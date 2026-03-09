# VerbaDeck Quick Start Guide

## Option 1: Auto-Create Desktop Shortcut (Easiest!)

**Just double-click this file:**
```
create-shortcut.bat
```

This will:
- Create a "VerbaDeck" shortcut on your Desktop
- Add the custom VerbaDeck icon
- Set it to run minimized
- Auto-open your browser when started

**Done!** Now just double-click the VerbaDeck icon on your desktop whenever you want to use it.

---

## Option 2: Manual Shortcut Creation

1. Go to: `c:\git\verbadeck\`
2. Find: `start-verbadeck-with-browser.bat`
3. Right-click → "Send to" → "Desktop (create shortcut)"
4. (Optional) Right-click the desktop shortcut → Properties → Change Icon → Browse to `c:\git\verbadeck\client\public\icon.ico`

---

## Using VerbaDeck

### Starting VerbaDeck
- Double-click the desktop shortcut
- Wait 5-10 seconds
- Browser opens automatically to http://localhost:5173

### Stopping VerbaDeck
- Close the command window that opened
- Or press `Ctrl+C` twice in the window

---

## First Time Setup

If this is your first time running VerbaDeck, make sure you have:

1. **Node.js installed** (download from https://nodejs.org/)

2. **Dependencies installed:**
   - Open Command Prompt
   - Navigate to `c:\git\verbadeck`
   - Run: `npm install`

3. **API Keys configured:**
   - Create a `.env` file in `c:\git\verbadeck\`
   - Add your keys:
     ```
     AAI_API_KEY=your_assemblyai_key_here
     OPENROUTER_API_KEY=your_openrouter_key_here
     REPLICATE_API_KEY=your_replicate_key_here
     ```

---

## What Happens When You Launch?

1. **Server starts** (runs on port 3002)
2. **Client starts** (runs on port 5173)
3. **Browser opens** after 5 seconds
4. **You're ready to create presentations!**

---

## Three Ways to Create Presentations

When VerbaDeck opens, you'll see 3 options:

### 1. Create from Scratch
- Answer a few AI questions about your topic
- VerbaDeck generates the full presentation
- Perfect for quick presentations

### 2. Process Existing Content
- Paste your script or notes
- Upload PowerPoint files
- VerbaDeck converts it for voice control

### 3. Know It All Wall
- Practice Q&A with voice activation
- Great for interview prep or teaching

---

## Need Help?

See the complete user guide: `VERBADECK_USER_GUIDE.md`

---

## Troubleshooting

### Shortcut won't create
- Try running `create-shortcut.bat` as Administrator
- Right-click → "Run as administrator"

### npm is not recognized
- Install Node.js from https://nodejs.org/
- Restart your computer after installing

### Port already in use
- VerbaDeck is already running
- Close the existing command window first

### Browser doesn't open
- Wait a bit longer (can take 10-15 seconds first time)
- Manually go to: http://localhost:5173
