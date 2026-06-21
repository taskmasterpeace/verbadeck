# Create Workflows Module

## Overview
Two creation paths: "Create from Scratch" (AI-guided wizard) and "Process Content" (paste text -> AI structuring). Both produce Section[] arrays that feed into the Editor.

## Files
| File | Lines | Purpose |
|------|-------|---------|
| `client/src/components/CreatePresentation.tsx` | 154 | Home page with 3 creation option cards |
| `client/src/components/CreateFromScratch.tsx` | 170 | Step-by-step wizard |
| `client/src/hooks/useCreateWizard.ts` | ~200 | Wizard state machine |
| `client/src/hooks/useSlideGeneration.ts` | ~180 | Generate questions/slides/notes |
| `client/src/components/AIScriptProcessor.tsx` | 368 | Paste text -> AI processing (LARGE) |
| `client/src/pages/AIScriptProcessorPage.tsx` | ~80 | Page wrapper |
| `client/src/pages/CreateFromScratchPage.tsx` | ~80 | Page wrapper |

## Create from Scratch Wizard
1. **Topic Input**: User enters topic + slide count (3-10)
2. **Generate Questions**: AI creates questions for each slide
3. **Answer Questions**: User answers (text input per question)
4. **Generate Slide Options**: ONE AT A TIME with preview
5. **Generate Speaker Notes**: BATCH all slides
6. -> onSectionsGenerated() -> App.tsx -> Zustand store -> redirect to /editor

## Process Content (AIScriptProcessor)
1. **Input**: Paste text OR upload PowerPoint
2. **Goal Picker**: Pitch / Training / Update / Keynote (auto-sets tone)
3. **Model Selection**: Choose AI model (default: GPT-4o-mini)
4. **Process**: Call POST /api/process-script
5. -> Returns structured sections with triggers
6. -> onSectionsGenerated() -> redirect to /editor

### Goal Picker Flow (important gotcha)
- Clicking "Process with AI" first time shows goal picker cards
- User selects goal OR clicks "Skip"
- Must click "Process with AI" AGAIN after goal selection
- This two-click flow confuses users and Playwright tests

## API Endpoints Used
- POST /api/generate-questions - Initial questions
- POST /api/generate-slide-options - Slide content variations
- POST /api/generate-speaker-notes - Batch notes generation
- POST /api/process-script - Parse raw text -> sections
- POST /api/upload-presentation - PowerPoint file upload

## Known Issues
- AIScriptProcessor at 368 lines (goal picker + API + preview mixed)
- Goal picker requires 2 clicks of "Process with AI" (confusing)
- clearPresentation() called at wizard start (wipes old data)
- No cancel/back during multi-step wizard
- Progress simulation is fake (not real server progress)

## Connections
- **Writes to**: usePresentationStore (setSections, setViewMode)
- **API**: useOpenRouter (processScript, generateQuestions, etc.)
- **Navigates to**: /editor after successful generation
- **Used by**: Dashboard cards, sidebar navigation
