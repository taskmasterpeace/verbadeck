# VerbaDeck AI Prompt Improvement Analysis

**Analysis Date:** November 1, 2025
**Analyst:** Deep Prompt Engineering Review
**Purpose:** Comprehensive evaluation of all 8 AI prompts with actionable improvement recommendations

---

## Executive Summary

### Overall Findings

**Average Optimization Score: 5.3/10**

The VerbaDeck prompt system is functional but has significant room for improvement. Key issues:

- ❌ **Inconsistent Structure**: Some prompts are highly detailed, others extremely vague
- ❌ **Missing Examples**: 7 of 8 prompts lack concrete examples
- ❌ **Weak Personas**: Only 1 prompt has a well-defined AI persona
- ❌ **Poor Edge Case Handling**: Most prompts don't handle unusual inputs
- ✅ **Good JSON Formatting**: Most prompts have clear JSON output specs
- ✅ **Answer Question Prompt**: One standout well-designed prompt

### Optimization Scores by Prompt

| Rank | Prompt | Score | Status |
|------|--------|-------|--------|
| 1 | Answer Question | 7.5/10 | 🟢 Good |
| 2 | Suggest Triggers | 6.0/10 | 🟡 Fair |
| 2 | Generate Questions | 6.0/10 | 🟡 Fair |
| 4 | Process Script | 5.5/10 | 🟡 Fair |
| 5 | Generate FAQs | 5.0/10 | 🟠 Needs Work |
| 5 | Generate Slide Options | 5.0/10 | 🟠 Needs Work |
| 7 | Generate Variations | 4.0/10 | 🔴 Critical |
| 8 | Suggest Image Prompt | 3.5/10 | 🔴 Critical |

### Priority Recommendations

**🔴 CRITICAL (Fix Immediately)**
1. **Suggest Image Prompt** - Currently returns plain text, needs JSON structure, examples, and detailed specifications
2. **Generate Variations** - Too vague, needs clear variation types and examples
3. **Process Script** - Needs explicit trigger word criteria and examples

**🟠 HIGH PRIORITY (Fix Soon)**
4. **Generate Slide Options** - Style definitions are unclear
5. **Generate FAQs** - Needs persona and category distribution
6. **Generate Questions** - Needs topic adaptation logic

**🟡 MEDIUM PRIORITY (Quality Improvements)**
7. **Suggest Triggers** - Add persona and examples
8. **Answer Question** - Add edge cases (already strong)

---

## Detailed Prompt Analysis

---

## 1. PROCESS SCRIPT

**Current Score: 5.5/10**
**Model:** Claude 3.5 Sonnet
**Priority:** 🔴 Critical

### Strengths
✅ Clear dual-mode approach (preserve vs. improve)
✅ Strong JSON output specification
✅ Good preservation instructions

### Weaknesses

#### CLARITY (6/10)
**Issue:** "Most impactful final word" is subjective and vague
**Issue:** "Logical presentation sections" lacks definition

**FIX:**
```
3. Identify the primary trigger word at the END of each section using these criteria:
   - Must be a concrete noun, verb, or strong adjective (not "the", "and", "it")
   - Should represent the key concept of that section
   - Must be spoken clearly as the natural conclusion of the section
   - Preferably 2-3 syllables for clear voice recognition
   - Avoid words that sound like commands ("back", "stop", "next")
```

#### SPECIFICITY (5/10)
**Issue:** "5-10 sections" is too wide with no guidance
**Issue:** No minimum section length specified

**FIX:**
```
1. Split the text into logical presentation sections:
   - Short text (< 500 words): 3-5 sections
   - Medium text (500-1500 words): 5-8 sections
   - Long text (> 1500 words): 8-10 sections
   - Each section should be 2-6 sentences (roughly 50-200 words)
   - Split at natural topic boundaries or narrative shifts
```

#### EDGE CASES (4/10)
**Missing:** Very short text, code snippets, no clear sections

