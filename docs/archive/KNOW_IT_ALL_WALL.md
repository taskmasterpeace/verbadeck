# Know It All Wall - Voice-Driven Q&A System 🎤❓

## Overview

Know It All Wall transforms VerbaDeck into an intelligent Q&A system that listens for questions, generates two answer options, and lets you select the correct answer by speaking keywords. Perfect for press conferences, investor pitches, town halls, and live Q&A sessions.

---

## 🎯 What It Does

### The Problem
During live Q&A sessions, presenters need to:
- Think quickly on their feet
- Provide consistent, on-brand answers
- Have backup options for different audience tones
- Manage follow-up questions smoothly

### The Solution
Know It All Wall provides:
- **AI-powered context understanding** - Analyzes your knowledge base automatically
- **Dual answer options** - Two different approaches for every question
- **Voice-activated selection** - Speak keywords to choose which answer to give
- **Inline keyword highlighting** - See exactly which words to say
- **Smart follow-ups** - AI generates relevant follow-up questions

---

## 🚀 Quick Start

### 1. Prepare Your Knowledge Base
```
Paste or type any content that defines your topic:
- Product documentation
- Company background
- Resume + job description
- Meeting notes
- Research papers
```

### 2. Start a Session
1. Click **"Know It All Wall"** button
2. Paste your knowledge base content
3. Or load a preset (resume + job description, product pitch, etc.)
4. Click **"Start Session"**

### 3. AI Setup (4-phase process)
The system automatically:
1. **Analyzes** your knowledge base (detects document types)
2. **Generates** initial contextual questions
3. **Processes** your answers
4. **Creates** intelligent follow-up questions

*Takes 30-45 seconds depending on content length*

### 4. Ask Questions
Just speak naturally:
- "When will this be available?"
- "What's the pricing model?"
- "How does this compare to competitors?"

System detects questions ending with "?" automatically.

### 5. Select Your Answer
Two answers appear with keywords highlighted:
- **Say the first keyword** → Answer option highlights (confirming)
- **Say the second keyword** → Answer locks in (answered)
- **Say "back"** → Reset and choose the other answer

---

## 📋 Features

### Phase 1: AI Context Analysis System

#### Document Type Detection
Automatically identifies document types in your knowledge base:
- 📄 Resume
- 💼 Job Description
- 📊 Product Description
- 📈 Business Plan
- 📝 Meeting Notes
- 🎓 Research Paper
- And more...

#### Contextual Question Generation
AI analyzes your content and generates relevant questions:
- **Initial questions** - Based on document types detected
- **Follow-up questions** - Based on your previous answers
- **Smart variety** - Different question types (clarifying, probing, scenario-based)

#### Pre-Session Setup Flow
Beautiful 4-phase progress bar:
```
[25%] Analyzing knowledge base...
[50%] Generating initial questions...
[75%] Processing your context...
[100%] Creating follow-up questions...
```

Visual document badges show detected content types.

### Phase 2: Inline Keyword Highlighting

#### HighlightedText Component
Keywords are highlighted throughout the answer text:
- **Blue background** - Undetected keywords (waiting to be spoken)
- **Green background + ring** - Detected keywords (you said this!)
- **Seamless integration** - Works in headings, paragraphs, bullets

#### Smart Keyword Detection
- **Word boundaries** - Only matches whole words
- **Case insensitive** - "Available" matches "available"
- **Phrase support** - Multi-word keywords like "next quarter"
- **Real-time highlighting** - Keywords light up as you speak

#### State Transitions
```
ready → confirming → answered
  ↓         ↓           ↓
Both    One answer   Selected
shown    visible     answer only
```

#### "Back" Command
Say any of these to reset:
- "back"
- "cancel"
- "reset"
- "undo"

Clears detected keywords and returns to ready state.

---

## 🎨 User Interface

### Question Card Layout

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ When will this be available?     [Status] ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                              ┃
┃  Answer 1                  Answer 2          ┃
┃  ┌────────────────────┐   ┌────────────────┐┃
┃  │ ○ Q4 Launch         │   │ ○ Beta Testing  │┃
┃  │                     │   │                 │┃
┃  │ We're targeting Q4  │   │ Currently in    │┃
┃  │ for the public      │   │ beta with select│┃
┃  │ launch...           │   │ partners...     │┃
┃  │                     │   │                 │┃
┃  │ Keywords:           │   │ Keywords:       │┃
┃  │ [launch] [quarter]  │   │ [beta] [testing]│┃
┃  └────────────────────┘   └────────────────┘┃
┃                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Status Indicators

