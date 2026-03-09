# TalkAdvantage Pro Format - Implementation Summary

## ✅ BACKEND COMPLETE

### 1. Updated Prompts (`server/prompts.js`)

#### `generateSlideOptions` - NEW FORMAT
- Now generates **ONE comprehensive slide** per section (no variations)
- TalkAdvantage Pro Format includes:
  - **Headline**: Big, bold, memorable (max 10 words)
  - **Subtext**: Optional 1-2 sentence expansion
  - **Visual Elements**: 3-5 bullet points/callouts (what appears ON slide)
  - **Recommended Image**: Detailed description for image generation
  - **Trigger Words**: Primary + 2 alternatives

#### `generateSpeakerNotes` - NEW FORMAT
- Generates comprehensive speaker notes for ALL slides
- Each slide gets:
  - **Profound Statement**: Tweet-worthy killer sentence (max 20 words)
  - **Talking Points - 3 Options**:
    - **Option A (Data)**: 2-3 sentences with numbers, facts, metrics
    - **Option B (Vision)**: 2-3 sentences painting future/big picture
    - **Option C (Proof)**: 2-3 sentences with examples, demos, testimonials
  - **High Impact Paragraph**: 4-6 sentences telling complete story

### 2. Updated Server Methods (`server/openrouter.js`)

#### `generateSlideOptions(topic, answers, sectionNumber, totalSections, model)`
- **Changed**: Now takes `sectionNumber` and `totalSections` instead of `numSlides`
- **Returns**: Single slide object (not array) in TalkAdvantage Pro format
- Uses updated prompt system with `getPrompt()`

#### `generateSpeakerNotes(slides, topic, answers, model)`
- **Changed**: Now requires `topic` and `answers` parameters
- **Returns**: Array of speaker notes objects with full TalkAdvantage Pro format
- Validates structure (profoundStatement, talkingPoints.data/vision/proof, highImpactParagraph)

### 3. Updated API Endpoints (`server/server.js`)

#### `POST /api/generate-slide-options`
- **Request Body** (changed):
  ```json
  {
    "topic": "string",
    "answers": [...],
    "sectionNumber": 1,      // NEW - which slide we're generating
    "totalSections": 5,       // NEW - total number of slides
    "model": "string"
  }
  ```
- **Response** (changed):
  ```json
  {
    "slide": {              // Single slide object (not array)
      "heading": "...",
      "subtext": "...",
      "visualElements": [...],
      "recommendedImage": "...",
      "primaryTrigger": "...",
      "alternativeTriggers": [...]
    }
  }
  ```

#### `POST /api/generate-speaker-notes`
- **Request Body** (changed):
  ```json
  {
    "slides": [...],
    "topic": "string",        // NEW - required
    "answers": {...},         // NEW - required
    "model": "string"
  }
  ```
- **Response**:
  ```json
  {
    "speakerNotes": [
      {
        "slideNumber": 1,
        "profoundStatement": "...",
        "talkingPoints": {
          "data": "...",
          "vision": "...",
          "proof": "..."
        },
        "highImpactParagraph": "..."
      }
    ]
  }
  ```

---

## ⏳ FRONTEND TODO

### 1. Update `CreateFromScratch` Component

#### Current Workflow:
```
User enters topic
  → Answers 5 questions
  → For each slide:
      → Generate 3 variations (Concise/Detailed/Story)
      → User picks one
  → Generate speaker notes for all
  → Navigate to editor
```

#### NEW Workflow:
```
User enters topic
  → Answers 5 questions (same)
  → For each slide (sequential):
      → Call /api/generate-slide-options with sectionNumber
      → Get ONE slide in TalkAdvantage Pro format
      → Show slide preview (no variations to pick)
      → Continue to next slide
  → After ALL slides generated:
      → Call /api/generate-speaker-notes (single batch call)
      → Attach speaker notes to each slide
  → Navigate to editor
```

### 2. Update API Calls

#### File: `client/src/hooks/useOpenRouter.ts`

**OLD:**
```typescript
const generateSlideOptions = async (topic: string, answers: any[], numSlides: number) => {
  const response = await fetch(`${API_BASE}/api/generate-slide-options`, {
    method: 'POST',
    body: JSON.stringify({ topic, answers, numSlides, model: selectedModel })
  });
  const data = await response.json();
  return data.slides; // Array of slides with options
};
```