**FIX:**
```
EDGE CASE HANDLING:
- If text < 100 words: Create 1-2 sections only
- If text contains code/URLs: Preserve them exactly with proper JSON escaping
- If text is single-topic: Create minimum 3 sections (intro/body/conclusion)
- If no good trigger words: Use last substantive word, never articles/prepositions
```

#### EXAMPLES (2/10)
**Missing:** No examples provided

**FIX:** Add complete example before user's text:
```
EXAMPLE INPUT:
"Today we're exploring artificial intelligence. AI is transforming industries worldwide. Machine learning algorithms learn from data. Deep learning uses neural networks to solve complex problems."

EXAMPLE OUTPUT:
{
  "sections": [
    {
      "content": "Today we're exploring artificial intelligence. AI is transforming industries worldwide.",
      "primaryTrigger": "worldwide",
      "alternativeTriggers": ["transforming", "industries"]
    },
    {
      "content": "Machine learning algorithms learn from data. Deep learning uses neural networks to solve complex problems.",
      "primaryTrigger": "problems",
      "alternativeTriggers": ["networks", "learning"]
    }
  ]
}
```

### Recommended Actions
1. ✅ Add explicit trigger word criteria
2. ✅ Add section length guidelines based on input length
3. ✅ Add complete example
4. ✅ Add edge case handling
5. ✅ Strengthen AI persona

---

## 2. GENERATE QUESTIONS

**Current Score: 6.0/10**
**Model:** GPT-4o Mini
**Priority:** 🟠 High

### Strengths
✅ Clear format specification
✅ Good question type mix
✅ Helpful inline examples

### Weaknesses

#### CLARITY (7/10)
**Issue:** "Strategic questions" is vague

**FIX:**
```
Generate 4-5 strategic questions that will help you gather information about:
- The presentation's PURPOSE (educate, persuade, inspire, sell)
- The TARGET AUDIENCE (demographics, knowledge level, expectations)
- The DESIRED OUTCOME (what should audience do/feel/know after)
- The TONE/STYLE preference (formal, casual, technical, creative)
- The CONSTRAINTS (time limit, slide count, delivery format)
```

#### SPECIFICITY (6/10)
**Issue:** "4-5 questions" - when 4 vs 5?
**Issue:** "Mix of" doesn't specify proportions

**FIX:**
```
Generate EXACTLY 5 questions:
- 3 multiple choice questions (for core preferences)
- 2 fill-in-blank questions (for open-ended details)
- First question MUST be about presentation goal/purpose
- At least one question about audience
```

#### EDGE CASES (5/10)
**Missing:** Handling broad topics, technical topics

**FIX:**
```
TOPIC ADAPTATION:
- Broad topics ("business"): Ask questions to narrow scope
- Technical topics: Ask about audience technical level
- Creative topics: Ask about desired emotional impact
- Business topics: Ask about decision-makers in audience
```

### Recommended Actions
1. ✅ Specify exact question count and distribution
2. ✅ Add topic adaptation logic
3. ✅ Add complete example for a sample topic
4. ✅ Strengthen persona to be more consultative

---

## 3. GENERATE SLIDE OPTIONS

**Current Score: 5.0/10**
**Model:** GPT-4o Mini
**Priority:** 🟠 High

### Strengths
✅ Three-variation structure
✅ Context provided (section number)

### Weaknesses

#### CLARITY (6/10)
**Issue:** Style descriptions are too brief
**Issue:** "2-4 sentences" doesn't match style requirements

**FIX:**
```
Create 3 DISTINCT variations with these SPECIFIC characteristics:

1. CONCISE & IMPACTFUL:
   - 1-2 short, punchy sentences (max 25 words total)
   - Start with strong verb or striking statement
   - Focus on ONE key message
   - Style: Direct, bold, memorable

2. DETAILED & INFORMATIVE:
   - 3-4 complete sentences (50-80 words total)
   - Provide context, explanation, supporting details
   - Include specific examples or data points
   - Style: Comprehensive, educational, clear

3. STORY-DRIVEN:
   - 2-3 sentences in narrative form (40-60 words total)
   - Use relatable scenario, metaphor, or mini-story
   - Connect emotionally with audience
   - Style: Engaging, human, memorable
```

