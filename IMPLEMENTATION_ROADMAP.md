# VerbaDeck Implementation Roadmap
**Created:** January 31, 2025, 2:15 AM
**Scope:** MASSIVE - 6 major feature additions
**Timeline:** 3-4 weeks (phased approach)

---

## Executive Summary

You've identified 6 major features to add:

1. ✅ **Preservation Mode** - Don't edit user's exact wording
2. ✅ **Test Data Button** - Quick-load your TalkAdvantage pitch
3. 🔧 **Rich Text Editor** - Format text, save/load presentations
4. 📱 **Mobile PWA** - Full mobile implementation (from earlier plan)
5. 🎥 **Video Support** - Play MP4 files in presentations
6. 💬 **Live Q&A** - Real-time AI answers to audience questions (STREAMING)

**Tonight's Focus:** Items 1-2 + testing + planning
**This Week:** Items 3-4
**Next 2 Weeks:** Items 5-6

---

## Phase 1: Core Improvements (TONIGHT - 4 hours)

### **What I'm Doing Right Now:**

#### 1.1 Keep Full Model List ✅
**CHANGE FROM EARLIER PLAN:**
- ~~Simplified 4-option selector~~
- **NEW:** Keep all 50+ models visible
- Make it one-line dropdown
- Default to Mistral Small 3.1 (free)

#### 1.2 Preservation Mode ✅
**As planned, you approved:**
```
☑ Preserve exact wording (DEFAULT)
☐ Let AI improve clarity
```

#### 1.3 Test Data Button ✅
**NEW FEATURE:**
```
[📄 Load Test Presentation]  ← Button in AI Processor
```
- Clicking loads your TalkAdvantage 8-section pitch
- Fills textarea instantly
- Ready to process

#### 1.4 Double-Size Test ✅
**Test Requirements:**
- Take your 8-section pitch (380 words)
- Create 16-section version (760 words)
- Test both in preserve mode
- Verify layout works on widescreen
- Screenshot results

#### 1.5 Layout Fixes ✅
- Model selector: One line
- Process button: Better placement
- Character counter: Fix
- More space for textarea

#### 1.6 Security Audit ✅
- Verify `.env` in `.gitignore`
- Check git status
- Confirm no API keys exposed

**Deliverables Tonight:**
- Preservation mode working
- Test button functional
- Your pitch tested (both sizes)
- Layout cleaned up
- Security confirmed
- Screenshots + docs

---

## Phase 2: Rich Text Editor (Week 1 - 20 hours)

### **Goal:** Users can format text, save/load presentations

### 2.1 Rich Text Editor Integration

**Current:** Plain textarea
**New:** Rich text editor with formatting

**Options to evaluate:**
1. **Lexical** (Facebook) - Modern, React-native
2. **Slate.js** - Fully customizable
3. **Tiptap** - Based on ProseMirror, popular
4. **Quill** - Simpler, battle-tested

**Recommendation:** Tiptap (best React integration, good docs)

**Features to implement:**
- Bold, italic, underline
- Headings (H1, H2, H3)
- Lists (bullet, numbered)
- Links
- Text colors (for emphasis)
- Alignment (left, center, right)

**Why this matters:**
- Your pitch has specific formatting (emphasis points)
- Section headings vs body text
- Trigger words could be highlighted differently

### 2.2 Enhanced Save/Load System

**Current:** Basic JSON export
**New:** Full presentation management

**Features:**
```
┌─ My Presentations ──────────────────┐
│                                     │
│ 📄 TalkAdvantage Pro Pitch          │
│    8 sections • Last edited: Today  │
│    [Open] [Duplicate] [Delete]      │
│                                     │
│ 📄 Product Demo                     │
│    5 sections • Last edited: 3 days │
│    [Open] [Duplicate] [Delete]      │
│                                     │
│ [+ New Presentation]                │
└─────────────────────────────────────┘
```

**Storage:**
- LocalStorage for browser
- JSON export/import for backup
- Future: Cloud sync (Phase 7)

