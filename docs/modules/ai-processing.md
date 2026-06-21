# AI Processing Module

## Overview
All AI interactions route through the server via OpenRouter API. Client hooks provide typed interfaces. Server selects optimal model per operation for cost/speed/quality balance.

## Client Files
| File | Lines | Purpose |
|------|-------|---------|
| `client/src/hooks/useOpenRouter.ts` | 333 | All AI API calls (LARGE - should split) |
| `client/src/hooks/useImageGeneration.ts` | 151 | AI image gen + stock search |
| `client/src/hooks/useBulkImageGeneration.ts` | 167 | Batch image generation |
| `client/src/hooks/useModelManagement.ts` | 51 | Get/set model per operation |
| `client/src/hooks/useModelConfig.ts` | 72 | Fetch model defaults from server |
| `client/src/lib/api-client.ts` | 116 | HTTP client with error handling |
| `client/src/lib/api-config.ts` | ~30 | Base URL computation |

## Server Files
| File | Lines | Purpose |
|------|-------|---------|
| `server/server.js` | 1367 | All API routes (MONOLITHIC) |
| `server/openrouter.js` | 1320 | OpenRouter API client (MONOLITHIC) |
| `server/model-config.js` | 157 | Model defaults + routing |
| `server/prompts.js` | 894 | All AI prompts |
| `server/image-generator.js` | 131 | Replicate image gen |
| `server/pexels-client.js` | 83 | Pexels stock images |
| `server/unsplash-client.js` | 115 | Unsplash stock images |

## Model Selection (model-config.js)
| Operation | Default Model | Why |
|-----------|--------------|-----|
| processScript | GPT-4o-mini ($0.15/1M) | Good structured output |
| generateQuestions | GPT-4o-mini | Fast, cheap |
| generateFAQs | Llama 3.1 8B (Groq) | Ultra-fast (~950ms) |
| answerQuestion | Llama 3.1 8B (Groq) | Sub-second response |
| suggestTriggers | Llama 3.1 8B (Groq) | Fast, simple task |
| speakerNotes | Claude 3.5 Sonnet | Quality creative writing |
| anticipateQuestions | Claude 3.5 Sonnet | Complex analysis |
| imagePrompts | Llama 3.1 (Groq) | Fast, simple task |

## Provider Routing
- Llama models -> Groq (for sub-second inference)
- Fallback chain: Groq -> GPT-4o-mini (on rate limits)
- `MODEL_PROVIDER_ROUTING` and `MODEL_FALLBACKS` in model-config.js

## API Endpoints
| Endpoint | Method | Purpose | Model |
|----------|--------|---------|-------|
| /api/process-script | POST | Parse text -> sections | GPT-4o-mini |
| /api/suggest-triggers | POST | AI trigger alternatives | Llama/Groq |
| /api/generate-faqs | POST | Create FAQ pairs | Llama/Groq |
| /api/answer-question | POST | Live Q&A (presenter) | Llama/Groq |
| /api/answer-question-with-keywords | POST | Know It All Q&A | Llama/Groq |
| /api/generate-questions | POST | Create from Scratch questions | GPT-4o-mini |
| /api/generate-slide-options | POST | Slide variations | GPT-4o-mini |
| /api/generate-speaker-notes | POST | Speaker notes from content | Claude 3.5 |
| /api/anticipate-questions | POST | Predict audience questions | Claude 3.5 |
| /api/generate-image | POST | Replicate AI image | N/A |
| /api/suggest-image-prompt | POST | Image description | Llama/Groq |
| /api/recommend-images | POST | Stock image search | N/A |
| /api/process-images | POST | Image OCR/analysis | GPT-4o-mini |
| /api/upload-presentation | POST | PowerPoint upload | N/A |

## Known Issues
- All API calls are blocking (no streaming)
- useOpenRouter.ts at 333 lines with 15+ methods (should split)
- server.js at 1367 lines (should split into route files)
- openrouter.js at 1320 lines (should split by operation)
- No request validation on server
- No retry logic on client
- No request timeout on client
- Progress simulation is fake (not from server)

## Connections
- **Called by**: Every module that needs AI (editor, create, know-it-all, presenter Q&A)
- **Reads from**: usePresentationStore (selectedModel, operationModels)
- **Config**: server/model-config.js controls all model selection
- **Prompts**: server/prompts.js contains all AI prompts (894 lines)
