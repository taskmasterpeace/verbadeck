import { useState, useEffect, useRef, useCallback } from 'react';

interface RoomState {
  currentIndex: number;
  totalSlides: number;
  sections: { heading?: string; content: string; advanceToken?: string }[];
  isStreaming: boolean;
  qaState: {
    question: string;
    answers: { answer1: any; answer2: any } | null;
    isLoading: boolean;
  } | null;
}

interface UseControllerSocketOptions {
  role: 'presenter' | 'controller';
  roomCode?: string;
  onNavigate?: (direction: 'next' | 'prev' | number) => void;
  onToggleQA?: (enabled: boolean) => void;
  onDismissQA?: () => void;
}

export function useControllerSocket({
  role,
  roomCode,
  onNavigate,
  onToggleQA,
  onDismissQA,
}: UseControllerSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [myRoomCode, setMyRoomCode] = useState<string | null>(null);
  const [remoteState, setRemoteState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/control`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🎮 Control socket connected');
      setError(null);

      if (role === 'presenter') {
        ws.send(JSON.stringify({ type: 'create-room' }));
      } else if (role === 'controller' && roomCode) {
        ws.send(JSON.stringify({ type: 'join-room', roomCode }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'room-created') {
          setMyRoomCode(msg.roomCode);
          setIsConnected(true);
        }
        else if (msg.type === 'room-joined') {
          setMyRoomCode(roomCode || null);
          setRemoteState(msg.state);
          setIsConnected(true);
        }
        else if (msg.type === 'state-update') {
          setRemoteState(msg.state);
        }
        else if (msg.type === 'navigate' && onNavigate) {
          onNavigate(msg.direction);
        }
        else if (msg.type === 'toggle-qa' && onToggleQA) {
          onToggleQA(msg.enabled);
        }
        else if (msg.type === 'qa-update') {
          setRemoteState(prev => prev ? { ...prev, qaState: msg.qaState } : prev);
        }
        else if (msg.type === 'dismiss-qa') {
          setRemoteState(prev => prev ? { ...prev, qaState: null } : prev);
          if (onDismissQA) onDismissQA();
        }
        else if (msg.type === 'room-closed') {
          setIsConnected(false);
          setError('Presenter ended the session');
        }
        else if (msg.type === 'error') {
          setError(msg.message);
        }
      } catch {}
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect for controllers
      if (role === 'controller') {
        reconnectTimerRef.current = setTimeout(connect, 2000);
      }
    };

    ws.onerror = () => {
      setError('Connection failed');
    };
  }, [role, roomCode, onNavigate, onToggleQA, onDismissQA]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendNavigate = useCallback((direction: 'next' | 'prev') => {
    send({ type: 'navigate', direction });
  }, [send]);

  const sendStateUpdate = useCallback((state: Partial<RoomState>) => {
    send({ type: 'state-update', state });
  }, [send]);

  const sendToggleQA = useCallback((enabled: boolean) => {
    send({ type: 'toggle-qa', enabled });
  }, [send]);

  const sendQAUpdate = useCallback((qaState: RoomState['qaState']) => {
    send({ type: 'qa-update', qaState });
  }, [send]);

  const sendDismissQA = useCallback(() => {
    send({ type: 'dismiss-qa' });
  }, [send]);

  return {
    isConnected,
    roomCode: myRoomCode,
    remoteState,
    error,
    sendNavigate,
    sendStateUpdate,
    sendToggleQA,
    sendQAUpdate,
    sendDismissQA,
  };
}
