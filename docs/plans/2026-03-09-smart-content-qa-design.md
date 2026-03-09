# Smart Content Processing & Contextual Q&A — Design

**Goal:** Reduce friction for users processing content into presentations, and make live Q&A answers context-aware (slide-specific) with a non-disruptive UI.

## Part 1: Goal-Aware Processing

When unstructured text is pasted into Process Content, show a goal picker before processing:

- **Pitch** — persuade, sell an idea, call to action
- **Training** — teach, step-by-step, educational
- **Status Update** — inform, progress report, metrics
- **Keynote** — inspire, big ideas, storytelling

Each option shows its short description. Selecting a goal auto-sets:
- **Tone** (e.g., Pitch = "Bold & Provocative", Training = "Conversational")
- **Section structure bias** (passed to processScript prompt)
- **Q&A anticipation categories** (e.g., Pitch = ROI/objection questions)

**Smart detection:** If the pasted text has section markers (e.g., `SECTION 1: OPENING HOOK`), skip the goal picker and go straight to processing. Unstructured text shows the picker.

Power users see a "Skip — just process it" link to bypass the goal picker.

## Part 2: Contextual Q&A Answers (Priority)

Replace the flat "all slides as one string" prompt with slide-aware context.

### Server changes (`server/openrouter.js` — `answerQuestion`)

Current: receives `presentationContent` as concatenated text of all slides.

New: receives `currentSlideIndex`, `sections` array, `knowledgeBase`, `tone`, and optional `presentationGoal`. The prompt becomes:

```
You are helping a presenter answer a live question. They are currently on slide {N} of {total}.

CURRENT SLIDE (what presenter is discussing right now):
Title: {heading}
{slide N content}

PREVIOUS SLIDE (context just covered):
{slide N-1 content or "This is the first slide"}

NEXT SLIDE (what's coming up):
{slide N+1 content or "This is the last slide"}

FULL PRESENTATION SUMMARY (for broader context):
{2-3 sentence summary of remaining slides}

KNOWLEDGE BASE:
{knowledge base entries if any}

PRESENTATION GOAL: {Pitch/Training/Update/Keynote or "General"}
```

### API endpoint changes (`server/server.js`)

`POST /api/answer-question` body adds:
- `currentSlideIndex: number`
- `sections: Section[]` (server extracts context window)
- `presentationGoal?: string`

Existing `presentationContent` field kept for backward compatibility but ignored when `sections` is provided.

### Client changes (`hooks/useQASession.ts`)

In presenter mode, pass `currentSectionIndex` and `sections` array to the API instead of joining all content into one string.

### Always fresh answers

Never use pre-cached Q&A Anticipation answers. Always generate fresh with live slide context.

## Part 3: Non-Disruptive Q&A Panel

Replace the full-screen modal (`QAPanel.tsx`) with a slide-in side panel in presenter mode.

- Panel slides in from the right (~40% width)
- Presenter's notes and slide preview remain visible on the left
- Brief answer shown prominently at top (what you read first)
- Bullets and full answer below, scrollable
- Dismiss via button, Ctrl+M, or voice cancel word
- Timer/progress indicator stays but compact

No changes to: Q&A toggle button, voice detection, model selection, Know It All mode (keeps its own flow).

## Not in scope

- No changes to auto-save or Library
- No new dependencies
- No model changes (keep GPT-4o-mini for processing, Llama 8B via Groq for Q&A)
- No changes to Q&A Anticipation panel in Editor (stays as-is)
- No changes to Know It All Wall Q&A flow
