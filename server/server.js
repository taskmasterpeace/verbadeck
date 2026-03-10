import express from 'express';
import { WebSocketServer } from 'ws';
import { WebSocket as WS } from 'ws';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import cors from 'cors';
import { OpenRouterClient } from './openrouter.js';
import { ReplicateImageGenerator } from './image-generator.js';
import { UnsplashClient } from './unsplash-client.js';
import { PexelsClient } from './pexels-client.js';
import { getModelForOperation } from './model-config.js';
import { getAllPromptsMetadata, getPromptExample, getPrompt } from './prompts.js';
import { createTimingMiddleware, timingErrorMiddleware } from './middleware/timing-middleware.js';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { readFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { createRoom, joinRoom, leaveRoom, getRoom, broadcastToControllers, sendToPresenter } from './room-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: resolve(__dirname, '../.env') });

const AAI_API_KEY = process.env.AAI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY; // INSTANT approval - use this first!
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; // Needs approval - fallback
const PORT = process.env.PORT || 3002;

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

// Image APIs are optional - at least one needed for AI image recommendations
if (!PEXELS_API_KEY && !UNSPLASH_ACCESS_KEY) {
  console.warn('⚠️  No image API keys found (PEXELS_API_KEY or UNSPLASH_ACCESS_KEY)');
  console.warn('⚠️  AI image recommendations will be disabled');
  console.warn('💡 Get Pexels key instantly: https://www.pexels.com/api/');
}

// Initialize OpenRouter client
const openRouterClient = new OpenRouterClient(OPENROUTER_API_KEY);

// Initialize Replicate Image Generator client
const replicateClient = new ReplicateImageGenerator(REPLICATE_API_KEY);

// Initialize image API clients (prefer Pexels - instant approval!)
const pexelsClient = PEXELS_API_KEY ? new PexelsClient(PEXELS_API_KEY) : null;
const unsplashClient = UNSPLASH_ACCESS_KEY ? new UnsplashClient(UNSPLASH_ACCESS_KEY) : null;

// Log which image API is available
if (pexelsClient) {
  console.log('📸 Pexels API ready (200 requests/hour)');
} else if (unsplashClient) {
  console.log('📸 Unsplash API ready (50 requests/hour)');
}

const app = express();

// CORS configuration - restrict to known origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'], // Development origins
  credentials: true,
};
app.use(cors(corsOptions));

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

