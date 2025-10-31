import express from 'express';
import { WebSocketServer } from 'ws';
import { WebSocket as WS } from 'ws';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import cors from 'cors';
import { OpenRouterClient } from './openrouter.js';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { readFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';

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

// Configure multer for file uploads
const upload = multer({
  dest: resolve(__dirname, './uploads'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

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
    const { text, model, preserveWording = true } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text too long (max 50,000 characters)' });
    }

    console.log(`📝 Processing script with model: ${model || 'default'}, preserve wording: ${preserveWording}`);
    const result = await openRouterClient.processScript(text, model, preserveWording);
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

// Process images with AI to generate presentation
app.post('/api/process-images', async (req, res) => {
  try {
    const { images, aspectRatio, model } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    console.log(`🖼️ Processing ${images.length} images with aspect ratio ${aspectRatio}`);
    const result = await openRouterClient.processImages(images, aspectRatio, model);
    console.log(`✅ Generated ${result.sections?.length || 0} sections from images`);

    res.json(result);
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).json({ error: error.message });
  }
});

// PowerPoint upload and parsing endpoint
app.post('/api/upload-pptx', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📤 Processing PPTX file: ${req.file.originalname}`);

    const filePath = req.file.path;
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    // Extract slides data
    const slides = [];
    let slideNumber = 1;

    // Find all slide XML files
    const slideFiles = zipEntries.filter(entry =>
      entry.entryName.match(/ppt\/slides\/slide\d+\.xml/)
    ).sort((a, b) => {
      const aNum = parseInt(a.entryName.match(/slide(\d+)\.xml/)[1]);
      const bNum = parseInt(b.entryName.match(/slide(\d+)\.xml/)[1]);
      return aNum - bNum;
    });

    // Extract images from ppt/media/
    const imageEntries = zipEntries.filter(entry =>
      entry.entryName.startsWith('ppt/media/')
    );

    const imageMap = new Map();

    for (const imageEntry of imageEntries) {
      const imageName = imageEntry.entryName.split('/').pop();
      const imageBuffer = imageEntry.getData();
      const timestamp = Date.now();
      const uniqueName = `${timestamp}-${imageName}`;
      const imagePath = resolve(__dirname, `../client/public/uploads/${uniqueName}`);

      await writeFile(imagePath, imageBuffer);
      imageMap.set(imageName, `/uploads/${uniqueName}`);
      console.log(`📷 Saved image: ${uniqueName}`);
    }

    // Parse each slide
    for (const slideFile of slideFiles) {
      const slideXml = slideFile.getData().toString('utf8');

      // Simple text extraction from XML
      const textMatches = slideXml.match(/<a:t>([^<]+)<\/a:t>/g) || [];
      const slideText = textMatches
        .map(match => match.replace(/<\/?a:t>/g, ''))
        .join(' ')
        .trim();

      if (slideText) {
        // Try to find associated image
        let imageUrl = null;
        if (imageMap.size > 0) {
          // Simple heuristic: use images in order
          const imageArray = Array.from(imageMap.values());
          if (slideNumber - 1 < imageArray.length) {
            imageUrl = imageArray[slideNumber - 1];
          }
        }

        slides.push({
          slideNumber,
          content: slideText,
          notes: '', // TODO: Extract speaker notes if needed
          imageUrl
        });

        slideNumber++;
      }
    }

    // Clean up uploaded file
    await unlink(filePath);

    console.log(`✅ Extracted ${slides.length} slides from PowerPoint`);
    res.json({ slides });

  } catch (error) {
    console.error('Error processing PPTX:', error);
    // Clean up on error
    if (req.file?.path) {
      try { await unlink(req.file.path); } catch {}
    }
    res.status(500).json({ error: error.message });
  }
});

// Generate script variations endpoint
app.post('/api/generate-variations', async (req, res) => {
  try {
    const { slideContent, model } = req.body;

    if (!slideContent || slideContent.trim().length === 0) {
      return res.status(400).json({ error: 'Slide content is required' });
    }

    console.log(`🎨 Generating variations for slide content`);
    const variations = await openRouterClient.generateVariations(slideContent, model);
    console.log(`✅ Generated ${variations.length} variations`);

    res.json({ variations });
  } catch (error) {
    console.error('Error generating variations:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-faqs', async (req, res) => {
  try {
    const { presentationContent, model } = req.body;

    if (!presentationContent || presentationContent.trim().length === 0) {
      return res.status(400).json({ error: 'Presentation content is required' });
    }

    console.log(`❓ Generating FAQs from presentation content`);
    const faqs = await openRouterClient.generateFAQs(presentationContent, model);
    console.log(`✅ Generated ${faqs.length} FAQs`);

    res.json({ faqs });
  } catch (error) {
    console.error('Error generating FAQs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/answer-question', async (req, res) => {
  try {
    const { question, presentationContent, knowledgeBase, model } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!presentationContent || presentationContent.trim().length === 0) {
      return res.status(400).json({ error: 'Presentation content is required' });
    }

    console.log(`💬 Answering question: "${question}"`);
    const answers = await openRouterClient.answerQuestion(
      question,
      presentationContent,
      knowledgeBase || [],
      model
    );
    console.log(`✅ Generated 2 answer options`);

    res.json(answers);
  } catch (error) {
    console.error('Error answering question:', error);
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
