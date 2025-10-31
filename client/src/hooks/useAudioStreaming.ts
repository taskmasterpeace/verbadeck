import { useEffect, useRef, useState, useCallback } from 'react';

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

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Store callbacks in refs to avoid stale closure issues
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const updateStatus = useCallback((newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const startStreaming = useCallback(async () => {
    if (isStreaming) return;

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

      // 3. Load AudioWorklet processor
      await audioContext.audioWorklet.addModule('/audio-processor.js');

      // 4. Create WebSocket connection to our proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
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
            // Send both interim and final transcripts - use ref to get latest callback
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
        updateStatus('disconnected');
        setIsStreaming(false);
      };

      // 5. Set up AudioWorklet to capture and send audio
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
      audioWorkletRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        // Receive PCM16 ArrayBuffer from worklet, send to WebSocket
        // Only send if WebSocket is open AND AssemblyAI is ready
        if (ws.readyState === WebSocket.OPEN && aaiReady) {
          ws.send(event.data);
        }
      };

      // Connect: mic -> worklet -> (messages to WebSocket)
      source.connect(workletNode);
      // Note: worklet doesn't need to connect to destination (we're not playing audio)

      setIsStreaming(true);
      console.log('Audio streaming started');

    } catch (error) {
      console.error('Error starting audio stream:', error);
      onErrorRef.current?.(error instanceof Error ? error.message : 'Failed to start audio stream');
      updateStatus('disconnected');
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isStreaming, updateStatus]);

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

    setIsStreaming(false);
    updateStatus('disconnected');
  }, [updateStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    isStreaming,
    status,
    startStreaming,
    stopStreaming,
  };
}