**Data Structure:**
```json
{
  "id": "uuid",
  "title": "TalkAdvantage Pro Pitch",
  "created": "2025-01-31",
  "modified": "2025-01-31",
  "sections": [
    {
      "id": "section-1",
      "content": "<p><strong>AI can write...</strong></p>",
      "richText": true,
      "advanceToken": "room",
      "selectedTriggers": ["room", "conversations"],
      "imageUrl": null,
      "videoUrl": null
    }
  ]
}
```

### 2.3 Test Double-Size Presentations

**Your requirement:** Make sure app handles larger content
- 16+ sections
- Long-form content
- Scrolling behavior
- Performance testing

**Tests:**
- 8 sections (your pitch) ✅
- 16 sections (2x) ✅
- 32 sections (stress test)
- 50+ sections (max capacity)

---

## Phase 3: Mobile PWA (Week 2 - 30 hours)

### **Use existing PWA_MOBILE_PLAN.md**

**Critical changes based on tonight's input:**

### 3.1 Single Monitor Only on Mobile ✅
**Your feedback:** "What if you only have one monitor?"

**NEW APPROACH:**
- Mobile = Presenter view ONLY
- NO audience view route on mobile
- Focus on presenter experience
- Desktop keeps dual-monitor

### 3.2 Portrait/Landscape Support

**Your requirement:** "16:9 and 9:16, compensate for both"

**Implementation:**
```css
/* Detect orientation */
@media (orientation: portrait) {
  .presentation-view {
    /* Stack vertically */
    flex-direction: column;
  }
}

@media (orientation: landscape) {
  .presentation-view {
    /* Side-by-side */
    flex-direction: row;
  }
}
```

**Image handling:**
- Portrait: Image top, text bottom
- Landscape: Image left, text right
- Auto-detect and adjust

### 3.3 Bottom Navigation (Thumb Zone)

**From earlier plan:**
```
┌──────────────┐
│              │
│   Content    │
│              │
├──────────────┤
│ [◀] [🎤] [▶] │ ← Bottom nav
└──────────────┘
```

**Key mobile features:**
- Full-screen mode
- Voice control button (center)
- Swipe gestures (left/right for sections)
- Screen wake lock
- Offline mode

**Timeline:**
- Day 1-2: PWA setup (vite-plugin-pwa)
- Day 3-4: Mobile layout
- Day 5-6: Touch gestures
- Day 7: Offline mode
- Day 8-9: Testing on real devices

---

## Phase 4: Video Support (Week 3 - 15 hours)

### **Goal:** Play MP4 videos in presentations

**Your requirement:** "Show actual video between things"

### 4.1 Video Integration

**UI Design:**
```
Section 3:
┌─────────────────────────────────────┐
│ 🎥 Video Demo                       │
│                                     │
│ [video player with controls]        │
│ ▶️ Play   ⏸️ Pause   🔇 Mute        │
│                                     │
│ Script text: "As you can see in    │
│ this demo..."                       │
│                                     │
│ Trigger: "demonstration"            │
└─────────────────────────────────────┘
```

**Features:**
- Upload MP4 files (or paste URL)
- Video plays on section load
- Voice commands:
  - Say "play" → video plays
  - Say "pause" → video pauses
  - Say "restart" → video restarts
- Auto-advance when video ends (optional)

### 4.2 Video Controls

**Options:**
```
Video Behavior:
● Play automatically when section loads
○ Wait for voice command "play"
○ Manual play button only

After video ends:
● Auto-advance to next section
○ Stay on current section
```

### 4.3 Portrait/Landscape Video

**Your requirement:** "Portrait and landscape"

**Implementation:**
- Detect video aspect ratio
- Portrait videos (9:16): Full height
- Landscape videos (16:9): Full width
- Use `object-fit: contain` for proper scaling

**Data Structure Update:**
```json
{
  "section": {
    "content": "Demo video showing...",
    "imageUrl": null,
    "videoUrl": "/videos/demo.mp4",
    "videoSettings": {
      "autoPlay": true,
      "autoAdvance": true,
      "muted": false
    }
  }
}
```

### 4.4 Technical Considerations

