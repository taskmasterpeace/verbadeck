import Replicate from 'replicate';
import axios from 'axios';

/**
 * Replicate Image Generator Client
 * Uses google/nano-banana model for image generation and editing
 */
export class ReplicateImageGenerator {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Replicate API key is required');
    }
    this.replicate = new Replicate({ auth: apiKey });
    this.model = 'google/nano-banana';
  }

  /**
   * Generate or edit an image using Replicate's google/nano-banana model
   * @param {string} prompt - Text description of the desired image
   * @param {Object} options - Generation options
   * @param {string} options.aspectRatio - Aspect ratio (1:1, 16:9, 9:16, etc.)
   * @param {string} options.imageInput - Base64 or URL of existing image to edit
   * @param {string} options.outputFormat - Output format (png or jpg)
   * @returns {Promise<string>} Base64 encoded image data URL
   */
  async generateImage(prompt, options = {}) {
    const {
      aspectRatio = '16:9',
      imageInput = null,
      outputFormat = 'png'
    } = options;

    console.log(`🎨 ${imageInput ? 'Editing' : 'Generating'} image with prompt:`, prompt);
    console.log(`📐 Aspect ratio: ${aspectRatio}, Format: ${outputFormat}`);

    try {
      // Prepare input for Replicate
      const input = {
        prompt: prompt,
        aspect_ratio: aspectRatio,
        output_format: outputFormat
      };

      // If editing existing image, include it
      if (imageInput) {
        console.log('🖼️  Using existing image as reference for editing');

        // If it's a base64 data URL, we need to upload it first
        if (imageInput.startsWith('data:')) {
          // For now, just pass it directly - Replicate will handle it
          // In production, you might want to upload to a temporary URL
          input.image_input = [imageInput];
        } else {
          // It's already a URL
          input.image_input = [imageInput];
        }
      }

      // Run the model
      const output = await this.replicate.run(this.model, { input });

      console.log('✅ Image generated successfully');

      // Output is a URL - we need to download it and convert to base64
      const imageUrl = Array.isArray(output) ? output[0] : output;
      const base64Image = await this.urlToBase64(imageUrl, outputFormat);

      return base64Image;
    } catch (error) {
      console.error('❌ Error generating image:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * Convert image URL to base64 data URL
   * @param {string} url - Image URL
   * @param {string} format - Image format (png or jpg)
   * @returns {Promise<string>} Base64 data URL
   */
  async urlToBase64(url, format = 'png') {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });

      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error converting URL to base64:', error.message);
      throw new Error('Failed to download generated image');
    }
  }

  /**
   * Get list of supported aspect ratios
   * @returns {Array<Object>} Array of aspect ratio options
   */
  static getSupportedAspectRatios() {
    return [
      { value: '1:1', label: '1:1 Square', description: 'Perfect square' },
      { value: '16:9', label: '16:9 Widescreen', description: 'Standard presentation' },
      { value: '9:16', label: '9:16 Portrait', description: 'Mobile/vertical' },
      { value: '4:3', label: '4:3 Traditional', description: 'Classic display' },
      { value: '3:4', label: '3:4 Portrait', description: 'Vertical traditional' },
      { value: '21:9', label: '21:9 Ultrawide', description: 'Cinema format' },
      { value: '2:3', label: '2:3 Photo', description: 'Photo portrait' },
      { value: '3:2', label: '3:2 Photo', description: 'Photo landscape' },
      { value: '4:5', label: '4:5 Portrait', description: 'Social media' },
      { value: '5:4', label: '5:4 Landscape', description: 'Social media' },
      { value: 'match_input_image', label: 'Match Input', description: 'Keep original ratio' }
    ];
  }

  /**
   * Get list of supported output formats
   * @returns {Array<Object>} Array of format options
   */
  static getSupportedFormats() {
    return [
      { value: 'png', label: 'PNG', description: 'Lossless, transparency support' },
      { value: 'jpg', label: 'JPG', description: 'Smaller file size' }
    ];
  }
}

export default ReplicateImageGenerator;