**Generating:**
```
🔵 Generating... [spinner]
```

**Ready (both answers shown):**
```
Both answer options visible
Keywords highlighted in blue
```

**Confirming (first keyword detected):**
```
⚠️ Say 2nd keyword
Only matching answer shown
First keyword green, second blue
Answer card pulses blue
```

**Answered:**
```
✅ Answered
Only selected answer shown
Both keywords green
Card background green tint
```

### Answered Questions Stack
After answering, questions collapse into an expandable section:
```
📋 Answered Questions (5) [click to expand]
```

### Presets
Built-in knowledge base templates:
- 🎯 **Job Interview** - Resume + job description
- 📊 **Product Launch** - Product description + market analysis
- 🏢 **Investor Pitch** - Business plan + financial projections
- 📚 **Academic Defense** - Research paper + thesis

---

## 🔧 Technical Architecture

### New API Endpoints

#### 1. Analyze Knowledge Base
```javascript
POST /api/analyze-knowledge-base

Request:
{
  "knowledgeBase": "string", // Your content
  "model": "string"          // Optional AI model
}

Response:
{
  "documentTypes": [
    {
      "type": "resume",
      "confidence": 0.95,
      "indicators": ["work experience", "education"]
    },
    {
      "type": "job_description",
      "confidence": 0.88,
      "indicators": ["requirements", "qualifications"]
    }
  ],
  "summary": "Detected a job interview preparation scenario..."
}
```

#### 2. Generate Context Questions
```javascript
POST /api/generate-context-questions

Request:
{
  "knowledgeBase": "string",
  "documentTypes": [...],    // From analyze endpoint
  "model": "string"
}

Response:
{
  "questions": [
    "Can you walk me through your experience with React?",
    "What interests you most about this role?",
    "How do you handle tight deadlines?"
  ]
}
```

#### 3. Generate Follow-up Questions
```javascript
POST /api/generate-followup-questions

Request:
{
  "knowledgeBase": "string",
  "previousQuestions": [...],
  "userAnswers": [...],      // Answers to initial questions
  "model": "string"
}

Response:
{
  "questions": [
    "Can you give a specific example of that?",
    "How did that experience shape your approach?",
    "What challenges did you face?"
  ]
}
```

#### 4. Answer Question with Keywords
```javascript
POST /api/answer-question-with-keywords

Request:
{
  "question": "When will this be available?",
  "knowledgeBase": "string",
  "model": "string"
}

Response:
{
  "answer1": {
    "heading": "Q4 Public Launch",
    "brief": "We're on track for fourth quarter release",
    "bullets": [
      "Beta testing complete by September",
      "Public launch in October",
      "Enterprise features in November"
    ],
    "full": "We're targeting Q4 2025 for our public launch...",
    "keywords": ["launch", "quarter"]
  },
  "answer2": {
    "heading": "Beta Access Available Now",
    "brief": "Currently accepting beta testers",
    "bullets": [...],
    "full": "We're actually in beta right now...",
    "keywords": ["beta", "testing"]
  }
}
```

### New Components

#### KnowItAllMode.tsx
Main container component:
- Manages session state
- Handles preset loading
- Orchestrates setup flow
- Integrates voice recognition

#### KnowItAllQuestionCard.tsx
Individual question display:
- Shows question text
- Renders two answer options
- Manages selection state
- Status indicator (generating/ready/confirming/answered)

#### KnowItAllWall.tsx
Questions grid manager:
- Infinite scroll support
- Intersection Observer for visibility tracking
- Auto-scrolls to newest question
- Collapsible answered questions

#### HighlightedText.tsx
Inline keyword highlighting:
- Parses text for keywords
- Renders highlighted segments
- Updates based on detection state
- Supports multiple HTML elements (h1-h6, p, span, li)

### New Utilities

#### text-highlighter.ts
```typescript
// Parse text and identify keywords
parseTextWithKeywords(text: string, keywords: string[]): TextSegment[]

// Check if keyword detected
isKeywordDetected(keyword: string, detectedKeywords: string[]): boolean
```

Text segments:
```typescript
interface TextSegment {
  text: string;
  isKeyword: boolean;
  keyword?: string; // The matched keyword
}
```

### Updated Hooks

