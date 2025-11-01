import axios from 'axios';

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

      // Try to extract JSON from the response
      let parsed;
      try {
        // First try direct parse
        parsed = JSON.parse(content);
      } catch (e) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          // Try to find JSON object in the text
          const objectMatch = content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      }

      return parsed;
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
3. Each section should be 2-4 sentences
4. Identify the most impactful final word as the primary trigger word for each section
5. Suggest 1-2 alternative trigger words per section
6. The presentation aspect ratio is ${aspectRatio} (${aspectRatio === '16:9' ? 'landscape/standard displays' : 'portrait/mobile displays'})

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "sections": [
    {
      "content": "Narration for this slide/image",
      "primaryTrigger": "word",
      "alternativeTriggers": ["word1", "word2"],
      "imageUrl": "data:image/..."
    }
  ]
}

Note: I'm providing ${images.length} images. Create exactly ${images.length} sections, one for each image in order.

Images are provided as base64 data URLs. Use your visual understanding to generate appropriate narration.`;

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

      // Try to extract JSON from the response
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          const objectMatch = content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      }

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
        systemPrompt: 'Enhance this presentation script by adding relevant details, smooth transitions, and professional language. Keep it concise but more polished. Maintain the core message.',
        temperature: 0.3,
      },
      {
        type: 'concise',
        label: 'Concise',
        description: 'Shorter, punchier version',
        systemPrompt: 'Rewrite this presentation script to be more concise and punchy. Remove unnecessary words while keeping the key message. Make it impactful and to the point.',
        temperature: 0.2,
      },
      {
        type: 'storytelling',
        label: 'Storytelling',
        description: 'Engaging narrative style',
        systemPrompt: 'Rewrite this presentation script in an engaging, storytelling style. Make it more narrative, relatable, and captivating while preserving the core information. Add emotional appeal.',
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
2. The answer should be 2-3 sentences, concise and clear
3. Use bullet points if the answer has multiple parts
4. Base answers on the presentation content provided

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "faqs": [
    {
      "question": "The question an audience member might ask",
      "answer": "A clear, concise answer based on the presentation content"
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

      // Try to extract JSON from the response
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          const objectMatch = content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      }

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
  async generateQuestions(topic, model = 'anthropic/claude-3.5-sonnet') {
    const prompt = `You are a presentation planning expert. A user wants to create a presentation about: "${topic}"

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
- Fill-in-blank should have helpful placeholder text`;

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

      // Try to extract JSON from the response
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          const objectMatch = content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      }

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

    const prompt = `You are a presentation designer. Create a ${numSlides}-slide presentation about: "${topic}"

User's requirements:
${answersContext}

For EACH slide position, generate 4 DIFFERENT content options. Each option should:
- Be 2-4 sentences of presentation narration
- Suggest a primary trigger word (the last impactful word)
- Suggest 1-2 alternative trigger words
- Offer a different approach/angle/style

The 4 options per slide should be diverse enough that the user has real choices.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "slides": [
    {
      "position": 1,
      "title": "Slide 1 title/topic",
      "options": [
        {
          "content": "First option narrative (2-4 sentences)",
          "primaryTrigger": "word",
          "alternativeTriggers": ["word1", "word2"],
          "style": "direct" or "storytelling" or "data-driven" or "provocative"
        },
        {
          "content": "Second option narrative (different from first)",
          "primaryTrigger": "word",
          "alternativeTriggers": ["word1", "word2"],
          "style": "direct" or "storytelling" or "data-driven" or "provocative"
        },
        {
          "content": "Third option narrative",
          "primaryTrigger": "word",
          "alternativeTriggers": ["word1", "word2"],
          "style": "direct" or "storytelling" or "data-driven" or "provocative"
        },
        {
          "content": "Fourth option narrative",
          "primaryTrigger": "word",
          "alternativeTriggers": ["word1", "word2"],
          "style": "direct" or "storytelling" or "data-driven" or "provocative"
        }
      ]
    }
  ]
}

IMPORTANT:
- Generate exactly ${numSlides} slides
- Each slide MUST have exactly 4 different options
- Options should be substantively different, not just minor rewording
- Content should flow logically from slide to slide`;

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

      // Try to extract JSON from the response
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          const objectMatch = content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      }

      return parsed.slides || [];
    } catch (error) {
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

      // Try to extract JSON from the response
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          const objectMatch = content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      }

      return parsed;
    } catch (error) {
      console.error('Error answering question:', error.response?.data || error.message);
      throw new Error('Failed to answer question');
    }
  }
}

export default OpenRouterClient;
