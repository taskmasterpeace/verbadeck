# VerbaDeck Quick Commands Reference

## Voice Commands (While Streaming)

### Control Commands
- **"activate verbadeck"** - Arms the system (enables auto-advance)
- **"pause verbadeck"** - Pauses advancement (transcription continues)

### Keyboard Shortcuts
- **P** - Toggle between Armed/Paused

## Default Behavior

- **Starts ARMED** - Ready to advance immediately when streaming starts
- **Always Listening** - Transcription runs continuously regardless of Armed/Paused state
- **Only Armed Mode Advances** - Sections only advance when Armed

## How It Works

1. **Start Listening** (click button)
2. System starts **ARMED** automatically
3. Speak your script naturally
4. When you say a **trigger word**, section advances
5. Say **"pause verbadeck"** if you need to pause
6. Say **"activate verbadeck"** to resume
7. Press **P key** anytime to toggle

## Voice Recognition Tips

### Good Wake/Stop Words (Easy for AI to recognize)
- ✅ "activate verbadeck" - Clear pronunciation
- ✅ "pause verbadeck" - Simple and distinct
- ✅ "resume presenting" - Alternative activation
- ✅ "stop advancing" - Alternative pause

### Avoid These (Hard to recognize)
- ❌ "majin twin" - Unusual spelling, inconsistent recognition
- ❌ Short phrases (too easily triggered accidentally)
- ❌ Common words like "next", "go", "stop" alone

## Customizing Commands

1. Edit wake/stop words in the status bar inputs
2. Use clear, 2-3 word phrases
3. Include distinctive words (like "verbadeck")
4. Test with "Start Listening" before your presentation

## Visual Indicators

### Status Bar (Top)
- **🟢 ARMED** - Green badge, system will advance on triggers
- **⏸️ PAUSED** - Gray badge, system won't advance

### Floating Indicator (Bottom Right)
- **ARMED - Listening** - Pulsing green badge
- **PAUSED - Not Advancing** - Yellow/gray badge

### Current Trigger (Section Display)
- Shows at top right: `Trigger: "word"`
- Multiple triggers shown in debug panel

## Troubleshooting

### "I said the wake word but nothing happened"

**Solutions:**
1. Check if streaming is active (green "Connected" indicator)
2. Try saying it more clearly: "activate verb-a-deck"
3. Check transcript ticker to see what was heard
4. Try pressing **P key** instead
5. Make sure you're not muted

### "System keeps advancing accidentally"

**Solutions:**
1. Say "pause verbadeck" to pause
2. Press **P key** to pause
3. Choose more specific trigger words in editor
4. Avoid common words as triggers

### "Wake word not recognized consistently"

**Better alternatives:**
- "start advancing"
- "activate system"
- "resume presentation"
- "enable auto advance"

Edit these in the status bar before starting!

## Best Practices

1. **Test First**: Try your wake/stop words before the real presentation
2. **Clear Phrases**: Use 2-3 word phrases, not single words
3. **Distinctive**: Include your app name or a unique word
4. **Avoid Overlap**: Don't use words that appear in your script content
5. **Practice**: Say them a few times to get comfortable

## Current Default Settings

```
Wake Word: "activate verbadeck"
Stop Word: "pause verbadeck"
Initial Mode: ARMED (ready immediately)
Keyboard: P key to toggle
```

**You can change these anytime in the Status Bar at the top!**
