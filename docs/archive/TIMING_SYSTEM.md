# VerbaDeck Timing System

## Overview

The timing system tracks actual AI model response times in production, enabling data-driven optimization of the `expectedResponseTime` values used for Q&A visual timers and performance monitoring.

## Architecture

### Components

1. **TimingLogger** (`server/timing-logger.js`)
   - Core logging class with JSONL file storage
   - Daily log rotation with automatic archiving
   - Privacy-safe: Only logs metadata (no user content)

2. **Timing Middleware** (`server/middleware/timing-middleware.js`)
   - Express middleware that wraps API endpoints
   - High-resolution timing (<5ms overhead)
   - Automatic error handling

3. **Analysis Script** (`scripts/analyze-timings.js`)
   - Generates statistics and recommendations
   - Calculates P95 response times for realistic expectations
   - Identifies models that need expectedResponseTime updates

## How It Works

### Automatic Timing Capture

Every AI operation is automatically timed:

```javascript
// Example: Answer Question endpoint
app.post('/api/answer-question',
  createTimingMiddleware('answerQuestion'),  // 👈 Timing middleware
  async (req, res) => {
    // ... your endpoint logic ...
  }
);
```

When a request comes in:
1. Middleware captures start time (high-resolution)
2. Request processes normally
3. Middleware captures end time when response is sent
4. Timing entry is written to JSONL log file

### Log Format

Logs are stored in `logs/timing/timing-YYYY-MM-DD.jsonl` (one JSON object per line):

```json
{
  "timestamp": "2025-11-05T12:34:56.789Z",
  "operation": "answerQuestion",
  "model": "meta-llama/llama-3.1-8b-instruct",
  "duration": 438,
  "expectedDuration": 440,
  "variance": "-0.5%",
  "success": true,
  "error": null,
  "metadata": {
    "statusCode": 200
  }
}
```

### Daily Rotation

- New log file created each day automatically
- Old logs (>30 days) archived to `logs/timing/archive/`
- No manual file management needed

## Using the Analysis Script

### Basic Analysis

```bash
# Analyze all timing data
node scripts/analyze-timings.js
```

Output includes:
- Statistics per operation and model (avg, median, P95, min, max)
- Variance from expected response times
- Recommendations for updating expectedResponseTime values
- Usage summary (most used operations and models)

### Filtered Analysis

```bash
# Only analyze answerQuestion operation
node scripts/analyze-timings.js --operation=answerQuestion

# Only analyze a specific model
node scripts/analyze-timings.js --model=meta-llama/llama-3.1-8b-instruct

# Only last 7 days
node scripts/analyze-timings.js --days=7

# Combine filters
node scripts/analyze-timings.js --operation=answerQuestion --days=7
```

## Understanding the Recommendations

### Example Output

```
📊 TIMING STATISTICS

🔸 Operation: answerQuestion
───────────────────────────────────────────────────────────────────

Model: meta-llama/llama-3.1-8b-instruct
  Requests:       50 (100.0% success rate)
  Average:        438ms
  Median:         425ms
  95th %ile:      520ms
  Min/Max:        380ms / 650ms
  Expected:       440ms (variance: -0.5%)
  💡 Recommend:   520ms (change: +80ms)
```

**Why P95?** The 95th percentile is more realistic for user-facing timers than average:
- Covers 95% of actual requests
- Accounts for network variability
- Prevents timer from finishing too early

### When to Update

Update `expectedResponseTime` in [openrouter-models.ts](client/src/lib/openrouter-models.ts#L38) when:

1. **Variance > 20%**: Actual times differ significantly from expected
2. **High sample size**: At least 10-20 requests for reliable data
3. **Consistent pattern**: Similar results across multiple days

## Example Workflow

### Week 1: Initial Setup
```bash
# Use VerbaDeck normally - timing logs are collected automatically
# (No action needed, just use the app)
```

### Week 2: First Analysis
```bash
node scripts/analyze-timings.js

# Output shows:
# - Llama 3.1 8B: Avg 438ms, P95 520ms (expected: 440ms)
# - Llama 3.3 70B: Avg 920ms, P95 1100ms (expected: 920ms)
```

**Recommendation**: Update Llama 3.1 8B expectedResponseTime from 440ms to 520ms

### Month 1: Regular Monitoring
```bash
# Run weekly analysis
node scripts/analyze-timings.js --days=7

# Check for changes:
# - New models performing differently?
# - Seasonal variations (time of day, day of week)?
# - Provider routing issues?
```

## Performance Impact

- **Overhead**: <5ms per request (negligible)
- **Storage**: ~100 bytes per log entry
- **Daily logs**: ~1MB for 10,000 requests (typical usage: <100KB/day)

## Privacy & Security

✅ **What's logged:**
- Timestamps, durations, model IDs
- Success/error status
- HTTP status codes

❌ **What's NOT logged:**
- User questions or answers
- Presentation content
- API keys or tokens
- Any personally identifiable information

## Troubleshooting

### No timing data collected

**Check:**
1. Server is running with timing middleware integrated
2. Logs directory exists: `logs/timing/`
3. File permissions allow writing

**Fix:**
```bash
# Ensure directory exists
mkdir -p logs/timing

# Check logs
ls -la logs/timing/

# View today's log
cat logs/timing/timing-$(date +%Y-%m-%d).jsonl
```

### Analysis script shows "No timing data"

**Reason:** No log files exist yet

**Fix:** Use VerbaDeck to perform some AI operations (Q&A, script processing, etc.)

### High variance warnings (⚠️)

**Reason:** Actual times differ significantly from expected (>20% variance)

**Action:**
1. Verify sample size is sufficient (>10 requests)
2. Check if the variance is consistent across days
3. Update expectedResponseTime in [openrouter-models.ts](client/src/lib/openrouter-models.ts)

## Integration Points

### Adding Timing to New Endpoints

```javascript
import { createTimingMiddleware } from './middleware/timing-middleware.js';

app.post('/api/new-operation',
  createTimingMiddleware('newOperation'),
  async (req, res) => {
    // ... your logic ...
  }
);
```

### Reading Logs Programmatically

```javascript
import { getTimingLogger } from './server/timing-logger.js';

const logger = getTimingLogger();

// Get all entries
const allEntries = logger.readAllEntries();

// Get today's entries
const today = new Date().toISOString().split('T')[0];
const todayEntries = logger.readEntriesForDate(today);

// Get stats for specific operation + model
const stats = logger.getStats('answerQuestion', 'meta-llama/llama-3.1-8b-instruct');
console.log(stats);
// {
//   operation: 'answerQuestion',
//   model: 'meta-llama/llama-3.1-8b-instruct',
//   count: 50,
//   avgDuration: 438,
//   minDuration: 380,
//   maxDuration: 650,
//   expectedDuration: 440
// }
```

## Future Enhancements

Potential additions to the timing system:

1. **Web Dashboard**: Real-time timing visualization in UI
2. **Alerting**: Notify when models exceed thresholds
3. **Token Tracking**: Log input/output tokens for cost analysis
4. **Provider Comparison**: Compare same model across providers
5. **Export**: CSV/JSON export for external analysis

## Related Files

- [server/timing-logger.js](server/timing-logger.js) - Core logger class
- [server/middleware/timing-middleware.js](server/middleware/timing-middleware.js) - Express middleware
- [server/server.js](server/server.js) - Middleware integration
- [scripts/analyze-timings.js](scripts/analyze-timings.js) - Analysis script
- [client/src/lib/openrouter-models.ts](client/src/lib/openrouter-models.ts) - Model config with expectedResponseTime
