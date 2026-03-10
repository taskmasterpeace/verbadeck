/**
 * Centralized API client for making requests to the VerbaDeck server
 * Provides consistent error handling and response parsing
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Make a POST request to the API
 * @param endpoint - API endpoint (e.g., '/api/process-script')
 * @param body - Request body (will be JSON.stringified)
 * @returns Parsed JSON response
 * @throws APIError if request fails
 */
export async function apiPost<T = any>(endpoint: string, body: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        throw new APIError(errorMessage, response.status, errorData);
      } catch (parseError) {
        // If parsing fails, throw with status text
        throw new APIError(errorMessage, response.status);
      }
    }

    return await response.json();
  } catch (error) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error;
    }

    // Wrap network errors
    if (error instanceof TypeError) {
      throw new APIError(`Network error: ${error.message}`);
    }

    // Wrap any other errors
    throw new APIError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Make a GET request to the API
 * @param endpoint - API endpoint (e.g., '/api/models')
 * @returns Parsed JSON response
 * @throws APIError if request fails
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        throw new APIError(errorMessage, response.status, errorData);
      } catch (parseError) {
        throw new APIError(errorMessage, response.status);
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new APIError(`Network error: ${error.message}`);
    }

    throw new APIError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Helper to check if an error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}
