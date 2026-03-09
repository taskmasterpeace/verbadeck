/**
 * TimingLogger - Tracks AI model response times for performance analysis
 *
 * Logs timing data to JSONL files (one JSON object per line) with daily rotation.
 * Enables analysis of actual vs expected response times across models and operations.
 *
 * Privacy: Only logs metadata (timestamps, durations, model IDs). NO user content.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TimingLogger {
  constructor(logsDir = path.join(__dirname, '../logs/timing')) {
    this.logsDir = logsDir;
    this.currentDate = null;
    this.currentStream = null;

    // Ensure logs directory exists
    this.ensureLogDirectory();
  }

  /**
   * Ensure logs directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
      console.log(`📊 Created timing logs directory: ${this.logsDir}`);
    }
  }

  /**
   * Get today's log file path
   */
  getTodayLogPath() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logsDir, `timing-${today}.jsonl`);
  }

  /**
   * Get or create write stream for today's log file
   * Handles daily rotation automatically
   */
  getWriteStream() {
    const today = new Date().toISOString().split('T')[0];

    // Check if we need to rotate to a new file
    if (this.currentDate !== today) {
      if (this.currentStream) {
        this.currentStream.end();
      }

      this.currentDate = today;
      this.currentStream = fs.createWriteStream(this.getTodayLogPath(), {
        flags: 'a', // Append mode
        encoding: 'utf8'
      });

      console.log(`📊 Timing logger: Logging to ${this.getTodayLogPath()}`);
    }

    return this.currentStream;
  }

  /**
   * Log a timing entry
   * @param {Object} entry - Timing entry object
   * @param {string} entry.operation - Operation type (e.g., 'answerQuestion', 'processScript')
   * @param {string} entry.model - Model ID used
   * @param {number} entry.startTime - Request start timestamp (ms since epoch)
   * @param {number} entry.endTime - Request end timestamp (ms since epoch)
   * @param {number} entry.duration - Duration in milliseconds
   * @param {number} entry.expectedDuration - Expected duration from model config
   * @param {boolean} entry.success - Whether the request succeeded
   * @param {string} [entry.error] - Error message if failed
   * @param {Object} [entry.metadata] - Additional metadata (e.g., provider, tokens)
   */
  log(entry) {
    try {
      // Validate required fields
      if (!entry.operation || !entry.model || !entry.startTime || !entry.endTime) {
        console.warn('⚠️ Timing logger: Missing required fields in entry');
        return;
      }

      // Build timing entry
      const timingEntry = {
        timestamp: new Date(entry.startTime).toISOString(),
        operation: entry.operation,
        model: entry.model,
        duration: entry.duration,
        expectedDuration: entry.expectedDuration || null,
        variance: entry.expectedDuration
          ? ((entry.duration - entry.expectedDuration) / entry.expectedDuration * 100).toFixed(1) + '%'
          : null,
        success: entry.success,
        error: entry.error || null,
        metadata: entry.metadata || {}
      };

      // Write to JSONL file (one JSON object per line)
      const stream = this.getWriteStream();
      stream.write(JSON.stringify(timingEntry) + '\n');

      // Console log for visibility (only in development)
      if (process.env.NODE_ENV !== 'production') {
        const durationStr = `${entry.duration}ms`;
        const expectedStr = entry.expectedDuration ? ` (expected: ${entry.expectedDuration}ms)` : '';
        const statusStr = entry.success ? '✅' : '❌';
        console.log(`${statusStr} Timing: ${entry.operation} with ${entry.model}: ${durationStr}${expectedStr}`);
      }
    } catch (error) {
      console.error('❌ Timing logger error:', error.message);
    }
  }

  /**
   * Read all entries from a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Array<Object>} Array of timing entries
   */
  readEntriesForDate(date) {
    const logPath = path.join(this.logsDir, `timing-${date}.jsonl`);

    if (!fs.existsSync(logPath)) {
      return [];
    }

    const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(line => line.trim());
    return lines.map(line => JSON.parse(line));
  }

  /**
   * Read all entries from all log files
   * @returns {Array<Object>} Array of all timing entries
   */
  readAllEntries() {
    const files = fs.readdirSync(this.logsDir)
      .filter(file => file.startsWith('timing-') && file.endsWith('.jsonl'))
      .sort(); // Sort chronologically

    const allEntries = [];
    for (const file of files) {
      const logPath = path.join(this.logsDir, file);
      const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(line => line.trim());
      const entries = lines.map(line => JSON.parse(line));
      allEntries.push(...entries);
    }

    return allEntries;
  }

  /**
   * Get statistics for a specific operation and model
   * @param {string} operation - Operation type
   * @param {string} model - Model ID
   * @returns {Object} Statistics object with avg, min, max, count
   */
  getStats(operation, model) {
    const entries = this.readAllEntries()
      .filter(e => e.operation === operation && e.model === model && e.success);

    if (entries.length === 0) {
      return null;
    }

    const durations = entries.map(e => e.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      operation,
      model,
      count: entries.length,
      avgDuration: Math.round(avg),
      minDuration: min,
      maxDuration: max,
      expectedDuration: entries[0].expectedDuration
    };
  }

  /**
   * Archive old log files (older than N days)
   * @param {number} days - Number of days to keep (default: 30)
   */
  archiveOldLogs(days = 30) {
    const archiveDir = path.join(this.logsDir, 'archive');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const files = fs.readdirSync(this.logsDir)
      .filter(file => file.startsWith('timing-') && file.endsWith('.jsonl'));

    let archivedCount = 0;
    for (const file of files) {
      // Extract date from filename: timing-YYYY-MM-DD.jsonl
      const dateMatch = file.match(/timing-(\d{4}-\d{2}-\d{2})\.jsonl/);
      if (dateMatch) {
        const fileDate = new Date(dateMatch[1]);
        if (fileDate < cutoffDate) {
          const sourcePath = path.join(this.logsDir, file);
          const destPath = path.join(archiveDir, file);
          fs.renameSync(sourcePath, destPath);
          archivedCount++;
        }
      }
    }

    if (archivedCount > 0) {
      console.log(`📊 Archived ${archivedCount} old timing log file(s)`);
    }
  }

  /**
   * Close the logger and flush any pending writes
   */
  close() {
    if (this.currentStream) {
      this.currentStream.end();
      this.currentStream = null;
    }
  }
}

// Singleton instance
let loggerInstance = null;

/**
 * Get the singleton TimingLogger instance
 */
export function getTimingLogger() {
  if (!loggerInstance) {
    loggerInstance = new TimingLogger();
  }
  return loggerInstance;
}