**File Storage:**
- Option A: Upload to server (`/uploads/videos/`)
- Option B: Use external URLs (YouTube, Vimeo)
- Option C: Data URLs (for small files)

**Formats:**
- MP4 (H.264) - Best compatibility
- WebM - Modern browsers
- Fallback for unsupported formats

**Performance:**
- Preload next section's video
- Compression recommendations
- Max file size limits (100MB?)

---

## Phase 5: Live Q&A Feature (Week 4 - 25 hours)

### **Goal:** Real-time AI answers to audience questions

**Your vision:** "System able to answer questions for the audience or help speaker answer"

### 5.1 Architecture (Based on Your Research)

**Flow:**
```
Audience asks question
  ↓
Presenter says "That's a good question" (trigger)
  ↓
System captures last 10 seconds of transcript
  ↓
Sends to OpenAI with streaming
  ↓
AI response streams back token-by-token
  ↓
Displays progressively on screen
  ↓
Presenter reads answer or elaborates
```

### 5.2 Question Detection

**Method 1: Keyword Trigger (Your idea)**
```javascript
const questionTriggers = [
  "that's a good question",
  "great question",
  "interesting question",
  "let me think about that",
  "question"
];

// When detected, capture previous transcript
```

**Method 2: Automatic Detection**
```javascript
function isQuestion(transcript) {
  // Check for question marks
  if (transcript.includes('?')) return true;

  // Check for interrogative words
  const questionWords = /^(who|what|when|where|why|how|can|could|would|should)/i;
  return questionWords.test(transcript.trim());
}
```

**Method 3: AssemblyAI Speaker Diarization**
- Detect when different speaker talks
- If speaker changes AND question detected
- Trigger Q&A mode

**Recommendation:** Start with Method 1 (keyword trigger), add Method 2 later

### 5.3 UI Design

**During Presentation:**
```
┌─ Presenter View ────────────────────┐
│                                     │
│ Current Section: Market Opportunity │
│                                     │
│ [Q&A MODE ACTIVE] 🎤                │
│                                     │
│ ┌─ Live Q&A ─────────────────────┐ │
│ │ Question:                       │ │
│ │ "Where is the best place to    │ │
│ │  pitch TalkAdvantage?"          │ │
│ │                                 │ │
│ │ AI Answer (streaming...):       │ │
│ │ "The best places to pitch       │ │
│ │  TalkAdvantage Pro would be..." │ │
│ │ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░         │ │
│ │                                 │ │
│ │ [Dismiss] [Keep for Reference]  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Toggle Button:**
```
[Q&A: OFF]  ← Click to enable question mode
[Q&A: ON]   ← Listening for questions
```

### 5.4 Streaming Implementation

**Backend (server/server.js):**
```javascript
// New endpoint for Q&A
app.post('/api/qna-stream', async (req, res) => {
  const { question, context } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are helping a presenter answer audience questions. Be concise, helpful, and professional."
      },
      {
        role: "user",
        content: `Context: ${context}\n\nQuestion: ${question}`
      }
    ],
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  res.end();
});
```

**Frontend (React hook):**
```typescript
// hooks/useQnAStreaming.ts
export function useQnAStreaming() {
  const [answer, setAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const askQuestion = async (question: string, context: string) => {
    setAnswer('');
    setIsStreaming(true);

    const response = await fetch('/api/qna-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          setAnswer(prev => prev + data.content);
        }
      }
    }

    setIsStreaming(false);
  };

  return { answer, isStreaming, askQuestion };
}
```

### 5.5 Context Management

**What to send to AI:**
- Current presentation title
- Current section content
- Previous 2-3 sections (for context)
- Company/product info (if available)
- Past Q&As in this session

**Example context:**
```javascript
const context = `
Presentation: TalkAdvantage Pro Pitch
Current Section: Market Opportunity ($1.5B conversational AI market)

Product: TalkAdvantage Pro - Real-time conversational intelligence tool that works during live meetings, not after.

Key Points:
- Language is your interface
- Five widgets: transcription, context pack, conversation cards, hotlink, notes
- $1.5B market, Meta SDK opening Fall 2025
- 6-month first-mover window
`;
```

### 5.6 Advanced Features (Future)

**Phase 5A (Basic):**
- Keyword trigger ("question")
- Streaming AI response
- Display on presenter view
- Manual dismiss

**Phase 5B (Enhanced):**
- Automatic question detection
- Voice activity detection (different speaker)
- Answer history (review past Q&As)
- Export Q&A transcript

**Phase 5C (Pro):**
- Multi-language questions
- Sentiment analysis (gauge audience engagement)
- Suggested follow-up questions
- Integration with presentation content

---

## Technical Architecture Updates

### **New Tech Stack Additions:**

**For Rich Text:**
- Tiptap editor
- @tiptap/react
- @tiptap/starter-kit

**For Video:**
- HTML5 `<video>` element
- react-player (optional wrapper)
- Video.js (advanced controls)

**For Q&A Streaming:**
- Server-Sent Events (SSE)
- OpenAI Streaming API
- EventSource polyfill (for older browsers)

---

## Updated Project Structure

```
verbadeck/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RichTextEditor.tsx        # NEW
│   │   │   ├── PresentationLibrary.tsx   # NEW
│   │   │   ├── VideoPlayer.tsx           # NEW
│   │   │   ├── QnAPanel.tsx              # NEW
│   │   │   ├── QnAToggle.tsx             # NEW
│   │   │   ├── PreservationModeToggle.tsx # NEW
│   │   │   ├── TestDataButton.tsx        # NEW
│   │   │   └── mobile/                   # NEW (from earlier plan)
│   │   ├── hooks/
│   │   │   ├── useQnAStreaming.ts        # NEW
│   │   │   ├── useVideoControls.ts       # NEW
│   │   │   ├── usePresentationLibrary.ts # NEW
│   │   │   └── useRichText.ts            # NEW
│   └── public/
│       └── videos/                        # NEW
├── server/
│   ├── server.js                          # UPDATE (add Q&A endpoint)
│   └── uploads/videos/                    # NEW
└── docs/
    ├── IMPLEMENTATION_ROADMAP.md          # THIS FILE
    ├── QNA_ARCHITECTURE.md                # NEW
    └── VIDEO_GUIDE.md                     # NEW
