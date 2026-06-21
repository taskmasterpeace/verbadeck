# Know It All Wall Module

## Overview
AI-powered Q&A practice mode. User provides knowledge base -> AI generates questions -> user answers via voice -> keywords confirm answer selection. Designed for presentation rehearsal.

## Files
| File | Lines | Purpose |
|------|-------|---------|
| `client/src/components/KnowItAllMode.tsx` | 626 | Setup wizard + orchestrator (LARGE) |
| `client/src/components/KnowItAllWall.tsx` | 660 | Question display + detection (LARGE) |
| `client/src/components/know-it-all/SessionStats.tsx` | 127 | Stats bar with timer, counts, controls |
| `client/src/components/know-it-all/ExportSession.tsx` | ~80 | Export session to JSON |
| `client/src/components/ToneSelector.tsx` | ~120 | Tone selection (compact mode for KIA) |
| `client/src/hooks/useKeywordDetection.ts` | 176 | Voice keyword matching |
| `client/src/hooks/useKnowItAllSetup.ts` | ~150 | Initial question/answer generation |
| `client/src/hooks/useSoundEffects.ts` | ~80 | Audio feedback for events |
| `client/src/lib/know-it-all-types.ts` | ~60 | QuestionCard, Answer types |

## Workflow
1. User enters/loads knowledge base text
2. Selects tone (10 options, compact pill selector)
3. Clicks "Start Session" -> `useKnowItAllSetup` generates questions
4. Each question gets 2 answer options with 2 keywords each
5. Voice transcript checked for question detection (30+ starters or "?")
6. Voice transcript checked for keyword matches on visible questions
7. Both keywords from same answer detected = answer confirmed
8. Session stats track: total, answered, pending, errors, elapsed time

## Question Detection (KnowItAllWall)
- 30+ question starters: "how", "what", "can you", "tell me", etc.
- Must end with "?" OR start with question word
- Minimum 10 characters
- No duplicates (similarity check)
- `isLastTranscriptFinal` guard: only detect on final transcripts UNLESS ends with "?"

## Queue Mode vs Rapid Fire
- **Queue (1x)**: Only one question at a time. Blocks new questions while generating/ready/confirming.
- **Rapid Fire**: Multiple questions allowed. Only blocks while actively generating.
- Toggle in SessionStats bar

## Keyword Detection (useKeywordDetection)
- Requires BOTH keywords from same answer option to match
- Order doesn't matter (keyword2 before keyword1 works)
- Hyphenated keywords match spoken form ("user-centric" = "user centric")
- Uses `createTokenPattern()` from script-parser.ts
- Only checks visible questions (viewport-aware via status check)
- "back" command resets confirmation state

## API Endpoints Used
- `POST /api/answer-question-with-keywords` - Generate answer + keywords
- `POST /api/generate-questions` - Initial question generation

## Known Issues
- KnowItAllMode.tsx (626 lines) + KnowItAllWall.tsx (660 lines) = massive
- Question detection loops through 30+ starters per transcript
- Manual question input exists but UX is buried
- Mobile overflow at 375px (preset select + load button)
- No persistent session history

## Connections
- **Reads from**: useVoiceStore (lastTranscript, isLastTranscriptFinal)
- **Reads from**: usePresentationStore (selectedTone, selectedModel)
- **Uses**: useAudioStreaming (start/stop voice), useKeywordDetection
- **API**: server/openrouter.js (answerQuestionWithKeywords, generateQuestions)