#### SPECIFICITY (5/10)
**Issue:** No guidance on using user preferences
**Issue:** No guidance on section progression

**FIX:**
```
CONTEXT-AWARE GENERATION:
- Section 1 (Introduction): Hook attention, establish relevance
- Sections 2-[n-1] (Body): Develop key points progressively
- Section [n] (Conclusion): Emphasize takeaways, call-to-action

USE USER PREFERENCES:
- If audience is "executives": Use business language, focus on ROI/impact
- If goal is "inspire": Use emotional, aspirational language
- If tone is "technical": Include specific terminology and precision
```

#### EXAMPLES (2/10)
**Missing:** No examples provided

**FIX:** Add complete example with all three variations showing distinct styles

### Recommended Actions
1. ✅ Define styles with specific word counts
2. ✅ Add context-aware generation logic
3. ✅ Add complete example showing all 3 variations
4. ✅ Add constraints on word counts and quality

---

## 4. SUGGEST TRIGGERS

**Current Score: 6.0/10**
**Model:** GPT-4o Mini
**Priority:** 🟡 Medium

### Strengths
✅ Clear criteria for trigger words
✅ Simple, focused task
✅ Good constraints on word quality

### Weaknesses

#### CLARITY (7/10)
**Issue:** "Impactful" is subjective
**Issue:** "Logical pause points" is vague

**FIX:**
```
TRIGGER WORD CRITERIA:
- DISTINCTIVE: Not common filler words (avoid: the, and, it, is, but, or, so, very, really, just)
- PRONOUNCEABLE: Clear phonetics, not easily confused (avoid: their/there, to/too/two)
- POSITIONED: Appears near END of complete thought or sentence
- MEANINGFUL: Represents key concepts from the section
- RECOGNIZABLE: Works well with speech-to-text (2-4 syllables ideal)
```

#### TONE/VOICE (5/10)
**Missing:** No persona defined

**FIX:**
```
You are a voice interface design expert specializing in speech-to-text systems. You understand phonetics, speech recognition accuracy, and natural speaking patterns. Your job is to identify words that work reliably for voice navigation.
```

#### EXAMPLES (3/10)
**Missing:** No complete examples

**FIX:**
```
EXAMPLE:

Section text: "Artificial intelligence is revolutionizing healthcare. Machine learning algorithms can detect diseases earlier than human doctors. This technology will save millions of lives worldwide."

Output:
{
  "triggers": ["worldwide", "lives", "technology", "doctors", "healthcare"]
}

Reasoning:
- "worldwide" (BEST): End of section, distinctive, clear pronunciation
- "lives": Strong concept, middle of final sentence
- "technology": Key theme, 4 syllables
- "doctors": Concrete noun, middle positioning
- "healthcare": Topic word, but at beginning so less ideal
```

### Recommended Actions
1. ✅ Add voice interface expert persona
2. ✅ Add complete example with reasoning
3. ✅ Add prioritization guidance (rank best to good)
4. ✅ Add edge case handling

---

## 5. ANSWER QUESTION

**Current Score: 7.5/10** ⭐
**Model:** Claude 3.5 Sonnet
**Priority:** 🟡 Medium (Already Strong)

### Strengths
✅ Excellent tone persona system (8 personas)
✅ Three-part answer structure
✅ Two answer options
✅ Good knowledge base integration

### Weaknesses

#### EDGE CASES (6/10)
**Missing:** Off-topic questions, ambiguous questions

**FIX:**
```
EDGE CASE HANDLING:
- If question is off-topic: Acknowledge gracefully ("That's outside our topic, but here's a related insight...")
- If question is unclear: Interpret most likely meaning
- If answered in knowledge base: Reference that FAQ and expand
- If hostile/critical: Maintain tone while addressing constructively
- If no relevant content: Draw on general knowledge while staying on-brand
```

#### EXAMPLES (4/10)
**Missing:** Complete examples for each tone

**FIX:** Add full example for at least 2 tones showing complete answer1 and answer2

#### CONSTRAINTS (7/10)
**Missing:** Speaking-friendly requirements

