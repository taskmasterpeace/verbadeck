import axios from 'axios';
import { getPrompt } from './prompts.js';
import { parseAIResponse } from './utils/json-parser.js';
import { TONE_PERSONAS } from './constants.js';
import { getProviderRouting, getModelForOperation } from './model-config.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

/**
 * OpenRouter API client for AI-powered script processing
 */
export class OpenRouterClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = OPENROUTER_API_URL;
  }

  /**
   * Fetch available models from OpenRouter
   */
  async getModels() {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching models:', error.response?.data || error.message);
      throw new Error('Failed to fetch models from OpenRouter');
    }
  }

  /**
   * Process raw text into structured presentation sections
   * @param {string} text - Raw script text
   * @param {string} model - Model ID (e.g., 'anthropic/claude-3.5-sonnet')
   * @param {boolean} preserveWording - If true, preserve exact wording; if false, allow AI to improve clarity
   * @returns {Promise<Object>} Structured sections with triggers
   */
  async processScript(text, model = 'anthropic/claude-3.5-sonnet', preserveWording = true) {
    const prompt = preserveWording
      ? `You are a presentation script formatter. Convert the following raw text into well-structured presentation sections.

IMPORTANT: PRESERVE THE EXACT WORDING. Do NOT edit, improve, or rewrite the content. The user has carefully crafted this text.

Your ONLY tasks:
1. Split the text into logical presentation sections (5-10 sections, or fewer if text is short)
2. Identify the most impactful final word in each section as the primary trigger word
3. Suggest 1-2 alternative trigger words per section that could also work
4. Keep the original text EXACTLY as written (including capitalization, punctuation, emphasis)
5. Add MARKDOWN formatting to enhance readability (this is NOT changing wording, just adding visual structure)

MARKDOWN FORMATTING INSTRUCTIONS:
For each section's content field, use MARKDOWN formatting to enhance visual presentation:
- Use **bold** for emphasis on key points and important terms
- Use *italic* for subtle emphasis or definitions
- Use bullet lists (- item) for multiple related points
- Use numbered lists (1. item) for sequential steps or ordered information
- Keep formatting clean and professional
- Format headings with proper structure if present

Example good formatting:
"**Key Insight**\n\nThis approach delivers three benefits:\n- **Improved performance** through caching\n- Reduced latency\n- Better user experience"

Return ONLY valid JSON in this exact format (no markdown wrapper, no extra text):
{
  "sections": [
    {
      "content": "The EXACT original text with MARKDOWN formatting added",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}

Raw text to process (PRESERVE EXACT WORDING, ADD MARKDOWN FORMATTING):
${text}`
      : `You are a presentation script formatter. Convert the following raw text into well-structured presentation sections.

For each section:
1. Clean up formatting and make it concise (2-4 sentences per section)
2. Improve clarity and flow while maintaining the core message
3. Identify the most impactful final word as the primary trigger word
4. Suggest 1-2 alternative trigger words that could also work
5. Create 5-10 sections total (fewer if the text is short)
6. Format content with MARKDOWN for visual clarity

MARKDOWN FORMATTING INSTRUCTIONS:
For each section's content field, use MARKDOWN formatting:
- Use **bold** for emphasis on key points and important terms
- Use *italic* for subtle emphasis or definitions
- Use bullet lists (- item) for multiple related points
- Use numbered lists (1. item) for sequential steps or ordered information
- Keep formatting clean and professional

Example good formatting:
"**Problem Statement**\n\nCustomers face three challenges:\n- **High costs** in current solutions\n- Complex setup processes\n- Limited scalability"

Return ONLY valid JSON in this exact format (no markdown wrapper, no extra text):
{
  "sections": [
    {
      "content": "The formatted and improved text with MARKDOWN formatting",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"]
    }
  ]
}

Raw text to process:
${text}`;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return parseAIResponse(content);
    } catch (error) {
      console.error('Error processing script:', error.response?.data || error.message);
      throw new Error('Failed to process script with AI');
    }
  }

  /**
   * Process images with AI to generate presentation script
   * @param {Array} images - Array of image objects with dataUrl and name
   * @param {string} aspectRatio - '9:16' or '16:9'
   * @param {string} model - Model ID
   * @returns {Promise<Object>} Structured sections with content and images
   */
  async processImages(images, aspectRatio = '16:9', model = 'anthropic/claude-3.5-sonnet') {
    const prompt = `You are a presentation script generator. I will provide you with ${images.length} images for a presentation.

Your task:
1. Analyze each image and create narration that flows naturally from one image to the next
2. Generate presentation script that tells a cohesive story through these visuals
3. Each section should be 2-4 sentences with MARKDOWN formatting
4. Identify the most impactful final word as the primary trigger word for each section
5. Suggest 1-2 alternative trigger words per section
6. The presentation aspect ratio is ${aspectRatio} (${aspectRatio === '16:9' ? 'landscape/standard displays' : 'portrait/mobile displays'})

MARKDOWN FORMATTING INSTRUCTIONS - CRITICAL RULES:
For each section's content field, use CLEAN MARKDOWN formatting ONLY:
- Use **bold** for emphasis on key visual elements and important points
- Use *italic* for subtle emphasis or descriptive details
- Use bullet lists (- item) for multiple related observations
- Use numbered lists (1. item) for sequential steps shown in images
- Keep formatting clean and professional
- DO NOT use HTML tags like <div>, <span>, <p>, <strong>, <em>, <center>, etc.
- DO NOT use inline styles or style attributes
- DO NOT use BBCode-style tags like [center], [left], [right]
- Use pure markdown syntax only

Example of CORRECT formatting (pure markdown):
"**Visual Impact**\n\nThis diagram shows:\n- **Core architecture** with three layers\n- Data flow patterns\n- Integration points"

Example of INCORRECT formatting (avoid):
❌ "<div>**Visual Impact**</div>" (no HTML tags)
❌ "[center]Centered text[/center]" (no BBCode tags)

Return ONLY valid JSON in this exact format (no markdown wrapper, no extra text):
{
  "sections": [
    {
      "content": "Narration for this slide/image with MARKDOWN formatting",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"],
      "imageUrl": "data:image/..."
    }
  ]
}

Note: I'm providing ${images.length} images. Create exactly ${images.length} sections, one for each image in order.

Images are provided as base64 data URLs. Use your visual understanding to generate appropriate narration with markdown formatting.`;

    try {
      // Build messages array with images
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            ...images.map((img, index) => ({
              type: 'image_url',
              image_url: {
                url: img.dataUrl,
              },
            })),
          ],
        },
      ];

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: messages,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;

      const parsed = parseAIResponse(content);

      // Add the actual image data URLs to the sections
      if (parsed.sections) {
        parsed.sections = parsed.sections.map((section, index) => ({
          ...section,
          imageUrl: images[index]?.dataUrl || section.imageUrl,
        }));
      }

      return parsed;
    } catch (error) {
      console.error('Error processing images:', error.response?.data || error.message);
      throw new Error('Failed to process images with AI');
    }
  }

  /**
   * Suggest better trigger words for a given section
   * @param {string} sectionText - The section content
   * @param {string} model - Model ID
   * @returns {Promise<string[]>} Array of suggested trigger words
   */
  async suggestTriggers(sectionText, model = 'anthropic/claude-3.5-sonnet') {
    const prompt = `Given this presentation section, suggest 3-5 powerful trigger words (single words or short phrases) that would work well to advance to the next slide. Choose words that are:
- Impactful and memorable
- Easy to pronounce clearly
- Not too common (avoid "the", "a", "is")
- Natural endpoints in the flow

Section: "${sectionText}"

Return ONLY a JSON array of strings, no other text:
["word1", "word2", "word3"]`;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;

      // Extract JSON array
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }

      throw new Error('No valid array found in response');
    } catch (error) {
      console.error('Error suggesting triggers:', error.response?.data || error.message);
      throw new Error('Failed to suggest triggers');
    }
  }

  /**
   * Generate 4 variations of a script (original, enhanced, concise, storytelling)
   * @param {string} slideContent - Original slide content
   * @param {string} model - Model ID
   * @returns {Promise<Array>} Array of 4 variations
   */
  async generateVariations(slideContent, model = 'anthropic/claude-3.5-sonnet') {
    const variations = [
      {
        type: 'original',
        label: 'Original',
        description: 'Your original slide content unchanged',
        systemPrompt: null, // No AI, just return original
        temperature: 0,
      },
      {
        type: 'enhanced',
        label: 'Enhanced',
        description: 'Added detail and smooth transitions',
        systemPrompt: 'Enhance this presentation script by adding relevant details, smooth transitions, and professional language. Keep it concise but more polished. Maintain the core message.\n\nIMPORTANT: Use CLEAN MARKDOWN formatting ONLY in your response:\n- Use **bold** for emphasis on key points and important terms\n- Use *italic* for subtle emphasis or definitions\n- Use bullet lists (- item) for multiple related points\n- Use numbered lists (1. item) for sequential steps\n- Keep formatting clean and professional\n- DO NOT use HTML tags like <div>, <span>, <p>, <strong>, <em>, <center>, etc.\n- DO NOT use BBCode tags like [center], [left], [right]\n- Use pure markdown syntax only',
        temperature: 0.3,
      },
      {
        type: 'concise',
        label: 'Concise',
        description: 'Shorter, punchier version',
        systemPrompt: 'Rewrite this presentation script to be more concise and punchy. Remove unnecessary words while keeping the key message. Make it impactful and to the point.\n\nIMPORTANT: Use CLEAN MARKDOWN formatting ONLY in your response:\n- Use **bold** for emphasis on key points and important terms\n- Use *italic* for subtle emphasis\n- Use bullet lists (- item) if appropriate for clarity\n- Keep formatting clean and professional\n- DO NOT use HTML tags like <div>, <span>, <p>, <strong>, <em>, <center>, etc.\n- DO NOT use BBCode tags like [center], [left], [right]\n- Use pure markdown syntax only',
        temperature: 0.2,
      },
      {
        type: 'storytelling',
        label: 'Storytelling',
        description: 'Engaging narrative style',
        systemPrompt: 'Rewrite this presentation script in an engaging, storytelling style. Make it more narrative, relatable, and captivating while preserving the core information. Add emotional appeal.\n\nIMPORTANT: Use CLEAN MARKDOWN formatting ONLY in your response:\n- Use **bold** for emphasis on dramatic moments and key points\n- Use *italic* for subtle emphasis and emotional nuance\n- Use bullet lists (- item) if appropriate for clarity\n- Keep formatting clean and professional\n- DO NOT use HTML tags like <div>, <span>, <p>, <strong>, <em>, <center>, etc.\n- DO NOT use BBCode tags like [center], [left], [right]\n- Use pure markdown syntax only',
        temperature: 0.7,
      },
    ];

    const results = [];

    for (const variant of variations) {
      if (variant.type === 'original') {
        // Original: no AI processing
        results.push({
          type: variant.type,
          label: variant.label,
          description: variant.description,
          content: slideContent,
          triggers: await this.extractTriggers(slideContent, model),
        });
        continue;
      }

      try {
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: model,
            temperature: variant.temperature,
            messages: [
              {
                role: 'system',
                content: variant.systemPrompt,
              },
              {
                role: 'user',
                content: slideContent,
              },
            ],
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://verbadeck.app',
              'X-Title': 'VerbaDeck',
            },
          }
        );

        const content = response.data.choices[0].message.content.trim();
        const triggers = await this.extractTriggers(content, model);

        results.push({
          type: variant.type,
          label: variant.label,
          description: variant.description,
          content: content,
          triggers: triggers,
        });
      } catch (error) {
        console.error(`Error generating ${variant.type} variation:`, error.message);
        // Fallback to original if generation fails
        results.push({
          type: variant.type,
          label: variant.label,
          description: `${variant.description} (using original)`,
          content: slideContent,
          triggers: await this.extractTriggers(slideContent, model),
        });
      }
    }

    return results;
  }

  /**
   * Extract trigger words from content
   * @param {string} content - Text content
   * @param {string} model - Model ID
   * @returns {Promise<string[]>} Array of trigger words
   */
  async extractTriggers(content, model = 'anthropic/claude-3.5-sonnet') {
    try {
      const triggers = await this.suggestTriggers(content, model);
      return triggers.slice(0, 3); // Limit to 3 triggers
    } catch (error) {
      // Fallback: use last few words
      const words = content.split(' ').filter(w => w.length > 3);
      return words.slice(-3).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  }

  /**
   * Generate FAQ suggestions from presentation content
   * @param {string} presentationContent - Full presentation text
   * @param {string} model - Model ID
   * @returns {Promise<Array>} Array of FAQ objects with question and answer
   */
  async generateFAQs(presentationContent, model = 'anthropic/claude-3.5-sonnet') {
    const prompt = `You are a presentation Q&A expert. Analyze this presentation and generate 5-8 frequently asked questions that an audience might ask.

For each question:
1. The question should be something a real audience member would ask
2. The answer should be 2-3 sentences, concise and clear with MARKDOWN formatting
3. Use bullet points if the answer has multiple parts
4. Base answers on the presentation content provided

MARKDOWN FORMATTING INSTRUCTIONS - CRITICAL RULES:
For each FAQ's answer field, use CLEAN MARKDOWN formatting ONLY:
- Use **bold** for emphasis on key points and important terms
- Use *italic* for subtle emphasis or clarifications
- Use bullet lists (- item) for multiple related points in the answer
- Use numbered lists (1. item) for sequential steps
- Keep formatting clean and professional
- DO NOT use HTML tags like <div>, <span>, <p>, <strong>, <em>, <center>, etc.
- DO NOT use inline styles or style attributes
- DO NOT use BBCode tags like [center], [left], [right]
- Use pure markdown syntax only

Example of CORRECT formatting (pure markdown):
"**Yes**, we support three integration methods:\n- **REST API** for real-time data\n- Webhook notifications\n- Batch file imports"

Example of INCORRECT formatting (avoid):
❌ "<div>**Yes**, we support...</div>" (no HTML tags)
❌ "[center]We support...[/center]" (no BBCode tags)

Return ONLY valid JSON in this exact format (no markdown wrapper, no extra text):
{
  "faqs": [
    {
      "question": "The question an audience member might ask",
      "answer": "A clear, concise answer with MARKDOWN formatting based on the presentation content"
    }
  ]
}

Presentation content:
${presentationContent}`;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = parseAIResponse(content);
      return parsed.faqs || [];
    } catch (error) {
      console.error('Error generating FAQs:', error.response?.data || error.message);
      throw new Error('Failed to generate FAQs');
    }
  }

  /**
   * Generate questions to understand user's presentation needs
   * @param {string} topic - The presentation topic
   * @param {string} model - Model ID
   * @returns {Promise<Array>} Array of 4-5 questions (mix of multiple choice and fill-in-blank)
   */
  async generateQuestions(topic, preferences = null, model = 'anthropic/claude-3.5-sonnet') {
    // Build preferences guidance
    let preferencesText = '';
    if (preferences) {
      const types = [];
      if (preferences.multiple_choice > 0) types.push(`${preferences.multiple_choice}% Multiple Choice`);
      if (preferences.true_false > 0) types.push(`${preferences.true_false}% True/False`);
      if (preferences.fill_in_blank > 0) types.push(`${preferences.fill_in_blank}% Fill-in-the-Blank`);
      preferencesText = `\nQuestion Type Distribution Preferences: ${types.join(', ')}`;
    }

    const prompt = `You are a presentation planning expert. A user wants to create a presentation about: "${topic}"

Generate 4-5 strategic questions to understand exactly what they need.

CRITICAL REQUIREMENT: You MUST use a MIX of different question types. Do NOT make all questions the same type.

${preferencesText ? preferencesText + '\n\nFollow these percentage guidelines STRICTLY for question type distribution.' : 'Question Type Guidelines:\n- Use at least ONE of each type: multiple_choice, true_false, and fill_in_blank\n- Intelligently distribute types based on what works best for this topic'}

Question Type Descriptions:
- Multiple choice: 3-4 options each, best for concrete choices
- True/False: Simple yes/no questions, best for validating assumptions
- Fill-in-the-blank: Open-ended text input, best for specific details like names, numbers, or descriptions

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
      "type": "true_false",
      "question": "Will this presentation include technical demonstrations?"
    },
    {
      "id": "q3",
      "type": "fill_in_blank",
      "question": "Who is your target audience?",
      "placeholder": "e.g., executives, students, general public"
    }
  ]
}

STRICT Requirements:
- Generate EXACTLY 4-5 questions total
- Use types: "multiple_choice", "true_false", or "fill_in_blank"
- MUST include AT LEAST ONE of each type (mix them up!)
- Multiple choice MUST have 3-4 options in the "options" array
- True/False questions must have type "true_false" and NO options field
- Fill-in-blank must have type "fill_in_blank" with a helpful "placeholder" field${preferencesText ? '\n- Follow the percentage guidelines for question type distribution' : '\n- Ensure variety: do NOT make all questions the same type'}`;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;

      const parsed = parseAIResponse(content);
      return parsed.questions || [];
    } catch (error) {
      console.error('Error generating questions:', error.response?.data || error.message);
      throw new Error('Failed to generate questions');
    }
  }

  /**
   * Generate slide options based on topic and user answers
   * @param {string} topic - The presentation topic
   * @param {Array} answers - User's answers to questions
   * @param {number} numSlides - Number of slides to generate
   * @param {string} model - Model ID
   * @returns {Promise<Array>} Array of slide positions, each with 4 options
   */
  async generateSlideOptions(topic, answers, numSlides, model = 'anthropic/claude-3.5-sonnet') {
    const answersContext = answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');

    const prompt = `Create ${numSlides} slides about: "${topic}"

${answersContext}

For EACH slide, generate 4 different options. Each option must have:
- content: 2-4 sentences with smart markdown (what audience sees on slide)
- primaryTrigger: one impactful word from the content
- alternativeTriggers: 1-2 alternative trigger words
- style: direct/storytelling/data-driven/provocative

MARKDOWN RULES:
- Use **bold** for key terms, stats, critical words
- Use bullets (- item) for 3+ related points
- Use numbered lists for steps/sequences
- NO HTML tags, NO BBCode like [center], NO headings in content
- Example: "We achieved **97% accuracy**.\n\n- **Fast** processing\n- **Easy** integration"

Return ${numSlides} slides, 4 options each. ONLY JSON, no extra text:
{
  "slides": [
    {
      "position": 1,
      "title": "First slide title",
      "options": [
        {"content": "Option 1 with **markdown**", "primaryTrigger": "word", "alternativeTriggers": ["alt1", "alt2"], "style": "direct"},
        {"content": "Option 2 with bullets", "primaryTrigger": "word2", "alternativeTriggers": ["alt3"], "style": "storytelling"},
        {"content": "Option 3 with stats", "primaryTrigger": "word3", "alternativeTriggers": ["alt4"], "style": "data-driven"},
        {"content": "Option 4 bold approach", "primaryTrigger": "word4", "alternativeTriggers": ["alt5"], "style": "provocative"}
      ]
    }
  ]
}`;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;

      const parsed = parseAIResponse(content);
      if (!parsed || !parsed.slides) {
        console.error('❌ AI returned invalid response. First 500 chars:', content.substring(0, 500));
        throw new Error('AI did not return valid slide data');
      }
      return parsed.slides || [];
    } catch (error) {
      if (error.message === 'AI did not return valid slide data') {
        throw error;
      }
      console.error('Error generating slide options:', error.response?.data || error.message);
      throw new Error('Failed to generate slide options');
    }
  }

  /**
   * Answer a question with TWO different response options
   * @param {string} question - The question to answer
   * @param {string} presentationContent - Full presentation text
   * @param {Array} knowledgeBase - Array of FAQ objects
   * @param {string} model - Model ID
   * @returns {Promise<Object>} Object with two answer options
   */
  async answerQuestion(question, presentationContent, knowledgeBase = [], model = 'anthropic/claude-3.5-sonnet', tone = 'professional') {
    const kbContext = knowledgeBase.length > 0
      ? `\n\nKnowledge Base (FAQs):\n${knowledgeBase.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n')}`
      : '';

    // Tone personas using "I want you to act as..." format
    const selectedPersona = TONE_PERSONAS[tone] || TONE_PERSONAS.professional;

    const prompt = `${selectedPersona}

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

    try {
      // Get provider routing if model requires specific provider (e.g., Groq for ultra-fast inference)
      const providerRouting = getProviderRouting(model);

      const requestBody = {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        // Add provider routing if needed (forces Groq for Llama models)
        ...(providerRouting || {})
      };

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return parseAIResponse(content);
    } catch (error) {
      console.error('Error answering question:', error.response?.data || error.message);
      throw new Error('Failed to answer question');
    }
  }

  /**
   * Answer question with headings and keywords (for Know It All Wall)
   * @param {string} question - The question to answer
   * @param {string} knowledgeBase - Knowledge base content to answer from
   * @param {string} model - Model ID to use
   * @returns {Promise<Object>} Two answers with headings, brief, bullets, full, and keywords
   */
  async answerQuestionWithKeywords(question, knowledgeBase, model = 'meta-llama/llama-3.1-8b-instruct', tone = 'professional') {
    // Use model config system for operation-specific defaults
    const selectedModel = getModelForOperation('answerQuestion', model);

    // Map tone descriptions
    const toneDescriptions = {
      professional: 'professional, clear, and business-appropriate',
      friendly: 'warm, conversational, and approachable',
      enthusiastic: 'energetic, positive, and motivating',
      confident: 'assertive, authoritative, and self-assured',
      technical: 'precise, detailed, and expert-focused'
    };

    const toneDesc = toneDescriptions[tone] || toneDescriptions.professional;

    const prompt = `You are an AI assistant answering questions based on the provided knowledge base.

**Question:** ${question}

**Knowledge Base:**
${knowledgeBase}

**Tone:** ${toneDesc}

**Task:** Generate 2 different answer approaches to this question based on the knowledge base. Use a ${toneDesc} tone throughout all answers.

Each answer should have:
1. **heading**: A short 3-7 word heading describing the approach (e.g., "Technical Deep Dive", "Business Value Focus", "User-Centric Perspective")
   - IMPORTANT: The heading MUST contain the first keyword naturally
2. **brief**: One concise sentence answering the question
   - IMPORTANT: The brief MUST contain the first keyword naturally
3. **bullets**: 3 key points as bullet points
   - IMPORTANT: At least ONE bullet point MUST contain the second keyword naturally
4. **full**: A complete 3-5 sentence paragraph explanation
5. **keywords**: Exactly 2 unique, easy-to-say keywords (2-3 syllables each) that represent this answer's core concepts

**CRITICAL Requirements for keywords:**
- Must be UNIQUE between the two answers (no overlap)
- Must be easy to pronounce (2-3 syllables)
- Must be memorable and distinct
- First keyword MUST appear in the heading or brief (user will say this first)
- Second keyword MUST appear in at least one bullet point (user will say this to confirm)
- Examples: "technical", "revenue", "timeline", "users", "features", "growth", "security", "pricing"

Return ONLY valid JSON in this exact format:
{
  "answer1": {
    "heading": "3-7 word heading containing keyword1",
    "brief": "One sentence answer containing keyword1",
    "bullets": ["Point 1", "Point 2 containing keyword2", "Point 3"],
    "full": "3-5 sentence paragraph explanation.",
    "keywords": ["keyword1", "keyword2"]
  },
  "answer2": {
    "heading": "Different heading containing keyword3",
    "brief": "Different sentence containing keyword3",
    "bullets": ["Different point 1", "Different point 2 containing keyword4", "Different point 3"],
    "full": "Different 3-5 sentence paragraph with alternative perspective.",
    "keywords": ["keyword3", "keyword4"]
  }
}`;

    // Retry logic with rate limit detection
    const MAX_RETRIES = 1;
    const RETRY_DELAY_MS = 2000;
    const RATE_LIMIT_THRESHOLD_MS = 500; // Failures <500ms are likely rate limits

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const startTime = Date.now();

      try {
        const providerRouting = getProviderRouting(selectedModel);

        const requestBody = {
          model: selectedModel,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          ...(providerRouting || {})
        };

        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://verbadeck.app',
              'X-Title': 'VerbaDeck',
            },
          }
        );

        const content = response.data.choices[0].message.content;
        const parsed = parseAIResponse(content);

        // Validate structure
        if (!parsed.answer1 || !parsed.answer2) {
          throw new Error('Invalid response structure: missing answer1 or answer2');
        }

        // Validate each answer has required fields
        for (const key of ['answer1', 'answer2']) {
          const answer = parsed[key];
          if (!answer.heading || !answer.brief || !answer.bullets || !answer.full || !answer.keywords) {
            throw new Error(`Invalid response structure: ${key} missing required fields`);
          }
          if (!Array.isArray(answer.keywords) || answer.keywords.length !== 2) {
            throw new Error(`Invalid response structure: ${key} keywords must be array of 2 strings`);
          }
        }

        // Success! Log if this was a retry
        if (attempt > 0) {
          console.log(`✓ Retry successful after ${attempt} attempt(s)`);
        }

        return parsed;
      } catch (error) {
        const duration = Date.now() - startTime;
        const isRateLimit = duration < RATE_LIMIT_THRESHOLD_MS;
        const isLastAttempt = attempt === MAX_RETRIES;

        console.error(`Error answering question with keywords (attempt ${attempt + 1}/${MAX_RETRIES + 1}, ${duration}ms):`,
          error.response?.data || error.message);

        // If rate limited and we have retries left, wait and retry
        if (isRateLimit && !isLastAttempt) {
          console.log(`⏱️  Rate limit detected (${duration}ms response) - retrying in ${RETRY_DELAY_MS}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          continue; // Retry
        }

        // No more retries or different error type
        if (isRateLimit) {
          throw new Error('Rate limited - max retries exceeded');
        } else {
          throw new Error('Failed to answer question with keywords');
        }
      }
    }
  }

  /**
   * Analyze knowledge base content to detect document types and purpose
   * @param {string} knowledgeBase - Knowledge base content to analyze
   * @param {string} model - Model ID to use
   * @returns {Promise<Object>} Analysis with document types, use case, and confidence
   */
  async analyzeKnowledgeBase(knowledgeBase, model = null) {
    // Use model config system for operation-specific defaults
    const selectedModel = getModelForOperation('analyzeKnowledgeBase', model);
    const prompt = `You are an intelligent AI assistant designed for the "Know It All Wall" feature - a voice-driven Q&A system.

**Your Purpose:**
- Analyze knowledge base content to understand what documents are provided
- Detect document types (resume, job description, product docs, technical specs, etc.)
- Identify the most likely use case scenario
- Be self-aware: You exist to help users prepare for interviews, product demos, presentations, etc.

**Knowledge Base Content:**
${knowledgeBase}

**Task:**
Analyze this content and return your findings. Be specific about what you detected.

Return ONLY valid JSON in this exact format:
{
  "documentTypes": ["document_type_1", "document_type_2"],
  "primaryUseCase": "interview_prep" | "product_demo" | "technical_presentation" | "sales_pitch" | "general_qa",
  "detectedContext": "Brief description of what you found (2-3 sentences)",
  "confidence": 0.0-1.0,
  "suggestedFocus": ["focus_area_1", "focus_area_2", "focus_area_3"]
}

**Document Type Examples:**
- "resume" - Personal resume/CV
- "job_description" - Job posting or role description
- "product_docs" - Product documentation or specs
- "technical_specs" - Technical specifications or architecture
- "marketing_materials" - Marketing copy, pitch decks
- "company_info" - Company overview, about pages

**Use Case Examples:**
- "interview_prep" - Preparing for job interviews
- "product_demo" - Product demonstration or pitch
- "technical_presentation" - Technical deep-dive presentation
- "sales_pitch" - Sales presentation or proposal
- "general_qa" - General Q&A session`;

    try {
      const providerRouting = getProviderRouting(selectedModel);

      const requestBody = {
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        ...(providerRouting || {})
      };

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return parseAIResponse(content);
    } catch (error) {
      console.error('Error analyzing knowledge base:', error.response?.data || error.message);
      throw new Error('Failed to analyze knowledge base');
    }
  }

  /**
   * Generate contextual multiple choice questions based on detected document types
   * @param {Object} analysis - Analysis result from analyzeKnowledgeBase
   * @param {string} knowledgeBase - Knowledge base content
   * @param {string} model - Model ID to use
   * @returns {Promise<Object>} Questions with multiple choice options
   */
  async generateContextQuestions(analysis, knowledgeBase, model = null) {
    // Use model config system for operation-specific defaults
    const selectedModel = getModelForOperation('generateContextQuestions', model);
    const prompt = `You are an intelligent AI assistant for the "Know It All Wall" - a voice-driven Q&A system.

**Context Analysis:**
- Document Types: ${analysis.documentTypes.join(', ')}
- Primary Use Case: ${analysis.primaryUseCase}
- Detected Context: ${analysis.detectedContext}

**Knowledge Base:**
${knowledgeBase}

**Task:**
Generate 2-3 contextual multiple choice questions that will help you better understand how to assist the user.

**Requirements:**
- Questions should be specific to the detected use case and documents
- Each question should have 3-4 clear options
- Questions should help refine your understanding of user needs
- Focus on aspects that will improve answer quality

**Example for interview_prep:**
- "What type of interview are you preparing for?"
  Options: Technical deep-dive, Behavioral/leadership, System design, Executive presentation
- "Which aspects should I emphasize in my answers?"
  Options: Technical expertise, Leadership experience, Strategic thinking, Team collaboration

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear question text?",
      "options": [
        {"id": "a", "text": "Option A text"},
        {"id": "b", "text": "Option B text"},
        {"id": "c", "text": "Option C text"}
      ]
    },
    {
      "id": "q2",
      "question": "Another question?",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"}
      ]
    }
  ]
}`;

    try {
      const providerRouting = getProviderRouting(selectedModel);

      const requestBody = {
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        ...(providerRouting || {})
      };

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return parseAIResponse(content);
    } catch (error) {
      console.error('Error generating context questions:', error.response?.data || error.message);
      throw new Error('Failed to generate context questions');
    }
  }

  /**
   * Generate follow-up questions based on initial answers
   * @param {Object} analysis - Analysis result from analyzeKnowledgeBase
   * @param {Array} initialAnswers - Array of {questionId, selectedOptionId} from initial questions
   * @param {string} knowledgeBase - Knowledge base content
   * @param {string} model - Model ID to use
   * @returns {Promise<Object>} Follow-up questions (1-2) with options
   */
  async generateFollowupQuestions(analysis, initialAnswers, knowledgeBase, model = null) {
    // Use model config system for operation-specific defaults
    const selectedModel = getModelForOperation('generateFollowupQuestions', model);
    const prompt = `You are an intelligent AI assistant for the "Know It All Wall" - a voice-driven Q&A system.

**Context Analysis:**
- Document Types: ${analysis.documentTypes.join(', ')}
- Primary Use Case: ${analysis.primaryUseCase}
- Detected Context: ${analysis.detectedContext}

**User's Initial Answers:**
${JSON.stringify(initialAnswers, null, 2)}

**Knowledge Base:**
${knowledgeBase}

**Task:**
Based on the user's answers to the initial questions, generate 1-2 precision follow-up questions to further refine your understanding.

**Requirements:**
- Questions should build on the initial answers
- Help narrow down exactly how to tailor responses
- Each question should have 3-4 options
- Be specific and actionable

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "f1",
      "question": "Specific follow-up question based on their answers?",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"}
      ]
    }
  ]
}`;

    try {
      const providerRouting = getProviderRouting(selectedModel);

      const requestBody = {
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        ...(providerRouting || {})
      };

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return parseAIResponse(content);
    } catch (error) {
      console.error('Error generating followup questions:', error.response?.data || error.message);
      throw new Error('Failed to generate followup questions');
    }
  }

  /**
   * Generate concise titles for slides based on their content
   * Tries to extract titles from processed content first, then infers from content
   * @param {Array} sections - Array of section objects with content
   * @param {string} model - Model ID
   * @returns {Promise<Array>} Array of title strings
   */
  async generateSlideTitles(sections, model = 'openai/gpt-4o-mini') {
    const prompt = getPrompt('generateTitles', sections);

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = parseAIResponse(content);

      // Validate we got the right number of titles
      if (!Array.isArray(parsed) || parsed.length !== sections.length) {
        throw new Error(`Expected ${sections.length} titles, got ${parsed?.length || 0}`);
      }

      return parsed;
    } catch (error) {
      console.error('Error generating titles:', error.response?.data || error.message);
      throw new Error('Failed to generate slide titles');
    }
  }

  /**
   * Generate speaker notes (full speaking scripts) for slides
   * @param {Array} slides - Array of objects with {content: string, title: string}
   * @param {string} model - Model ID
   * @returns {Promise<Array>} Array of speaker notes strings
   */
  async generateSpeakerNotes(slides, model = 'openai/gpt-4o-mini') {
    // Build slides context
    const slidesContext = slides.map((slide, index) =>
      `Slide ${index + 1}: "${slide.title}"\n${slide.content}`
    ).join('\n\n');

    const prompt = `Generate speaker notes (full speaking scripts) for these ${slides.length} slides.

For EACH slide, write what the presenter will SAY word-for-word. This is their complete speaking script.

REQUIREMENTS:
- Include stories, personal anecdotes, specific examples with names/numbers
- Add statistics, data, or research NOT mentioned on the slide
- Make it natural and conversational, like talking to a friend
- 4-8 sentences that significantly expand on the slide content
- DO NOT write meta-instructions - write actual spoken words

Example:
Slide: "AI boosts productivity"
BAD: "Explain how AI improves productivity."
GOOD: "Here's what blew my mind - teams using AI saw 73% faster completion. Real work, not demos. Sarah's team finished a 3-week project in 5 days. How? AI handled grunt work. I tested this last month - cut report writing from 4 hours to 45 minutes."

SLIDES:
${slidesContext}

Return ONLY JSON (no markdown):
{
  "speakerNotes": [
    "Full script for slide 1...",
    "Full script for slide 2...",
    ...
  ]
}`;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verbadeck.app',
            'X-Title': 'VerbaDeck',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = parseAIResponse(content);

      // Return the speaker notes array
      return parsed.speakerNotes || [];
    } catch (error) {
      console.error('Error generating speaker notes:', error.response?.data || error.message);
      throw new Error('Failed to generate speaker notes');
    }
  }
}

export default OpenRouterClient;