app.post('/api/process-script', createTimingMiddleware('processScript'), async (req, res) => {
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

app.post('/api/suggest-triggers', createTimingMiddleware('suggestTriggers'), async (req, res) => {
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
app.post('/api/suggest-image-prompt', createTimingMiddleware('suggestImagePrompt'), async (req, res) => {
  try {
    const { content, presentationContext, model, presentationStyle } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const selectedModel = getModelForOperation('suggestImagePrompt', model);
    console.log(`🎨 Generating image prompt for slide using ${selectedModel}`);
    if (presentationStyle) {
      console.log(`   🎨 Using presentation style: ${presentationStyle.name}`);
    }

    // Use centralized prompt from prompts.js
    let userPrompt = getPrompt('suggestImagePrompt', content, presentationContext);

    // If presentation style is provided, append style constraints to the prompt
    if (presentationStyle) {
      const styleGuidance = `\n\nIMPORTANT: Apply the following presentation style consistently:\n- Style Name: ${presentationStyle.name}\n- Color Scheme: ${presentationStyle.colorScheme}\n- Visual Style: ${presentationStyle.visualStyle}\n- Mood: ${presentationStyle.mood}\n- Examples: ${presentationStyle.examples.join(', ')}\n\nYour image prompt MUST incorporate these style elements to ensure consistency across all slides.`;
      userPrompt += styleGuidance;
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

    const responseText = response.data.choices[0].message.content.trim();
    console.log(`✅ Generated image prompt response:`, responseText.substring(0, 200) + '...');

    // Parse JSON response
    let promptData;
    try {
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      promptData = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('⚠️  Failed to parse JSON response, treating as plain text:', parseError.message);
      // Fallback: treat as plain text prompt (backwards compatibility)
      promptData = {
        imagePrompt: responseText,
        style: 'photorealistic',
        mood: 'professional',
        keywords: []
      };
    }

    // Return structured response (backwards compatible with { prompt: "..." })
    res.json({
      prompt: promptData.imagePrompt || promptData.prompt || responseText,
      style: promptData.style,
      mood: promptData.mood,
      keywords: promptData.keywords
    });
  } catch (error) {
    console.error('Error generating image prompt:', error);
    // Fallback: return a basic prompt based on the content
    const fallbackPrompt = `Professional presentation slide showing: ${req.body.content.substring(0, 100)}`;
    console.log(`⚠️  Using fallback prompt: "${fallbackPrompt}"`);
    res.json({
      prompt: fallbackPrompt,
      style: 'photorealistic',
      mood: 'professional',
      keywords: []
    });
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
app.post('/api/process-images', createTimingMiddleware('processImages'), async (req, res) => {
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

// AI-powered image recommendations from Pexels (instant!) or Unsplash (needs approval)
app.post('/api/recommend-images', createTimingMiddleware('recommendImages'), async (req, res) => {
  try {
    // Check if any image API is available (prefer Pexels - instant approval!)
    const imageClient = pexelsClient || unsplashClient;
    const apiSource = pexelsClient ? 'Pexels' : unsplashClient ? 'Unsplash' : null;

    if (!imageClient) {
      return res.status(503).json({
        error: 'Image recommendations unavailable - No image API configured',
        message: 'Get Pexels key instantly: https://www.pexels.com/api/ (or wait for Unsplash approval)',
        fallback: 'manual-upload'
      });
    }

    const { content, model } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Step 1: AI analyzes content and generates smart search queries
    const selectedModel = getModelForOperation('recommendImages', model);
    console.log(`🎨 Analyzing content for image recommendations using ${selectedModel} (source: ${apiSource})`);

    const analysisPrompt = `Analyze this slide content and generate 4 strategic image search queries:

Content: "${content}"

Generate 4 queries with different approaches:
1. LITERAL: Direct, concrete representation of the main subject
2. PROFESSIONAL: Business/corporate context version
3. ABSTRACT: Conceptual or metaphorical interpretation
4. EMOTIONAL: Mood/feeling-based representation

Requirements:
- Each query should be 2-4 words
- Avoid overly generic terms ("business meeting", "office")
- Prefer specific, evocative imagery
- Think about what would visually reinforce the message

Return ONLY valid JSON (no markdown):
{
  "queries": ["query1", "query2", "query3", "query4"],
  "rationale": "brief explanation of the approach"
}`;

    const analysisResponse = await openRouterClient.chat(analysisPrompt, selectedModel);
    const { queries, rationale } = JSON.parse(analysisResponse);

    console.log(`🔍 Generated search queries: ${queries.join(', ')}`);

    // Step 2: Search image API for each query (fetch 1 best result per query)
    const imagePromises = queries.map(query =>
      imageClient.searchPhotos(query, 1, 'landscape').catch(err => {
        console.error(`Error searching "${query}":`, err);
        return []; // Return empty array on error
      })
    );

    const imageResults = await Promise.all(imagePromises);

    // Flatten and add context
    const recommendations = imageResults
      .flat()
      .filter(img => img) // Remove any null/undefined
      .map((img, i) => ({
        ...img,
        searchQuery: queries[i],
        queryRationale: rationale
      }));

    console.log(`✅ Found ${recommendations.length} image recommendations`);

    res.json({
      recommendations,
      queries,
      rationale
    });
  } catch (error) {
    console.error('Error generating image recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download/track image usage (Unsplash requires tracking, Pexels doesn't)
app.post('/api/download-unsplash-image', async (req, res) => {
  try {
    const { downloadUrl, imageUrl, source } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl required' });
    }

    // Only Unsplash requires download tracking
    if (source === 'unsplash' && unsplashClient && downloadUrl) {
      await unsplashClient.triggerDownload(downloadUrl);
      console.log('✅ Unsplash download tracked');
    } else if (source === 'pexels') {
      console.log('✅ Pexels image selected (no tracking required)');
    }

    // Return the image URL for the client to use
    res.json({
      success: true,
      imageUrl,
      message: 'Image ready to use'
    });
  } catch (error) {
    console.error('Error handling image download:', error);
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
app.post('/api/generate-variations', createTimingMiddleware('generateVariations'), async (req, res) => {
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

app.post('/api/generate-faqs', createTimingMiddleware('generateFAQs'), async (req, res) => {
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

app.post('/api/answer-question', createTimingMiddleware('answerQuestion'), async (req, res) => {
  try {
    const { question, presentationContent, knowledgeBase, model, tone, sections, currentSlideIndex, presentationGoal } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Support both new (sections + index) and legacy (presentationContent) formats
    let contextContent;
    if (sections && Array.isArray(sections) && typeof currentSlideIndex === 'number') {
      // New contextual format - server builds the context window
      const total = sections.length;
      const current = sections[currentSlideIndex];
      const previous = currentSlideIndex > 0 ? sections[currentSlideIndex - 1] : null;
      const next = currentSlideIndex < total - 1 ? sections[currentSlideIndex + 1] : null;

      // Build remaining slides summary (exclude current/prev/next)
      const otherSlides = sections
        .filter((_, i) => i !== currentSlideIndex && i !== currentSlideIndex - 1 && i !== currentSlideIndex + 1)
        .map((s, i) => `- ${s.heading || 'Slide'}: ${s.content.substring(0, 80)}...`)
        .join('\n');

      contextContent = `You are helping a presenter answer a live question. They are on slide ${currentSlideIndex + 1} of ${total}.

CURRENT SLIDE (what presenter is discussing right now):
Title: ${current.heading || 'Untitled'}
${current.content}

PREVIOUS SLIDE (what was just covered):
${previous ? `Title: ${previous.heading || 'Untitled'}\n${previous.content}` : 'This is the first slide.'}

NEXT SLIDE (what is coming up):
${next ? `Title: ${next.heading || 'Untitled'}\n${next.content}` : 'This is the last slide.'}

OTHER SLIDES IN PRESENTATION:
${otherSlides || 'None'}

${presentationGoal ? `PRESENTATION GOAL: ${presentationGoal}` : ''}`;
    } else if (presentationContent && presentationContent.trim().length > 0) {
      // Legacy flat format
      contextContent = presentationContent;
    } else {
      return res.status(400).json({ error: 'Either sections+currentSlideIndex or presentationContent is required' });
    }

    const selectedModel = getModelForOperation('answerQuestion', model);
    console.log(`💬 Answering question: "${question}" (tone: ${tone || 'professional'}, slide: ${currentSlideIndex ?? 'N/A'}) using ${selectedModel}`);
    const answers = await openRouterClient.answerQuestion(
      question,
      contextContent,
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

app.post('/api/answer-question-with-keywords', createTimingMiddleware('answerQuestionWithKeywords'), async (req, res) => {
  try {
    const { question, knowledgeBase, model, tone } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!knowledgeBase || knowledgeBase.trim().length === 0) {
      return res.status(400).json({ error: 'Knowledge base is required' });
    }

    const selectedModel = getModelForOperation('answerQuestion', model);
    console.log(`🧠 Answering question with keywords: "${question}" using ${selectedModel} (tone: ${tone || 'professional'})`);

    const answers = await openRouterClient.answerQuestionWithKeywords(
      question,
      knowledgeBase,
      selectedModel,
      tone
    );

    console.log(`✅ Generated 2 answer options with keywords and headings in ${tone || 'professional'} tone`);
    res.json(answers);
  } catch (error) {
    console.error('Error answering question with keywords:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-knowledge-base', createTimingMiddleware('analyzeKnowledgeBase'), async (req, res) => {
  try {
    const { knowledgeBase, model } = req.body;

    if (!knowledgeBase || knowledgeBase.trim().length === 0) {
      return res.status(400).json({ error: 'Knowledge base content is required' });
    }

    const selectedModel = getModelForOperation('analyzeKnowledgeBase', model);
    console.log(`🔍 Analyzing knowledge base (${knowledgeBase.length} chars) using ${selectedModel}`);

    const analysis = await openRouterClient.analyzeKnowledgeBase(
      knowledgeBase,
      selectedModel
    );

    console.log(`✅ Detected: ${analysis.documentTypes.join(', ')} | Use case: ${analysis.primaryUseCase}`);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing knowledge base:', error);
    res.status(500).json({ error: error.message });
  }
});

// Speaker Note Transformation: Expand
app.post('/api/expand-speaker-notes', createTimingMiddleware('expandSpeakerNotes'), async (req, res) => {
  try {
    const { briefNotes, slideContent, selectedTone, model } = req.body;

    if (!briefNotes || !slideContent) {
      return res.status(400).json({ error: 'briefNotes and slideContent are required' });
    }

    const selectedModel = getModelForOperation('expandSpeakerNotes', model);
    console.log(`📝 Expanding speaker notes using ${selectedModel} (tone: ${selectedTone})`);

    const prompt = `Expand these brief speaker notes into a full, structured speaking framework:

Slide Content: "${slideContent}"
Brief Notes: "${briefNotes}"
Tone: ${selectedTone || 'professional'}

Use this proven speaking structure:

1. HOOK (10 seconds): Attention-grabbing opening statement or question
2. CONTEXT (30 seconds): Background information and setup
3. INSIGHT (45 seconds): Main points with supporting details, structured clearly
4. DATA POINT: One memorable statistic, fact, or example
5. CALL TO ACTION: What you want the audience to remember or do

Requirements:
- Conversational language (write how people actually speak)
- Use specific numbers, names, examples from the slide content when available
- Natural speaking rhythm with clear transitions
- Estimated total speaking time: 2-3 minutes
- Preserve any key phrases from the original brief notes

Return ONLY valid JSON (no markdown):
{
  "expandedNotes": "full text with clear structure markers (HOOK:, CONTEXT:, etc.)",
  "speakingTime": "2:15",
  "keyTakeaway": "one sentence summary of the main message",
  "structure": {
    "hook": "the hook text",
    "context": "context text",
    "insight": "insight text",
    "dataPoint": "data point text",
    "callToAction": "CTA text"
  }
}`;

    const response = await openRouterClient.chat(prompt, selectedModel);
    const result = JSON.parse(response);

    console.log(`✅ Expanded to ${result.speakingTime} speaking time`);
    res.json(result);
  } catch (error) {
    console.error('Error expanding speaker notes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Speaker Note Transformation: Simplify
app.post('/api/simplify-speaker-notes', createTimingMiddleware('simplifySpeakerNotes'), async (req, res) => {
  try {
    const { notes, model } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'notes are required' });
    }

    const selectedModel = getModelForOperation('simplifySpeakerNotes', model);
    console.log(`🎯 Simplifying speaker notes using ${selectedModel}`);

    const prompt = `Simplify these speaker notes to key bullet points:

Original Notes: "${notes}"

Requirements:
- Extract only the essential points
- Use bullet points (•) for clarity
- Each bullet should be 5-10 words max
- Keep numbers, names, and concrete details
- Remove fluff, filler, and unnecessary context
- Make it scannable (quick glance reference)

Return ONLY valid JSON (no markdown):
{
  "simplified": "• Point 1\\n• Point 2\\n• Point 3",
  "bulletCount": 3,
  "keyTerms": ["term1", "term2", "term3"]
}`;

    const response = await openRouterClient.chat(prompt, selectedModel);
    const result = JSON.parse(response);

    console.log(`✅ Simplified to ${result.bulletCount} key points`);
    res.json(result);
  } catch (error) {
    console.error('Error simplifying speaker notes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Speaker Note Transformation: Add Analogy
app.post('/api/add-analogy', createTimingMiddleware('addAnalogy'), async (req, res) => {
  try {
    const { content, notes, model } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const selectedModel = getModelForOperation('addAnalogy', model);
    console.log(`📖 Generating analogy using ${selectedModel}`);

    const prompt = `Create a memorable analogy for this slide content:

Slide Content: "${content}"
${notes ? `Speaker Notes: "${notes}"` : ''}

Requirements:
- Generate ONE clear, memorable analogy that makes the concept accessible
- Use concrete, relatable comparisons (everyday objects, common experiences)
- Avoid clichés ("tip of the iceberg", "low-hanging fruit")
- The analogy should clarify, not complicate
- Keep it brief (2-3 sentences)
- Make it appropriate for professional settings

Return ONLY valid JSON (no markdown):
{
  "analogy": "Think of [concept] like [relatable thing]. Just as [comparison], our [concept] [parallel].",
  "analogyType": "metaphor|simile|comparison",
  "reasoning": "why this analogy works for this content"
}`;

    const response = await openRouterClient.chat(prompt, selectedModel);
    const result = JSON.parse(response);

    console.log(`✅ Generated ${result.analogyType}: ${result.analogy.substring(0, 50)}...`);
    res.json(result);
  } catch (error) {
    console.error('Error generating analogy:', error);
    res.status(500).json({ error: error.message });
  }
});

// Speaker Note Transformation: Add Story
app.post('/api/add-story', createTimingMiddleware('addStory'), async (req, res) => {
  try {
    const { content, notes, model } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const selectedModel = getModelForOperation('addStory', model);
    console.log(`💡 Generating story/example using ${selectedModel}`);

    const prompt = `Create a concrete story or example that illustrates this slide content:

Slide Content: "${content}"
${notes ? `Speaker Notes: "${notes}"` : ''}

Requirements:
- Generate a SHORT, concrete story or example (3-4 sentences)
- Use realistic details (names, numbers, situations) that COULD be true
- Make it relatable and memorable
- Should illustrate the key point clearly
- Professional tone appropriate for business settings
- If you use specific names/companies, make them obviously fictional or generic

IMPORTANT: This story will be labeled as "AI-generated" so the user knows to verify details.
You can be creative but stay plausible.

Return ONLY valid JSON (no markdown):
{
  "story": "Let me tell you about [character/situation]...",
  "storyType": "customer-example|case-study|hypothetical|analogy",
  "warning": "AI-generated story - verify details before using",
  "keyPoint": "what this story illustrates"
}`;

    const response = await openRouterClient.chat(prompt, selectedModel);
    const result = JSON.parse(response);

    console.log(`✅ Generated ${result.storyType} story`);
    res.json(result);
  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({ error: error.message });
  }
});

// Smart Q&A Anticipation: Predict likely audience questions
app.post('/api/anticipate-questions', createTimingMiddleware('anticipateQuestions'), async (req, res) => {
  try {
    const { sections, knowledgeBase, model } = req.body;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'sections array is required' });
    }

    const selectedModel = getModelForOperation('anticipateQuestions', model);
    console.log(`🔮 Anticipating audience questions using ${selectedModel}`);

    // Combine all slide content
    const allContent = sections.map((s, i) => `Slide ${i + 1}: ${s.content}`).join('\n\n');
    const existingQA = knowledgeBase && knowledgeBase.length > 0
      ? knowledgeBase.map(q => q.question).join('\n')
      : 'None';

    const prompt = `You're analyzing a business presentation. Predict the top 10 questions a skeptical audience would ask during Q&A:

PRESENTATION CONTENT:
${allContent}

EXISTING Q&A (already prepared):
${existingQA}

Requirements:
- Think like a skeptical executive, investor, or stakeholder
- Focus on gaps, risks, concerns, implementation details, proof points
- Questions should be natural (how people actually speak, not formal)
- Avoid questions already covered in existing Q&A
- Rank by likelihood (most likely first)
- Include confidence score (0-100%)
- Categorize each question

Categories:
- roi: Return on investment, cost, budget
- risk: Potential problems, downsides, what could go wrong
- implementation: Timeline, resources, how it actually works
- proof: Evidence, data, case studies, validation
- alternative: Why not do something else, comparison to competitors

Return ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "question": "exact question text as audience would ask it",
      "likelihood": 95,
      "category": "roi",
      "reasoning": "brief explanation why they'd ask this",
      "slideReference": 3
    }
  ]
}

Generate exactly 10 questions.`;

    const response = await openRouterClient.chat(prompt, selectedModel);
    const result = JSON.parse(response);

    console.log(`✅ Anticipated ${result.questions.length} questions (avg likelihood: ${Math.round(result.questions.reduce((sum, q) => sum + q.likelihood, 0) / result.questions.length)}%)`);
    res.json(result);
  } catch (error) {
    console.error('Error anticipating questions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Smart Q&A: Generate answer for predicted question
app.post('/api/generate-qa-answer', createTimingMiddleware('generateQAAnswer'), async (req, res) => {
  try {
    const { question, presentationContent, knowledgeBase, selectedTone, model } = req.body;

    if (!question || !presentationContent) {
      return res.status(400).json({ error: 'question and presentationContent are required' });
    }

    const selectedModel = getModelForOperation('generateQAAnswer', model);
    console.log(`💬 Generating answer for: "${question.substring(0, 50)}..." using ${selectedModel}`);

    const prompt = `Generate two answer versions for this anticipated Q&A question:

QUESTION: "${question}"

PRESENTATION CONTENT:
${presentationContent}

${knowledgeBase ? `ADDITIONAL CONTEXT:\n${knowledgeBase}` : ''}

TONE: ${selectedTone || 'professional'}

Generate TWO versions:

1. SHORT ANSWER (30 seconds):
   - 50-75 words
   - Direct, concise, confident
   - Immediately addresses the core question
   - One key fact or number if available

2. DETAILED ANSWER (2-3 minutes):
   - 150-200 words
   - Structured with clear sections
   - Includes data points, examples, or case studies
   - Addresses nuances and potential follow-up concerns
   - Ends with confidence/reassurance

Requirements:
- Conversational tone (write how you'd actually speak)
- Use specific numbers/data from the presentation content when available
- If no data available, use frameworks/logic instead of making up statistics
- Be honest if information isn't in the presentation ("That's a great question. While I don't have exact figures in this deck, here's what we do know...")

Return ONLY valid JSON (no markdown):
{
  "shortAnswer": "30-second response text",
  "detailedAnswer": "2-3 minute response text",
  "keyPoints": ["point1", "point2", "point3"],
  "confidence": "high|medium|low",
  "missingInfo": "what information you wish you had to answer better (or null)"
}`;

    const response = await openRouterClient.chat(prompt, selectedModel);
    const result = JSON.parse(response);

    console.log(`✅ Generated answers (confidence: ${result.confidence})`);
    res.json(result);
  } catch (error) {
    console.error('Error generating Q&A answer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-context-questions', createTimingMiddleware('generateContextQuestions'), async (req, res) => {
  try {
    const { analysis, knowledgeBase, model } = req.body;

    if (!analysis || !knowledgeBase) {
      return res.status(400).json({ error: 'Analysis and knowledge base are required' });
    }

    const selectedModel = getModelForOperation('generateContextQuestions', model);
    console.log(`❓ Generating context questions for ${analysis.primaryUseCase} using ${selectedModel}`);

    const questions = await openRouterClient.generateContextQuestions(
      analysis,
      knowledgeBase,
      selectedModel
    );

    console.log(`✅ Generated ${questions.questions.length} context questions`);
    res.json(questions);
  } catch (error) {
    console.error('Error generating context questions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-followup-questions', createTimingMiddleware('generateFollowupQuestions'), async (req, res) => {
  try {
    const { analysis, initialAnswers, knowledgeBase, model } = req.body;

    if (!analysis || !initialAnswers || !knowledgeBase) {
      return res.status(400).json({ error: 'Analysis, initial answers, and knowledge base are required' });
    }

    const selectedModel = getModelForOperation('generateFollowupQuestions', model);
    console.log(`🎯 Generating follow-up questions based on ${initialAnswers.length} initial answers using ${selectedModel}`);

    const questions = await openRouterClient.generateFollowupQuestions(
      analysis,
      initialAnswers,
      knowledgeBase,
      selectedModel
    );

    console.log(`✅ Generated ${questions.questions.length} follow-up questions`);
    res.json(questions);
  } catch (error) {
    console.error('Error generating followup questions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-titles', createTimingMiddleware('generateTitles'), async (req, res) => {
  try {
    const { sections, model } = req.body;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'Sections array is required' });
    }

    const selectedModel = getModelForOperation('generateTitles', model);
    console.log(`📋 Generating titles for ${sections.length} sections using ${selectedModel}`);

    const titles = await openRouterClient.generateSlideTitles(sections, selectedModel);
    console.log(`✅ Generated ${titles.length} slide titles`);

    res.json({ titles });
  } catch (error) {
    console.error('Error generating titles:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-questions', createTimingMiddleware('generateQuestions'), async (req, res) => {
  try {
    const { topic, model, preferences } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const selectedModel = getModelForOperation('generateQuestions', model);
    const prefInfo = preferences ? ' with custom preferences' : ' (AI decides)';
    console.log(`❓ Generating questions for topic: "${topic}"${prefInfo} using ${selectedModel}`);
    const questions = await openRouterClient.generateQuestions(topic, preferences, selectedModel);
    console.log(`✅ Generated ${questions.length} questions`);

    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-slide-options', createTimingMiddleware('generateSlideOptions'), async (req, res) => {
  try {
    const { topic, answers, sectionNumber, totalSections, model } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    if (!sectionNumber || sectionNumber < 1) {
      return res.status(400).json({ error: 'Section number must be >= 1' });
    }

    if (!totalSections || totalSections < 1) {
      return res.status(400).json({ error: 'Total sections must be >= 1' });
    }

    const selectedModel = getModelForOperation('generateSlideOptions', model);
    console.log(`🎨 Generating slide ${sectionNumber}/${totalSections} in TalkAdvantage Pro format for topic: "${topic}" using ${selectedModel}`);
    const slide = await openRouterClient.generateSlideOptions(topic, answers, sectionNumber, totalSections, selectedModel);
    console.log(`✅ Generated slide: "${slide.heading}"`);

    res.json({ slide });
  } catch (error) {
    console.error('Error generating slide:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-speaker-notes', createTimingMiddleware('generateSpeakerNotes'), async (req, res) => {
  try {
    const { slides, topic, answers, model } = req.body;

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({ error: 'Slides array is required' });
    }

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!answers) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    const selectedModel = getModelForOperation('generateSpeakerNotes', model);
    console.log(`📝 Generating TalkAdvantage Pro speaker notes for ${slides.length} slides using ${selectedModel}`);
    const speakerNotes = await openRouterClient.generateSpeakerNotes(slides, topic, answers, selectedModel);
    console.log(`✅ Generated ${speakerNotes.length} speaker notes with profound statements and 3 talking points each`);

    res.json({ speakerNotes });
  } catch (error) {
    console.error('Error generating speaker notes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all prompts metadata (for Advanced Settings UI)
app.get('/api/prompts', (req, res) => {
  try {
    const metadata = getAllPromptsMetadata();
    res.json({ prompts: metadata });
  } catch (error) {
    console.error('Error getting prompts metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific prompt example for editing
app.get('/api/prompts/:operation', (req, res) => {
  try {
    const { operation } = req.params;
    const promptExample = getPromptExample(operation);
    res.json(promptExample);
  } catch (error) {
    console.error('Error getting prompt example:', error);
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`\n🎤 VerbaDeck Server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`Control WebSocket: ws://localhost:${PORT}/ws/control`);
  console.log(`API endpoints: http://localhost:${PORT}/api/*`);
  console.log(`🤖 OpenRouter AI enabled\n`);
});

const wss = new WebSocketServer({ noServer: true });
const controlWss = new WebSocketServer({ noServer: true });

server.on('upgrade', async (req, socket, head) => {
  if (req.url === '/ws') {
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
  } else if (req.url === '/ws/control') {
    controlWss.handleUpgrade(req, socket, head, (ws) => {
      console.log('🎮 Control WebSocket connected');
      let roomCode = null;
      let role = null;

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());

          if (msg.type === 'create-room') {
            const room = createRoom(ws);
            roomCode = room.code;
            role = 'presenter';
            ws.send(JSON.stringify({ type: 'room-created', roomCode: room.code }));
          }

          else if (msg.type === 'join-room') {
            const room = joinRoom(msg.roomCode, ws);
            if (room) {
              roomCode = msg.roomCode;
              role = 'controller';
              ws.send(JSON.stringify({ type: 'room-joined', state: room.state }));
            } else {
              ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            }
          }

          else if (msg.type === 'state-update' && roomCode) {
            const room = getRoom(roomCode);
            if (room) {
              room.state = { ...room.state, ...msg.state };
              broadcastToControllers(room, { type: 'state-update', state: room.state });
            }
          }

          else if (msg.type === 'navigate' && roomCode) {
            const room = getRoom(roomCode);
            if (room && role === 'controller') {
              sendToPresenter(room, { type: 'navigate', direction: msg.direction });
            }
          }

          else if (msg.type === 'toggle-qa' && roomCode) {
            const room = getRoom(roomCode);
            if (room) {
              if (role === 'controller') {
                sendToPresenter(room, { type: 'toggle-qa', enabled: msg.enabled });
              }
            }
          }

          else if (msg.type === 'qa-update' && roomCode) {
            const room = getRoom(roomCode);
            if (room && role === 'presenter') {
              room.state.qaState = msg.qaState;
              broadcastToControllers(room, { type: 'qa-update', qaState: msg.qaState });
            }
          }

          else if (msg.type === 'dismiss-qa' && roomCode) {
            const room = getRoom(roomCode);
            if (room) {
              room.state.qaState = null;
              if (role === 'controller') {
                sendToPresenter(room, { type: 'dismiss-qa' });
              } else {
                broadcastToControllers(room, { type: 'dismiss-qa' });
              }
            }
          }

        } catch (err) {
          console.error('Control message error:', err);
        }
      });

      ws.on('close', () => {
        console.log(`🎮 Control WebSocket disconnected (${role}, room ${roomCode})`);
        if (roomCode) leaveRoom(roomCode, ws);
      });

      ws.on('error', (err) => {
        console.error('Control WebSocket error:', err.message);
        if (roomCode) leaveRoom(roomCode, ws);
      });
    });
  } else {
    socket.destroy();
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

