/**
 * Unsplash API Client
 *
 * Provides image search and download functionality using the Unsplash API.
 * Free tier: 50 requests/hour
 *
 * Documentation: https://unsplash.com/documentation
 */

// Node.js 18+ has built-in fetch, no import needed

export class UnsplashClient {
  constructor(accessKey) {
    if (!accessKey) {
      throw new Error('Unsplash access key is required');
    }

    this.accessKey = accessKey;
    this.baseUrl = 'https://api.unsplash.com';
  }

  /**
   * Search for photos by query
   * @param {string} query - Search term
   * @param {number} perPage - Number of results (max 30)
   * @param {string} orientation - 'landscape', 'portrait', or 'squarish'
   * @returns {Promise<Array>} Array of photo objects
   */
  async searchPhotos(query, perPage = 4, orientation = 'landscape') {
    const url = `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=${orientation}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1'
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Transform to simplified format with quality indicators
      return data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular, // 1080px on longest side
        thumbnail: photo.urls.small, // 400px on longest side
        fullSize: photo.urls.full, // Full resolution
        description: photo.alt_description || photo.description || 'Untitled',
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        downloadUrl: photo.links.download_location,
        width: photo.width,
        height: photo.height,
        // Quality indicators
        quality: this._calculateQuality(photo.width, photo.height),
        resolution: `${photo.width}x${photo.height}`,
        isHighRes: photo.width >= 2000 && photo.height >= 1500,
        color: photo.color, // Dominant color (hex)
        likes: photo.likes
      }));
    } catch (error) {
      console.error('Error searching Unsplash photos:', error);
      throw error;
    }
  }

  /**
   * Trigger download tracking (required by Unsplash API guidelines)
   * Must be called when user downloads/uses an image
   * @param {string} downloadUrl - Download location URL from photo object
   */
  async triggerDownload(downloadUrl) {
    try {
      await fetch(downloadUrl, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`
        }
      });
      console.log('✅ Unsplash download tracked');
    } catch (error) {
      console.error('Error tracking Unsplash download:', error);
      // Non-blocking - don't throw error
    }
  }

  /**
   * Calculate quality score based on resolution
   * @private
   */
  _calculateQuality(width, height) {
    const pixels = width * height;

    if (pixels >= 6000000) return 'excellent'; // 6MP+ (e.g., 3000x2000)
    if (pixels >= 3000000) return 'high'; // 3-6MP (e.g., 2000x1500)
    if (pixels >= 1500000) return 'medium'; // 1.5-3MP (e.g., 1500x1000)
    return 'low'; // < 1.5MP
  }

  /**
   * Get quality indicator emoji
   */
  static getQualityEmoji(quality) {
    switch (quality) {
      case 'excellent': return '⭐⭐⭐';
      case 'high': return '⭐⭐';
      case 'medium': return '⭐';
      case 'low': return '⚠️';
      default: return '';
    }
  }
}