```

---

## Timeline Summary

### **Phase 1: Tonight (4 hours)**
- Preservation mode
- Test data button
- Layout improvements
- Double-size test
- Security audit

### **Phase 2: Week 1 (Mon-Fri, 20 hours)**
- Rich text editor (3 days)
- Save/load system (2 days)

### **Phase 3: Week 2 (Mon-Fri, 30 hours)**
- Mobile PWA (full week)

### **Phase 4: Week 3 (Mon-Fri, 15 hours)**
- Video support (3 days)
- Testing (2 days)

### **Phase 5: Week 4 (Mon-Fri, 25 hours)**
- Q&A streaming (4 days)
- Integration testing (1 day)

**Total:** 3-4 weeks, 94 hours of work

---

## Priorities & Dependencies

### **Critical Path:**
```
Phase 1 (Tonight) → Phase 2 (Rich Text) → Phase 3 (Mobile) → Phase 4 (Video) → Phase 5 (Q&A)
```

### **Can be parallelized:**
- Video support (Phase 4) and Mobile PWA (Phase 3) are independent
- Q&A feature (Phase 5) can start before mobile is done

### **Recommended Order:**
1. ✅ Phase 1: Core improvements (TONIGHT)
2. ✅ Phase 2: Rich text editor (THIS WEEK)
3. ✅ Phase 3: Mobile PWA (NEXT WEEK)
4. ⚠️ Phase 4: Video OR Phase 5: Q&A (choose priority)
5. ⚠️ Remaining phase

**Question for you:** Which is more important RIGHT NOW?
- 🎥 Video support (for product demos, tutorials)
- 💬 Live Q&A (for interactive presentations)

---

## Risk Assessment

### **Low Risk:**
- Phase 1 (Core improvements) - Small changes
- Phase 2 (Rich text) - Well-documented libraries
- Phase 4 (Video) - Standard HTML5

### **Medium Risk:**
- Phase 3 (Mobile PWA) - Complex, but we have a plan
- Phase 5 (Q&A basic) - OpenAI streaming is standard now

### **High Risk:**
- Phase 5 (Q&A advanced) - Speaker diarization, auto-detection
- Performance with large presentations (50+ sections)
- Mobile + Video together (bandwidth/battery)

---

## Success Criteria

### **Phase 1:**
✅ Preservation mode maintains 100% of original text
✅ Test button loads pitch instantly
✅ 16-section presentation works smoothly
✅ Layout uses ≤20% space for model selector
✅ `.env` confirmed secure

### **Phase 2:**
✅ Users can bold, italic, format text
✅ Save/load preserves formatting
✅ Presentation library shows all saved decks
✅ Export/import works

### **Phase 3:**
✅ PWA installs on mobile
✅ Works offline
✅ Touch gestures functional
✅ Portrait + landscape supported
✅ Voice control works on mobile

### **Phase 4:**
✅ MP4 videos play inline
✅ Voice commands control playback
✅ Portrait + landscape videos display correctly
✅ Auto-advance option works
✅ No performance degradation

### **Phase 5:**
✅ Questions detected accurately
✅ AI responses stream smoothly (token-by-token)
✅ Answers are contextually relevant
✅ Presenter can dismiss/keep answers
✅ No lag or freezing during streaming

---

## Cost Implications

### **API Costs:**

**OpenRouter (existing):**
- Script processing: Mistral Small 3.1 (FREE)
- Trigger suggestions: Mistral Small 3.1 (FREE)

**Q&A Streaming (new):**
- GPT-4: $10/1M tokens (~$0.01 per question)
- Claude Opus: $15/1M tokens (~$0.015 per question)
- **Estimate:** $5-20/month for heavy users

**AssemblyAI (existing):**
- Real-time transcription: $0.025/min
- Speaker diarization: $0.035/min
- **Already accounted for**

**Storage:**
- LocalStorage: FREE (browser limit ~10MB)
- Videos: Need server storage or external hosting
- **Recommendation:** External hosting (YouTube embeds, Vimeo, S3)

---

## Next Steps

### **Immediate (Tonight):**
1. Implement Phase 1 features
2. Test with your pitch data
3. Document results
4. Get your approval on direction

### **Tomorrow:**
5. Review tonight's work
6. Decide Phase priority (Rich text? Mobile? Video? Q&A?)
7. Start chosen phase

### **This Week:**
8. Complete Phases 1-2
9. Begin Phase 3 or 4

---

## Open Questions

**1. Image Workflow:**
You said "figure out image workflow later" - confirm we're postponing this?

**2. Widescreen Layout:**
You mentioned concerns about single-monitor users. Should we:
- Keep dual-pane (current + next preview)?
- Make it toggleable?
- Different layout for single monitor?

**3. Video Priority:**
Is video support higher priority than Q&A, or vice versa?

**4. Q&A Trigger:**
Do you want:
- Manual keyword ("question")
- Automatic detection
- Both with toggle?

**5. AssemblyAI Speaker Diarization:**
Should we test if AssemblyAI can detect different speakers for Q&A?

**6. Deployment:**
When do we need production deployment ready?
- Local only for now?
- Need to deploy somewhere (Vercel, Railway)?

---

## Final Recommendation

### **Tonight:**
✅ Do Phase 1 (core improvements + testing)
✅ Create detailed plans for Phases 2-5
✅ Get your feedback on priorities

### **This Week:**
✅ Rich text editor (Phase 2) - Unlocks better UX
✅ Start mobile PWA (Phase 3) - Big market opportunity

### **Next 2 Weeks:**
Choose between:
- **Video first** (if product demos are priority)
- **Q&A first** (if interactive presentations are priority)

**My recommendation:** Rich Text → Mobile → Video → Q&A
**Why:** Each phase builds value incrementally, mobile opens new markets, video before Q&A is simpler.

---

**READY TO START PHASE 1?**

Say "go" and I'll begin implementation tonight.
Or tell me what to change in this plan first.

---

**End of Roadmap**

*This is a living document - will update as we progress through phases.*
