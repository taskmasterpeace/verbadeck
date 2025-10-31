# VerbaDeck

**Voice-driven presentations with hands-free advancement.**

VerbaDeck lets you present word-for-word scripts using voice recognition. When you speak the last word of a section, the app automatically advances to the next. A custom wake-word arms/disarms advancement while transcription runs continuously.

## Features

- **Voice-Driven Advancement**: Speak the trigger word (last word of each section) to auto-advance
- **Wake-Word Control**: Arm/disarm advancement with custom wake and stop words
- **Live Transcription**: Real-time speech-to-text with AssemblyAI Universal-Streaming v3
- **Hands-Free**: No clicker needed - just speak naturally
- **Safety Controls**: Manual pause with keyboard shortcut (P key)
- **Visual Feedback**: Status indicators, progress bar, live transcript ticker
- **Section Preview**: See current and next sections side-by-side
- **Custom Scripts**: Paste or edit your presentation script with auto-parsing

## Architecture

### Stack

- **Frontend**: Vite + React + TypeScript + shadcn/ui (Tailwind CSS)
- **Backend**: Node.js + Express + WebSocket proxy
- **STT**: AssemblyAI Universal-Streaming v3 API
- **Audio**: Web Audio API + AudioWorklet (PCM16 mono 16kHz)
- **Testing**: Playwright for visual regression and E2E tests

### How It Works

1. **Script Parsing**: Your script is split into sections (separated by blank lines). The last word of each section becomes the "trigger word".
2. **Audio Capture**: Browser captures microphone audio via Web Audio API, converts to PCM16 format using AudioWorklet.
3. **Streaming**: Audio is sent as raw binary over WebSocket to our Node.js proxy, which relays to AssemblyAI with authentication.
4. **Transcription**: AssemblyAI sends back real-time transcript events.
5. **State Machine**:
   - **PAUSED**: Transcription runs but advancement is disabled
   - **ARMED**: Listening for trigger words to advance sections
   - Wake-word detection toggles between states
6. **Auto-Advance**: When armed, hearing the current section's trigger word advances to the next section (with debounce to prevent double-advances).

## Prerequisites