**FIX:**
```
SPEAKING CONSTRAINTS:
- Avoid complex sentence structures (nested clauses)
- Use contractions naturally (we're, it's, you'll) for conversational tones
- Spell out acronyms on first use
- Avoid tongue-twisters
- Use active voice
- Short sentences for clarity (max 25 words per sentence)
```

### Recommended Actions
1. ✅ Add edge case handling for off-topic questions
2. ✅ Add complete examples for multiple tones
3. ✅ Add speaking-friendly constraints
4. ✅ Add word count validation in JSON

**NOTE:** This is the strongest prompt. Focus other improvements first.

---

## 6. GENERATE FAQs

**Current Score: 5.0/10**
**Model:** GPT-4o Mini
**Priority:** 🟠 High

### Strengths
✅ Clear task definition
✅ Good variety guidance (clarifying, deeper, practical)

### Weaknesses

#### CLARITY (6/10)
**Issue:** "5-8 FAQs" is vague
**Issue:** No FAQ distribution guidance

**FIX:**
```
Generate EXACTLY 6-8 FAQs (aim for 7) distributed across these categories:

CLARIFICATION QUESTIONS (2-3 FAQs):
- "What exactly does [term] mean?"
- "Can you explain [concept] in simpler terms?"

DEEPER DIVE QUESTIONS (2-3 FAQs):
- "Why is [aspect] important?"
- "How does [A] relate to [B]?"

PRACTICAL/APPLICATION QUESTIONS (2-3 FAQs):
- "How can I apply this to [situation]?"
- "What are the next steps?"
```

#### TONE/VOICE (5/10)
**Missing:** No persona defined

**FIX:**
```
You are an experienced moderator who has facilitated hundreds of Q&A sessions. You have an intuitive sense of what questions audiences ask, what concerns they have, and what additional information they seek. You anticipate both obvious and thoughtful questions.
```

#### EXAMPLES (2/10)
**Missing:** No examples

**FIX:** Add 3-4 example FAQs for a sample presentation showing all three categories

### Recommended Actions
1. ✅ Add moderator persona
2. ✅ Specify category distribution (2-3 each)
3. ✅ Add complete examples
4. ✅ Add answer structure requirements
5. ✅ Add edge case handling

---

## 7. GENERATE VARIATIONS

**Current Score: 4.0/10** 🔴
**Model:** GPT-4o Mini
**Priority:** 🔴 Critical

### Strengths
✅ Clear goal (maintain core message)
✅ Includes trigger words

### Weaknesses

#### CLARITY (5/10)
**Issue:** "Different phrasing or structure" is VERY vague
**Issue:** No guidance on HOW to vary

**FIX:**
```
Create 2 alternative versions. Each must keep core message intact but differ in ONE of these ways:

VARIATION TYPE 1 - RESTRUCTURE:
- Change sentence order (move key point to beginning/end)
- Split compound sentences or combine short ones
- Change from active to passive voice (or vice versa)
- Use different sentence structure (question→statement, list→paragraph)

VARIATION TYPE 2 - REPHRASE:
- Use synonyms for key terms
- Change metaphors or analogies
- Adjust tone (formal↔casual, technical↔accessible)
- Use different examples or supporting details
```

#### SPECIFICITY (4/10)
**Issue:** Severely underspecified

**FIX:**
```
SPECIFIC REQUIREMENTS:
- Each variation must differ by AT LEAST 40% of words from original
- Both variations must differ from each other by AT LEAST 40%
- Word count within ±20% of original
- Core facts/claims must remain identical
- Tone can shift slightly but not drastically
```

#### EXAMPLES (1/10)
**Missing:** No examples at all