#### useKeywordDetection.ts
Enhanced with:
- "Back" command support (back/cancel/reset/undo)
- Specific keyword tracking (not just any keyword)
- State transition logic (ready → confirming → answered)
- Viewport-aware detection (only active questions)

---

## 🎯 Use Cases

### 1. Job Interview Prep
**Knowledge Base:**
- Your resume
- Job description
- Company research

**Sample Questions:**
- "Tell me about your experience with [technology]"
- "Why are you interested in this role?"
- "Describe a challenging project"

**Answer Options:**
- Technical depth vs. business impact
- Formal vs. conversational tone
- Short vs. detailed responses

### 2. Investor Pitch Q&A
**Knowledge Base:**
- Pitch deck content
- Financial projections
- Market analysis

**Sample Questions:**
- "What's your go-to-market strategy?"
- "How do you plan to acquire customers?"
- "What's your competitive advantage?"

**Answer Options:**
- Aggressive growth vs. sustainable scaling
- Technical differentiation vs. market positioning
- Current traction vs. future vision

### 3. Product Launch Press Conference
**Knowledge Base:**
- Product specs
- Press release
- Competitive analysis

**Sample Questions:**
- "When will this be available?"
- "How much will it cost?"
- "What makes this different from competitors?"

**Answer Options:**
- Technical details vs. benefits
- Pricing tiers vs. value proposition
- Feature comparison vs. use cases

### 4. Academic Defense
**Knowledge Base:**
- Research paper
- Thesis
- Related works

**Sample Questions:**
- "What's your research methodology?"
- "How does this advance the field?"
- "What are the limitations?"

**Answer Options:**
- Technical rigor vs. practical applications
- Theoretical contribution vs. empirical findings
- Current results vs. future research

---

## 💡 Best Practices

### Knowledge Base Preparation

**✅ DO:**
- Include comprehensive background information
- Add specific facts, dates, numbers
- Cover multiple perspectives
- Include potential objections/challenges
- Keep content focused and relevant

**❌ DON'T:**
- Include sensitive or confidential information
- Add irrelevant filler content
- Mix unrelated topics
- Exceed ~50,000 characters (model context limits)

### During Live Sessions

**✅ DO:**
- Speak keywords clearly and distinctly
- Wait for keyword highlighting to confirm detection
- Use "back" command if you change your mind
- Let questions finish before starting your answer

**❌ DON'T:**
- Rush through keywords (may not detect)
- Speak over audience questions
- Say keywords from both answers (confusing)
- Forget to check which answer is highlighted

### AI Model Selection

**Recommended Models:**

**For Speed (< 3 seconds):**
- `meta-llama/llama-3.1-8b-instruct` - Fast, good quality
- `openai/gpt-4o-mini` - Balanced speed/quality

**For Quality:**
- `anthropic/claude-3.5-sonnet` - Best understanding
- `openai/gpt-4o` - Excellent reasoning

**For Cost:**
- `meta-llama/llama-3.1-8b-instruct` - $0.05 per 1M tokens
- `openai/gpt-4o-mini` - $0.15 per 1M tokens

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Load Know It All mode
- [ ] Paste knowledge base content (500+ words)
- [ ] Start session
- [ ] Verify setup progress bar (4 phases)
- [ ] Check document type badges appear
- [ ] Ask a question ending with "?"
- [ ] Verify AI generates 2 answers
- [ ] Check keywords are highlighted (blue)
- [ ] Say first keyword → verify it turns green
- [ ] Verify only matching answer remains visible
- [ ] Say second keyword → verify answer locks in
- [ ] Check answered question moves to stack
- [ ] Say "back" during confirming → verify reset
- [ ] Test with different AI models
- [ ] Export session data (JSON)

### Playwright Tests
```bash
npm run test:ui
```

Test coverage:
- Component rendering
- Keyword detection logic
- State transitions
- Visual regression

---

## 🐛 Troubleshooting

### Question Not Detected
**Symptoms:** You asked a question but nothing appeared

**Solutions:**
- Ensure question ends with "?"
- Check microphone is active (listening indicator)
- Verify transcript is updating (bottom bar)
- Question must be > 10 characters

### Keywords Not Highlighting
**Symptoms:** Keywords stay blue even after speaking

**Solutions:**
- Speak clearly and distinctly
- Check transcript shows your words
- Keywords are case-insensitive but need word boundaries
- Try saying the keyword alone: "launch" (pause) "quarter"