- **Node.js** 18+ and npm
- **AssemblyAI API Key**: Get yours at [assemblyai.com](https://www.assemblyai.com/)
- **Browser**: Chrome, Edge, or any Chromium-based browser (for Web Audio API support)
- **Microphone**: Required for voice input

## Setup

### 1. Clone or Download

```bash
git clone <repository-url>
cd verbadeck
```

### 2. Install Dependencies

```bash
# Install root workspace dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Configure API Key

The `.env` file has already been created with your API key:

```
AAI_API_KEY=987aca52da654f01aad3113ecb062169
```

**⚠️ SECURITY WARNING**: This key is currently exposed. After testing, you should:
1. Rotate this key in your AssemblyAI dashboard
2. Never commit `.env` to version control (already in `.gitignore`)
3. Use environment variables in production

### 4. Run Development Servers

From the project root:

```bash
npm run dev
```

This starts both:
- **Server**: http://localhost:3001 (WebSocket proxy)
- **Client**: http://localhost:5173 (Vite dev server)

## Usage

### Basic Workflow

1. **Edit Your Script** (optional):
   - Before starting, you can edit the default script in the text area
   - Separate sections with blank lines
   - The last word of each section will be auto-bolded as the trigger

2. **Set Wake/Stop Words** (optional):
   - Default wake word: "majin twin"
   - Default stop word: "majin pause"
   - Edit these in the status bar before streaming

3. **Start Listening**:
   - Click "Start Listening" button
   - Grant microphone permissions when prompted
   - Wait for "Connected" status (green indicator)

4. **Arm the System**:
   - Say your wake word (e.g., "majin twin")
   - Status changes from "PAUSED" to "ARMED"

5. **Present**:
   - Read your script naturally
   - When you speak the bolded trigger word, the app advances
   - Live transcript appears at the bottom

6. **Pause if Needed**:
   - Say your stop word (e.g., "majin pause")
   - Or press the **P** key on your keyboard
   - Status returns to "PAUSED" (transcription continues)

7. **Stop**:
   - Click "Stop Listening" when done

### Keyboard Shortcuts

- **P**: Toggle between ARMED and PAUSED modes

### Tips

- **Choose Good Trigger Words**: Avoid common words like "the" or "a". The parser automatically uses the last word, which is usually meaningful.
- **Test First**: Use the section navigation buttons to test your script before presenting.
- **Venue Testing**: Test your venue's Wi-Fi and ambient noise before the real presentation.
- **Wake-Word Best Practices**: Use an uncommon phrase to avoid accidental arming (default "majin twin" is intentionally uncommon).

## Testing

### Run Playwright Tests

```bash
# From project root
npm test

# With UI mode for visual debugging
npm run test:ui
```

The tests include:
- UI rendering and visibility checks
- Section navigation
- Wake/stop word editing
- Visual regression tests (screenshots)
- Script editing and re-parsing

Test results and screenshots are saved to `playwright-report/`.

## Development

### Project Structure

```
verbadeck/
├── server/                 # Node.js WebSocket proxy
│   ├── server.js          # Express + WS relay to AssemblyAI
│   └── package.json
├── client/                # React frontend
│   ├── public/
│   │   └── audio-processor.js  # AudioWorklet for PCM16 conversion
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── PresenterView.tsx
│   │   │   ├── ScriptEditor.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── TranscriptTicker.tsx
│   │   ├── hooks/
│   │   │   └── useAudioStreaming.ts
│   │   ├── lib/
│   │   │   ├── script-parser.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx        # Main app with state machine
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── tests/
│   └── verbadeck.spec.ts  # Playwright E2E tests
├── .env                   # API key (DO NOT COMMIT)
├── .gitignore
├── package.json           # Root workspace config
├── playwright.config.ts
└── README.md
```

### Key Files

- **server/server.js**: WebSocket proxy that authenticates with AssemblyAI and relays binary audio + transcript messages
- **client/src/App.tsx**: Main application logic, state machine, wake-word detection, trigger-word matching
- **client/src/hooks/useAudioStreaming.ts**: Audio capture, WebSocket connection, transcript events
- **client/public/audio-processor.js**: AudioWorklet processor that converts Float32 mic input to PCM16
- **client/src/lib/script-parser.ts**: Parses script into sections, extracts trigger words, creates regex patterns

## API Reference

### AssemblyAI Universal-Streaming v3

- **Endpoint**: `wss://streaming.assemblyai.com/v3/ws`
- **Authentication**: Header `Authorization: <API_KEY>`
- **Audio Format**: Raw binary PCM16, 16kHz, mono, ~50ms chunks (800 frames)
- **Message Types**:
  - `Begin`: Session started
  - `Turn`: Transcript update (contains `text` field)
  - `Termination`: Session ended
  - `Error`: Error occurred

### WebSocket Proxy

- **Endpoint**: `ws://localhost:3001/ws` (dev) or `ws://yourdomain.com/ws` (production)
- **Protocol**: Binary (audio) and JSON (status/transcript messages)
- Client sends raw PCM16 audio, receives JSON transcript events

## Troubleshooting

### "WebSocket connection failed"

- Ensure server is running on port 3001
- Check that `.env` file exists with valid API key
- Verify AssemblyAI API key in dashboard

### "Microphone permission denied"

- Grant microphone access in browser settings
- HTTPS required in production (localhost works in dev)

### "Trigger word not detected"

- Check console for transcript output
- Ensure mode is "ARMED" (say wake word)
- Verify trigger word is spelled correctly in transcript
- Speak clearly and at normal pace

### "Audio not streaming"

- Check browser console for AudioWorklet errors
- Verify `/audio-processor.js` is accessible (should be in `client/public/`)
- Ensure sample rate is 16kHz

### "Visual regression test failures"

- Playwright screenshot tests may fail on first run (no baseline)
- Run `npx playwright test --update-snapshots` to create/update baselines

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
AAI_API_KEY=<your-assemblyai-api-key>
PORT=3001  # or your preferred port
```

### Build Client

```bash
cd client
npm run build
# Output in client/dist/
```

### Deploy

1. Deploy `server/` to your Node.js hosting (Heroku, Railway, Render, etc.)
2. Deploy `client/dist/` to static hosting (Vercel, Netlify, Cloudflare Pages, etc.)
3. Update WebSocket URL in production to point to your server domain
4. Ensure HTTPS for both server and client (required for microphone access)

### HTTPS Requirement

Browsers require HTTPS for:
- `getUserMedia()` microphone access (localhost exempted)
- Secure WebSocket (`wss://`)

Use a reverse proxy (nginx, Caddy) or hosting platform with automatic SSL.

## License

MIT (or your preferred license)

## Credits

Built with:
- [AssemblyAI](https://www.assemblyai.com/) - Real-time speech-to-text
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Playwright](https://playwright.dev/) - Testing

---

**Happy Presenting! 🎤**