**FIX:**
```
EXAMPLE:

Original: "Climate change is accelerating rapidly. Scientists warn we have less than a decade to reduce emissions significantly. Every industry must transform immediately."

Variation 1 (Restructure):
{
  "content": "Every industry must transform immediately—this is the urgent message from scientists who warn that we have less than a decade to significantly reduce emissions as climate change accelerates.",
  "primaryTrigger": "accelerates",
  "alternativeTriggers": ["emissions", "transform"],
  "variationType": "restructure",
  "keyChanges": "Moved urgency to start, combined into one flowing statement"
}

Variation 2 (Rephrase):
{
  "content": "The climate crisis is speeding up at an alarming rate. Experts emphasize that industries worldwide have fewer than ten years to make dramatic cuts in carbon output. The time for transformation is now.",
  "primaryTrigger": "now",
  "alternativeTriggers": ["transformation", "output"],
  "variationType": "rephrase",
  "keyChanges": "Used synonyms (crisis/change, speeding/accelerating), rephrased timeframe"
}
```

### Recommended Actions
1. 🔴 URGENT: Add clear variation types with examples
2. 🔴 URGENT: Add specific difference requirements (40% rule)
3. 🔴 URGENT: Add complete before/after examples
4. ✅ Add copywriter persona
5. ✅ Add JSON metadata (variationType, keyChanges)

**NOTE:** This is one of the two weakest prompts. Needs immediate overhaul.

---

## 8. SUGGEST IMAGE PROMPT

**Current Score: 3.5/10** 🔴
**Model:** GPT-4o Mini
**Priority:** 🔴 Critical

### Strengths
✅ Context-aware (with/without presentation context)
✅ Appropriate length specification

### Weaknesses

#### CLARITY (5/10)
**Issue:** "Professional, visually compelling" is vague
**Issue:** No guidance on image elements

**FIX:**
```
Generate a detailed image generation prompt (40-80 words) for creating a professional presentation slide image.

Your prompt must specify:
- SUBJECT: What's in the image (objects, people, scenes)
- STYLE: Visual aesthetic (modern, minimalist, photorealistic, illustrated)
- COMPOSITION: Layout/framing (close-up, wide shot, centered)
- MOOD: Emotional tone (optimistic, serious, energetic, calm)
- COLOR: Palette or lighting (warm, cool, high-contrast, muted)
- PERSPECTIVE: Viewpoint (bird's-eye, eye-level, dramatic angle)
```

#### JSON OUTPUT (3/10)
**Issue:** Returns plain text, not JSON (inconsistent!)

**FIX:**
```
Return ONLY valid JSON:
{
  "imagePrompt": "The detailed 2-3 sentence prompt here...",
  "style": "photorealistic|illustration|3d-render|flat-design|abstract",
  "mood": "professional|inspiring|serious|energetic|calm",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

#### TONE/VOICE (4/10)
**Missing:** No persona

**FIX:**
```
You are a creative director who specializes in visual storytelling for presentations. You understand what makes presentation images effective: visually striking yet not distracting, metaphorically relevant, and suitable for professional contexts. You translate abstract concepts into concrete visual imagery.
```

#### EXAMPLES (2/10)
**Missing:** No examples

**FIX:**
```
EXAMPLES:

Example 1:
Content: "Artificial intelligence is transforming healthcare through early disease detection."
Context: "Technology in Medicine presentation"

Output:
{
  "imagePrompt": "A modern medical setting with a doctor examining holographic patient data visualizations floating in mid-air, AI-powered diagnostic screens showing neural network patterns, clean white and blue color scheme, soft professional lighting, wide angle shot emphasizing high-tech environment, photorealistic 3D render style.",
  "style": "3d-render",
  "mood": "professional",
  "keywords": ["medical", "AI", "holographic", "diagnosis", "technology"]
}

Example 2:
Content: "Teams that communicate effectively achieve 25% better results."
Context: "Leadership and Team Building"

