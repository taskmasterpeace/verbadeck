# 🎤 VerbaDeck

**Voice-Driven Presentations with AI-Powered Intelligence**

> Transform how you present. Speak naturally, advance automatically. No clicker needed.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![Windows Ready](https://img.shields.io/badge/Windows-Ready-0078D6?logo=windows)](https://www.microsoft.com/windows)

</div>

---

## 🚀 Quick Start (Windows)

**Get VerbaDeck on your desktop in 30 seconds!**

1. **Clone and install:**
   ```bash
   git clone https://github.com/taskmasterpeace/verbadeck.git
   cd verbadeck
   npm install
   ```

2. **Add your API keys** - Create `.env` file:
   ```env
   AAI_API_KEY=your_assemblyai_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   REPLICATE_API_KEY=your_replicate_api_key
   ```

3. **Create desktop shortcut:**
   - **Double-click:** `create-shortcut.bat`
   - **Done!** VerbaDeck icon appears on your desktop

4. **Launch VerbaDeck:**
   - **Double-click** the desktop icon
   - Browser opens automatically in 5 seconds
   - **Start creating presentations!**

📖 **See [QUICK_START.md](QUICK_START.md) for detailed setup instructions**

---

## 🌟 What is VerbaDeck?

VerbaDeck is a revolutionary presentation platform that lets you deliver presentations **completely hands-free** using voice commands. Simply speak naturally, and VerbaDeck automatically advances your slides when you say trigger words. Perfect for product demos, sales pitches, conference talks, and any presentation where you need your hands free.

**Built by [Machine King Labs](https://machinekingdomlabs.com)** - Innovation in AI-powered presentation technology.

---

## ✨ Key Features

### 🎯 Three Creation Modes

#### 1. **Create from Scratch** - AI-Guided Builder
- Answer a few questions about your topic
- AI generates complete presentation with trigger words
- Perfect for quick, professional presentations
- Choose tone, audience, and slide count

#### 2. **Process Existing Content**
- **Paste your script** - AI converts to voice-controlled slides
- **Upload PowerPoint** - Extracts text and images automatically
- **Preservation mode** - Keeps exact wording for legal/medical content
- AI suggests intelligent trigger words

#### 3. **Know It All Wall** - Q&A Practice Mode
- Voice-activated keyword confirmation system
- Practice answering questions about any topic
- Perfect for interview prep, teaching, or exam study
- Build knowledge base with AI-generated FAQs

---

### 🗣️ Advanced Voice Control

- **Intelligent Trigger Detection**: AI identifies natural trigger words that advance slides
- **Multi-Trigger Support**: Multiple trigger words per slide for flexibility
- **Plural Recognition**: Automatically detects plurals (e.g., "solution" matches "solutions")
- **BACK Command**: Navigate backwards with "back", "previous", or "go back"
- **2-Second Debounce**: Prevents accidental double-advances from transcript echoes
- **Real-Time Transcription**: Powered by AssemblyAI's streaming API
- **Live Transcript Display**: See what VerbaDeck hears in real-time

---

### 🤖 AI-Powered Intelligence

#### Smart Model Configuration
- **Operation-Specific Defaults**:
  - GPT-4o Mini for fast, cost-effective operations (20x cheaper!)
  - Claude 3.5 Sonnet for premium quality tasks
- **50+ AI Models**: Choose from GPT-4, Claude, Gemini, Llama, and more via OpenRouter
- **Model Presets**:
  - 🚀 Maximum Speed - Ultra-fast Llama models
  - ⚖️ Balanced - Mix of speed and quality
  - ✨ Quality - Premium Claude/GPT-4 models
  - 💰 Free Models - Zero-cost options
- **Category-Based Configuration**:
  - Create from Scratch
  - Q&A Mode
  - Know It All Wall
  - Editor Tools
  - Upload & Processing
  - Vision & Images
- **Bulk Model Changers**: Apply model to entire categories at once
- **User Overrides**: Always override defaults via UI
- **Persistent Settings**: Saved to localStorage

#### AI Features
- **Smart Script Processing**: Transform raw text into structured sections
- **AI Trigger Suggestions**: Get intelligent trigger word recommendations
- **Image Generation**: Create slide images with Replicate
- **Bulk Image Generation**: Generate images for all slides at once
- **Vision Analysis**: Extract text from uploaded images
- **Speaker Notes**: AI-generated presentation notes
- **Slide Variations**: Generate alternative versions of slides

---

### 🎓 Live Q&A System

- **Question Detection**: Automatically detects "?" in transcripts when Q&A mode is ON
- **Dual AI Answers**: Generates TWO complete answer perspectives
- **8 Personality Tones**:
  - 💼 Professional - Clear and authoritative
  - ✨ Witty & Engaging - Clever and memorable
  - 🧠 Deeply Insightful - Analytical and nuanced
  - 💬 Conversational - Warm and relatable
  - 🔥 Bold & Provocative - Challenges assumptions
  - 🔬 Technical Expert - Precise and data-driven
  - 📖 Storytelling - Compelling narratives
  - 😏 Sarcastic & Sharp - Dry wit
- **Knowledge Base Management**:
  - AI-powered FAQ generation
  - Manual Q&A entry
  - Auto-generate from presentation content
  - Import/export knowledge bases
- **Context-Aware**: Uses presentation content + knowledge base for accurate responses
- **Easy Toggle**: "Q&A" button in status bar (green when active)

---

### 🎨 Rich Editing & Presentation Features

#### Content Editor
- **Rich Text Editing**: Bold, italic, headings, bullets with Tiptap
- **Markdown Support**: Write in markdown, renders beautifully
- **Image Support**: Add visuals to slides with drag-and-drop
- **Trigger Word Management**:
  - Multiple triggers per slide
  - Alternative trigger suggestions
  - Visual trigger selection
- **Layout Templates**: Choose from multiple presentation layouts
- **Section Reordering**: Drag-and-drop slide organization

#### Presenter Mode
- **Dual-Monitor Support**: Presenter view + clean audience view
- **BroadcastChannel Sync**: Real-time window synchronization
- **Smooth Transitions**: Framer Motion animations
- **Progress Tracking**: Visual progress bar and section counter
- **Trigger Carousel**: Shows previous, current, and next trigger words
- **Live Transcript**: See real-time transcription
- **Current Slide Preview**: See what audience sees
- **Speaker Notes Display**: Show AI-generated or custom notes

---

### 💾 Save & Load System

- **Presentation Library**: Browse and manage saved presentations
- **File Export/Import**: Save as `.verbadeck` files
- **LocalStorage**: Auto-save presentations in browser
- **Quick Load**: One-click test presentation loading
- **Cross-Device**: Load presentations on any device
- **Knowledge Base Export**: Save Q&A databases separately

---

### 📱 Modern Web App

- **Progressive Web App**: Install on mobile/tablet/desktop
- **Offline Mode**: Works without internet after initial load
- **Responsive Design**: Optimized for all screen sizes
- **Mobile-First UI**: Portrait and landscape support
- **Dark Mode Ready**: Easy on the eyes
- **Keyboard Shortcuts**: Arrow keys for navigation

---

### 🪟 Windows Desktop Integration

- **One-Click Desktop Shortcut**: Auto-creates shortcut with custom icon
- **Auto-Launch Browser**: Opens browser automatically on startup
- **Minimized Command Window**: Runs quietly in background
- **Easy Batch Files**: Simple `.bat` launchers included
- **PowerShell Script**: Advanced shortcut creation
- **Icon Customization**: Uses custom VerbaDeck crown icon

---

## 🎯 Use Cases

### 🚀 Product Demos & Sales Pitches
**Perfect for**: Software demos, product launches, sales presentations

**Why VerbaDeck**: Keep your hands free to operate your product while advancing slides naturally. No fumbling with a clicker when you need to demonstrate features.

**Example**: Demo a mobile app while advancing through feature slides by saying "dashboard", "analytics", "reporting" as trigger words.

---

### 🎤 Conference Talks & Keynotes
**Perfect for**: Tech conferences, TEDx talks, academic presentations

**Why VerbaDeck**: Maintain natural body language and eye contact with your audience. No distractions from clickers or keyboard shortcuts.

**Example**: Deliver a keynote about AI ethics with hands-free navigation, using Q&A mode to handle audience questions with AI-generated talking points.

---

### 📊 Executive Briefings & Board Meetings
**Perfect for**: Quarterly reviews, strategy presentations, investor pitches

**Why VerbaDeck**: Professional dual-monitor setup with preservation mode for exact wording. AI-powered Q&A ensures accurate responses.

**Example**: Present quarterly financials with "revenue", "growth", "forecast" as triggers, with Q&A mode providing professional-toned answers to board questions.

---

### 🏥 Medical & Healthcare Presentations
**Perfect for**: Grand rounds, medical conferences, patient education

**Why VerbaDeck**: Preservation mode keeps medical terminology exact. Hands-free for gestures and demonstrations.

**Example**: Present treatment protocols with clinical terms as triggers, maintaining precise medical language.

---

### 🎓 Academic Lectures & Training
**Perfect for**: University lectures, corporate training, workshops

**Why VerbaDeck**: Engage students with natural presentation flow. Use Know It All Wall for Q&A practice.

**Example**: Teach machine learning concepts with "supervised", "neural", "training" as triggers, generating insightful answers for student questions.

---

### 💼 Internal Team Presentations
**Perfect for**: Sprint reviews, project updates, team meetings

**Why VerbaDeck**: Conversational tone options and quick setup. Save/load presentations for recurring meetings.

**Example**: Weekly sprint review with "completed", "progress", "blockers" as triggers, using conversational Q&A tone.

---

## 📖 How to Use

### Windows: Desktop Shortcut (Recommended!)

1. **Double-click:** `create-shortcut.bat` in the VerbaDeck folder
2. **VerbaDeck icon** appears on your desktop with custom crown icon
3. **Double-click** desktop icon to launch
4. **Browser opens** automatically after 5 seconds
5. **Start creating!**

**To stop:** Close the command window or press `Ctrl+C`

---

### Manual Start

```bash
# From VerbaDeck folder
npm run dev

# Wait for:
# - Server: http://localhost:3002
# - Client: http://localhost:5173

# Open browser: http://localhost:5173
```

---

### Creating Presentations

#### Method 1: Create from Scratch (AI-Guided)

1. Click **"Start from Scratch"** on home page
2. Describe your presentation topic
3. Choose tone (Professional, Witty, Technical, etc.)
4. Select number of slides (3-20)
5. Pick target audience
6. Click **"Generate Presentation"**
7. AI creates slides with trigger words - ready to present!

---

#### Method 2: Process Existing Content

**Option A: Paste Text**
1. Click **"Process Content"** on home page
2. Select AI model (or use balanced default)
3. Check "Preserve exact wording" (recommended for legal/medical)
4. Paste your script
5. Click **"Process with AI"**
6. AI segments text and suggests triggers

**Option B: Upload PowerPoint**
1. Click **"Upload PowerPoint"**
2. Select `.pptx` file
3. Text and images extracted automatically
4. AI generates trigger words
5. Edit as needed

---

#### Method 3: Know It All Wall

1. Click **"Start Q&A Practice"** on home page
2. Enter a topic or upload content
3. AI generates knowledge base with questions
4. Practice voice-activated Q&A
5. Confirm correct keywords to advance
6. Perfect for interview prep or teaching

---

### Presenting with Voice Control

1. **Navigate to Present View**: Click **"3. Present"** button (top navigation)
2. **Start Listening**: Click **🎤 Voice** button (grant mic permission)
3. **Wait for Connected**: Status badge turns green
4. **Speak Naturally**: Say your presentation
5. **Auto-Advance**: Slides advance when you say trigger words
6. **Go Back**: Say "back" to return to previous slide
7. **Q&A Mode**: Click "Q&A" button to enable question detection

**Trigger Carousel** (bottom of screen):
- **Left**: Previous trigger or "Say back"
- **Center**: Current slide's trigger words (highlighted)
- **Right**: Next slide's trigger (preview)

---

### Dual-Monitor Presenter Mode

1. Click **"Open Audience View"** button (Present view)
2. New window opens with clean view
3. Drag to second monitor/projector
4. Press F11 for full-screen
5. Present from main window (shows triggers, controls, notes)
6. Audience sees only content and images

**BroadcastChannel** keeps both windows synchronized in real-time!

---

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- React 18 + TypeScript
- Vite (ultra-fast HMR)
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- React Router
- Tiptap (rich text editor)
- vite-plugin-pwa (PWA support)

**Backend**:
- Node.js + Express
- WebSocket proxy for AssemblyAI
- OpenRouter API client
- Replicate API integration
- Operation-specific model defaults

**APIs**:
- AssemblyAI Universal-Streaming v3 (real-time STT)
- OpenRouter (unified access to 50+ AI models)
- Replicate (image generation)

**Storage**:
- LocalStorage (presentation library, settings)
- File System (.verbadeck export/import)

**Testing**:
- Playwright (E2E + visual regression)
- 100% test coverage on all 3 modules

---

### How Voice Control Works

```
┌─────────────────────────────────────────────────────────┐
│                    User Speaks                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Browser: Web Audio API captures microphone             │
│  AudioWorklet converts Float32 → PCM16 (16kHz mono)     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  WebSocket → Node.js Proxy (localhost:3002)             │
│  Adds AssemblyAI Authorization header                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  AssemblyAI Real-Time STT                                │
│  Returns transcript events via WebSocket                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  React App: Trigger Detection Engine                     │
│  1. Q&A Mode Check: If enabled and "?" detected →        │
│     generate answers                                     │
│  2. BACK Check: "back", "previous", "go back" →          │
│     go to previous slide                                 │
│  3. Trigger Match: Check current slide triggers          │
│     - Normalize (lowercase, strip punctuation)           │
│     - Regex: \b{trigger}(s|es|ies)?\b (plural support)  │
│  4. Debounce: 2-second delay prevents double-advance     │
│  5. Navigate: Update section index                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  BroadcastChannel syncs to audience view                 │
│  Both windows stay in perfect sync                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
verbadeck/
├── 🪟 Windows Launchers
│   ├── create-shortcut.bat                 # Desktop shortcut creator
│   ├── create-desktop-shortcut.ps1         # PowerShell script
│   ├── start-verbadeck.bat                 # Basic launcher
│   └── start-verbadeck-with-browser.bat    # Auto-browser launcher
│
├── 📄 Documentation
│   ├── README.md                            # This file
│   ├── QUICK_START.md                       # Quick start guide
│   ├── VERBADECK_USER_GUIDE.md              # Complete user guide
│   ├── CREATE_DESKTOP_SHORTCUT.md           # Shortcut instructions
│   ├── MODEL_CONFIGURATION.md               # AI model docs
│   ├── KNOW_IT_ALL_WALL.md                  # Q&A mode docs
│   └── UI_INVESTIGATION_REPORT.md           # Testing report
│
├── client/                                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateFromScratch.tsx       # AI-guided builder
│   │   │   ├── CreatePresentation.tsx      # Content processor
│   │   │   ├── PresenterView.tsx           # Main presentation
│   │   │   ├── AudienceView.tsx            # Clean audience display
│   │   │   ├── RichSectionEditor.tsx       # Content editing
│   │   │   ├── KnowItAllWall.tsx           # Q&A practice mode
│   │   │   ├── QAPanel.tsx                 # Q&A interface
│   │   │   ├── StatusBar.tsx               # Top navigation
│   │   │   ├── SettingsModal.tsx           # Settings dialog
│   │   │   ├── AdvancedSettings.tsx        # Model configuration
│   │   │   ├── LibraryBrowser.tsx          # Presentation library
│   │   │   ├── ModelSelector.tsx           # AI model picker
│   │   │   ├── TriggerCarousel.tsx         # Trigger display
│   │   │   ├── TranscriptTicker.tsx        # Live transcript
│   │   │   ├── CurrentSlidePreview.tsx     # Slide preview
│   │   │   ├── PresentationTimer.tsx       # Timer widget
│   │   │   ├── MarkdownRenderer.tsx        # Markdown display
│   │   │   └── Footer.tsx                  # Footer branding
│   │   ├── hooks/
│   │   │   ├── useAudioStreaming.ts        # WebSocket + Audio
│   │   │   ├── useOpenRouter.ts            # AI API client
│   │   │   ├── useBulkImageGeneration.ts   # Batch images
│   │   │   ├── useFileOperations.ts        # Save/load logic
│   │   │   ├── useAutoSave.ts              # Auto-save hook
│   │   │   ├── useLocalStorage.ts          # Storage hook
│   │   │   └── useKeywordDetection.ts      # Trigger matching
│   │   ├── lib/
│   │   │   ├── script-parser.ts            # Trigger matching
│   │   │   ├── openrouter-models.ts        # Model definitions
│   │   │   ├── presentation-library.ts     # Library management
│   │   │   ├── api-client.ts               # API client
│   │   │   └── text-highlighter.ts         # Text highlighting
│   │   ├── pages/
│   │   │   ├── HomePage.tsx                # Landing page
│   │   │   └── AudiencePage.tsx            # Audience route
│   │   ├── App.tsx                         # Main application
│   │   └── main.tsx                        # Entry point
│   ├── public/
│   │   ├── audio-processor.js              # AudioWorklet
│   │   └── icon.ico                        # App icon
│   └── package.json
│
├── server/
│   ├── server.js                           # Express + WebSocket
│   ├── openrouter.js                       # AI API client
│   ├── image-generator.js                  # Replicate client
│   ├── model-config.js                     # Operation defaults
│   ├── prompts.js                          # AI prompts
│   ├── middleware/
│   │   └── timing-middleware.js            # Request timing
│   └── package.json
│
├── tests/                                   # Playwright tests
│   ├── verbadeck.spec.ts                   # Main app tests
│   ├── model-configuration.spec.ts         # Model config tests
│   ├── model-configuration-redesign.spec.ts
│   ├── speaker-notes-workflow.spec.ts
│   ├── ui-investigation.spec.ts
│   └── screenshots/                        # Visual regression
│
├── .env                                     # API keys (gitignored)
├── .gitignore                               # Excludes secrets
├── package.json                             # Root workspace
└── playwright.config.ts                     # Test configuration
```

---

## 🔧 Development

### Available Scripts

```bash
# Root workspace
npm run dev          # Start server + client concurrently
npm test             # Run Playwright tests
npm run test:ui      # Run tests with UI mode

# Client only
cd client
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build

# Server only
cd server
npm start            # Express server (port 3002)
npm run dev          # With auto-restart
```

### Environment Variables

```env
# .env (project root)
AAI_API_KEY=your_assemblyai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
REPLICATE_API_KEY=your_replicate_api_key
PORT=3002                # Optional, defaults to 3002
NODE_ENV=development     # Optional
```

🔒 **Security**: Never commit `.env` - it's already in `.gitignore`

---

## 🚀 Production Deployment

### Build the Client

```bash
cd client
npm run build
# Output: client/dist/
```

### Deploy Options

**Option 1: Vercel/Netlify (Recommended)**
- Deploy `client/dist/` to Vercel or Netlify
- Deploy `server/` as separate Node.js app (Railway, Render, Heroku)
- Update WebSocket URL in client for production server

**Option 2: All-in-One Server**
- Serve `client/dist/` from Express
- Single deployment to Railway, Render, or any Node.js host

**Option 3: Docker**
- Use multi-stage Dockerfile
- Build client, run server, serve static files

### HTTPS Requirement

⚠️ **Critical for Production**:
- Microphone access requires HTTPS (except localhost)
- WebSocket should use `wss://` in production
- Use platform SSL or reverse proxy (nginx, Caddy)

### Production Environment

```bash
# Set these in your production environment
AAI_API_KEY=<your-key>
OPENROUTER_API_KEY=<your-key>
REPLICATE_API_KEY=<your-key>
PORT=3002
NODE_ENV=production
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with UI mode (debugging)
npm run test:ui

# Update visual snapshots
npx playwright test --update-snapshots

# Run specific test file
npx playwright test tests/verbadeck.spec.ts
```

**Test Coverage** (100% Passing):
- ✅ Landing page and navigation (13/13)
- ✅ Model configuration system (5/5)
- ✅ Model configuration redesign (8/8)
- ✅ Speaker notes workflow (2/2)
- ✅ Settings button accessibility
- ✅ Workflow state management
- ✅ Voice control integration
- ✅ Dual-monitor synchronization

---

## 🐛 Troubleshooting

### WebSocket Connection Failed
- ✓ Check server is running on port 3002
- ✓ Verify `.env` file exists with valid API keys
- ✓ Check browser console for errors
- ✓ Restart server and client

### Microphone Not Working
- ✓ Grant microphone permissions in browser
- ✓ HTTPS required in production (localhost OK for dev)
- ✓ Try Chrome (best Web Audio API support)
- ✓ Check system microphone settings

### Trigger Words Not Detected
- ✓ Check transcript bar - is text appearing?
- ✓ Verify "Connected" status (green badge)
- ✓ Speak clearly at normal pace
- ✓ Check trigger word matches your speech
- ✓ Try alternative triggers (shown in editor)

### AI Processing Fails
- ✓ Verify OpenRouter API key is correct
- ✓ Check model availability (some require credits)
- ✓ Ensure text is not empty
- ✓ Try different AI model (GPT-4o Mini recommended)

### Audience View Not Syncing
- ✓ Both windows must be same origin (same domain)
- ✓ Check BroadcastChannel support (all modern browsers)
- ✓ Try closing and reopening audience view
- ✓ Check browser console for errors

### Desktop Shortcut Won't Create
- ✓ Run `create-shortcut.bat` as Administrator
- ✓ Right-click → "Run as administrator"
- ✓ Check PowerShell execution policy
- ✓ Try manual shortcut creation (see [CREATE_DESKTOP_SHORTCUT.md](CREATE_DESKTOP_SHORTCUT.md))

---

## 💡 Tips for Best Results

### Script Writing
- **Clear sections**: Natural topic breaks
- **Strong triggers**: Unique words, not "the", "and", "a"
- **Natural flow**: Write like you speak
- **Plural-friendly**: Triggers auto-match plurals

### Presenting
- **Test first**: Practice run before real presentation
- **Speak naturally**: Don't overemphasize triggers
- **Check venue**: Test Wi-Fi and ambient noise
- **Have backup**: Keep keyboard handy (arrow keys work!)

### AI Model Selection
- **GPT-4o Mini**: Fast, cost-effective, free tier (default for most operations)
- **Claude 3.5 Sonnet**: Best quality (default for presentations and Q&A)
- **GPT-4 Turbo**: Most creative
- **Gemini Pro**: Fast and free
- **Use presets**: Quick configuration for speed/quality balance
- **See**: [AdvancedSettings](client/src/components/AdvancedSettings.tsx) for operation-specific defaults

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Credits

**Built by Machine King Labs**
Website: [machinekingdomlabs.com](https://machinekingdomlabs.com)

**Powered by amazing open-source tools**:
- [AssemblyAI](https://www.assemblyai.com/) - Real-time speech-to-text
- [OpenRouter](https://openrouter.ai/) - Unified AI model access
- [Replicate](https://replicate.com/) - Image generation
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [Playwright](https://playwright.dev/) - Testing framework

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/taskmasterpeace/verbadeck/issues)
- **Discussions**: [GitHub Discussions](https://github.com/taskmasterpeace/verbadeck/discussions)
- **Documentation**: [VERBADECK_USER_GUIDE.md](VERBADECK_USER_GUIDE.md) - Complete guide with examples
- **Quick Start**: [QUICK_START.md](QUICK_START.md) - Get started in minutes

---

## 🌟 Star History

If VerbaDeck helps you deliver better presentations, please star ⭐ this repository!

---

<div align="center">

**Made with ❤️ by [Machine King Labs](https://machinekingdomlabs.com)**

**Redefining Presentations with AI**

🎤 **Happy Presenting!** 🚀

</div>
