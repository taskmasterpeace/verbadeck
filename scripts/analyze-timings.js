/**
 * Timing Analysis Script
 *
 * Analyzes timing logs to generate recommendations for expectedResponseTime values.
 * Run this script periodically to update model configuration based on real-world data.
 *
 * Usage:
 *   node scripts/analyze-timings.js
 *   node scripts/analyze-timings.js --operation answerQuestion
 *   node scripts/analyze-timings.js --model meta-llama/llama-3.1-8b-instruct
 *   node scripts/analyze-timings.js --days 7  (only last 7 days)
 */

import { getTimingLogger } from '../server/timing-logger.js';
import { RECOMMENDED_MODELS } from '../client/src/lib/openrouter-models.ts';
import { MODEL_DEFAULTS } from '../server/model-config.js';

// Parse command line arguments
const args = process.argv.slice(2);
const operationFilter = args.find(arg => arg.startsWith('--operation='))?.split('=')[1];
const modelFilter = args.find(arg => arg.startsWith('--model='))?.split('=')[1];
const daysFilter = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1] || '30');

console.log('📊 VerbaDeck Timing Analysis\n');
console.log(`Analyzing logs from the last ${daysFilter} days...`);
if (operationFilter) console.log(`Filtering by operation: ${operationFilter}`);
if (modelFilter) console.log(`Filtering by model: ${modelFilter}`);
console.log('');

// Get timing logger instance
const logger = getTimingLogger();

// Read all timing entries
const allEntries = logger.readAllEntries();

if (allEntries.length === 0) {
  console.log('⚠️  No timing data found. Use the application to generate some timing logs first.');
  process.exit(0);
}

// Filter by date range
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - daysFilter);

const entries = allEntries.filter(entry => {
  const entryDate = new Date(entry.timestamp);
  return entryDate >= cutoffDate;
});

console.log(`📈 Found ${entries.length} timing entries (total: ${allEntries.length})\n`);

// Group entries by operation and model
const grouped = {};
for (const entry of entries) {
  if (operationFilter && entry.operation !== operationFilter) continue;
  if (modelFilter && entry.model !== modelFilter) continue;

  const key = `${entry.operation}::${entry.model}`;
  if (!grouped[key]) {
    grouped[key] = {
      operation: entry.operation,
      model: entry.model,
      durations: [],
      expectedDuration: entry.expectedDuration,
      successCount: 0,
      errorCount: 0
    };
  }

  if (entry.success) {
    grouped[key].durations.push(entry.duration);
    grouped[key].successCount++;
  } else {
    grouped[key].errorCount++;
  }
}

// Calculate statistics for each group
const stats = [];
for (const key in grouped) {
  const group = grouped[key];
  if (group.durations.length === 0) continue;

  const sorted = [...group.durations].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  stats.push({
    operation: group.operation,
    model: group.model,
    count: group.durations.length,
    successRate: (group.successCount / (group.successCount + group.errorCount) * 100).toFixed(1),
    avgDuration: Math.round(avg),
    medianDuration: median,
    p95Duration: p95,
    minDuration: min,
    maxDuration: max,
    expectedDuration: group.expectedDuration,
    variance: group.expectedDuration ? ((avg - group.expectedDuration) / group.expectedDuration * 100).toFixed(1) : null
  });
}

// Sort by operation and then by average duration
stats.sort((a, b) => {
  if (a.operation !== b.operation) {
    return a.operation.localeCompare(b.operation);
  }
  return a.avgDuration - b.avgDuration;
});

// Print results
console.log('═══════════════════════════════════════════════════════════════════════════\n');
console.log('📊 TIMING STATISTICS\n');