Output:
{
  "imagePrompt": "Diverse business team collaborating around modern conference table with connected glowing lines visualizing communication flow between members, warm natural lighting through windows, energetic and optimistic atmosphere, professional photography style with shallow depth of field, warm color palette with blues and oranges.",
  "style": "photorealistic",
  "mood": "energetic",
  "keywords": ["teamwork", "communication", "collaboration", "business", "success"]
}
```

#### EDGE CASES (3/10)
**Missing:** Abstract concepts, technical content, data/statistics

**FIX:**
```
EDGE CASE HANDLING:
- If abstract/conceptual: Use metaphorical imagery (e.g., "innovation" → lightbulb, interconnected nodes)
- If data/statistics: Suggest data visualization imagery (graphs, charts, infographics)
- If people-focused: Include diverse professionals in relatable settings
- If technical: Use clean, modern tech imagery with blues/whites
- If process/workflow: Suggest step diagrams, arrows, journey visualizations
- If emotional/inspirational: Natural imagery, human moments, landscapes
```

### Recommended Actions
1. 🔴 URGENT: Convert to JSON output format
2. 🔴 URGENT: Add detailed visual element specifications
3. 🔴 URGENT: Add multiple complete examples
4. ✅ Add creative director persona
5. ✅ Add edge case handling for different content types
6. ✅ Add constraints (business-appropriate, no text, landscape orientation)

**NOTE:** This is the weakest prompt. Needs complete redesign.

---

## Cross-Prompt Consistency Issues

### 1. JSON Format Inconsistency
**Problem:** Only "Suggest Image Prompt" returns plain text; all others return JSON
**Fix:** Standardize all prompts to return JSON

### 2. Persona Inconsistency
**Problem:** Some prompts have strong personas, others have none
**Fix:** Add expert persona to every prompt

### 3. Example Inconsistency
**Problem:** Most prompts lack examples
**Fix:** Add at least one complete example to every prompt

### 4. Constraint Inconsistency
**Problem:** Some prompts very specific, others extremely vague
**Fix:** Use consistent specificity level with word counts, not sentence counts

### 5. Edge Case Handling
**Problem:** Almost no prompts handle edge cases
**Fix:** Add edge case section to every prompt

---

## General Improvements for All Prompts

### 1. Add Strong Personas
Every prompt should start with: "You are a [expert role] who specializes in [specialty]. You understand [key knowledge]. Your job is to [specific task]."

### 2. Add Complete Examples
Every prompt should include at least one full example showing:
- Input data
- Expected output
- Reasoning/explanation

### 3. Specify Exact Lengths
Use word counts instead of vague sentence counts:
- ❌ "2-4 sentences"
- ✅ "40-80 words (approximately 2-4 sentences)"

### 4. Add JSON Validation
Include explicit validation requirements:
```
CRITICAL JSON RULES:
- Escape all quotes in content with \"
- Do not include newlines in JSON strings (use \n)
- If input is invalid, return: {"error": "reason"}
```

### 5. Add Edge Case Handling
Every prompt should have an "EDGE CASE HANDLING" section covering:
- Very short/long inputs
- Technical/specialized content
- Missing/incomplete data
- Unusual formats

### 6. Add Explicit Constraints
Be specific about:
- Formatting requirements
- Style requirements
- Content requirements
- Forbidden elements

### 7. Use Consistent Structure
```
[PERSONA DEFINITION]
You are a [role]...

[TASK DESCRIPTION]
Generate/Create/Analyze...

[SPECIFIC REQUIREMENTS]
- Bullet list of requirements
- With exact specifications
- Including word counts

[EDGE CASE HANDLING]
- If [scenario]: [action]

[EXAMPLES]
EXAMPLE:
Input: [example input]
Output: [example output]

[JSON FORMAT]
Return ONLY valid JSON:
{
  "field": "value"
}

