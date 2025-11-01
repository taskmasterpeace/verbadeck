import express from 'express';
import { WebSocketServer } from 'ws';
import { WebSocket as WS } from 'ws';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import cors from 'cors';
import { OpenRouterClient } from './openrouter.js';
import { ReplicateImageGenerator } from './image-generator.js';
import { getModelForOperation } from './model-config.js';
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
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const PORT = process.env.PORT || 3001;

if (!AAI_API_KEY) {
  console.error('ERROR: AAI_API_KEY not found in .env file');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('ERROR: OPENROUTER_API_KEY not found in .env file');
  process.exit(1);
}

if (!REPLICATE_API_KEY) {
  console.error('ERROR: REPLICATE_API_KEY not found in .env file');
  process.exit(1);
}

// Initialize OpenRouter client
const openRouterClient = new OpenRouterClient(OPENROUTER_API_KEY);

// Initialize Replicate Image Generator client
const replicateClient = new ReplicateImageGenerator(REPLICATE_API_KEY);

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

    const selectedModel = getModelForOperation('processScript', model);
    console.log(`📝 Processing script with model: ${selectedModel}, preserve wording: ${preserveWording}`);
    const result = await openRouterClient.processScript(text, selectedModel, preserveWording);
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

    const selectedModel = getModelForOperation('suggestTriggers', model);
    console.log(`💡 Suggesting triggers for section using ${selectedModel}`);
    const triggers = await openRouterClient.suggestTriggers(text, selectedModel);
    console.log(`✅ Suggested ${triggers.length} triggers`);

    res.json({ triggers });
  } catch (error) {
    console.error('Error suggesting triggers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate image with AI using Replicate
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio, imageInput, outputFormat } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`🎨 ${imageInput ? 'Editing' : 'Generating'} image with Replicate`);
    console.log(`Prompt: "${prompt}"`);
    console.log(`Aspect ratio: ${aspectRatio || '16:9'}, Format: ${outputFormat || 'png'}`);

    const base64Image = await replicateClient.generateImage(prompt, {
      aspectRatio: aspectRatio || '16:9',
      imageInput: imageInput || null,
      outputFormat: outputFormat || 'png'
    });

    res.json({ imageUrl: base64Image });
  } catch (error) {
    console.error('❌ Error generating image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Suggest image prompt from section content
app.post('/api/suggest-image-prompt', async (req, res) => {
  try {
    const { content, presentationContext, model } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const selectedModel = getModelForOperation('suggestImagePrompt', model);
    console.log(`🎨 Generating image prompt for slide using ${selectedModel}`);

    // Build context-aware prompt for AI
    let userPrompt = `This slide contains: "${content}"`;

    if (presentationContext && presentationContext.trim().length > 0) {
      userPrompt = `This is part of a presentation about: ${presentationContext}\n\nThis specific slide contains: "${content}"\n\nGenerate a detailed image prompt (2-3 sentences) that would create a professional, visually compelling presentation slide image. The prompt should fit the presentation theme and accurately represent this slide's content. Focus on professional, clean, presentation-appropriate visuals. Return ONLY the image prompt, nothing else.`;
    } else {
      userPrompt = `Create a detailed image prompt (2-3 sentences) for this presentation slide: "${content}"\n\nThe prompt should create a professional, visually compelling image. Return ONLY the image prompt, nothing else.`;
    }

    // Use OpenRouter to generate intelligent prompt
    const axios = await import('axios');
    const response = await axios.default.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const suggestedPrompt = response.data.choices[0].message.content.trim();
    console.log(`✅ Generated prompt: "${suggestedPrompt}"`);

    res.json({ prompt: suggestedPrompt });
  } catch (error) {
    console.error('Error generating image prompt:', error);
    // Fallback: return a basic prompt based on the content
    const fallbackPrompt = `Professional presentation slide showing: ${req.body.content.substring(0, 100)}`;
    console.log(`⚠️  Using fallback prompt: "${fallbackPrompt}"`);
    res.json({ prompt: fallbackPrompt });
  }
});

// Get available aspect ratios and formats
app.get('/api/image-options', (req, res) => {
  res.json({
    aspectRatios: ReplicateImageGenerator.getSupportedAspectRatios(),
    formats: ReplicateImageGenerator.getSupportedFormats()
  });
});

// Process images with AI to generate presentation
app.post('/api/process-images', async (req, res) => {
  try {
    const { images, aspectRatio, model } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const selectedModel = getModelForOperation('processImages', model);
    console.log(`🖼️ Processing ${images.length} images with ${selectedModel} (aspect ratio: ${aspectRatio})`);
    const result = await openRouterClient.processImages(images, aspectRatio, selectedModel);
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

    const selectedModel = getModelForOperation('generateVariations', model);
    console.log(`🎨 Generating variations for slide content using ${selectedModel}`);
    const variations = await openRouterClient.generateVariations(slideContent, selectedModel);
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

    const selectedModel = getModelForOperation('generateFAQs', model);
    console.log(`❓ Generating FAQs from presentation content using ${selectedModel}`);
    const faqs = await openRouterClient.generateFAQs(presentationContent, selectedModel);
    console.log(`✅ Generated ${faqs.length} FAQs`);

    res.json({ faqs });
  } catch (error) {
    console.error('Error generating FAQs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/answer-question', async (req, res) => {
  try {
    const { question, presentationContent, knowledgeBase, model, tone } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!presentationContent || presentationContent.trim().length === 0) {
      return res.status(400).json({ error: 'Presentation content is required' });
    }

    const selectedModel = getModelForOperation('answerQuestion', model);
    console.log(`💬 Answering question: "${question}" (tone: ${tone || 'professional'}) using ${selectedModel}`);
    const answers = await openRouterClient.answerQuestion(
      question,
      presentationContent,
      knowledgeBase || [],
      selectedModel,
      tone || 'professional'
    );
    console.log(`✅ Generated 2 answer options in ${tone || 'professional'} tone`);

    res.json(answers);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic, model } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const selectedModel = getModelForOperation('generateQuestions', model);
    console.log(`❓ Generating questions for topic: "${topic}" using ${selectedModel}`);
    const questions = await openRouterClient.generateQuestions(topic, selectedModel);
    console.log(`✅ Generated ${questions.length} questions`);

    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-slide-options', async (req, res) => {
  try {
    const { topic, answers, numSlides, model } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    if (!numSlides || numSlides < 1 || numSlides > 20) {
      return res.status(400).json({ error: 'Number of slides must be between 1 and 20' });
    }

    const selectedModel = getModelForOperation('generateSlideOptions', model);
    console.log(`🎨 Generating ${numSlides} slide options for topic: "${topic}" using ${selectedModel}`);
    const slides = await openRouterClient.generateSlideOptions(topic, answers, numSlides, selectedModel);
    console.log(`✅ Generated ${slides.length} slides with 4 options each`);

    res.json({ slides });
  } catch (error) {
    console.error('Error generating slide options:', error);
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
