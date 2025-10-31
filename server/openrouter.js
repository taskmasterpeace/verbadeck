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
   * @returns {Promise<Object>} Structured sections with triggers
   */
  async processScript(text, model = 'anthropic/claude-3.5-sonnet') {
    const prompt = `You are a presentation script formatter. Convert the following raw text into well-structured presentation sections.

For each section:
1. Clean up formatting and make it concise (2-4 sentences per section)
2. Identify the most impactful final word as the primary trigger word
3. Suggest 1-2 alternative trigger words that could also work
4. Create 5-10 sections total (fewer if the text is short)

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "sections": [
    {
      "content": "The actual text of the section",
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
}

export default OpenRouterClient;
