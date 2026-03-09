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
npm run dev:server  # Node.js server on port 3002
npm run dev:client  # Vite dev server on port 5173
```

### Testing
```bash
# Run all Playwright tests
npm test

# Run specific test file
npx playwright test tests/navigation.spec.ts

# Run with UI mode for debugging
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

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
REPLICATE_API_KEY=your_replicate_key     # For image generation
PEXELS_API_KEY=your_pexels_key           # For AI image recommendations (instant approval)
```

The server will exit with error if required API keys are missing.

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

### State Management (Zustand Stores)

VerbaDeck uses Zustand for state management with four primary stores in `client/src/stores/`:

**usePresentationStore** - Core presentation state:
- `sections: Section[]` - All presentation sections with trigger words
- `currentSectionIndex` - What audience sees (changes immediately on trigger)
- `presenterDisplayIndex` - What presenter notes show (changes after countdown)
- `isCountingDown` - True during countdown period between trigger and note change
- `countdownDuration` - Configurable delay (1-10 seconds, default: 3)
- `knowledgeBase` - Q&A pairs for live questions
- `viewMode: 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch' | 'know-it-all'`
- Persists user settings only (not presentation content) to avoid rehydration conflicts

**useVoiceStore** - Voice streaming state:
- `isStreaming`, `status` - Audio/WebSocket connection state
- `transcript[]`, `lastTranscript` - Live transcript history

**useUIStore** - UI state:
- Modal visibility, loading states, editor tabs

**useQAStore** - Q&A feature state:
- Question detection, answer generation state

### Section Interface (lib/script-parser.ts)

```typescript
interface Section {
  id: string;
  heading?: string;                  // Section title/heading
  content: string;                   // Main slide content
  speakerNotes?: string;             // Speaker notes (markdown supported)
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
- `ws://localhost:3002/ws` - Proxies to `wss://streaming.assemblyai.com/v3/ws`
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
- `POST /api/generate-questions` - Generate questions for Create from Scratch
- `POST /api/generate-slide-options` - Generate slide variations
- `POST /api/generate-faqs` - Generate FAQ pairs
- `POST /api/answer-question` - Answer live Q&A questions with tone options

## AI Model Configuration

VerbaDeck uses operation-specific AI models for optimal cost/quality balance. All models support structured JSON output.

### Model Defaults (server/model-config.js)
- **GPT-4o Mini** ($0.15/1M): Question generation, slide options, script processing, image recommendations
- **Llama 3.1 8B via Groq** (~950ms): FAQ generation, live Q&A, trigger suggestions (ultra-fast)
- **Claude 3.5 Sonnet** (quality): Speaker note transformations, Q&A anticipation, creative content

### Provider Routing
- Llama models route to Groq for sub-second inference
- Fallback chain: Groq → GPT-4o-mini (handles rate limits gracefully)
- Configure via `MODEL_PROVIDER_ROUTING` and `MODEL_FALLBACKS` in model-config.js

### How It Works
1. Each endpoint calls `getModelForOperation(operationName, userModel)`
2. If user provides a model → use it (override)
3. Otherwise → use operation-specific default
4. Server logs show which model is being used

Example: `❓ Generating questions for topic: "AI Ethics" using openai/gpt-4o-mini`

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

### Countdown Timer System
Unique feature that separates audience view from presenter notes:
1. Trigger word detected → `currentSectionIndex` updates immediately (audience sees new slide)
2. `isCountingDown` set to true, countdown animation starts
3. After `countdownDuration` seconds → `presenterDisplayIndex` updates (notes change)
4. This gives presenter buffer time to finish their thought before seeing new notes

### AudioWorklet Processing
- File: `client/public/audio-processor.js` (plain JS, not bundled)
- Converts Float32Array → Int16Array (PCM16LE)
- Posts binary ArrayBuffer chunks to main thread → WebSocket

## Component Structure

### Main Views
- **CreateFromScratch** - AI-guided wizard for building presentations from topic
- **AIScriptProcessor** - AI model selection + raw text input → sections
- **RichSectionEditor** - Edit section content, toggle triggers, add images
- **PresenterView** - Main presentation display with trigger words visible
- **AudienceView** - Clean 50/50 image/text split, no controls
- **KnowItAllMode** - Q&A practice mode with voice-activated keyword confirmation

### UI Components
- **StatusBar** - Top bar with Start/Stop Listening button
- **CountdownProgressBar** - Visual countdown between trigger and note change
- **TriggerCarousel** - Bottom carousel showing previous/current/next triggers
- **TranscriptTicker** - Live transcript bar at very bottom
- **QAAnticipationPanel** - AI-predicted questions with pre-written answers

### Layout System
Uses `client/src/layouts/` for consistent page structure:
- **MainLayout** - Primary layout with sidebar navigation
- **RootLayout** - Base wrapper with global providers

## Testing Notes

- Playwright config targets `http://localhost:5173` (client)
- `webServer` auto-starts both client and server before tests
- Tests run in headed mode by default (`headless: false`)
- Visual regression: Screenshots stored in `tests/screenshots/`
- Key test files:
  - `tests/navigation.spec.ts` - Route navigation tests
  - `tests/editor-workflow.spec.ts` - Content editing flows
  - `tests/presenter-workflow.spec.ts` - Presentation mode tests
  - `tests/know-it-all-workflow.spec.ts` - Q&A practice mode tests
  - `tests/keyboard-shortcuts-integration.spec.ts` - Shortcut tests
  - `tests/mobile-responsive.spec.ts` - Mobile breakpoint tests

## Common Development Scenarios

### Adding a New AI Model
1. Update `client/src/lib/openrouter-models.ts` with model ID/name
2. No server changes needed (OpenRouter handles routing)

### Adding a New AI Operation
1. Add operation name to `MODEL_DEFAULTS` in `server/model-config.js`
2. Create API endpoint in `server/server.js` using `getModelForOperation()`
3. Add client hook or API call in appropriate component

### Modifying Trigger Detection Logic
- Core logic: `App.tsx` → `handleTranscript` callback
- Pattern generation: `lib/script-parser.ts` → `createTokenPattern()`
- Test: Run `npx playwright test tests/presenter-workflow.spec.ts`

### Debugging WebSocket Issues
- Server logs: Check Node.js console for AssemblyAI connection status
- Client logs: Browser console shows WebSocket messages and audio worklet activity
- Common issue: Audio sent before `{ready: true}` received (check `aaiReady` flag)

### Modifying Section Advance Behavior
- Debounce timing: Change `NAV_DEBOUNCE_MS` in `App.tsx`
- Countdown duration: Modify via `setCountdownDuration` in Zustand store
- Add new navigation triggers: Update `backWords` array or add new trigger checks

### Working with Zustand State
- Import stores from `client/src/stores/index.ts`
- Use selectors for derived state: `selectCurrentSection`, `selectSettings`
- Store persistence only saves user settings, not presentation content (avoids rehydration issues)

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
- **Zustand** - State management with devtools and persist middleware
- **Tailwind CSS** + **shadcn/ui** - Styling and components
- **Framer Motion** - Animations
- **React Router v7** - Client-side routing
- **Tiptap** - Rich text editor for speaker notes
- **AssemblyAI Universal-Streaming v3** - Real-time STT
- **OpenRouter** - AI model API (GPT-4, Claude, Gemini, Llama, etc.)
- **Pexels/Unsplash** - Stock image APIs for AI recommendations
- **Replicate** - AI image generation
- **Playwright** - E2E testing
- **Express** + **ws** - Server and WebSocket proxy
