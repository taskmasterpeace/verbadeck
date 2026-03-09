# VerbaDeck User Guide
## The Complete Guide to Voice-Driven Presentations

**Version 2.0** | Last Updated: October 31, 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Workflow Modes](#workflow-modes)
   - [Create from Scratch](#create-from-scratch)
   - [Process Existing Content](#process-existing-content)
4. [Presentation Delivery](#presentation-delivery)
5. [Q&A Features with Personality Tones](#qa-features)
6. [Advanced Features](#advanced-features)
7. [Use Cases & Examples](#use-cases)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is VerbaDeck?

VerbaDeck is a revolutionary voice-driven presentation system that advances your slides automatically when you speak specific trigger words. Unlike traditional clicker-based presentations, VerbaDeck allows you to maintain natural eye contact with your audience while your AI-powered system listens for key phrases and advances slides seamlessly.

### Key Benefits

**🎤 Hands-Free Presentation**
- No more fumbling with clickers or spacebar
- Maintain natural gestures and body language
- Full eye contact with your audience

**🤖 AI-Powered Intelligence**
- Automatic trigger word identification
- Multiple trigger alternatives per slide
- Smart Q&A assistance with personality tones

**🎨 Flexible Creation Methods**
- Create presentations from scratch with AI
- Process existing script text
- Convert PowerPoint files
- Generate from slide images

**📱 Multi-Device Support**
- Dual-monitor presenter and audience views
- Mobile and desktop responsive design
- Real-time synchronization via BroadcastChannel

---

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Microphone access for voice control
- Internet connection for AI processing
- Optional: Dual monitors for presenter + audience view

### First Launch

1. Open VerbaDeck in your browser
2. Grant microphone permissions when prompted
3. Choose your workflow mode:
   - **Create from Scratch**: AI generates your presentation
   - **Process Existing Content**: Convert existing materials

### Quick Start (5 Minutes)

1. Click "Process Existing Content" (default view)
2. Click "Load Test Presentation" to see a sample
3. Click "Process with AI" to generate trigger words
4. Switch to "Present" mode
5. Click "Start Listening" and speak naturally!

---

## Workflow Modes

VerbaDeck offers two primary workflows for creating presentations. Understanding which to use is crucial for efficiency.

---

## Create from Scratch

**When to Use:**
- You have a topic but no written script
- You want AI to generate the entire presentation
- You need a quick presentation with minimal preparation
- You want consistent tone and style throughout

### Interface Overview

The Create from Scratch interface consists of several key sections:

#### 1. Description Input

**Location**: Top of the form

**Purpose**: Tell the AI what your presentation is about. Be as detailed or brief as you like.

**Best Practices**:
- ✅ Include your main topic and key points
- ✅ Mention target audience if relevant
- ✅ Specify desired length or scope
- ❌ Don't worry about perfect formatting
- ❌ Don't include actual slides - just describe them

**Example Inputs**:

*Brief*:
```
A presentation about climate change solutions for corporate executives.
```

*Detailed*:
```
I need a 15-minute presentation about climate change solutions specifically
targeting corporate executives. Focus on practical, implementable strategies
that businesses can adopt, including carbon offsetting, renewable energy
transitions, and supply chain optimization. Include data and ROI projections.
```

#### 2. Presentation Tone Selector

**Location**: Below description input

**Purpose**: Choose the writing style and personality for your AI-generated presentation.

**Available Tones**:

##### 💼 **Professional**
- **Style**: Clear, direct, and credible
- **Best For**: Business presentations, board meetings, formal pitches
- **Characteristics**: Confident and authoritative while remaining approachable
- **Example**: "Our analysis indicates a 34% improvement in operational efficiency following implementation."

##### ✨ **Witty & Engaging**
- **Style**: Clever wordplay and light humor
- **Best For**: Conference talks, team presentations, creative pitches
- **Characteristics**: Entertaining while still informative
- **Example**: "We didn't just move the needle - we turned the whole dashboard green."

##### 🧠 **Deeply Insightful**
- **Style**: Analytical and nuanced
- **Best For**: Academic presentations, thought leadership, strategy sessions
- **Characteristics**: Reveals deeper connections and implications
- **Example**: "The intersection of these trends suggests not just evolution, but a fundamental paradigm shift."

##### 💬 **Conversational**
- **Style**: Friendly and relatable
- **Best For**: Internal meetings, training sessions, team updates
- **Characteristics**: Like talking to a colleague, no corporate jargon
- **Example**: "Look, here's the deal - we tried three approaches, and one actually worked."

##### 🔥 **Bold & Provocative**
- **Style**: Challenges assumptions
- **Best For**: Disruptive pitches, innovation talks, rallying teams
- **Characteristics**: Strong statements, controversial takes, memorable
- **Example**: "Everyone's doing it wrong. Here's why, and here's what we're doing instead."

##### 🔬 **Technical Expert**
- **Style**: Precise and data-driven
- **Best For**: Engineering presentations, technical reviews, scientific talks
- **Characteristics**: Specific details, metrics, technical accuracy
- **Example**: "At 99.97% uptime with p99 latency under 150ms, our infrastructure exceeds SLA by 40%."

##### 📖 **Storytelling**
- **Style**: Compelling narratives
- **Best For**: Sales presentations, motivational talks, product launches
- **Characteristics**: Anecdotes, scenarios, vivid examples
- **Example**: "Picture this: It's 2AM, the system is down, and millions are at stake..."

##### 😏 **Sarcastic & Sharp**
- **Style**: Dry wit and ironic observations
- **Best For**: Internal critiques, retrospectives, tech talks
- **Characteristics**: Subtle jabs, memorable points, still helpful
- **Example**: "Of course we should rewrite everything in Rust. What could possibly go wrong?"

**How to Select a Tone**:
1. Click on any tone button
2. The selected tone will highlight in **blue**
3. Read the description to confirm it matches your needs
4. You can change it anytime before generating

**Tone Selection Strategy**:
- For executive audiences: Professional or Insightful
- For technical teams: Technical Expert or Conversational
- For sales presentations: Storytelling or Witty
- For conferences: Witty, Bold, or Storytelling
- For internal meetings: Conversational or Professional

#### 3. Number of Slides Slider

**Location**: Below tone selector

**Purpose**: Set how many slides your presentation should have

**Range**: 3 to 20 slides

**Best Practices**:

- **3-5 slides**: Elevator pitch, quick updates (5 minutes)
- **6-8 slides**: Standard pitch, team meeting (10-15 minutes)
- **9-12 slides**: Conference talk, client presentation (20-30 minutes)
- **13-20 slides**: Workshop, training session (45-60 minutes)

**How to Use**:
1. Drag the slider left or right
2. The large blue number updates in real-time
3. The gradient fills to show your selection visually

**Tip**: Start with fewer slides than you think you need. It's easier to add than to cut.

#### 4. Target Audience Selector

**Location**: Below slide count slider

**Purpose**: Tailor the presentation complexity and language to your audience

**Available Audiences**:

##### 👥 **General Audience**
- Accessible language, minimal jargon
- Broad appeal, varied knowledge levels
- Use for: Public talks, all-hands meetings, community presentations

##### 🔬 **Technical/Expert**
- Technical depth, industry terminology
- Assumes domain expertise
- Use for: Engineering reviews, scientific conferences, specialist workshops

##### 💼 **Business Executive**
- Focus on ROI, strategy, outcomes
- Concise, data-driven, decision-oriented
- Use for: Board meetings, investor pitches, executive briefings

##### 🎓 **Students/Academic**
- Educational approach, clear explanations
- Building blocks of understanding
- Use for: Lectures, training sessions, educational workshops

**Selection Impact**:
- Affects vocabulary complexity
- Changes example types
- Adjusts data presentation
- Influences storytelling approach

#### 5. Include Images Toggle

**Location**: Below audience selector

**Purpose**: Add visual elements to your presentation

**Two Modes**:

##### 🤖 **AI-Generated Prompts** (Recommended)
- AI creates DALL-E/Midjourney-compatible prompts for each slide
- You generate images separately using those prompts
- Faster, more flexible
- **Use when**: You have access to image generation tools

**Workflow**:
1. Enable "Include Images"
2. Select "AI-Generated Prompts"
3. Generate presentation
4. AI provides image prompts in each section
5. Use prompts with your preferred image generation tool
6. Upload generated images to slides

##### 📸 **Manual Upload**
- Upload your own images for each slide
- Grid interface shows all slides at once
- Supports portrait and landscape orientations
- **Use when**: You have specific images to use

**Workflow**:
1. Enable "Include Images"
2. Select "Manual Upload"
3. Grid appears showing slots for each slide
4. Click each slot to upload an image
5. Images are automatically associated with slides

**Supported Formats**: PNG, JPG, GIF, WebP

#### 6. Generate Presentation Button

**Location**: Bottom of form

**Appearance**: Large blue button with sparkle icon

**States**:
- **Disabled** (gray): When description is empty
- **Enabled** (blue): Ready to generate
- **Processing** (animated): AI is working

**What Happens When You Click**:

1. **Validation** (instant)
   - Checks description is not empty
   - Validates all settings

2. **AI Processing** (30-60 seconds)
   - Sends your inputs to OpenRouter API
   - Uses selected tone persona
   - Generates sections with trigger words
   - Creates image prompts if requested

3. **Result** (automatic)
   - Switches to Edit Sections view
   - Shows all generated slides
   - Each slide has trigger words identified
   - Ready for refinement or immediate presentation

**Progress Indicators**:
- Loading spinner on button
- Progress bar appears
- Status text: "Processing with AI... This may take 30-60 seconds"

### Complete Create from Scratch Workflow

**Step-by-Step Example**: Creating a Product Launch Presentation

1. **Start the Creation**
   - Click "Create from Scratch" tab
   - Interface loads with empty form

2. **Describe Your Presentation**
   ```
   Product launch presentation for our new AI-powered analytics platform.
   Target: SaaS executives and CTOs. Cover: the problem we solve, our unique
   approach, key features, early customer results, pricing, and next steps.
   ```

3. **Select Tone**: **🔥 Bold & Provocative**
   - Why: Disruptive product needs strong positioning
   - This will generate confident, memorable language

4. **Set Slide Count**: **8 slides**
   - Perfect for 15-minute pitch + Q&A

5. **Choose Audience**: **💼 Business Executive**
   - Focuses on outcomes and ROI

6. **Configure Images**: **Enable** → **AI-Generated Prompts**
   - AI will suggest relevant imagery

7. **Generate**
   - Click "Generate Presentation"
   - Wait 45 seconds for AI processing

8. **Review Result**
   - 8 slides generated with trigger words
   - Each slide has 2-3 trigger alternatives
   - Image prompts included
   - Switch to Edit Sections to refine

**Total Time**: 5 minutes + AI processing

---

## Process Existing Content

**When to Use:**
- You already have a written script or speech
- You're converting an existing PowerPoint
- You have slide images that need scripts
- You want to preserve your exact wording

### Interface Overview

Process Existing Content offers **three distinct methods**:

---

### Method 1: Paste Text

**Best For**: Written scripts, speeches, blog posts you want to present

#### Interface Components

##### 1. Model Selector

**Location**: Top of form

**Purpose**: Choose which AI model processes your script

**How It Works**:
- Click the dropdown to see all available models
- Models are organized by category:
  - **Recommended**: Best balance of quality and cost
  - **Cost-Effective**: Budget-friendly options (many are FREE)
  - **Premium**: Highest quality, slower, more expensive

**Available Models** (as of Oct 2025):
- **Claude 3.5 Sonnet** (Default, Recommended)
- **Claude 3 Haiku** (Fast, Free)
- **GPT-4 Turbo** (Premium)
- **GPT-3.5 Turbo** (Cost-Effective, Free)
- **Gemini Pro** (Free)
- **Mistral Large** (Premium)
- **Llama 3.1 70B** (Free)

**FREE Models Highlighted**: Look for the green "FREE" badge

**Model Selection Tips**:
- **Claude 3 Haiku**: Best free option, fast, accurate
- **Claude 3.5 Sonnet**: Best overall (default), worth the small cost
- **GPT-4 Turbo**: Most creative, best for complex scripts
- **GPT-3.5 Turbo**: Fast and free, good for simple scripts

**Your Selection is Saved**: VerbaDeck remembers your choice automatically

##### 2. Preserve Exact Wording Checkbox

**Location**: Below model selector

**Default**: ✅ Checked (RECOMMENDED)

**What It Does**:

**When CHECKED** (Default):
- AI only identifies trigger words
- Your text remains 100% unchanged
- AI only suggests section breaks
- **Use when**: You've carefully crafted every word

**When UNCHECKED**:
- AI may rephrase for clarity
- AI may improve flow and transitions
- AI may fix grammar and style issues
- **Use when**: Script needs polish

**Visual Indicator**:
- Blue checkbox and border
- "DEFAULT" badge in blue
- Clear description of behavior

**Best Practice**: Leave checked unless you specifically want AI edits

##### 3. Raw Script Text Area

**Location**: Center of form

**Purpose**: Paste your existing script

**Features**:
- Large textarea (400px height, expands to 80vh)
- Monospace font for readability
- Blue focus border
- Character counter (current / max)
- Max: 50,000 characters

**How to Use**:
1. Copy your script from any source
2. Click in the textarea
3. Paste (Ctrl+V or Cmd+V)
4. Text appears immediately
5. Character counter updates

**Formatting Tips**:
- Don't worry about formatting - AI handles it
- Paragraph breaks help AI identify sections
- ALL CAPS for emphasis is fine
- Bullets and numbers are preserved

**Test Button**:
- Click "Load Test Presentation" to see an example
- Loads a complete sample presentation
- Use this to understand expected format
- **Tip**: Try processing the test first to learn the system

##### 4. Character Counter

**Location**: Below textarea

**Shows**:
- Current character count (e.g., "2,543 characters")
- Maximum allowed (50,000 characters)

**Why It Matters**:
- AI models have token limits
- Longer scripts take more time to process
- Character count helps you stay within limits

**What If I'm Over?**:
- Split into multiple presentations
- Edit down to key points
- Use bullet points instead of full sentences

##### 5. Tips Section

**Location**: Bottom of form

**Content**: Best practices for optimal results

**Key Tips**:
- ✅ Provide complete sentences and paragraphs
- ✅ AI will automatically split into digestible sections
- ✅ Trigger words are chosen based on impact and clarity
- ✅ You can edit sections and triggers after processing

##### 6. Process with AI Button

**Location**: Bottom of form

**Appearance**: Large gradient button (blue-600 to blue-500)

**States**:
- **Disabled**: When textarea is empty
- **Enabled**: When text is present
- **Processing**: Shows spinner and "Processing..." text

**Processing Time**: 30-60 seconds depending on script length and model

**What Happens**:
1. **Validation**: Checks text is present
2. **API Call**: Sends to OpenRouter with selected model
3. **AI Processing**:
   - Analyzes your script
   - Identifies natural section breaks
   - Suggests primary trigger words
   - Generates 2-3 trigger alternatives per section
4. **Result**: Switches to Edit Sections view with processed slides

#### Complete Paste Text Workflow

**Example**: Converting a Conference Talk Script

**Scenario**: You've written a 20-minute conference talk script about microservices architecture.

**Step 1: Prepare Your Script**

```
Good morning everyone. Today I want to talk about microservices architecture
and why it's both the best and worst decision you'll ever make.

Let's start with the problem. You have a monolithic application. It's slow to deploy,
hard to scale, and every change requires testing the entire system.

Enter microservices. Break your application into small, independent services.
Each service handles one business capability. Sounds perfect, right?

Here's what they don't tell you. Microservices introduce distributed systems complexity.
Network failures, data consistency, service discovery, monitoring - it's a lot.

But when done right, the benefits are real. Independent deployment, technology flexibility,
team autonomy, and horizontal scaling. These are game-changers.

So should you use microservices? Here's my framework...
```

**Step 2: Open Process Existing Content**
- Click "Process Existing Content" tab
- "Paste Text" method is selected by default

**Step 3: Choose Your Model**
- Click model dropdown
- Select "Claude 3.5 Sonnet" (best balance)
- Dropdown closes automatically

**Step 4: Configure Preservation**
- Leave "Preserve exact wording" **CHECKED**
- Your carefully chosen words stay intact

**Step 5: Paste Your Script**
- Click in textarea
- Paste your full script (Ctrl+V)
- See character count update: "1,247 characters"

**Step 6: Review Before Processing**
- Scroll through pasted text
- Check no formatting issues
- Verify complete script is present

**Step 7: Process**
- Click "Process with AI"
- Progress bar appears
- Status: "Processing with AI... This may take 30-60 seconds"
- Wait for completion

**Step 8: View Results**
- Automatically switches to Edit Sections view
- Script split into 6 sections:
  1. Opening Hook (trigger: "architecture")
  2. The Problem (trigger: "monolithic")
  3. The Solution (trigger: "microservices")
  4. The Reality (trigger: "complexity")
  5. The Benefits (trigger: "deployment")
  6. Decision Framework (trigger: "framework")

**Step 9: Refine**
- Each section shows your exact wording
- Trigger words highlighted
- 2-3 alternative triggers per section
- Toggle triggers on/off as needed

**Total Time**: 2 minutes + 45 seconds AI processing

---

### Method 2: Upload PowerPoint

**Best For**: Converting existing PowerPoint presentations to voice-driven format

#### How It Works

1. **Select Method**
   - Click "Upload PowerPoint" button
   - Interface changes to show upload area

2. **Upload Your PPTX File**
   - Click upload area or drag file
   - Supports .pptx format only
   - Maximum file size: 50MB

3. **Processing**
   - Text extracted from slides
   - Images extracted and preserved
   - Speaker notes included if present
   - Slide order maintained

4. **Result**
   - One VerbaDeck section per PowerPoint slide
   - Text content becomes section content
   - Images attached to respective sections
   - Default trigger words generated

#### Best Practices

**Optimal PowerPoint Structure**:
- Clear text on each slide (not just images)
- Consistent formatting
- Speaker notes for additional context
- High-quality images

**What Gets Extracted**:
- ✅ Slide titles
- ✅ Body text
- ✅ Bullet points
- ✅ Images
- ✅ Speaker notes (if present)
- ❌ Animations (not supported)
- ❌ Embedded videos (not supported)
- ❌ Custom fonts (converted to web fonts)

**After Upload**:
- Review each section's trigger word
- Edit text if needed
- Adjust trigger words for natural speech
- Test in presenter mode

---

### Method 3: Generate from Images

**Best For**: You have presentation slides as images and need scripts generated

#### How It Works

1. **Select Method**
   - Click "Generate from Images" button
   - Image template builder interface loads

2. **Upload Slide Images**
   - Upload images in presentation order
   - One image per slide
   - Supports: PNG, JPG, GIF, WebP

3. **AI Analysis**
   - AI analyzes visual content
   - Identifies text via OCR
   - Understands slide structure
   - Generates appropriate script

4. **Result**
   - Full presentation script generated
   - Trigger words identified
   - Images attached to sections
   - Ready for refinement

#### Best Practices

**Image Quality**:
- High resolution (minimum 1920x1080)
- Clear text (readable by OCR)
- Consistent image dimensions
- Good contrast

**AI Analysis Works Best With**:
- Text-heavy slides
- Clear visual hierarchy
- Consistent design
- Standard slide formats

**Limitations**:
- Handwritten text may not OCR well
- Very design-heavy slides with minimal text produce shorter scripts
- Complex diagrams may need manual refinement

---

## Presentation Delivery

After creating your presentation (either from scratch or from existing content), you're ready to deliver it with voice control.

### Presenter View

#### Switching to Present Mode

1. Click "Present" button in the top navigation
2. Presenter interface loads
3. Current slide displays in center
4. Controls and transcript visible

#### Interface Components

##### 1. Status Bar

**Location**: Top of screen

**Elements**:
- **Voice Control Button**: Start/Stop Listening (large, prominent)
- **Connection Status**: Shows WebSocket connection state
  - ⚫ Disconnected (gray)
  - 🟡 Connecting (yellow)
  - 🟢 Connected (green)
- **Mode Indicator**: ▶️ STREAMING or ⏸️ PAUSED

**Voice Control Button States**:
- **Start Listening**: Red microphone icon, click to begin
- **Stop Listening**: Animated recording indicator, click to pause

**Visual Feedback**:
- Pulsing animation when listening
- Color changes to indicate state
- Status text updates in real-time

##### 2. Main Slide Display

**Location**: Center of screen

**Shows**:
- Current section content
- Section number (e.g., "Section 3 of 8")
- Attached image (if present)
- Trigger words **highlighted and underlined**

**Visual Design**:
- Clean white background
- Large readable text
- Trigger words in bold+underline
- Progress indicator at bottom

##### 3. Trigger Carousel

**Location**: Below main slide

**Purpose**: Shows previous, current, and next trigger words

**Display**:
- **Previous**: Grayed out, smaller
- **Current**: Large, bold, blue highlight
- **Next**: Normal size, ready to advance

**Example**:
```
[architecture] → MICROSERVICES → [complexity]
```

**Why It's Useful**:
- Know what word advances the slide
- See upcoming triggers to plan your speech
- Visual confirmation of detection

##### 4. Transcript Ticker

**Location**: Bottom of screen

**Purpose**: Real-time display of what the system hears

**Features**:
- Auto-scrolling transcript
- Shows last 20 transcripts
- Final transcripts in normal text
- Interim transcripts in lighter color

**Example**:
```
"Good morning everyone"
"today I want to talk about"
"microservices architecture" ← Trigger detected!
```

**Visual Feedback**:
- Detected triggers flash briefly
- Scroll automatically to latest

##### 5. Navigation Controls

**Location**: Varies (top or side panel)

**Manual Navigation**:
- Previous button (←)
- Next button (→)
- Jump to specific section (numbered buttons)

**Keyboard Shortcuts**:
- `← Left Arrow`: Previous section
- `→ Right Arrow`: Next section
- `Space`: Toggle listening
- `P`: Toggle Pause/Play

**Voice Commands**:
- **"BACK"** / **"Previous"** / **"Go back"**: Go to previous section
  - These words are ALWAYS active
  - Override current section triggers
  - Only work when not on first section

#### Voice Control Behavior

##### How Trigger Detection Works

1. **Audio Capture**
   - Your microphone captures audio
   - Audio processor converts to PCM16 format
   - Sent to AssemblyAI via WebSocket

2. **Transcription**
   - AssemblyAI transcribes in real-time
   - Returns both interim (partial) and final transcripts
   - VerbaDeck receives transcript events

3. **Trigger Matching**
   - Transcript converted to lowercase
   - Non-alphanumeric characters stripped
   - Regex pattern matching:
     ```regex
     \b{trigger-word}(s|es|ies)?\b
     ```
   - Handles plurals automatically

4. **Navigation**
   - When trigger detected, advance to next section
   - **2-second debounce** prevents double-advance
   - Visual transition effect plays
   - Transcript updates
   - Trigger carousel shifts

##### Trigger Word Variations

**Example**: Trigger word is "**solution**"

**Will Also Detect**:
- "solutions" (plural)
- "Solution" (capitalized)
- "SOLUTION" (all caps)
- "...the solution, which..." (embedded in sentence)

**Will NOT Detect**:
- "resolution" (different word)
- "solut" (incomplete)
- "solutioning" (different form, though this varies by implementation)

##### Multiple Triggers Per Section

**How It Works**:
- Each section can have multiple active triggers
- ANY trigger word advances the section
- You choose which to say naturally

**Example Section**:
- Primary: "**microservices**"
- Alternatives: "**architecture**", "**services**"

**In Practice**:
- Say "...microservices architecture..." → Advances
- Or say "...breaking into services..." → Also advances
- Or say "...the microservices approach..." → Also advances

**Why Multiple Triggers Help**:
- Natural variation in delivery
- Recover if you use alternate phrasing
- Flexibility during Q&A interruptions

##### BACK Command Priority

**Special Behavior**:
- "BACK" command is checked FIRST, before section triggers
- Always active (except on first section)
- Cannot be disabled

**Back Command Words**:
- "back"
- "previous"
- "go back"

**Use Cases**:
- Audience asks to see previous slide
- You want to revisit a point
- Accidentally advanced too soon

**How to Use**:
- Simply say "Let's go back to..."
- Or "Back to the previous point..."
- System immediately returns to previous section

**Visual Feedback**:
- Reverse slide transition
- Trigger carousel updates backward
- Section number decrements

#### Complete Presentation Delivery Workflow

**Example**: Delivering Your Microservices Talk

**Step 1: Final Preparation**
- Review all sections in Edit mode
- Verify trigger words are natural
- Ensure images are attached
- Test microphone (speak a few words)

**Step 2: Switch to Present Mode**
- Click "Present" button
- Presenter view loads
- Section 1 displays
- Status shows "⏸️ PAUSED" and "⚫ Disconnected"

**Step 3: Start Voice Control**
- Click "Start Listening" button
- Browser requests microphone permission (if first time)
- Click "Allow"
- Status changes to "🟢 Connected" and "▶️ STREAMING"
- Transcript ticker starts showing interim results

**Step 4: Begin Presentation**
- **Slide 1**: "Good morning everyone. Today I want to talk about **microservices architecture**."
  - Trigger "architecture" detected
  - Slide advances to Section 2

- **Slide 2**: "Let's start with the problem. You have a **monolithic** application..."
  - Trigger "monolithic" detected
  - Slide advances to Section 3

- **Slide 3**: "Enter **microservices**. Break your application into small services..."
  - Trigger "microservices" detected
  - Slide advances to Section 4

**Step 5: Handle Questions**
- Audience asks: "Can you go back to the problem slide?"
- You say: "Sure, let's go **back** to that."
- "back" trigger detected (always active)
- Slide returns to Section 2

**Step 6: Natural Variation**
- **Slide 4**: "But here's the **complexity** you need to understand..."
  - Alternative trigger used instead of primary
  - Still advances correctly

**Step 7: Complete Presentation**
- Continue through all sections
- Each trigger word naturally embedded in speech
- No awkward pauses or forced phrasing
- Maintain eye contact throughout

**Step 8: Q&A Time**
- Click "Stop Listening" to pause voice control
- Use manual navigation if needed
- Or keep voice control active for "back" commands

**Total Delivery Time**: 20 minutes, 100% hands-free

---

### Audience View

#### Opening Audience View

**Two Methods**:

**Method 1**: Separate Monitor/Device
1. Open a second browser window/tab
2. Navigate to `/audience` route
3. Full-screen the window (F11)
4. Position on audience-facing screen

**Method 2**: Share Screen
1. Stay in presenter view
2. Use screen sharing in Zoom/Teams/Meet
3. Share the presenter view window
4. Audience sees your slides

#### Audience View Features

**Clean Interface**:
- No controls visible
- No trigger words shown
- No transcript ticker
- Just slide content and images

**50/50 Layout**:
- Image on left (if present)
- Text content on right
- Responsive to screen size

**Synchronization**:
- Connected to presenter view via BroadcastChannel
- Updates automatically when presenter advances
- No manual syncing needed
- Works even offline (same-origin only)

**Initial State**:
- On load, audience view sends "request-state" message
- Presenter view responds with current section
- Audience view jumps to correct position
- Seamless join mid-presentation

#### Dual-Monitor Setup Guide

**Recommended Configuration**:

**Monitor 1** (Facing You): Presenter View
- Shows trigger words
- Shows transcript
- Shows controls
- Your reference screen

**Monitor 2** (Facing Audience): Audience View
- Clean slide display
- No distractions
- Full-screen mode
- Professional appearance

**Setup Steps**:

1. **Connect Second Monitor**
   - Extend display (not mirror)
   - Position to the right or above

2. **Open Presenter View**
   - Main browser window on Monitor 1
   - Switch to Present mode
   - Start Listening

3. **Open Audience View**
   - New browser window/tab
   - Navigate to [http://localhost:5173/audience](http://localhost:5173/audience) (or your production URL)
   - Drag window to Monitor 2
   - Press F11 for full-screen

4. **Test Synchronization**
   - Advance a slide in presenter view
   - Verify audience view updates
   - Test "back" command
   - Confirm all sections sync

5. **Begin Presentation**
   - Look at audience (Monitor 2)
   - Glance at presenter view as needed (Monitor 1)
   - Speak naturally, let triggers advance

**Troubleshooting Sync Issues**:
- Refresh audience view
- Check both views are same origin (same domain)
- Verify BroadcastChannel API is supported (all modern browsers)
- Check browser console for errors

---

## Q&A Features with Personality Tones

VerbaDeck's Q&A system helps you respond to audience questions intelligently, with AI-generated answers in your chosen personality tone.

### When to Use Q&A Features

**Perfect For**:
- Post-presentation Q&A sessions
- Interactive workshops
- Live panel discussions
- Training sessions with questions

**How It Works**:
1. Audience asks a question
2. You type (or dictate) the question into VerbaDeck
3. AI analyzes your presentation content + knowledge base
4. AI generates 2 answer options in your chosen tone
5. You select an answer or use it as talking points

### Q&A Interface

#### Accessing Q&A Mode

**During Presentation**:
1. In presenter view, look for Q&A panel
2. Click "Answer Question" button
3. Q&A interface appears (may be a modal or side panel)

**Components**:
- Question input field
- Tone selector (same 8 tones as Create from Scratch)
- Knowledge base reference (if added)
- "Generate Answers" button
- Answer display area

#### Entering Questions

**Three Methods**:

**Method 1**: Type Manually
- Click in question field
- Type audience's question verbatim
- Click "Generate Answers"

**Method 2**: Voice Dictation (if available)
- Click microphone icon in question field
- Speak the question
- Text appears automatically
- Click "Generate Answers"

**Method 3**: Pre-defined Questions
- If you added FAQs to knowledge base
- Select from dropdown
- Auto-fills question field

#### Selecting Your Tone

**Purpose**: Match your response style to the context

**Tone Selector Interface**:
- Same 8 tones as Create from Scratch
- Click to select
- Selection highlights in blue
- Affects AI answer generation

**Tone Strategy by Context**:

**Formal Q&A (Conferences, Corporate)**
- Use: 💼 **Professional**
- Why: Credible, authoritative answers

**Technical Q&A (Developer Meetups, Workshops)**
- Use: 🔬 **Technical Expert**
- Why: Precise, data-driven responses

**Interactive Q&A (Training, Workshops)**
- Use: 💬 **Conversational**
- Why: Approachable, easy to understand

**Challenging Questions**
- Use: 🧠 **Deeply Insightful**
- Why: Reveals deeper thinking

**Difficult/Tricky Questions**
- Use: 😏 **Sarcastic & Sharp** (use carefully!)
- Why: Defuses tension with humor

**Pricing/Sales Questions**
- Use: ✨ **Witty & Engaging**
- Why: Memorable, positive framing

#### Generating Answers

**What Happens When You Click "Generate Answers"**:

1. **Context Analysis**
   - AI reads your entire presentation content
   - Checks your knowledge base (if added)
   - Understands the question context

2. **AI Processing (5-15 seconds)**
   - Uses selected tone persona
   - Generates 2 distinct answer options
   - Each answer is complete and standalone

3. **Result Display**
   - **Option A**: First answer approach
   - **Option B**: Alternative answer approach
   - Both use the same tone
   - Both are factually based on your content

#### Using Generated Answers

**Three Ways to Use**:

**Method 1**: Read Verbatim
- Select one answer
- Read it word-for-word
- Best for: High-pressure situations, critical accuracy

**Method 2**: Use as Talking Points
- Scan both answers
- Extract key points
- Speak naturally using those points
- Best for: Conversational Q&A, workshops

**Method 3**: Combine and Adapt
- Take elements from both answers
- Add your own insights
- Personalize the response
- Best for: Interactive sessions, panel discussions

**Copy to Clipboard**:
- Click copy icon next to answer
- Paste into notes or follow-up emails
- Share with audience after presentation

### Tone Examples in Q&A

**Question**: "How much does your product cost?"

**💼 Professional Tone**:
```
Our pricing is structured in three tiers to accommodate different organizational needs.
The Starter plan begins at $99/month for teams up to 10 users, our Professional plan
at $299/month includes advanced features and scales to 50 users, and our Enterprise
plan offers custom pricing with unlimited users and dedicated support. I can provide
a detailed pricing sheet after this session, or we can schedule a call to discuss
which tier aligns best with your requirements.
```

**✨ Witty & Engaging Tone**:
```
Ah, the question that's really asking "can we afford this?" - I appreciate the directness!
We start at $99/month, which is roughly the cost of one fancy team lunch. But unlike
lunch, this actually compounds in value. We have three tiers - think "coffee shop,"
"nice restaurant," and "let's get the CEO involved." The real answer is: it depends
on how much inefficiency is currently costing you. Spoiler alert: probably more than
our software.
```

**🔬 Technical Expert Tone**:
```
Pricing follows a per-user, per-month SaaS model with three tiers: $99/month (1-10 users,
core features, 99.9% SLA), $299/month (11-50 users, API access, 99.95% SLA, advanced
analytics), and Enterprise (50+ users, custom integration, 99.99% SLA, dedicated
infrastructure). Volume discounts apply above 100 users. Annual prepayment yields
15% discount. All prices are USD, billed monthly, with 14-day money-back guarantee.
ROI typically achieved in 3-6 months based on efficiency gains.
```

**😏 Sarcastic & Sharp Tone**:
```
Oh good, we're skipping straight to money - I respect that. It's $99/month to start,
which I realize sounds expensive until you calculate how much your team currently
wastes on manual processes. Think of it as "therapy for your workflow" - except
unlike therapy, it actually works immediately. We also have bigger plans for teams
who enjoy throwing money at problems that deserve it. But seriously, the pricing
page has all the details, and we don't do the annoying "contact sales" thing unless
you're enterprise-level and genuinely need custom infrastructure.
```

**Notice**:
- Same factual information
- Completely different delivery
- Tone appropriate for different contexts
- All maintain professionalism (even sarcastic)

### Knowledge Base (FAQs)

**Purpose**: Pre-load common questions and answers for AI to reference

#### Adding to Knowledge Base

**When to Use**:
- Before presenting
- You know common questions
- You want consistent answers

**How to Add**:
1. In Edit Sections view, find Knowledge Base panel
2. Click "Add FAQ"
3. Enter question
4. Enter your preferred answer
5. Save

**What AI Does With It**:
- References your answers when generating responses
- Ensures consistency with your messaging
- Combines your FAQs with presentation content
- Adapts your answer to selected tone

#### Example Knowledge Base

```markdown
**Q: Do you offer a free trial?**
A: Yes, 14-day free trial, no credit card required. Full feature access.

**Q: What integrations do you support?**
A: Slack, Teams, Salesforce, HubSpot, 5,000+ via Zapier. API for custom integrations.

**Q: What about data security?**
A: SOC 2 Type II certified, GDPR compliant, data encrypted at rest and in transit.

**Q: Can we self-host?**
A: Enterprise plan includes self-hosted option. Requires infrastructure meeting our specs.
```

**Benefits**:
- Consistent messaging
- Faster AI response time
- Factually accurate answers
- Your voice, enhanced by AI

---

## Advanced Features

### Script Editor (Rich Section Editor)

After AI processes your content (from scratch or existing), you can refine every detail.

#### Editing Section Content

**How to Access**:
- Click "Edit Sections" tab
- All sections display in sequence

**Editing Features**:

**1. Content Editing**
- Click on any section text
- Inline editing (or dedicated editor)
- Supports rich text formatting (if enabled)
- Auto-saves on blur

**2. Trigger Word Management**
- **Primary Trigger**: Always displayed, always active
- **Alternative Triggers**: Toggle on/off individually
- **Add Custom Trigger**: Click "+ Add Trigger"
- **Remove Trigger**: Click "X" next to trigger

**Visual Indicators**:
- Active triggers: Blue highlight
- Inactive triggers: Gray, strikethrough
- Primary trigger: Bold, cannot disable

**3. Image Management**
- Click "Add Image" or "Change Image"
- Upload from computer
- Or paste URL
- Image preview updates immediately

**4. Reordering Sections**
- Drag-and-drop sections (if UI supports)
- Or use up/down arrow buttons
- Section numbers update automatically

**5. Deleting Sections**
- Click delete button (trash icon)
- Confirm deletion
- Section removed permanently

**6. Adding New Sections**
- Click "+ Add Section" between existing sections
- Enter content manually
- Set trigger word
- Add image (optional)

#### Testing Your Edits

**After Editing**:
1. Switch to Present mode
2. Start Listening
3. Deliver a few sections
4. Verify triggers work naturally
5. Return to Edit mode if adjustments needed

**Iterative Refinement**:
- Test → Edit → Test → Edit
- Fine-tune trigger words for natural speech
- Adjust section length for pacing
- Optimize trigger word placement

### Transition Effects

**Visual Transitions**:
- Smooth slide-in animations
- Flash effect on section change
- Fade transitions for images
- Configurable in settings (if available)

**Why Transitions Matter**:
- Visual confirmation of advancement
- Professional appearance
- Helps audience follow along
- Reduces jarring jumps

### Responsive Design

**Mobile Support**:
- Full functionality on tablets
- Simplified interface on phones
- Touch-optimized controls
- Portrait and landscape modes

**Desktop Optimization**:
- Large readable text
- Efficient use of screen space
- Keyboard shortcuts enabled
- Multi-monitor support

**Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1280px

---

## Use Cases & Examples

### Use Case 1: Conference Keynote

**Scenario**: 30-minute keynote at a tech conference about AI ethics

**Workflow**:
1. **Create from Scratch**
2. **Description**:
   ```
   Keynote about AI ethics for a tech conference. Audience: Software engineers,
   CTOs, product managers. Cover: current state of AI ethics, real-world
   failures, ethical frameworks, practical implementation strategies, and a
   call to action. Should be thought-provoking and actionable.
   ```
3. **Tone**: 🔥 Bold & Provocative
4. **Slides**: 15
5. **Audience**: Technical/Expert
6. **Images**: AI-Generated Prompts
7. **Generate**: 60 seconds
8. **Refine**: Edit trigger words, add personal anecdotes
9. **Present**: Hands-free delivery with natural trigger words

**Result**: Memorable, hands-free keynote with seamless slide transitions

---

### Use Case 2: Sales Pitch

**Scenario**: 15-minute pitch to investors for Series A funding

**Workflow**:
1. **Process Existing Content** → Paste Text
2. **Paste**: Existing pitch script from Google Docs
3. **Model**: Claude 3.5 Sonnet (best quality for high-stakes pitch)
4. **Preserve Wording**: ✅ Checked (every word carefully chosen)
5. **Process**: 45 seconds
6. **Review**: 8 sections generated
7. **Edit**: Fine-tune trigger words to match natural emphasis
8. **Knowledge Base**: Add FAQs about financials, competition, roadmap
9. **Present**: Hands-free, maintain eye contact with investors throughout
10. **Q&A**: Use Professional tone for answers

**Result**: Confident, polished pitch with perfect eye contact. No clicker fumbling.

---

### Use Case 3: Internal Team Training

**Scenario**: 1-hour training workshop on new company policies

**Workflow**:
1. **Upload PowerPoint** (existing training deck)
2. **Extract**: 20 slides converted to VerbaDeck sections
3. **Edit**: Add trigger words manually (original PPT had none)
4. **Knowledge Base**: Add 10 common policy questions
5. **Present**: Conversational tone throughout
6. **Q&A**: Use Conversational tone for approachable answers
7. **Audience View**: Projected on conference room screen

**Result**: Interactive training with seamless Q&A, all hands-free

---

### Use Case 4: Academic Lecture

**Scenario**: 50-minute university lecture on machine learning

**Workflow**:
1. **Create from Scratch**
2. **Description**:
   ```
   University lecture on supervised learning algorithms for CS undergraduates.
   Cover: linear regression, logistic regression, decision trees, random forests,
   and neural networks. Include mathematical foundations, Python code examples,
   and real-world applications.
   ```
3. **Tone**: 🔬 Technical Expert
4. **Slides**: 18
5. **Audience**: Students/Academic
6. **Images**: Manual Upload (own diagrams and code screenshots)
7. **Generate**: 60 seconds
8. **Edit**: Add mathematical formulas, code snippets
9. **Present**: Technical terminology as trigger words
10. **Q&A**: Use Deeply Insightful tone to expand on concepts

**Result**: Comprehensive lecture with technical depth, hands-free delivery

---

### Use Case 5: Product Demo

**Scenario**: 20-minute product demo at trade show booth

**Workflow**:
1. **Generate from Images** (screenshots of product)
2. **Upload**: 12 product screenshots
3. **AI Analysis**: Generates scripts based on UI elements
4. **Edit**: Refine scripts to match actual demo flow
5. **Tone**: ✨ Witty & Engaging (trade show energy)
6. **Present**: Voice control while physically demoing product
7. **Slides Advance**: Automatically as you talk through features

**Result**: Engaging demo with synchronized slides, no manual advancing

---

## Troubleshooting

### Microphone Issues

**Problem**: "Microphone not working"

**Solutions**:
1. Check browser permissions (click padlock in address bar)
2. Ensure microphone is not muted at OS level
3. Try different browser (Chrome recommended)
4. Check microphone is selected in OS settings
5. Restart browser

**Problem**: "Audio detected but no transcription"

**Solutions**:
1. Check internet connection (transcription requires online API)
2. Verify AssemblyAI API key is configured (server-side)
3. Check browser console for WebSocket errors
4. Ensure firewall allows WebSocket connections

---

### Trigger Word Detection Issues

**Problem**: "Trigger words not detected"

**Solutions**:
1. Speak clearly and at normal volume
2. Say the trigger word distinctly (not mumbled)
3. Check trigger word is not too similar to common words
4. Try alternative trigger words for that section
5. Lower background noise

**Problem**: "Slides advancing too quickly"

**Cause**: 2-second debounce may not be enough if you repeat words

**Solutions**:
1. Avoid repeating trigger words within 2 seconds
2. Use more unique trigger words (not "the", "and", etc.)
3. Increase debounce time (if configurable)

**Problem**: "Slides not advancing at all"

**Solutions**:
1. Verify you're saying the exact trigger word (or plural)
2. Check transcript ticker to see what system hears
3. Ensure voice control is active (status shows "▶️ STREAMING")
4. Try saying trigger word in isolation to test

---

### AI Processing Issues

**Problem**: "Processing takes too long"

**Typical Times**:
- Short script (< 1000 words): 20-40 seconds
- Medium script (1000-3000 words): 40-60 seconds
- Long script (> 3000 words): 60-90 seconds

**If Longer**:
1. Check internet connection speed
2. Try different AI model (Haiku is faster)
3. Reduce script length
4. Server may be experiencing high load

**Problem**: "Processing fails with error"

**Solutions**:
1. Check script length (max 50,000 characters)
2. Verify API key is valid (server-side)
3. Try different AI model
4. Check browser console for specific error
5. Refresh page and try again

---

### Synchronization Issues (Dual-Monitor)

**Problem**: "Audience view not updating"

**Solutions**:
1. Refresh audience view tab
2. Verify both views are same origin (same domain/port)
3. Check browser supports BroadcastChannel API (all modern browsers do)
4. Check browser console in both views for errors
5. Ensure both tabs are visible (not minimized)

**Problem**: "Audience view starts at wrong section"

**Cause**: Audience view joined mid-presentation

**Solutions**:
1. Refresh audience view - it will request current state
2. Manually navigate presenter view to sync
3. Restart presentation from beginning

---

### General Issues

**Problem**: "VerbaDeck is slow or laggy"

**Solutions**:
1. Close other browser tabs
2. Restart browser
3. Clear browser cache
4. Check computer resources (CPU, RAM)
5. Try different browser

**Problem**: "Lost my work"

**Prevention**:
- VerbaDeck auto-saves to localStorage
- Edits saved automatically on blur
- Use same browser and device

**Recovery**:
- Refresh page - content should restore
- Check browser localStorage in DevTools
- Re-process script if needed (usually fast second time)

---

## Appendix: Keyboard Shortcuts

**Presenter Mode**:
- `←` Left Arrow: Previous section
- `→` Right Arrow: Next section
- `Space`: Start/Stop Listening
- `P`: Toggle Pause/Play
- `Esc`: Exit full-screen

**Editor Mode**:
- `Ctrl/Cmd + S`: Save changes (if manual save)
- `Ctrl/Cmd + Z`: Undo (text editing)
- `Ctrl/Cmd + Y`: Redo (text editing)

---

## Appendix: Technical Details

### Voice Control Architecture

**Audio Path**:
1. Browser MediaDevices API captures microphone
2. AudioContext processes audio stream
3. AudioWorklet converts Float32 → PCM16 at 16kHz mono
4. WebSocket sends binary audio to Node.js server
5. Server proxies to AssemblyAI streaming API v3
6. AssemblyAI returns transcript events
7. VerbaDeck matches transcripts against trigger patterns

**Transcription**:
- Provider: AssemblyAI Universal-Streaming v3
- Sample Rate: 16kHz
- Format: PCM16LE
- Latency: 300-800ms typical

**Trigger Detection**:
- Normalization: `toLowerCase()` + strip non-alphanumeric
- Pattern: `/\b${token}(s|es|ies)?\b/i`
- Debounce: 2000ms between navigations
- Priority: BACK commands checked first

---

## Appendix: Supported Browsers

**Recommended**:
- Chrome 90+ ✅ (Best support)
- Edge 90+ ✅ (Chromium-based)

**Supported**:
- Firefox 88+ ⚠️ (Some MediaDevices quirks)
- Safari 14+ ⚠️ (Requires HTTPS for microphone)

**Not Supported**:
- Internet Explorer ❌
- Opera Mini ❌ (No WebSocket support)

---

## Appendix: Privacy & Data

**What's Recorded**:
- Audio transcription only (not audio files)
- Text content you create
- Trigger word configurations

**What's NOT Recorded**:
- Raw audio files (processed in real-time, then discarded)
- Personal information (unless you include it in scripts)

**Where Data Goes**:
- Audio: Streamed to AssemblyAI (GDPR compliant, see their policy)
- Scripts: Sent to OpenRouter for AI processing
- Local Storage: Browser localStorage for auto-save

**Your Controls**:
- Stop Listening: Immediately stops audio capture
- Clear Local Storage: Deletes saved presentations
- Use self-hosted option (if available) for full data control

---

## Support & Resources

**Getting Help**:
- GitHub Issues: [https://github.com/your-repo/verbadeck/issues](https://github.com/your-repo/verbadeck/issues)
- Discord Community: [Link if available]
- Email Support: [support@verbadeck.com](mailto:support@verbadeck.com)

**Additional Resources**:
- Video Tutorials: [YouTube channel link]
- Sample Presentations: [Example gallery link]
- API Documentation: [For developers]

**Feature Requests**:
- Submit on GitHub Issues with "enhancement" label
- Vote on existing feature requests
- Join discussion in community forums

---

**End of User Guide**

*Thank you for using VerbaDeck! We're excited to revolutionize how you present.*

**Version 2.0** | © 2025 VerbaDeck | [Website](https://verbadeck.com) | [GitHub](https://github.com/your-repo/verbadeck)
