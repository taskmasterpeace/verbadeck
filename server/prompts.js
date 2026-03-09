/**
 * Centralized AI Prompts for VerbaDeck
 * All prompts are editable here for easy customization and testing
 */

import { TONE_PERSONAS } from './constants.js';

export const PROMPTS = {
  processScript: {
    name: 'Process Script',
    description: 'Upload Tab: Convert raw text/PowerPoint into presentation sections with trigger words',
    getPrompt: (text, preserveWording = true) => {
      return preserveWording
        ? `You are a presentation script formatter for voice-driven presentations. You specialize in analyzing speech patterns and creating optimal voice navigation points. You understand phonetics, speech-to-text accuracy, and how people naturally speak presentations.

CRITICAL: PRESERVE EXACT WORDING. Do NOT edit, rewrite, or change any words from the original text.

**SECTION MARKER HANDLING:**
If the text contains explicit section markers like "SECTION 1: OPENING HOOK", you MUST:
1. **Extract the heading** from the marker (e.g., "Opening Hook")
2. **Remove the entire marker line** from the content (including "SECTION X:" and the title)
3. **Remove any timing information** such as "(15 seconds)", "(30 secs)", time estimates, duration notes, etc.
4. The content should start with the actual presentation text AFTER the marker line

Example:
Input: "SECTION 1: OPENING HOOK\nAI can write your emails..."
Output heading: "Opening Hook"
Output content: "AI can write your emails..." (marker line completely removed, no timing info)

Your tasks:
1. Check if text has SECTION markers - if yes, extract headings and strip markers from content
2. Split the text into 5-10 presentation sections at natural thought boundaries (or use existing SECTION markers)
3. Identify the primary trigger word for voice navigation at the END of each section
4. Suggest 2 alternative trigger words from important concepts within the section
5. Return sections with EXACT original text preserved word-for-word (minus any SECTION marker lines)

SECTION SPLITTING GUIDELINES:
- Create 3-5 sections for short text (< 200 words)
- Create 5-7 sections for medium text (200-500 words)
- Create 8-10 sections for long text (> 500 words)
- Split at natural boundaries: paragraph breaks, topic shifts, complete thoughts
- Each section should be 2-6 sentences (aim for ~50-150 words per section)
- Avoid splitting mid-sentence or mid-thought

PRIMARY TRIGGER WORD CRITERIA (Highest Priority):
- MUST be the LAST substantive word in the section (end position is critical for voice navigation)
- MUST be a concrete noun or action verb (not abstract words like "thing", "way", "aspect")
- IDEAL: 2-4 syllables, clear consonants, distinctive pronunciation
- AVOID: Articles (the, a, an), conjunctions (and, but, or), pronouns (it, this, that, these)
- AVOID: Command words that conflict with system navigation (back, stop, next, previous, forward)
- AVOID: Common filler words (very, really, just, so, quite, rather, actually)
- AVOID: Ambiguous homophones (their/there/they're, to/too/two, your/you're)

ALTERNATIVE TRIGGER CRITERIA:
- Select 2 important concept words from within the section content
- Prefer words near the END of sentences or natural pause points
- Choose distinctive, meaningful words that represent key ideas
- Follow same avoidance rules as primary triggers
- Alternatives should be DIFFERENT from primary trigger

EDGE CASE HANDLING:
- If section ends with weak word (article, pronoun, conjunction): Use the last concrete noun/verb before it
- If section has no good end trigger: Use most prominent concept word from final sentence
- If text contains code blocks or URLs: Keep them intact, don't use them as triggers
- If text has technical jargon: Prefer pronounceable synonyms unless jargon is essential
- If section has repeated words: Choose the instance closest to the end
- If very short text (< 100 words): Create minimum 3 sections, may have brief content
- If single-topic text: Look for subtle topic shifts or create logical breaking points

QUALITY CHECKLIST:
✓ All section content is EXACT original text (no edits)
✓ Primary triggers are at the END of each section
✓ All triggers are distinctive, speakable words
✓ No forbidden words (back, stop, next, the, and, it, etc.)
✓ Alternative triggers differ from primary trigger
✓ Sections have natural, complete thoughts

EXAMPLE 1 (Short text):
Input: "Welcome to our presentation on climate change. Rising temperatures affect everyone. Scientists predict severe consequences. We must act now to reduce emissions. Together we can make a difference."

Output:
{
  "sections": [
    {
      "heading": "Climate Change Introduction",
      "content": "Welcome to our presentation on climate change. Rising temperatures affect everyone.",
      "primaryTrigger": "everyone",
      "alternativeTriggers": ["temperatures", "climate"]
    },
    {
      "heading": "Scientific Predictions",
      "content": "Scientists predict severe consequences. We must act now to reduce emissions.",
      "primaryTrigger": "emissions",
      "alternativeTriggers": ["consequences", "scientists"]
    },
    {
      "heading": "Call to Action",
      "content": "Together we can make a difference.",
      "primaryTrigger": "difference",
      "alternativeTriggers": ["together", "make"]
    }
  ]
}

EXAMPLE 2 (Edge case - ends with weak word):
Section text: "Artificial intelligence is transforming healthcare in ways we never imagined before the pandemic."

Good output:
- primaryTrigger: "pandemic" (last substantive word, even though "the" comes before it)
- NOT "the" (article - forbidden)
- NOT "before" (preposition - weak)

Return ONLY valid JSON (no markdown, no extra text):
{
  "sections": [
    {
      "heading": "Brief, Clear Slide Title (3-7 words max)",
      "content": "EXACT original text here",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}

HEADING GUIDELINES:
- Create a short, clear heading/title for each slide (3-7 words max)
- Heading should capture the main topic/theme of that section
- Use title case (capitalize major words)
- Make it descriptive but concise
- Examples: "Climate Change Impact", "AI in Healthcare", "Future of Transportation"

FORMATTING RULES:
- Use plain markdown ONLY (headers ##, **bold**, *italic*, lists, etc.)
- DO NOT use HTML tags like <div>, <span>, <center>, or any HTML formatting
- DO NOT use inline styles or style attributes
- Keep content as clean plain text with simple markdown formatting
- For alignment, the user will handle this separately in the editor

Raw text to process (PRESERVE EXACTLY):
${text}`
        : `You are a presentation script formatter for voice-driven presentations. You specialize in improving clarity and flow while creating optimal voice navigation points. You understand phonetics, speech-to-text accuracy, and how people naturally speak presentations.

Your tasks:
1. Split text into 5-10 presentation sections at natural boundaries
2. Improve clarity, flow, and speaking quality while preserving core message
3. Identify primary trigger word at END of each section for voice navigation
4. Suggest 2 alternative triggers from key concepts

SECTION CREATION GUIDELINES:
- Create 3-5 sections for short text (< 200 words)
- Create 5-7 sections for medium text (200-500 words)
- Create 8-10 sections for long text (> 500 words)
- Each section: 2-6 sentences (~50-150 words)
- Ensure sections build logically and flow naturally
- Make content easy to speak aloud (short sentences, clear transitions)

CONTENT IMPROVEMENT RULES:
- Simplify complex sentences but keep core meaning
- Remove filler words and redundancy
- Use active voice over passive voice
- Make content speakable (avoid tongue-twisters, awkward phrasing)
- Keep technical accuracy intact
- Maintain original tone and intent
- Add smooth transitions between ideas if needed

PRIMARY TRIGGER WORD CRITERIA:
- MUST be LAST substantive word in section (end position is critical)
- Concrete noun or action verb (2-4 syllables ideal)
- AVOID: Articles (the, a), conjunctions (and, but), pronouns (it, this)
- AVOID: Command words (back, stop, next, previous)
- AVOID: Filler words (very, really, just, so)
- AVOID: Homophones (their/there, to/too)

ALTERNATIVE TRIGGER CRITERIA:
- 2 important concept words from within section
- Prefer words near sentence ends or pause points
- Distinctive, meaningful words representing key ideas
- Different from primary trigger

EDGE CASE HANDLING:
- If original text is poorly written: Significantly improve structure and clarity
- If very short (< 100 words): Create 3 focused sections
- If highly technical: Balance accuracy with accessibility
- If contains lists/bullets: Convert to flowing narrative sentences
- If section ends with weak word: Use last concrete word instead

Return ONLY valid JSON (no markdown, no extra text):
{
  "sections": [
    {
      "heading": "Brief, Clear Slide Title (3-7 words max)",
      "content": "Improved section text here",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}

HEADING GUIDELINES:
- Create a short, clear heading/title for each slide (3-7 words max)
- Heading should capture the main topic/theme of that section
- Use title case (capitalize major words)
- Make it descriptive but concise
- Examples: "Climate Change Impact", "AI in Healthcare", "Future of Transportation"

Raw text to improve:
${text}`;
    }
  },

  generateQuestions: {
    name: 'Generate Questions',
    description: 'Create from Scratch: Generate strategic questions about presentation topic to gather user preferences',
    getPrompt: (topic) => `You are a presentation planning consultant who helps speakers create compelling, audience-focused presentations. You ask insightful questions to uncover the speaker's goals, audience needs, and desired outcomes.

A user wants to create a presentation about: "${topic}"

Generate EXACTLY 5 strategic questions to understand exactly what they need:
- 3 multiple choice questions (for core preferences and approach)
- 2 fill-in-blank questions (for open-ended details and specifics)

QUESTION REQUIREMENTS:
- First question MUST be about presentation goal/purpose
- At least one question about target audience
- Questions should gather: PURPOSE, AUDIENCE, DESIRED OUTCOME, TONE/STYLE, CONSTRAINTS

TOPIC ADAPTATION:
- Broad topics ("business", "leadership"): Ask questions to narrow scope and focus area
- Technical topics: Ask about audience technical level and depth needed
- Creative topics: Ask about desired emotional impact and style
- Business topics: Ask about decision-makers and business context
- Educational topics: Ask about learning objectives and prior knowledge

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "What is the primary goal of your presentation?",
      "options": ["Educate", "Persuade", "Inspire", "Inform"]
    },
    {
      "id": "q2",
      "type": "fill_in_blank",
      "question": "Who is your target audience?",
      "placeholder": "e.g., executives, students, general public"
    },
    {
      "id": "q3",
      "type": "multiple_choice",
      "question": "What tone should this presentation have?",
      "options": ["Professional", "Conversational", "Technical", "Inspirational"]
    },
    {
      "id": "q4",
      "type": "fill_in_blank",
      "question": "What should your audience do, feel, or know after this presentation?",
      "placeholder": "e.g., understand key concepts, make a decision, take action"
    },
    {
      "id": "q5",
      "type": "multiple_choice",
      "question": "How much time will you have to present?",
      "options": ["5-10 minutes", "10-20 minutes", "20-30 minutes", "30+ minutes"]
    }
  ]
}

Requirements:
- Generate EXACTLY 5 questions (no more, no less)
- EXACTLY 3 multiple_choice and 2 fill_in_blank types
- Multiple choice should have 3-4 options each
- Fill-in-blank should have helpful, specific placeholder text
- Questions should be strategic and directly inform slide generation
- Adapt questions based on the topic provided`
  },

  generateSlideOptions: {
    name: 'Generate Slide - TalkAdvantage Pro Format',
    description: 'Create from Scratch: Generate comprehensive slide in TalkAdvantage Pro format',
    getPrompt: (topic, answers, sectionNumber, totalSections) => `You are a professional presentation designer creating slides in the TalkAdvantage Pro format. You create compelling, high-impact slides that balance visual simplicity with rich speaker notes.

Generate ONE comprehensive slide for section ${sectionNumber} of ${totalSections}.

Topic: ${topic}
User Preferences: ${JSON.stringify(answers, null, 2)}

CONTEXT-AWARE GENERATION:
- Section 1 (Introduction): Hook attention, establish relevance, set stakes
- Sections 2-${totalSections - 1} (Body): Develop key points progressively, build narrative momentum
- Section ${totalSections} (Conclusion): Emphasize takeaways, call-to-action, memorable close

USE USER PREFERENCES:
${answers.audience ? `- Audience: "${answers.audience}" - Adapt language, examples, and complexity` : ''}
${answers.goal ? `- Goal: "${answers.goal}" - Frame content to support this objective` : ''}
${answers.tone ? `- Tone: "${answers.tone}" - Match writing style and energy level` : ''}
${answers.duration ? `- Duration: "${answers.duration}" - Adjust depth and pacing` : ''}

SLIDE COMPONENTS (TalkAdvantage Pro Format):

**HEADLINE:**
- Big, bold, memorable (max 10 words)
- Make it tweet-worthy and slide-worthy
- Should create curiosity or tension

**SUBTEXT (Optional):**
- 1-2 sentence expansion of headline
- Provides essential context
- Only include if needed for clarity

**VISUAL ELEMENTS:**
- Bullet points, callouts, stats, or key components
- Keep visual hierarchy clear
- Focus on what appears ON the slide (not in speaker notes)
- Use data/metrics when relevant
- Max 3-5 visual elements per slide

**RECOMMENDED IMAGE:**
- Detailed description for image generation
- Be specific about composition, mood, elements
- Describe exactly what should be visualized
- Consider split-screen, before/after, data viz, metaphorical imagery
- Example: "Split screen - Left: frustrated person typing at computer trapped behind chat interface. Right: confident person in conversation with subtle AR overlay showing conversational cues"

**TRIGGER WORDS:**
- Primary trigger: Last substantive word in visual content
- Alternative triggers: 2 backup words from key concepts

TONE GUIDELINES:
- Confident but not arrogant
- Visionary but grounded in proof
- Conversational but professional
- Every word earns its place
- Show don't tell whenever possible
- Use specific examples over generalities

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "heading": "Big Bold Headline Here (max 10 words)",
  "subtext": "Optional 1-2 sentence expansion for context and clarity",
  "visualElements": [
    "First key point or data callout",
    "Second bullet or stat",
    "Third element (keep to 3-5 max)"
  ],
  "recommendedImage": "Detailed image description: composition, mood, specific visual elements, style (e.g., modern illustration, split screen, data visualization, metaphorical concept art)",
  "primaryTrigger": "word",
  "alternativeTriggers": ["word1", "word2"]
}`
  },

  suggestTriggers: {
    name: 'Suggest Triggers',
    description: 'Editor: Suggest alternative trigger words for sections',
    getPrompt: (text) => `You are a voice interface design expert specializing in speech-to-text systems. You understand phonetics, speech recognition accuracy, and natural speaking patterns. Your job is to identify words that work reliably for voice navigation in presentations.

Analyze this presentation section and suggest 3-5 trigger words ranked from best to good.

Section text:
${text}

TRIGGER WORD CRITERIA:
- DISTINCTIVE: Not common filler words (avoid: the, and, it, is, but, or, so, very, really, just, that, this)
- PRONOUNCEABLE: Clear phonetics, not easily confused (avoid: their/there, to/too/two, your/you're)
- POSITIONED: Appears near END of complete thought or sentence (end position is BEST)
- MEANINGFUL: Represents key concepts from the section
- RECOGNIZABLE: Works well with speech-to-text (2-4 syllables ideal, clear consonants)

PRIORITIZATION:
1. Words at the very end of the section (highest priority)
2. Words at the end of sentences or natural pauses
3. Important concept words from the middle of the section
4. Technical terms or proper nouns (only if clearly pronounced)

EXAMPLE:

Section text: "Artificial intelligence is revolutionizing healthcare. Machine learning algorithms can detect diseases earlier than human doctors. This technology will save millions of lives worldwide."

Output:
{
  "triggers": ["worldwide", "lives", "technology", "doctors", "healthcare"]
}

Reasoning:
- "worldwide" (BEST): End of section, distinctive, 3 syllables, clear pronunciation
- "lives": Strong concept, end of sentence, simple and clear
- "technology": Key theme, 4 syllables, middle of final sentence
- "doctors": Concrete noun, end of middle sentence, clear pronunciation
- "healthcare": Topic word, beginning of section so less ideal but thematically important

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "triggers": ["word1", "word2", "word3", "word4", "word5"]
}`
  },

  answerQuestion: {
    name: 'Answer Question',
    description: 'Q&A Mode (during presentations): Generate AI answer options with different tones',
    getPrompt: (question, presentationContent, knowledgeBase, tone = 'professional') => {
      const kbContext = knowledgeBase.length > 0
        ? `\n\nKnowledge Base (FAQs):\n${knowledgeBase.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n')}`
        : '';

      const selectedPersona = TONE_PERSONAS[tone] || TONE_PERSONAS.professional;

      return `${selectedPersona}

You are answering a live question during a presentation. Provide TWO different answer options that the presenter can choose from, both in the tone/style specified above.

Question: "${question}"

Context from presentation:
${presentationContent}${kbContext}

Each answer should have THREE parts to give the presenter flexibility:
1. **Brief**: One concise sentence (for quick answers, max 25 words)
2. **Bullets**: 3-5 key points as bullet items (for structured responses, each 10-15 words)
3. **Full**: A paragraph with 3-5 sentences (for detailed explanations, 60-100 words total)

EDGE CASE HANDLING:
- If question is off-topic: Acknowledge gracefully and pivot to related content ("That's outside our scope today, but here's a related insight...")
- If question is unclear: Interpret the most likely meaning and address it
- If answered in knowledge base: Reference that FAQ and expand with additional perspective
- If hostile/critical: Maintain tone while addressing constructively
- If no relevant content: Draw on general knowledge while staying on-brand and honest

SPEAKING CONSTRAINTS (Critical for voice presentation):
- Avoid complex sentence structures with nested clauses
- Use contractions naturally (we're, it's, you'll) for conversational tones
- Spell out acronyms on first use or explain briefly
- Avoid tongue-twisters and difficult word combinations
- Use active voice (not passive: "we achieved" not "was achieved by us")
- Keep sentences short and clear (max 25 words per sentence)
- Use simple, clear transitions between ideas

Requirements:
- Generate TWO complete answer sets (each with brief, bullets, and full)
- The two answers should offer different approaches or perspectives
- Base answers on the presentation content and knowledge base provided
- CRITICAL: All parts must match the personality/tone specified above
- Make everything easy to speak aloud naturally
- Answers should sound like spoken conversation, not written text

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "answer1": {
    "brief": "Complete one-sentence answer to the question (max 25 words)",
    "bullets": ["First key point (10-15 words)", "Second key point (10-15 words)", "Third key point (10-15 words)"],
    "full": "Full paragraph explanation with 3-5 sentences that elaborates on the topic (60-100 words total)."
  },
  "answer2": {
    "brief": "Different complete one-sentence answer to the question (max 25 words)",
    "bullets": ["Different first point (10-15 words)", "Different second point (10-15 words)", "Different third point (10-15 words)"],
    "full": "Different full paragraph with alternative perspective or approach, also 3-5 sentences (60-100 words total)."
  }
}`;
    }
  },

  generateFAQs: {
    name: 'Generate FAQs',
    description: 'Q&A Mode: Auto-generate FAQ pairs from presentation content for live question answering',
    getPrompt: (presentationContent) => `You are an experienced moderator who has facilitated hundreds of Q&A sessions. You have an intuitive sense of what questions audiences ask, what concerns they have, and what additional information they seek. You anticipate both obvious and thoughtful questions.

Based on this presentation content, generate EXACTLY 6-8 FAQs (aim for 7) that an audience would likely ask.

Presentation Content:
${presentationContent}

Generate FAQs distributed across these categories:

CLARIFICATION QUESTIONS (2-3 FAQs):
- "What exactly does [term] mean?"
- "Can you explain [concept] in simpler terms?"
- "What's the difference between [A] and [B]?"

DEEPER DIVE QUESTIONS (2-3 FAQs):
- "Why is [aspect] important?"
- "How does [A] relate to [B]?"
- "What are the implications of [concept]?"

PRACTICAL/APPLICATION QUESTIONS (2-3 FAQs):
- "How can I apply this to [situation]?"
- "What are the next steps?"
- "What resources do you recommend?"

ANSWER REQUIREMENTS:
- Keep answers concise but complete (2-4 sentences, 30-80 words)
- Base answers directly on presentation content
- Use clear, accessible language
- Maintain professional but conversational tone
- Make answers easy to speak aloud during live Q&A

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "faqs": [
    {
      "question": "Question text here ending with question mark?",
      "answer": "Clear, helpful answer here in 2-4 sentences based on the presentation content."
    }
  ]
}`
  },

  generateVariations: {
    name: 'Generate Variations',
    description: 'Editor: Create alternative slide content variations for user to choose from',
    getPrompt: (originalContent) => `You are an expert copywriter specializing in presentation content. You excel at rewriting content in different styles while preserving core meaning. You understand that variations should feel meaningfully different to give presenters real choices.

Create 2 alternative versions of this slide content. Each must keep the core message intact but differ significantly in ONE of these ways:

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

SPECIFIC REQUIREMENTS:
- Each variation must differ by AT LEAST 40% of words from original
- Both variations must differ from each other by AT LEAST 40%
- Word count within ±20% of original (so variations feel similar in scope)
- Core facts/claims must remain identical
- Tone can shift slightly but not drastically
- Each variation needs appropriate trigger words at natural pause points

EXAMPLE:

Original: "Climate change is accelerating rapidly. Scientists warn we have less than a decade to reduce emissions significantly. Every industry must transform immediately."

Variation 1 (Restructure):
{
  "content": "Every industry must transform immediately—this is the urgent message from scientists who warn that we have less than a decade to significantly reduce emissions as climate change accelerates.",
  "primaryTrigger": "accelerates",
  "alternativeTriggers": ["emissions", "transform"]
}

Variation 2 (Rephrase):
{
  "content": "The climate crisis is speeding up at an alarming rate. Experts emphasize that industries worldwide have fewer than ten years to make dramatic cuts in carbon output. The time for transformation is now.",
  "primaryTrigger": "now",
  "alternativeTriggers": ["transformation", "output"]
}

Original content to vary:
${originalContent}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "variations": [
    {
      "content": "First variation text here (restructured)",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    },
    {
      "content": "Second variation text here (rephrased)",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}`
  },

  suggestImagePrompt: {
    name: 'Suggest Image Prompt',
    description: 'Editor: Generate detailed image generation prompts for slide visuals',
    getPrompt: (content, presentationContext = '') => {
      const contextLine = presentationContext && presentationContext.trim().length > 0
        ? `This is part of a presentation about: ${presentationContext}\n\nThis specific slide contains: "${content}"`
        : `This slide contains: "${content}"`;

      return `You are a creative director who specializes in visual storytelling for presentations. You have an expert understanding of what makes presentation images effective: they must be visually striking yet not distracting, metaphorically relevant, and suitable for professional contexts. You know how to translate abstract concepts into concrete visual imagery.

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
${contextLine}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "imagePrompt": "Your detailed 40-80 word prompt here with all required elements...",
  "style": "photorealistic|illustration|3d-render|flat-design|abstract",
  "mood": "professional|inspiring|serious|energetic|calm",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;
    }
  },

  generateSpeakerNotes: {
    name: 'Generate Speaker Notes - TalkAdvantage Pro Format',
    description: 'Create from Scratch: Generate comprehensive speaker notes with 3 talking point options (Data, Vision, Proof)',
    getPrompt: (slides, topic, answers) => {
      const slidesContext = slides.map((s, i) => `Slide ${i + 1}: ${s.heading}\n${s.subtext || ''}\nVisual Elements: ${s.visualElements?.join(', ') || 'N/A'}`).join('\n\n');

      return `You are an expert presentation coach creating TalkAdvantage Pro speaker notes. You provide speakers with multiple rhetorical approaches to choose from during their presentation.

Generate speaker notes for ALL ${slides.length} slides in this presentation.

Topic: ${topic}
User Preferences: ${JSON.stringify(answers, null, 2)}

Slides Overview:
${slidesContext}

For EACH slide, generate:

**PROFOUND STATEMENT:**
- One killer sentence (max 20 words)
- Tweet-worthy and memorable
- Captures the essence of the slide
- Should create "aha" moment or reframe thinking

**TALKING POINTS - 3 OPTIONS:**

**Option A (Data):**
- 2-3 sentences with numbers, facts, metrics
- The analytical, evidence-based angle
- Use specific data points when relevant
- Ground claims in measurable reality

**Option B (Vision):**
- 2-3 sentences painting future state or big picture
- The inspirational, aspirational angle
- Help audience see possibilities
- Connect to larger meaning or impact

**Option C (Proof):**
- 2-3 sentences with examples, demos, testimonials
- The credibility, real-world angle
- Show it working in practice
- Use case studies, stories, demonstrations

**HIGH IMPACT PARAGRAPH:**
- 4-6 sentences that tell the complete story
- Balance emotion with data
- High word-to-impact ratio
- Set up natural transition to next slide
- Should be delivery-ready (easy to speak aloud)

TONE GUIDELINES:
- Match the user's selected tone: ${answers.tone || 'professional'}
- Confident but not arrogant
- Visionary but grounded in proof
- Conversational but professional
- Every word earns its place
- Use specific examples over generalities

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "speakerNotes": [
    {
      "slideNumber": 1,
      "profoundStatement": "One killer sentence that reframes thinking (max 20 words)",
      "talkingPoints": {
        "data": "2-3 sentences with numbers, facts, and metrics grounding the claim in measurable reality.",
        "vision": "2-3 sentences painting the future state and inspiring the audience to see new possibilities.",
        "proof": "2-3 sentences with examples, case studies, or demonstrations showing this working in practice."
      },
      "highImpactParagraph": "4-6 sentences telling the complete story, balancing emotion with data, using high word-to-impact ratio, and setting up natural transition to the next slide."
    }
  ]
}`;
    }
  },

  generateTitles: {
    name: 'Generate Slide Titles',
    description: 'Editor: Extract or generate concise titles for presentation slides',
    getPrompt: (sections) => {
      const sectionsText = sections.map((s, i) => `Section ${i + 1}:\n${s.content}`).join('\n\n');

      return `You are a presentation design expert. Your PRIMARY job is to EXTRACT existing titles from content when present, and only generate new ones when necessary.

CRITICAL INSTRUCTIONS - Follow in order:

1. **EXTRACT FIRST** - Look for obvious titles already in the content:
   - **SECTION MARKERS**: Lines like "SECTION 1: OPENING HOOK (15 seconds)" → extract "Opening Hook"
   - **PATTERN**: "SECTION [NUMBER]: [TITLE] ([time])" → extract only the [TITLE] part
   - First line if it's short (under 10 words) and descriptive
   - Lines in ALL CAPS
   - Lines with markdown headers (# Header, ## Header)
   - Lines followed by a line break before body text
   - Lines that end with a colon followed by explanation
   - Lines that are clearly headlines/titles based on positioning and brevity

2. **Clean up extracted titles**:
   - Remove "SECTION X:" prefix
   - Remove time markers like "(15 seconds)", "(20 seconds)"
   - Remove markdown formatting (##, **, etc.)
   - Remove colons at the end
   - Keep it to 3-7 words if longer
   - Convert to Title Case (capitalize each word)

3. **Only if NO title exists** in the content:
   - Infer a clear, specific title from the main message (3-7 words)
   - Make it informative and specific (avoid generic terms like "Introduction", "Overview")

4. **Title Quality Rules**:
   - Use Title Case (capitalize major words)
   - Be specific to the actual content
   - Presenters should instantly recognize their own phrasing
   - NEVER include "Section X:" in the output
   - NEVER include timing like "(15 seconds)"

EXAMPLES:
Input: "SECTION 1: OPENING HOOK (15 seconds)\nAI can write your emails..."
Output: "Opening Hook"

Input: "SECTION 2: THE PROBLEM (20 seconds)\nThink about your last meeting..."
Output: "The Problem"

Input: "## Introduction\nWelcome everyone..."
Output: "Introduction"

Sections:
${sectionsText}

Return ONLY valid JSON array of title strings, one per section (no markdown, no extra text):
["Title for Section 1", "Title for Section 2", "Title for Section 3"]

Requirements:
- Must return exactly ${sections.length} titles
- Prefer extraction over generation (extract 90% of the time if possible)
- Each title should be 3-7 words
- Use title case
- Be specific and descriptive
- NEVER include "SECTION X:" prefix or timing markers`;
    }
  }
};

/**
 * Get a specific prompt
 * @param {string} operation - Operation name
 * @param  {...any} args - Arguments to pass to the prompt generator
 * @returns {string} The generated prompt
 */
export function getPrompt(operation, ...args) {
  const promptConfig = PROMPTS[operation];
  if (!promptConfig) {
    throw new Error(`Unknown prompt operation: ${operation}`);
  }

  if (typeof promptConfig.getPrompt === 'function') {
    return promptConfig.getPrompt(...args);
  }

  return promptConfig.getPrompt;
}

/**
 * Get all prompts metadata (for UI display)
 * @returns {Object} Prompts metadata
 */
export function getAllPromptsMetadata() {
  const metadata = {};
  for (const [key, value] of Object.entries(PROMPTS)) {
    metadata[key] = {
      name: value.name,
      description: value.description
    };
  }
  return metadata;
}

/**
 * Get example prompt output for editing
 * @param {string} operation - Operation name
 * @returns {Object} Example prompt with parameters
 */
export function getPromptExample(operation) {
  const promptConfig = PROMPTS[operation];
  if (!promptConfig) {
    throw new Error(`Unknown prompt operation: ${operation}`);
  }

  // Generate example prompts with sample parameters
  let examplePrompt = '';
  let parameters = {};

  switch (operation) {
    case 'processScript':
      parameters = { text: '[Your script text here]', preserveWording: true };
      examplePrompt = promptConfig.getPrompt('[Your script text here]', true);
      break;
    case 'generateQuestions':
      parameters = { topic: '[Your presentation topic]' };
      examplePrompt = promptConfig.getPrompt('[Your presentation topic]');
      break;
    case 'generateSlideOptions':
      parameters = { topic: '[Topic]', answers: [], sectionNumber: 1, totalSections: 5 };
      examplePrompt = promptConfig.getPrompt('[Topic]', [], 1, 5);
      break;
    case 'suggestTriggers':
      parameters = { text: '[Section text]' };
      examplePrompt = promptConfig.getPrompt('[Section text]');
      break;
    case 'answerQuestion':
      parameters = { question: '[Question]', presentationContent: '[Content]', knowledgeBase: [], tone: 'professional' };
      examplePrompt = promptConfig.getPrompt('[Question]', '[Content]', [], 'professional');
      break;
    case 'generateFAQs':
      parameters = { presentationContent: '[Presentation content]' };
      examplePrompt = promptConfig.getPrompt('[Presentation content]');
      break;
    case 'generateVariations':
      parameters = { originalContent: '[Original slide content]' };
      examplePrompt = promptConfig.getPrompt('[Original slide content]');
      break;
    case 'suggestImagePrompt':
      parameters = { content: '[Slide content]', presentationContext: '[Context]' };
      examplePrompt = promptConfig.getPrompt('[Slide content]', '[Context]');
      break;
    default:
      examplePrompt = 'No example available';
  }

  return {
    operation,
    name: promptConfig.name,
    description: promptConfig.description,
    examplePrompt,
    parameters
  };
}
