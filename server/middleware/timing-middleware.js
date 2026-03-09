/**
 * Timing Middleware - Captures AI model response times
 *
 * Wraps API endpoints to log timing data for performance analysis.
 * Minimal overhead (<5ms) using high-resolution timers.
 */

import { getTimingLogger } from '../timing-logger.js';

/**
 * Create timing middleware for a specific operation
 * @param {string} operationName - Name of the operation (e.g., 'answerQuestion')
 * @returns {Function} Express middleware function
 */
export function createTimingMiddleware(operationName) {
  return (req, res, next) => {
    // Capture start time with high-resolution timer
    const startTime = Date.now();
    const startHrTime = process.hrtime.bigint();

    // Store timing data on request object
    req.timingData = {
      operation: operationName,
      startTime,
      startHrTime
    };

    // Intercept response to capture end time
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      // Capture end time
      const endTime = Date.now();
      const endHrTime = process.hrtime.bigint();
      const duration = Number(endHrTime - req.timingData.startHrTime) / 1_000_000; // Convert nanoseconds to milliseconds

      // Extract model from request or response
      const model = req.body?.model || body?.model || 'unknown';
      const expectedDuration = req.body?.expectedResponseTime || null;

      // Log timing entry
      const logger = getTimingLogger();
      logger.log({
        operation: operationName,
        model,
        startTime,
        endTime,
        duration: Math.round(duration),
        expectedDuration,
        success: !body.error,
        error: body.error ? body.error.message || body.error : null,
        metadata: {
          statusCode: res.statusCode,
          // Add any additional metadata from response if available
          ...body.metadata
        }
      });

      // Call original json method
      return originalJson(body);
    };

    next();
  };
}

/**
 * Generic timing middleware that extracts operation from route path
 * Useful for auto-detecting operation from endpoint URL
 */
export function autoTimingMiddleware(req, res, next) {
  // Extract operation from path: /api/answer-question -> answerQuestion
  const pathMatch = req.path.match(/\/api\/([a-z-]+)/);
  if (pathMatch) {
    const operationName = pathMatch[1]
      .split('-')
      .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    // Use the specific timing middleware
    return createTimingMiddleware(operationName)(req, res, next);
  }

  next();
}

/**
 * Error handling middleware for timing (catches errors before response)
 */
export function timingErrorMiddleware(err, req, res, next) {
  if (req.timingData) {
    const endTime = Date.now();
    const endHrTime = process.hrtime.bigint();
    const duration = Number(endHrTime - req.timingData.startHrTime) / 1_000_000;

    const logger = getTimingLogger();
    logger.log({
      operation: req.timingData.operation,
      model: req.body?.model || 'unknown',
      startTime: req.timingData.startTime,
      endTime,
      duration: Math.round(duration),
      expectedDuration: req.body?.expectedResponseTime || null,
      success: false,
      error: err.message,
      metadata: {
        statusCode: err.statusCode || 500
      }
    });
  }

  next(err);
}
