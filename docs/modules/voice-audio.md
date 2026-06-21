# Voice & Audio Module

## Overview
Real-time speech-to-text pipeline: Browser microphone -> AudioWorklet -> WebSocket -> AssemblyAI v3 -> Transcript events -> Trigger detection -> Navigation.

## Files
| File | Lines | Purpose |
|------|-------|---------|
| `client/src/hooks/useAudioStreaming.ts` | 207 | WebSocket + AudioContext lifecycle |
| `client/src/hooks/useVoiceNavigation.ts` | 109 | Transcript -> action routing |
| `client/src/lib/voice-controller.ts` | 140 | Pure logic: trigger/back/question detection |
| `client/src/stores/voice.ts` | ~50 | Zustand: lastTranscript, isStreaming, isLastTranscriptFinal |
| `client/public/audio-processor.js` | ~30 | AudioWorklet: Float32 -> PCM16LE |
| `server/server.js` (WebSocket section) | ~100 | Proxy to AssemblyAI wss://streaming.assemblyai.com/v3/ws |

## Data Flow
```
getUserMedia(16kHz mono) -> AudioContext -> AudioWorkletNode('audio-processor')
  -> worklet.port.onmessage -> ws.send(PCM16 binary)
  -> AssemblyAI proxy (server.js) -> AssemblyAI v3 API
  <- {type:'status', ready:true} (must wait before sending audio)
  <- {type:'Turn', transcript:'...', end_of_turn:true/false}
  -> onTranscript(text, isFinal) callback
  -> useVoiceNavigation dispatches to VoiceController
```

## Detection Priority (useVoiceNavigation)
1. CANCEL word (when QA is loading) - from settings, default "cancel"
2. QUESTION detection (when isListeningForQuestions) - ends with "?"
3. BACK command - /\b(back|previous|go\s+back)\b/i
4. Section TRIGGERS - createTokenPattern() with plural support

## Key Patterns
- All callbacks use refs to avoid stale closures (critical for WebSocket)
- `isStreamingRef` prevents guard check from using stale state
- `updateStatus` has `[]` deps (fully stable) to prevent cascade
- Cleanup runs only on unmount via inline useEffect return

## Known Issues
- No automatic reconnection on network failure
- Debounce is 2000ms (NAV_DEBOUNCE_MS), not configurable from UI
- Audio worklet uses cache-busting `?v=${Date.now()}`
- 204 console.log statements need structured logger

## Connections
- **Reads from**: usePresentationStore (sections, triggers, currentSectionIndex)
- **Writes to**: useVoiceStore (lastTranscript, isLastTranscriptFinal)
- **Triggers**: usePresentationStore.advanceSection(), goBackSection()
- **Used by**: App.tsx (starts/stops streaming), KnowItAllWall (question detection)
