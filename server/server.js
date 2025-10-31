import express from 'express';
import { WebSocketServer } from 'ws';
import { WebSocket as WS } from 'ws';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import cors from 'cors';
import { OpenRouterClient } from './openrouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: resolve(__dirname, '../.env') });

const AAI_API_KEY = process.env.AAI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PORT = process.env.PORT || 3001;

if (!AAI_API_KEY) {
  console.error('ERROR: AAI_API_KEY not found in .env file');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('ERROR: OPENROUTER_API_KEY not found in .env file');
  process.exit(1);
}

// Initialize OpenRouter client
const openRouterClient = new OpenRouterClient(OPENROUTER_API_KEY);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for large scripts

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OpenRouter API endpoints
app.get('/api/models', async (req, res) => {
  try {
    const models = await openRouterClient.getModels();
    res.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/process-script', async (req, res) => {
  try {
    const { text, model } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text too long (max 50,000 characters)' });
    }

    console.log(`📝 Processing script with model: ${model || 'default'}`);
    const result = await openRouterClient.processScript(text, model);
    console.log(`✅ Processed ${result.sections?.length || 0} sections`);

    res.json(result);
  } catch (error) {
    console.error('Error processing script:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/suggest-triggers', async (req, res) => {
  try {
    const { text, model } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`💡 Suggesting triggers for section`);
    const triggers = await openRouterClient.suggestTriggers(text, model);
    console.log(`✅ Suggested ${triggers.length} triggers`);

    res.json({ triggers });
  } catch (error) {
    console.error('Error suggesting triggers:', error);
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`\n🎤 VerbaDeck Server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`API endpoints: http://localhost:${PORT}/api/*`);
  console.log(`🤖 OpenRouter AI enabled\n`);
});

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', async (req, socket, head) => {
  if (req.url !== '/ws') {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (clientWs) => {
    console.log('✅ Client connected');

    // Build AssemblyAI v3 WebSocket URL with parameters
    const aaiParams = new URLSearchParams({
      sample_rate: '16000',
      encoding: 'pcm_s16le',
      format_turns: 'true',
      // Enable word-level timestamps and confidence for better trigger detection
      word_boost: '["majin", "twin", "pause", "moments", "opportunity", "traction"]'
    });

    const aaiUrl = `wss://streaming.assemblyai.com/v3/ws?${aaiParams}`;

    console.log('🔗 Connecting to AssemblyAI Universal-Streaming v3...');

    const aaiWs = new WS(aaiUrl, {
      headers: {
        'Authorization': AAI_API_KEY
      }
    });

    // Track connection state
    let isConnected = false;

    aaiWs.on('open', () => {
      console.log('✅ Connected to AssemblyAI');
      isConnected = true;
      clientWs.send(JSON.stringify({
        type: 'status',
        message: 'Connected to AssemblyAI',
        ready: true
      }));
    });

    aaiWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Forward all messages to client
        clientWs.send(data.toString());
      } catch (error) {
        console.error('Error parsing AAI message:', error);
        console.error('Raw data:', data.toString());
      }
    });

    // Client sends raw binary PCM16 audio to AssemblyAI
    clientWs.on('message', (msg, isBinary) => {
      if (!isConnected) {
        console.warn('⚠️  Audio received but not connected to AAI yet');
        return;
      }

      if (isBinary) {
        // Forward binary audio directly to AssemblyAI
        aaiWs.send(msg);
      } else {
        // Handle control messages (if any)
        try {
          const data = JSON.parse(msg.toString());
          if (data.type === 'ping') {
            clientWs.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // Not JSON, ignore
        }
      }
    });

    const cleanup = () => {
      console.log('🔌 Client disconnected');
      try { aaiWs.close(); } catch {}
      try { clientWs.close(); } catch {}
    };

    aaiWs.on('close', (code, reason) => {
      console.log(`AssemblyAI connection closed: ${code} ${reason}`);
      cleanup();
    });

    aaiWs.on('error', (error) => {
      console.error('AssemblyAI WebSocket error:', error.message);
      clientWs.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
      cleanup();
    });

    clientWs.on('close', cleanup);
    clientWs.on('error', (error) => {
      console.error('Client WebSocket error:', error.message);
      cleanup();
    });
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