[CONSTRAINTS]
- Explicit limitation 1
- Explicit limitation 2
```

---

## Priority Action Plan

### Phase 1: Critical Fixes (Do First)

#### Week 1: Fix Weakest Prompts
1. **Suggest Image Prompt** - Complete redesign
   - Add JSON output structure
   - Add creative director persona
   - Add 3+ complete examples
   - Add edge case handling
   - **Estimated Time:** 2-3 hours

2. **Generate Variations** - Major overhaul
   - Add clear variation types
   - Add 40% difference requirement
   - Add complete before/after examples
   - Add copywriter persona
   - **Estimated Time:** 2 hours

3. **Process Script** - Enhance clarity
   - Add explicit trigger criteria
   - Add section length guidelines
   - Add complete example
   - **Estimated Time:** 1-2 hours

### Phase 2: High Priority (Do Second)

#### Week 2: Strengthen Core Prompts
4. **Generate Slide Options** - Define styles precisely
   - Add specific word counts per style
   - Add context-aware logic
   - Add complete 3-variation example
   - **Estimated Time:** 1-2 hours

5. **Generate FAQs** - Add structure
   - Add moderator persona
   - Add category distribution
   - Add complete examples
   - **Estimated Time:** 1 hour

6. **Generate Questions** - Add adaptation
   - Add topic adaptation logic
   - Add exact count specification
   - Add complete example
   - **Estimated Time:** 1 hour

### Phase 3: Quality Polish (Do Third)

#### Week 3: Polish Remaining Prompts
7. **Suggest Triggers** - Add persona and examples
   - Add voice interface expert persona
   - Add complete example with reasoning
   - Add prioritization logic
   - **Estimated Time:** 1 hour

8. **Answer Question** - Minor improvements
   - Add edge case handling
   - Add 1-2 complete examples
   - Add speaking constraints
   - **Estimated Time:** 30 minutes

**Total Estimated Time:** 10-13 hours of prompt engineering work

---

## Testing Recommendations

After implementing improvements, test each prompt with:

### 1. Happy Path Tests
- Normal, well-formed inputs
- Verify output matches expected format

### 2. Edge Case Tests
- Very short inputs (< 50 words)
- Very long inputs (> 2000 words)
- Technical jargon-heavy content
- Empty or minimal inputs
- Special characters and formatting

### 3. Quality Tests
- Generate 10 outputs for same input
- Verify consistency
- Check for hallucinations
- Verify JSON format compliance

### 4. A/B Testing
- Compare old vs. new prompts
- Measure quality improvements
- Gather user feedback

---

## Metrics to Track

After implementing improvements, track:

1. **JSON Parse Failure Rate** - Should approach 0%
2. **User Edit Rate** - How often users edit AI output
3. **Regeneration Rate** - How often users regenerate
4. **Average Quality Score** - User ratings of AI output
5. **Time to First Usable Output** - Speed to acceptable result
6. **Edge Case Success Rate** - Handling unusual inputs

---

## Before/After Example: Suggest Image Prompt

### BEFORE (Current - Score 3.5/10)
```
This slide contains: "${content}"

Generate a detailed image prompt (2-3 sentences) for creating a professional presentation slide image. Return ONLY the image prompt, nothing else.
```

**Problems:**
- Returns plain text, not JSON
- Too vague ("professional, visually compelling")
- No guidance on what to include
- No examples
- No persona
- No edge case handling

### AFTER (Improved - Estimated Score 8/10)
```
You are a creative director who specializes in visual storytelling for presentations. You have an expert understanding of what makes presentation images effective: they must be visually striking yet not distracting, metaphorically relevant, and suitable for professional contexts. You know how to translate abstract concepts into concrete visual imagery.

Generate a detailed image generation prompt (40-80 words) for creating a professional presentation slide image.