**NEW:**
```typescript
const generateSlideOptions = async (
  topic: string,
  answers: any[],
  sectionNumber: number,
  totalSections: number
) => {
  const response = await fetch(`${API_BASE}/api/generate-slide-options`, {
    method: 'POST',
    body: JSON.stringify({
      topic,
      answers,
      sectionNumber,
      totalSections,
      model: selectedModel
    })
  });
  const data = await response.json();
  return data.slide; // Single slide object
};
```

**Speaker Notes - OLD:**
```typescript
const generateSpeakerNotes = async (slides: any[]) => {
  const response = await fetch(`${API_BASE}/api/generate-speaker-notes`, {
    method: 'POST',
    body: JSON.stringify({ slides, model: selectedModel })
  });
  const data = await response.json();
  return data.speakerNotes; // Array of strings
};
```

**Speaker Notes - NEW:**
```typescript
const generateSpeakerNotes = async (
  slides: any[],
  topic: string,
  answers: any[]
) => {
  const response = await fetch(`${API_BASE}/api/generate-speaker-notes`, {
    method: 'POST',
    body: JSON.stringify({
      slides,
      topic,
      answers,
      model: selectedModel
    })
  });
  const data = await response.json();
  return data.speakerNotes; // Array of objects with profoundStatement, talkingPoints, highImpactParagraph
};
```

### 3. Update Data Structures

#### Section Interface (`client/src/lib/script-parser.ts`)

**ADD to Section interface:**
```typescript
interface Section {
  id: string;
  content: string;  // Keep for backward compatibility
  advanceToken: string;
  alternativeTriggers?: string[];
  selectedTriggers?: string[];
  imageUrl?: string;

  // NEW - TalkAdvantage Pro Format
  heading?: string;               // Big bold headline
  subtext?: string;               // Optional expansion
  visualElements?: string[];      // Bullet points shown on slide
  recommendedImage?: string;      // Image description

  // NEW - Speaker Notes
  speakerNotes?: {
    profoundStatement?: string;
    talkingPoints?: {
      data: string;
      vision: string;
      proof: string;
    };
    highImpactParagraph?: string;
  };
}
```

### 4. Update UI Components

#### `CreateFromScratch.tsx` Changes:

1. **Remove variation picker UI** - No more 3 options to choose from
2. **Add sequential slide generation** - Loop through slides 1 by 1
3. **Show TalkAdvantage format preview** while generating:
   - Show Headline as it generates
   - Show Visual Elements preview
   - Show Recommended Image description
4. **Batch speaker notes generation** at the end
5. **Progress indicator**: "Generating slide 3 of 5..."

#### `PresenterView.tsx` / `RichSectionEditor.tsx` Changes:

**Add speaker notes toggle UI:**
```jsx
<div className="speaker-notes">
  <h3>Profound Statement</h3>
  <p>{section.speakerNotes?.profoundStatement}</p>

  <h3>Talking Points</h3>
  <Tabs>
    <Tab label="Data">
      {section.speakerNotes?.talkingPoints?.data}
    </Tab>
    <Tab label="Vision">
      {section.speakerNotes?.talkingPoints?.vision}
    </Tab>
    <Tab label="Proof">
      {section.speakerNotes?.talkingPoints?.proof}
    </Tab>
  </Tabs>

  <h3>High Impact Paragraph</h3>
  <p>{section.speakerNotes?.highImpactParagraph}</p>

  <h3>Recommended Image</h3>
  <p>{section.recommendedImage}</p>
  <button>Generate Image</button> {/* Future: trigger Replicate API */}
</div>
```

---

## Key Benefits of New Format

✅ **Faster Generation**: One comprehensive slide per section (no variations)
✅ **Richer Content**: Profound statement + 3 talking point angles
✅ **Image Ready**: Detailed descriptions ready for AI image generation
✅ **Professional Format**: Matches TalkAdvantage Pro deck standards
✅ **Speaker Flexibility**: Choose Data/Vision/Proof angle on the fly

---

## Testing Checklist

- [ ] Backend prompts generate valid JSON
- [ ] Frontend calls updated API endpoints correctly
- [ ] Sequential slide generation works (1 by 1)
- [ ] Speaker notes batch generation works
- [ ] Section interface supports new fields
- [ ] PresenterView displays speaker notes tabs
- [ ] Image descriptions display correctly
- [ ] Backward compatibility maintained (old presentations still load)

---

## Next Steps

1. Update frontend API hooks (`useOpenRouter.ts`)
2. Update `CreateFromScratch` to generate slides sequentially
3. Update Section interface with new fields
4. Update PresenterView to show speaker notes with tabs
5. Add visual preview of TalkAdvantage format during generation
6. Test end-to-end workflow

**Estimated Time**: 2-3 hours for frontend changes + testing
