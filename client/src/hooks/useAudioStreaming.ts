import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL } from '@/lib/api-config';

interface TranscriptMessage {
  type: 'status' | 'Turn' | 'Begin' | 'Termination' | 'Error';
  text?: string;
  transcript?: string;
  end_of_turn?: boolean;
  message?: string;
  ready?: boolean;
}

interface UseAudioStreamingProps {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

export function useAudioStreaming({
  onTranscript,
  onError,
  onStatusChange,
}: UseAudioStreamingProps = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // All refs — avoids stale closures and dependency chain issues
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStreamingRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  const onStatusChangeRef = useRef(onStatusChange);

  // Keep refs in sync
  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;
  onStatusChangeRef.current = onStatusChange;

  const updateStatus = useCallback((newStatus: 'connecting' | 'connected' | 'disconnected') => {
    setStatus(newStatus);
    onStatusChangeRef.current?.(newStatus);
  }, []); // Stable — uses ref for callback

  const stopStreaming = useCallback(() => {
    console.log('Stopping audio stream');

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio worklet
    if (audioWorkletRef.current) {
      audioWorkletRef.current.disconnect();
      audioWorkletRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    isStreamingRef.current = false;
    setIsStreaming(false);
    updateStatus('disconnected');
  }, [updateStatus]); // updateStatus is now stable

  const startStreaming = useCallback(async () => {
    // Use ref to avoid stale closure on isStreaming
    if (isStreamingRef.current) return;

    try {
      updateStatus('connecting');

      // 1. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // 2. Create AudioContext
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // 3. Load AudioWorklet processor (with cache-busting)
      const cacheBuster = `?v=${Date.now()}`;
      await audioContext.audioWorklet.addModule(`/audio-processor.js${cacheBuster}`);

      // 4. Create WebSocket connection to our proxy
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.binaryType = 'arraybuffer';

      // Track if AssemblyAI is ready
      let aaiReady = false;

      ws.onopen = () => {
        console.log('WebSocket connected to proxy');
      };

      ws.onmessage = (event) => {
        try {
          const msg: TranscriptMessage = JSON.parse(event.data);

          console.log('Received message:', msg.type, msg);

          if (msg.type === 'status' && msg.ready) {
            aaiReady = true;
            updateStatus('connected');
            console.log('✅ AssemblyAI ready - can send audio now');
          }

          if (msg.type === 'Turn' && msg.transcript) {
            const isFinal = msg.end_of_turn === true;
            console.log('📝 Transcript received:', msg.transcript, 'isFinal:', isFinal);
            onTranscriptRef.current?.(msg.transcript, isFinal);
          }

          if (msg.type === 'Begin') {
            console.log('🎤 AssemblyAI session started');
          }

          if (msg.type === 'Error') {
            console.error('AssemblyAI error:', msg.message);
            onErrorRef.current?.(msg.message || 'Unknown error');
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err, event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onErrorRef.current?.('WebSocket connection error');
        updateStatus('disconnected');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        isStreamingRef.current = false;
        updateStatus('disconnected');
        setIsStreaming(false);
      };

      // 5. Set up AudioWorklet to capture and send audio
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
      audioWorkletRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        if (ws.readyState === WebSocket.OPEN && aaiReady) {
          ws.send(event.data);
        }
      };

      // Connect: mic -> worklet -> (messages to WebSocket)
      source.connect(workletNode);

      isStreamingRef.current = true;
      setIsStreaming(true);
      console.log('Audio streaming started');

    } catch (error) {
      console.error('Error starting audio stream:', error);
      onErrorRef.current?.(error instanceof Error ? error.message : 'Failed to start audio stream');
      updateStatus('disconnected');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [updateStatus]); // updateStatus is now stable — no more cascading recreations

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      // Inline cleanup to avoid any ref/callback issues
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      if (audioWorkletRef.current) { audioWorkletRef.current.disconnect(); audioWorkletRef.current = null; }
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    };
  }, []);

  return {
    isStreaming,
    status,
    startStreaming,
    stopStreaming,
  };
}
