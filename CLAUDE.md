# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VerbaDeck is a voice-driven presentation system that advances slides automatically when trigger words are spoken. It combines real-time speech-to-text (AssemblyAI), AI-powered script processing (OpenRouter), and dual-monitor presentation support using React + Node.js.

## Development Commands

### Starting Development
```bash
# From project root - starts both server and client concurrently
npm run dev

# Or individually:
npm run dev:server  # Node.js server on port 3001
npm run dev:client  # Vite dev server on port 5173
```

### Testing
```bash
# Run all Playwright tests
npm test

# Run with UI mode for debugging
npm run test:ui

# Update visual snapshots
npx playwright test --update-snapshots
```

### Building
```bash
# Build client for production
npm run build:client  # Output: client/dist/
```

### Server Development
```bash
cd server
npm run dev    # Auto-restart with --watch
npm start      # Production mode
```

## Environment Setup

Create `.env` in project root:
```env
AAI_API_KEY=your_assemblyai_key
OPENROUTER_API_KEY=your_openrouter_key
```

The server will exit with error if these keys are missing.

## Architecture Overview

### Monorepo Structure
- **Root**: npm workspace with `concurrently` for dev orchestration
- **client/**: React 18 + TypeScript + Vite frontend
- **server/**: Express + WebSocket proxy for AssemblyAI
- **tests/**: Playwright E2E tests at root level

### Key Data Flow

1. **Audio Capture**: Browser Web Audio API → AudioWorklet (`public/audio-processor.js`) converts Float32 to PCM16 at 16kHz mono
2. **WebSocket Proxy**: Client WebSocket → Node.js proxy (`server/server.js`) → AssemblyAI v3 streaming API
   - Proxy adds `Authorization: <AAI_API_KEY>` header
   - Bidirectional: audio out, transcript events in
3. **Trigger Detection**: `App.tsx` (`handleTranscript`) checks transcript against current section's trigger words
   - Uses regex patterns from `createTokenPattern()` (handles plurals: s/es/ies)
   - Debounces navigation (2s) to prevent double-advance
   - "BACK" command always checked first for previous section navigation
4. **Dual-Monitor Sync**: BroadcastChannel API syncs presenter view (`App.tsx`) with audience view (`/audience` route)

### Core State Management (App.tsx)

- `sections: Section[]` - All presentation sections with trigger words
- `currentSectionIndex: number` - Active section
- `viewMode: 'ai-processor' | 'editor' | 'presenter'` - Current UI mode
- `isStreaming: boolean` - Microphone/transcription active
- `transcript: string[]` - Live transcript history (last 20 final transcripts)
- `lastTranscript: string` - Most recent interim/final transcript

### Section Interface (lib/script-parser.ts)

```typescript
interface Section {
  id: string;
  content: string;
  advanceToken: string;              // Primary trigger word
  alternativeTriggers?: string[];    // AI-suggested alternatives
  selectedTriggers?: string[];       // User-selected active triggers
  imageUrl?: string;                 // Optional slide image
}
```

### Custom Hooks

**useAudioStreaming** (`hooks/useAudioStreaming.ts`):
- Manages AudioContext, MediaStream, AudioWorklet, WebSocket lifecycle
- Returns: `{ isStreaming, status, startStreaming, stopStreaming }`
- Status: `'connecting' | 'connected' | 'disconnected'`
- Critical: Only sends audio after AssemblyAI sends `{type: 'status', ready: true}`

**useOpenRouter** (`hooks/useOpenRouter.ts`):
- API client for `/api/process-script` and `/api/suggest-triggers`
- Returns: `{ processScript, suggestTriggers, isProcessing, error, progress }`

**useTransitions** (`hooks/useTransitions.ts`):
- Manages visual flash effects on section advance
- Returns: `{ shouldFlash, triggerTransition }`

## Server Endpoints

### WebSocket
- `ws://localhost:3001/ws` - Proxies to `wss://streaming.assemblyai.com/v3/ws`
- Client sends: Binary PCM16 audio chunks
- Client receives: JSON transcript events (`{type: 'Turn', transcript, end_of_turn}`)

### REST API
- `GET /health` - Health check
- `GET /api/models` - List OpenRouter models
- `POST /api/process-script` - AI script processing
  - Body: `{text: string, model?: string}`
  - Returns: `{sections: [{content, primaryTrigger, alternativeTriggers}]}`
- `POST /api/suggest-triggers` - AI trigger suggestions for a section
  - Body: `{text: string, model?: string}`
  - Returns: `{triggers: string[]}`

## Important Implementation Details

### Trigger Word Matching
- Normalization: `toLowerCase()` + strip non-alphanumeric
- Pattern: Regex with word boundaries + plural support (`/\b${token}(s|es|ies)?\b/i`)
- Example: "moment" matches "moment", "moments"
- Multi-trigger: Sections can have multiple active triggers via `selectedTriggers[]`

### Navigation Debouncing
- `NAV_DEBOUNCE_MS = 2000` (2 seconds) between advances/backs
- Prevents echo issues from transcript duplicates
- Stored in `lastNavTimeRef` (useRef to avoid re-renders)

### BACK Command Priority
- Always checked before section triggers
- Words: ["back", "previous", "go back"]
- Only active when `currentSectionIndex > 0`
- Exits early to prevent accidental forward advance

### BroadcastChannel Sync
- Channel name: `'verbadeck-presentation'`
- Messages:
  - Presenter → Audience: `{type: 'presentation-update', state: {currentSectionIndex, sections}}`
  - Audience → Presenter: `{type: 'request-state'}` on load
- Same-origin only (security requirement)

### AudioWorklet Processing
- File: `client/public/audio-processor.js` (plain JS, not bundled)
- Converts Float32Array → Int16Array (PCM16LE)
- Posts binary ArrayBuffer chunks to main thread → WebSocket

## Component Structure

### Main Views
- **AIScriptProcessor** - AI model selection + raw text input → sections
- **RichSectionEditor** - Edit section content, toggle triggers, add images
- **PresenterView** - Main presentation display with trigger words visible
- **AudienceView** - Clean 50/50 image/text split, no controls

### UI Components
- **StatusBar** - Top bar with Start/Stop Listening button
- **StatusIndicator** - Floating "Listening" badge during streaming
- **TriggerCarousel** - Bottom carousel showing previous/current/next triggers
- **TranscriptTicker** - Live transcript bar at very bottom
- **TransitionEffects** - Framer Motion slide transitions

## Testing Notes

- Playwright config targets `http://localhost:5173` (client)
- `webServer` auto-starts client dev server before tests
- Tests run in headed mode by default (`headless: false`)
- Visual regression: Screenshots stored in `tests/` directory
- Key test files:
  - `tests/verbadeck.spec.ts` - Main UI/navigation tests
  - `tests/ai-features.spec.ts` - AI processing tests

## Common Development Scenarios

### Adding a New AI Model
1. Update `client/src/lib/openrouter-models.ts` with model ID/name
2. No server changes needed (OpenRouter handles routing)

### Modifying Trigger Detection Logic
- Core logic: `App.tsx` → `handleTranscript` callback
- Pattern generation: `lib/script-parser.ts` → `createTokenPattern()`
- Test: Run `npm test` and check `tests/verbadeck.spec.ts`

### Debugging WebSocket Issues
- Server logs: Check Node.js console for AssemblyAI connection status
- Client logs: Browser console shows WebSocket messages and audio worklet activity
- Common issue: Audio sent before `{ready: true}` received (check `aaiReady` flag)

### Modifying Section Advance Behavior
- Debounce timing: Change `NAV_DEBOUNCE_MS` in `App.tsx`
- Add new navigation triggers: Update `backWords` array or add new trigger checks
- Visual feedback: Modify `useTransitions` hook or `TransitionEffects` component

## Production Deployment Considerations

- Client requires HTTPS for microphone access (except localhost)
- WebSocket should use `wss://` in production
- Update `useAudioStreaming.ts` WebSocket URL logic for production domain
- Server needs `AAI_API_KEY` and `OPENROUTER_API_KEY` in environment
- CORS: Server uses `cors()` middleware, update for production origins if needed

## Tech Stack Reference

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (ESM-based, fast HMR)
- **Tailwind CSS** + **shadcn/ui** - Styling and components
- **Framer Motion** - Animations
- **React Router** - `/audience` route
- **AssemblyAI Universal-Streaming v3** - Real-time STT
- **OpenRouter** - AI model API (GPT-4, Claude, Gemini, etc.)
- **Playwright** - E2E testing
- **Express** + **ws** - Server and WebSocket proxy