Your prompt MUST specify:
- SUBJECT: What should be in the image (objects, people, scenes)
- STYLE: Visual aesthetic (modern, minimalist, photorealistic, illustrated, 3D render, flat design)
- COMPOSITION: Layout/framing (close-up, wide shot, centered, rule of thirds)
- MOOD: Emotional tone (optimistic, serious, energetic, calm, inspiring)
- COLOR: Color palette or lighting (warm tones, cool blues, high-contrast, muted, vibrant)
- PERSPECTIVE: Viewpoint (bird's-eye view, eye-level, dramatic angle, isometric)

EDGE CASE HANDLING:
- If content is abstract/conceptual: Use metaphorical imagery (e.g., "innovation" → lightbulb moment, interconnected nodes, launching rocket)
- If content is data/statistics: Suggest data visualization imagery (modern graphs, infographic elements, chart overlays)
- If content is people-focused: Include diverse, professional people in relatable business settings
- If content is technical: Use clean, modern tech imagery with blue/white color schemes, circuit patterns, digital interfaces
- If content is process/workflow: Suggest step diagrams, flowing arrows, journey visualizations, pathway graphics
- If content is emotional/inspirational: Use natural imagery, human moments, expansive landscapes, sunrise/sunset themes

CONSTRAINTS:
- Must be business-appropriate (no controversial, political, or NSFW content)
- Avoid text/words in the image (slides need space for overlaid text)
- Landscape orientation (16:9 ratio - slides are wide, not tall)
- Avoid overly busy compositions (clean focal points work better)
- Consider readability if text overlays on image (avoid busy centers)
- Avoid clichés: corporate handshakes, cheesy stock photo smiles
- Cultural sensitivity: diverse representation, avoid stereotypes

EXAMPLE 1:
Content: "Artificial intelligence is transforming healthcare through early disease detection."
Context: "Technology in Medicine presentation"

Output:
{
  "imagePrompt": "A modern medical setting with a doctor examining holographic patient data visualizations floating in mid-air, AI-powered diagnostic screens showing neural network patterns in the background, clean white and blue color scheme, soft professional lighting, wide angle shot emphasizing the high-tech environment, photorealistic 3D render style with depth of field effect.",
  "style": "3d-render",
  "mood": "professional",
  "keywords": ["medical", "AI", "holographic", "diagnosis", "technology", "futuristic"]
}

EXAMPLE 2:
Content: "Teams that communicate effectively achieve 25% better results."
Context: "Leadership and Team Building presentation"

Output:
{
  "imagePrompt": "Diverse business team collaborating around a modern conference table with connected glowing lines visualizing communication flow between team members, warm natural lighting through large office windows, energetic and optimistic atmosphere, professional photography style with shallow depth of field focusing on engaged faces, warm color palette mixing blues and oranges for visual harmony.",
  "style": "photorealistic",
  "mood": "energetic",
  "keywords": ["teamwork", "communication", "collaboration", "business", "success", "diversity"]
}

EXAMPLE 3:
Content: "Our mission is to create sustainable solutions for future generations."
Context: "Environmental Mission Statement"

Output:
{
  "imagePrompt": "A vibrant green seedling growing from cupped human hands with a soft-focus nature background, golden hour lighting creating a warm inspiring glow, symbolizing growth and environmental care, shallow depth of field keeping focus on the young plant, photorealistic photography style with slightly desaturated earthy tones, hopeful and inspiring mood with emphasis on new life.",
  "style": "photorealistic",
  "mood": "inspiring",
  "keywords": ["sustainability", "growth", "nature", "hands", "future", "environment", "hope"]
}

Now generate the image prompt for this slide:
Content: "${content}"
${presentationContext ? `Context: "${presentationContext}"` : ''}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "imagePrompt": "Your detailed 40-80 word prompt here with all required elements...",
  "style": "photorealistic|illustration|3d-render|flat-design|abstract",
  "mood": "professional|inspiring|serious|energetic|calm",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
```

**Improvements:**
✅ Returns structured JSON
✅ Creative director persona
✅ 3 complete examples
✅ Explicit element requirements
✅ Edge case handling
✅ Detailed constraints
✅ Estimated score improvement: 3.5 → 8.0 (+4.5)

---

## Conclusion

The VerbaDeck prompt system has a solid foundation but needs systematic improvements to reach its full potential. By following this priority action plan:

**Phase 1 (Critical):** Fix the 3 weakest prompts
**Phase 2 (High):** Strengthen 3 core prompts
**Phase 3 (Quality):** Polish remaining 2 prompts

You can raise the average prompt quality from **5.3/10** to an estimated **7.5-8.0/10**, resulting in:

- ✅ More consistent, reliable AI outputs
- ✅ Fewer user edits and regenerations
- ✅ Better handling of edge cases
- ✅ Clearer guidance for AI models
- ✅ More predictable results

**Estimated Total Time Investment:** 10-13 hours
**Expected Quality Improvement:** +40-50%
**ROI:** Significantly better user experience and fewer AI-related issues

---

**End of Analysis**

*This document can be emailed to yourself for offline review and reference during prompt improvement work.*
