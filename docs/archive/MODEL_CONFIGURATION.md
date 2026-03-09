# Model Configuration for VerbaDeck

## Overview

VerbaDeck now uses operation-specific AI models to optimize performance, cost, and quality. Each API operation has a carefully selected default model, with all models supporting structured JSON output.

## Default Model Assignments

### Fast & Cost-Effective Operations (GPT-4o Mini)

The following operations use **GPT-4o Mini** (`openai/gpt-4o-mini`) for fast, cost-effective structured output:

- **Generate Questions** (`/api/generate-questions`)
  - Creates 4-5 strategic questions for "Create from Scratch" flow
  - Simple task, benefits from speed

- **Generate Slide Options** (`/api/generate-slide-options`)
  - Creates 4 content variations per slide
  - High-volume generation, cost-efficiency matters

- **Generate FAQs** (`/api/generate-faqs`)
  - Creates 5-8 FAQ pairs from presentation content
  - Straightforward extraction task

- **Suggest Triggers** (`/api/suggest-triggers`)
  - Suggests 3-5 trigger words for a section
  - Simple pattern recognition

- **Generate Variations** (`/api/generate-variations`)
  - Creates 4 script variations (original, enhanced, concise, storytelling)
  - Fast iteration benefits user experience

### Premium Quality Operations (Claude 3.5 Sonnet)

The following operations use **Claude 3.5 Sonnet** (`anthropic/claude-3.5-sonnet`) for highest quality:

- **Process Script** (`/api/process-script`)
  - User's primary workflow
  - Requires nuanced understanding of presentation structure
  - Deserves premium quality

- **Answer Question** (`/api/answer-question`)
  - Live Q&A during presentations
  - User-facing, needs high quality responses
  - 8 tone personas require sophisticated generation

- **Process Images** (`/api/process-images`)
  - Vision + language task
  - Needs strong multimodal capabilities
  - Quality critical for narration

## Cost Comparison

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| GPT-4o Mini | $0.15 | $0.60 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |

**Example cost for typical "Create from Scratch" flow:**
- Generate 5 questions: ~500 tokens (GPT-4o Mini) ≈ $0.0002
- Generate 5 slides × 4 options: ~8000 tokens (GPT-4o Mini) ≈ $0.005
- **Total: Less than 1 cent per presentation**

## User Model Override

Users can always override the default model:

```javascript
// Frontend: User selects a model via UI
const selectedModel = 'openai/gpt-4-turbo';

// API call includes model parameter
fetch('/api/generate-questions', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'AI Ethics',
    model: selectedModel  // Override default
  })
});

// Backend: User model takes precedence
const selectedModel = getModelForOperation('generateQuestions', model);
// If model is provided → use it
// If model is null → use default (gpt-4o-mini)
```

## Structured Output Support

All models in VerbaDeck support structured JSON output:

### Native JSON Mode
- OpenAI models (GPT-4o, GPT-4o Mini, GPT-3.5 Turbo)
- Reasoning models (o1, o1-mini)

### JSON via Prompting
- Anthropic Claude (3.5 Sonnet, 3 Haiku, 3 Opus)
- Google Gemini (Pro 1.5, Flash 1.5)
- Meta Llama (3.1 70B, 3.1 405B)
- Perplexity Sonar (online models)

## Configuration File

Model defaults are defined in `server/model-config.js`:

```javascript
export const MODEL_DEFAULTS = {
  generateQuestions: 'openai/gpt-4o-mini',
  generateSlideOptions: 'openai/gpt-4o-mini',
  generateFAQs: 'openai/gpt-4o-mini',
  suggestTriggers: 'openai/gpt-4o-mini',
  generateVariations: 'openai/gpt-4o-mini',

  answerQuestion: 'anthropic/claude-3.5-sonnet',
  processScript: 'anthropic/claude-3.5-sonnet',
  processImages: 'anthropic/claude-3.5-sonnet',
};
```

## Benefits

1. **Cost Optimization**: Background tasks use GPT-4o Mini (20x cheaper than Claude)
2. **Speed**: Fast models for quick operations improve UX
3. **Quality**: Premium models for user-facing features
4. **Flexibility**: Users can override any default
5. **Reliability**: All models support required structured output

## Testing Different Models

To test a different model for an operation:

1. **Via UI**: Select model in Settings before the operation
2. **Via Code**: Pass `model` parameter in API calls
3. **Via Config**: Edit `server/model-config.js` to change defaults

## Monitoring

Server logs now show which model is being used:

```
❓ Generating questions for topic: "AI Ethics" using openai/gpt-4o-mini
✅ Generated 5 questions

💬 Answering question: "What about bias?" using anthropic/claude-3.5-sonnet
✅ Generated 2 answer options in professional tone
```