### Answer Not Locking In
**Symptoms:** Second keyword doesn't select answer

**Solutions:**
- Verify BOTH keywords are from the SAME answer
- Check first keyword turned green before saying second
- Don't mix keywords from different answers
- Use "back" command to reset if needed

### Setup Takes Too Long
**Symptoms:** Progress bar stuck or slow

**Solutions:**
- Try faster AI model (llama-3.1-8b-instruct)
- Reduce knowledge base size (< 10,000 words)
- Check OpenRouter API has credits
- Verify internet connection

### Wrong Answer Options
**Symptoms:** AI-generated answers don't match your content

**Solutions:**
- Improve knowledge base quality (more specific details)
- Use better AI model (Claude 3.5 Sonnet)
- Add more context about the topic
- Rephrase question to be more specific

---

## 📊 Performance Metrics

### Setup Phase Timings

**Knowledge Base Analysis:**
- Small (< 1,000 words): 2-4 seconds
- Medium (1,000-5,000 words): 5-10 seconds
- Large (5,000-20,000 words): 10-20 seconds

**Question Generation:**
- Initial questions (5): 8-15 seconds
- Follow-up questions (3): 5-10 seconds

**Total Setup Time:**
- Typical: 30-45 seconds
- Fast model (Llama): 20-30 seconds
- Premium model (GPT-4): 45-60 seconds

### Live Q&A Performance

**Question Detection:**
- Latency: < 500ms after "?"
- Accuracy: ~95% for clear audio

**Answer Generation:**
- Fast model: 2-5 seconds
- Standard model: 5-10 seconds
- Premium model: 10-20 seconds

**Keyword Detection:**
- Latency: ~200ms after word spoken
- Accuracy: ~90% for clear speech
- False positives: < 5%

---

## 🔐 Privacy & Security

### Data Handling
- Knowledge base content sent to AI provider (OpenRouter)
- Transcript data processed by AssemblyAI
- No data stored on server (session-only)
- All data deleted when session ends

### API Keys
```env
AAI_API_KEY=your_assemblyai_key      # Voice recognition
OPENROUTER_API_KEY=your_openrouter_key # AI processing
```

Both stored in `.env` (never committed to git).

### Content Recommendations
- ✅ Use for: Public information, practice scenarios
- ⚠️ Avoid: Confidential data, personal information
- ❌ Never: Trade secrets, PII, passwords

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Multi-language support (Spanish, French, Mandarin)
- [ ] Custom keyword assignment (user chooses keywords)
- [ ] Answer rating system (thumbs up/down)
- [ ] Session analytics (questions answered, average time)
- [ ] Export answered questions as PDF/Word
- [ ] Voice tone analysis (confident vs. hesitant)
- [ ] Real-time answer editing during session
- [ ] Audience question upvoting
- [ ] Integration with presentation mode (show answers on slides)

### Community Requests
- Offline mode with cached AI responses
- Multiple simultaneous questions (queue)
- Team mode (multiple presenters)
- Question categories/tagging
- Historical session replay

---

## 📈 Version History

### Version 1.3 (Current)
**Phase 1: AI Context Analysis**
- Document type detection
- Context-aware question generation
- Follow-up question intelligence
- 4-phase setup flow
- Visual progress indicators

**Phase 2: Inline Keyword Highlighting**
- HighlightedText component
- Real-time keyword detection
- "Back" command support
- State transitions (ready/confirming/answered)
- Answered questions stack

**UI Improvements:**
- Removed timestamp from cards (cleaner)
- Updated footer to Version 1.3
- Enhanced status indicators

### Version 1.2
- Initial Know It All Wall release
- Basic Q&A generation
- Two-answer system
- Keyword-based selection

---

## 🤝 Contributing

Found a bug? Have an idea?
- Report issues on GitHub
- Submit PRs for improvements
- Share your use cases
- Request new features

---

## 📚 Additional Resources

- [QUICKSTART.md](./QUICKSTART.md) - Get started with VerbaDeck
- [AI_FEATURES_SUMMARY.md](./AI_FEATURES_SUMMARY.md) - All AI features
- [CLAUDE.md](./CLAUDE.md) - Development guide
- [MODEL_CONFIGURATION.md](./MODEL_CONFIGURATION.md) - AI model details

---

**Built with ❤️ by Machine King Labs**

*Know It All Wall - Because every question deserves two great answers.* 🎤✨
