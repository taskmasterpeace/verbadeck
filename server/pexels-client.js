/**
 * Pexels API Client
 *
 * Alternative to Unsplash - INSTANT approval (no waiting!)
 * Free tier: 200 requests/hour
 *
 * Documentation: https://www.pexels.com/api/documentation/
 */

// Node.js 18+ has built-in fetch, no import needed

export class PexelsClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Pexels API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = 'https://api.pexels.com/v1';
  }

  /**
   * Search for photos by query
   * @param {string} query - Search term
   * @param {number} perPage - Number of results (max 80)
   * @param {string} orientation - 'landscape', 'portrait', or 'square'
   * @returns {Promise<Array>} Array of photo objects
   */
  async searchPhotos(query, perPage = 4, orientation = 'landscape') {
    const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=${orientation}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Transform to VerbaDeck format (matching Unsplash structure)
      return data.photos.map(photo => ({
        id: photo.id.toString(),
        url: photo.src.large2x, // 1920px wide
        thumbnail: photo.src.medium, // 350px wide
        fullSize: photo.src.original,
        description: photo.alt || 'Pexels Photo',
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        downloadUrl: photo.url, // Pexels page URL
        width: photo.width,
        height: photo.height,
        // Quality indicators
        quality: this._calculateQuality(photo.width, photo.height),
        resolution: `${photo.width}x${photo.height}`,
        isHighRes: photo.width >= 2000 && photo.height >= 1500,
        color: photo.avg_color || '#000000',
        likes: 0, // Pexels doesn't provide likes
        source: 'pexels' // Identify source
      }));
    } catch (error) {
      console.error('Error searching Pexels photos:', error);
      throw error;
    }
  }

  /**
   * Calculate quality score based on resolution
   * @private
   */
  _calculateQuality(width, height) {
    const pixels = width * height;

    if (pixels >= 6000000) return 'excellent'; // 6MP+
    if (pixels >= 3000000) return 'high'; // 3-6MP
    if (pixels >= 1500000) return 'medium'; // 1.5-3MP
    return 'low'; // < 1.5MP
  }
}