let currentOperation = null;
for (const stat of stats) {
  if (stat.operation !== currentOperation) {
    if (currentOperation !== null) console.log(''); // Blank line between operations
    console.log(`\n🔸 Operation: ${stat.operation}`);
    console.log('─'.repeat(75));
    currentOperation = stat.operation;
  }

  const modelName = stat.model.split('/').pop();
  console.log(`\nModel: ${stat.model}`);
  console.log(`  Requests:       ${stat.count} (${stat.successRate}% success rate)`);
  console.log(`  Average:        ${stat.avgDuration}ms`);
  console.log(`  Median:         ${stat.medianDuration}ms`);
  console.log(`  95th %ile:      ${stat.p95Duration}ms`);
  console.log(`  Min/Max:        ${stat.minDuration}ms / ${stat.maxDuration}ms`);

  if (stat.expectedDuration) {
    const varianceStr = parseFloat(stat.variance) > 0 ? `+${stat.variance}%` : `${stat.variance}%`;
    const varianceIcon = Math.abs(parseFloat(stat.variance)) > 20 ? '⚠️ ' : '';
    console.log(`  Expected:       ${stat.expectedDuration}ms (variance: ${varianceIcon}${varianceStr})`);
  }

  // Recommendation: Use P95 as expected duration (more realistic for user-facing timers)
  if (stat.count >= 5) {
    const recommendation = stat.p95Duration;
    const change = stat.expectedDuration ? recommendation - stat.expectedDuration : null;
    if (change !== null && Math.abs(change) > stat.expectedDuration * 0.2) {
      console.log(`  💡 Recommend:   ${recommendation}ms (change: ${change > 0 ? '+' : ''}${change}ms)`);
    }
  } else {
    console.log(`  ⚠️  Low sample size (${stat.count}) - collect more data for reliable recommendations`);
  }
}

console.log('\n═══════════════════════════════════════════════════════════════════════════\n');

// Generate update recommendations for openrouter-models.ts
console.log('📝 RECOMMENDED UPDATES FOR openrouter-models.ts\n');

// Group recommendations by model
const modelRecommendations = {};
for (const stat of stats) {
  if (stat.count < 5) continue; // Skip low sample sizes

  if (!modelRecommendations[stat.model]) {
    modelRecommendations[stat.model] = {
      operations: [],
      avgP95: 0,
      count: 0
    };
  }

  modelRecommendations[stat.model].operations.push({
    operation: stat.operation,
    p95: stat.p95Duration,
    expected: stat.expectedDuration
  });
  modelRecommendations[stat.model].avgP95 += stat.p95Duration;
  modelRecommendations[stat.model].count++;
}

// Calculate average P95 for each model
for (const model in modelRecommendations) {
  const rec = modelRecommendations[model];
  rec.avgP95 = Math.round(rec.avgP95 / rec.count);
}

// Print recommendations
let hasRecommendations = false;
for (const model in modelRecommendations) {
  const rec = modelRecommendations[model];
  const modelConfig = RECOMMENDED_MODELS.find(m => m.id === model);

  if (!modelConfig) continue;

  const currentExpected = modelConfig.expectedResponseTime;
  const recommended = rec.avgP95;
  const change = recommended - currentExpected;

  // Only show if change is significant (> 20%)
  if (Math.abs(change) > currentExpected * 0.2) {
    hasRecommendations = true;
    console.log(`Model: ${model}`);
    console.log(`  Current expectedResponseTime: ${currentExpected}ms`);
    console.log(`  Recommended (avg P95):        ${recommended}ms`);
    console.log(`  Change:                       ${change > 0 ? '+' : ''}${change}ms (${(change / currentExpected * 100).toFixed(1)}%)`);
    console.log('');
  }
}

if (!hasRecommendations) {
  console.log('✅ No significant changes recommended. Current expectedResponseTime values are accurate.\n');
}

console.log('═══════════════════════════════════════════════════════════════════════════\n');

// Usage summary
console.log('📈 USAGE SUMMARY\n');
const operationCounts = {};
const modelCounts = {};

for (const entry of entries) {
  operationCounts[entry.operation] = (operationCounts[entry.operation] || 0) + 1;
  modelCounts[entry.model] = (modelCounts[entry.model] || 0) + 1;
}

console.log('Most used operations:');
const topOps = Object.entries(operationCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
for (const [op, count] of topOps) {
  console.log(`  ${op}: ${count} requests`);
}

console.log('\nMost used models:');
const topModels = Object.entries(modelCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
for (const [model, count] of topModels) {
  const modelName = model.split('/').pop();
  console.log(`  ${modelName}: ${count} requests`);
}

console.log('\n═══════════════════════════════════════════════════════════════════════════\n');
console.log('💡 TIP: Run this script after making changes to see updated recommendations.\n');
