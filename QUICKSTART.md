# VerbaDeck - Quick Start Guide

## What You Have

A complete voice-driven presentation system with:

- ✅ AssemblyAI Universal-Streaming v3 integration (raw binary PCM16)
- ✅ Node.js WebSocket proxy server
- ✅ React + Vite + shadcn/ui frontend
- ✅ AudioWorklet for mic capture
- ✅ Wake-word arming ("majin twin" / "majin pause")
- ✅ Auto-advance on trigger words (last word of each section)
- ✅ **Know It All Wall** - AI-powered Q&A mode with inline keyword highlighting
- ✅ Keyboard controls (P key to pause/resume)
- ✅ Live transcript ticker
- ✅ Playwright visual tests
- ✅ All dependencies installed
- ✅ TypeScript compilation verified

## Run VerbaDeck Now

### Option 1: Run Both Servers (Recommended)

From the project root:

```bash
npm run dev
```

This starts:
- **Server** on http://localhost:3001 (WebSocket proxy)
- **Client** on http://localhost:5173 (Vite dev server)

### Option 2: Run Separately

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

## Usage Flow

1. **Open Browser**: Navigate to http://localhost:5173

2. **Edit Script** (optional): Modify the default pitch script or paste your own

3. **Configure Wake Words** (optional):
   - Default wake word: "majin twin" (arms the system)
   - Default stop word: "majin pause" (pauses advancement)

4. **Start Listening**: Click the "Start Listening" button
   - Grant microphone permissions
   - Wait for green "Connected" indicator

5. **Arm the System**: Say "majin twin"
   - Status changes from "PAUSED" to "ARMED"

6. **Present**: Read your script
   - When you say the **bolded last word** of the current section, it auto-advances
   - Watch the live transcript at the bottom

7. **Pause/Resume**: Press **P** key or say "majin pause"

8. **Stop**: Click "Stop Listening" when done

## Know It All Wall Mode 🎤❓

**NEW in v1.3**: Voice-driven Q&A system for live questioning!

### Quick Start

1. **Click "Know It All Wall"** button (top right)
2. **Paste your knowledge base** (product docs, resume, etc.)
3. **Start Session** - AI analyzes and generates questions
4. **Ask questions** - Just speak naturally, end with "?"
5. **Select answer** - Say 2 keywords to choose which answer to give

### Example Flow

```
You: "When will this be available?" [question detected]
AI: Generates 2 answer options with keywords highlighted
Option 1: Keywords: [launch, quarter]
Option 2: Keywords: [beta, testing]

You: "launch" [first keyword - answer 1 highlights]
You: "quarter" [second keyword - answer 1 locks in]
```

### Features

- **AI Context Analysis** - Detects document types (resume, job description, etc.)
- **Inline Keyword Highlighting** - Keywords light up as you speak them
- **Dual Answer Options** - Two different approaches for every question
- **"Back" Command** - Say "back" to reset and choose different answer
- **Smart Follow-ups** - AI generates relevant follow-up questions

**Full Documentation:** See [KNOW_IT_ALL_WALL.md](./KNOW_IT_ALL_WALL.md)

## What Makes This Special

### Architecture Highlights

1. **AssemblyAI v3 Raw Binary Streaming**:
   - Direct PCM16 audio (not base64)
   - ~50ms chunks for low latency
   - Word-level timestamps and confidence

2. **AudioWorklet Pipeline**:
   - Browser mic → AudioWorklet → PCM16 conversion → WebSocket
   - 16kHz mono, optimized for speech recognition

3. **Server-Side Auth**:
   - API key never exposed to browser
   - Node proxy handles AssemblyAI authentication

4. **State Machine**:
   - ARMED: Listening for trigger words
   - PAUSED: Transcription runs but no advancement
   - Wake/stop words toggle states

5. **Smart Matching**:
   - Regex with suffix tolerance (handles plurals: "moment" / "moments")
   - Debounce prevents double-advance on echoes
   - Word boundary matching

## Test the System

### Run Playwright Tests

```bash
npm test
```

Or with UI mode:

```bash
npm run test:ui
```

### Manual Testing Checklist

- [ ] Script editor visible before streaming
- [ ] Wake/stop words editable
- [ ] "Start Listening" connects (green indicator)
- [ ] Say wake word → status changes to "ARMED"
- [ ] Say trigger word → section advances
- [ ] Press P → toggles ARMED/PAUSED
- [ ] Live transcript shows at bottom
- [ ] Progress bar updates
- [ ] Next section preview visible
- [ ] Section navigation buttons work

## Troubleshooting

### "Cannot connect to WebSocket"

Check server is running:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### "Microphone permission denied"

- Check browser settings → Allow microphone access
- HTTPS required in production (localhost works in dev)

### "Trigger word not detected"

- Verify mode is "ARMED" (green indicator, say wake word)
- Check live transcript to see what AssemblyAI heard
- Speak clearly at normal pace
- Ensure trigger word matches exactly (check console logs)

### TypeScript errors

```bash
cd client
npx tsc --noEmit
```

Should complete with no errors.

## API Key Security Reminder

Your current API key in `.env`:
```
AAI_API_KEY=987aca52da654f01aad3113ecb062169
```

**⚠️ IMPORTANT**: After testing, rotate this key:
1. Go to AssemblyAI dashboard
2. Regenerate your API key
3. Update `.env` with new key
4. Never commit `.env` to git (already in `.gitignore`)

## Project Structure Reference

```
verbadeck/
├── server/
│   ├── server.js           # WebSocket proxy
│   └── package.json
├── client/
│   ├── public/
│   │   └── audio-processor.js    # AudioWorklet
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui
│   │   │   ├── PresenterView.tsx
│   │   │   ├── ScriptEditor.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── TranscriptTicker.tsx
│   │   ├── hooks/
│   │   │   └── useAudioStreaming.ts
│   │   ├── lib/
│   │   │   ├── script-parser.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx             # Main app
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   └── package.json
├── tests/
│   └── verbadeck.spec.ts      # Playwright tests
├── .env                        # API key (gitignored)
├── README.md                   # Full documentation
├── QUICKSTART.md              # This file
└── package.json               # Root workspace
```

## Next Steps

### Customize Your Script

1. Edit the default script in `App.tsx` (line 9) or paste directly in the UI
2. Sections are separated by blank lines
3. Last word of each section = trigger word
4. Use Markdown for formatting (bold, italic, etc.)

### Adjust Wake Words

Change default wake/stop words in `App.tsx`:
```typescript
const [wakeWord, setWakeWord] = useState('your custom wake phrase');
const [stopWord, setStopWord] = useState('your custom stop phrase');
```

Or edit them in the UI before starting.

### Tune Sensitivity

In `server/server.js`, adjust AssemblyAI parameters:
```javascript
const aaiParams = new URLSearchParams({
  sample_rate: '16000',
  encoding: 'pcm_s16le',
  format_turns: 'true',
  end_of_turn_confidence_threshold: '0.4',  // Adjust 0.0-1.0
  word_boost: '["your", "important", "words"]'
});
```

### Deploy to Production

See `README.md` "Production Deployment" section for:
- Building client for production
- Deploying server to Node.js hosting
- HTTPS setup (required for microphone access)

---

**You're all set! Run `npm run dev` and start presenting.** 🎤

For full documentation, see `README.md`.
