/**
 * Centralized AI Prompts for VerbaDeck
 * All prompts are editable here for easy customization and testing
 */

export const PROMPTS = {
  processScript: {
    name: 'Process Script',
    description: 'Convert raw text into presentation sections with trigger words',
    getPrompt: (text, preserveWording = true) => {
      return preserveWording
        ? `You are a presentation script formatter. Convert the following raw text into well-structured presentation sections.

IMPORTANT: PRESERVE THE EXACT WORDING. Do NOT edit, improve, or rewrite the content. The user has carefully crafted this text.

Your ONLY tasks:
1. Split the text into logical presentation sections (5-10 sections, or fewer if text is short)
2. Identify the most impactful final word in each section as the primary trigger word
3. Suggest 1-2 alternative trigger words per section that could also work
4. Keep the original text EXACTLY as written (including capitalization, punctuation, emphasis)

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "sections": [
    {
      "content": "The EXACT original text of the section",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}

Raw text to process (PRESERVE EXACTLY AS WRITTEN):
${text}`
        : `You are a presentation script formatter. Convert the following raw text into well-structured presentation sections.

For each section:
1. Clean up formatting and make it concise (2-4 sentences per section)
2. Improve clarity and flow while maintaining the core message
3. Identify the most impactful final word as the primary trigger word
4. Suggest 1-2 alternative trigger words that could also work
5. Create 5-10 sections total (fewer if the text is short)

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "sections": [
    {
      "content": "The formatted and improved text of the section",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}

Raw text to process:
${text}`;
    }
  },

  generateQuestions: {
    name: 'Generate Questions',
    description: 'Create strategic questions for the Create from Scratch workflow',
    getPrompt: (topic) => `You are a presentation planning expert. A user wants to create a presentation about: "${topic}"

Generate 4-5 strategic questions to understand exactly what they need. Use a mix of:
- Multiple choice questions (3-4 options each)
- Fill-in-the-blank questions

These questions should help you later generate a high-quality, tailored presentation.

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
    }
  ]
}

Requirements:
- Generate 4-5 questions total
- Mix of multiple_choice and fill_in_blank types
- Questions should be strategic and useful for generating slides
- Multiple choice should have 3-4 options
- Fill-in-blank should have helpful placeholder text`
  },

  generateSlideOptions: {
    name: 'Generate Slide Options',
    description: 'Generate multiple slide variations for each section',
    getPrompt: (topic, answers, sectionNumber, totalSections) => `You are a professional presentation designer. Generate 3 different slide content options for section ${sectionNumber} of ${totalSections}.

Topic: ${topic}
User Preferences: ${JSON.stringify(answers, null, 2)}

Create 3 DISTINCT variations:
1. Concise & impactful (minimal text, strong statement)
2. Detailed & informative (more context and explanation)
3. Story-driven (narrative approach, relatable example)

Return ONLY valid JSON:
{
  "options": [
    {
      "content": "Slide text here (2-4 sentences)",
      "style": "concise|detailed|story",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}`
  },

  suggestTriggers: {
    name: 'Suggest Triggers',
    description: 'Suggest alternative trigger words for a section',
    getPrompt: (text) => `Analyze this presentation section and suggest 3-5 impactful trigger words that would work well for voice navigation.

Section text:
${text}

Choose words that are:
- Distinctive and memorable
- Naturally occurring at logical pause points
- Not too common (avoid "the", "and", "is")
- Easy to pronounce clearly

Return ONLY valid JSON:
{
  "triggers": ["word1", "word2", "word3"]
}`
  },

  answerQuestion: {
    name: 'Answer Question',
    description: 'Generate Q&A answers with different tones',
    getPrompt: (question, presentationContent, knowledgeBase, tone = 'professional') => {
      const kbContext = knowledgeBase.length > 0
        ? `\n\nKnowledge Base (FAQs):\n${knowledgeBase.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n')}`
        : '';

      const tonePersonas = {
        professional: 'I want you to act as a professional business presenter who delivers clear, direct, and credible answers. Be confident and authoritative while remaining approachable.',
        witty: 'I want you to act as a witty and engaging presenter who uses clever wordplay, light humor, and memorable phrasing to make answers entertaining while still being informative.',
        insightful: 'I want you to act as a deeply insightful thought leader who provides analytical, nuanced answers that reveal deeper connections and implications beyond the obvious.',
        conversational: 'I want you to act as a friendly, conversational presenter who answers like talking to a colleague - warm, relatable, and easy to understand without corporate jargon.',
        bold: 'I want you to act as a bold, provocative presenter who challenges assumptions, uses strong statements, and isn\'t afraid to be controversial or make people think differently.',
        technical: 'I want you to act as a technical expert who provides precise, data-driven answers with specific details, metrics, and technical accuracy for sophisticated audiences.',
        storytelling: 'I want you to act as a storytelling presenter who weaves answers into compelling narratives, using anecdotes, scenarios, and vivid examples to illustrate points.',
        sarcastic: 'I want you to act as a sharp, sarcastic presenter who uses dry wit, subtle jabs, and ironic observations to make memorable points (while still being helpful).'
      };

      const selectedPersona = tonePersonas[tone] || tonePersonas.professional;

      return `${selectedPersona}

You are answering a live question during a presentation. Provide TWO different answer options that the presenter can choose from, both in the tone/style specified above.

Question: "${question}"

Context from presentation:
${presentationContent}${kbContext}

Each answer should have THREE parts to give the presenter flexibility:
1. **Brief**: One concise sentence (for quick answers)
2. **Bullets**: 3-5 key points as bullet items (for structured responses)
3. **Full**: A paragraph with 3-5 sentences (for detailed explanations)

Requirements:
- Generate TWO complete answer sets (each with brief, bullets, and full)
- The two answers should offer different approaches or perspectives
- Base answers on the presentation content and knowledge base provided
- CRITICAL: All parts must match the personality/tone specified above
- Make everything easy to speak aloud

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "answer1": {
    "brief": "Complete one-sentence answer to the question",
    "bullets": ["First key point", "Second key point", "Third key point"],
    "full": "Full paragraph explanation with 3-5 sentences that elaborates on the topic."
  },
  "answer2": {
    "brief": "Different complete one-sentence answer to the question",
    "bullets": ["Different first point", "Different second point", "Different third point"],
    "full": "Different full paragraph with alternative perspective or approach, also 3-5 sentences."
  }
}`;
    }
  },

  generateFAQs: {
    name: 'Generate FAQs',
    description: 'Auto-generate frequently asked questions from presentation content',
    getPrompt: (presentationContent) => `Based on this presentation content, generate 5-8 frequently asked questions (FAQs) that an audience might ask.

Presentation Content:
${presentationContent}

Requirements:
- Generate realistic questions an audience would ask
- Provide clear, helpful answers based on the presentation
- Mix of clarifying questions, deeper dive questions, and practical questions
- Keep answers concise but complete (2-4 sentences)

Return ONLY valid JSON:
{
  "faqs": [
    {
      "question": "Question text here?",
      "answer": "Answer text here."
    }
  ]
}`
  },

  generateVariations: {
    name: 'Generate Variations',
    description: 'Create slide content variations',
    getPrompt: (originalContent) => `Create 2 alternative versions of this slide content while maintaining the same key message.

Original:
${originalContent}

Generate variations that:
- Keep the core message intact
- Offer different phrasing or structure
- Maintain similar length
- Include appropriate trigger words

Return ONLY valid JSON:
{
  "variations": [
    {
      "content": "Variation text here",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}`
  },

  suggestImagePrompt: {
    name: 'Suggest Image Prompt',
    description: 'Generate detailed image prompts for AI image generation',
    getPrompt: (content, presentationContext = '') => {
      if (presentationContext && presentationContext.trim().length > 0) {
        return `This is part of a presentation about: ${presentationContext}

This specific slide contains: "${content}"

Generate a detailed image prompt (2-3 sentences) that would create a professional, visually compelling presentation slide image. Return ONLY the image prompt, nothing else.`;
      }
      return `This slide contains: "${content}"

Generate a detailed image prompt (2-3 sentences) for creating a professional presentation slide image. Return ONLY the image prompt, nothing else.`;
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
