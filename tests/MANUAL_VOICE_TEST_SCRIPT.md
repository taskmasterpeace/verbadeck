# Know It All Wall - Manual Voice Test Script

## Setup (30 seconds)

1. Open browser to `http://localhost:5173`
2. Click **"Start Listening"** in top bar (microphone access will be requested)
3. Wait for green "Listening" indicator
4. Click **"Know It All Wall"** button (top right)

---

## Test 1: Empty State & Preset Loading (1 minute)

### Verify:
- ✅ "Quick Load Presets" dropdown visible
- ✅ Knowledge base textarea empty
- ✅ "0 characters" shown
- ✅ "Start Session" button visible

### Action:
1. Select **"📄 Resume - Robert Smith"** from dropdown
2. Click **"Load"** button
3. **Verify:** Character count changes from 0 to ~2000+ characters
4. **Verify:** Blue badge appears showing "Loaded: Resume - Robert Smith"

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 2: AI Session Setup with Voice (2 minutes)

### Action:
1. Click **"Start Session"** button
2. **Verify:** Progress bar appears showing "Setting up your session..."
3. **Verify:** "Analyzing your knowledge base..." message appears
4. Wait 3-5 seconds for AI analysis

### Expected AI Response:
- ✅ "Analysis Complete" message with blue background
- ✅ Document types shown: "Resume", "Job Description", etc.
- ✅ 2 context questions appear with radio buttons

### Say Out Loud (clearly):
**Question 1:** "What type of interview are you preparing for?"

**YOU SAY:** "Executive"
- Click the radio button for **"Executive/Leadership"**

**Question 2:** "What level of detail should I provide in answers?"

**YOU SAY:** "Detailed"
- Click the radio button for **"Detailed and comprehensive"**

### Action:
1. Click **"Continue"** button
2. **Verify:** "Processing your answers..." appears
3. Wait 2-3 seconds

### Expected Follow-up Question:
**Question 3:** "Should I emphasize technical depth or strategic vision?"

**YOU SAY:** "Balanced"
- Click the radio button for **"Balanced approach"**

### Action:
1. Click **"Start Session"** button (the second one, at bottom)
2. **Verify:** Session becomes active
3. **Verify:** Header changes to compact mode with:
   - 💬 "Know It All Wall" title
   - Total questions count: 0
   - Answered: 0
   - Pending: 0
   - Stop, Clear, JSON, MD buttons visible

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 3: Ask First Question with Voice (30 seconds)

### YOU SAY (clearly, end with "?"):
**"When will this product be available?"**

### Expected Response (5-10 seconds):
- ✅ Question card appears with your question as title
- ✅ Card shows "Generating answers..." with loading spinner
- ✅ After 5-10s, two answer options appear:
  - **Answer 1** with 2 highlighted keywords
  - **Answer 2** with 2 different highlighted keywords

### Example Keywords (will vary):
- Answer 1: [**launch**] [**quarter**]
- Answer 2: [**testing**] [**beta**]

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 4: Select Answer with Voice Keywords (1 minute)

### Look at the keywords in Answer 1
Let's say they are: [**launch**] [**quarter**]

### YOU SAY (one at a time, clearly):
**"launch"**

### Expected:
- ✅ The word "launch" gets a GREEN background
- ✅ Progress indicator shows "1/2 keywords"

### YOU SAY:
**"quarter"**

### Expected:
- ✅ The word "quarter" gets a GREEN background
- ✅ Progress shows "2/2 keywords"
- ✅ Card locks in with green border
- ✅ Full answer is displayed
- ✅ "Answered" count in header increases to 1

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 5: Test "Back" Command (30 seconds)

### YOU SAY (clearly):
**"back"**

### Expected:
- ✅ Question card resets to showing both answer options again
- ✅ Keywords no longer highlighted green
- ✅ "Answered" count decreases back to 0
- ✅ Card shows "Ready" status

### Now select Answer 2 keywords instead:
If Answer 2 keywords are: [**testing**] [**beta**]

**YOU SAY:** "testing"
**YOU SAY:** "beta"

### Expected:
- ✅ Answer 2 locks in this time
- ✅ Different answer content is shown
- ✅ "Answered" count goes back to 1

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 6: Ask Multiple Questions (2 minutes)

### YOU SAY (clearly, end with "?"):
**"How much will it cost?"**

### Wait for question card to appear and answers to generate

**YOU SAY:** (first two keywords you see in Answer 1)

### Expected:
- ✅ Second question card appears
- ✅ First question still visible above
- ✅ Header shows: Total: 2, Answered: 2

### YOU SAY:
**"What's the timeline for release?"**

### Wait and select answer with keywords

**YOU SAY:** (keywords from answer)

### Expected:
- ✅ Third question card
- ✅ Header shows: Total: 3, Answered: 3
- ✅ Questions are stacked vertically

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 7: Cancel Word Test (30 seconds)

### YOU SAY (clearly):
**"What features does it have?"**

### Wait for question to appear
### Before answering, YOU SAY:
**"cancel"**

### Expected:
- ✅ Question card is removed immediately
- ✅ Total question count decreases by 1
- ✅ Card disappears from the wall

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 8: Export Functionality (1 minute)

### Action:
1. Click **"JSON"** button in header
2. **Verify:** File downloads: `know-it-all-YYYY-MM-DD.json`
3. Open the JSON file
4. **Verify:** Contains:
   - `exportedAt` timestamp
   - `totalQuestions` count
   - `answeredQuestions` array with all your answered questions
   - Each question has: question text, answer details, bullets, full text

### Action:
1. Click **"MD"** button in header
2. **Verify:** File downloads: `know-it-all-YYYY-MM-DD.md`
3. Open the Markdown file
4. **Verify:** Formatted with:
   - Heading for each question
   - Answer heading in bold
   - Bullet points
   - Full answer text

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 9: Clear Questions Dialog (30 seconds)

### Action:
1. Click **"Clear"** button in header
2. **Verify:** Custom modal dialog appears (NOT browser confirm!)
   - Title: "Clear All Questions"
   - Message: "Clear all questions from this session? This cannot be undone."
   - Red "Confirm" button
   - Gray "Cancel" button
3. Click **"Confirm"**
4. **Verify:** All question cards disappear
5. **Verify:** Header shows: Total: 0, Answered: 0, Pending: 0

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 10: Stop Session (30 seconds)

### Action:
1. Click **"Stop"** button in header
2. **Verify:** Session ends
3. **Verify:** Returns to Knowledge Base input screen
4. **Verify:** Content still in textarea
5. **Verify:** Character count preserved

**STATUS:** ✅ PASS / ❌ FAIL

---

## Test 11: Modal Dialogs (No Browser Popups!) (1 minute)

### Test Save Preset Dialog:
1. Paste some text in knowledge base: "Test content for preset"
2. Click **"Save as Preset"**
3. **Verify:** Custom modal appears (NOT browser prompt!)
   - Input field for preset name
   - Placeholder text
   - Cancel and Submit buttons
4. Type: "My Test Preset"
5. Press Enter or click Submit
6. **Verify:** Success modal appears: "Preset Saved"
7. Click OK

### Test Clear Knowledge Base Dialog:
1. Click **"Clear"** button (next to knowledge base textarea)
2. **Verify:** Custom modal appears (NOT browser confirm!)
   - Red danger styling
   - "Clear Knowledge Base" title
   - Confirm/Cancel buttons
3. Click Confirm
4. **Verify:** Textarea is empty
5. **Verify:** "0 characters" shown

**STATUS:** ✅ PASS / ❌ FAIL

---

## Final Checklist

### Visual Verification:
- ✅ No 🧠 brain emoji anywhere (should be 💬 speech bubble)
- ✅ All modals are custom (no browser alert/confirm/prompt)
- ✅ Inline keyword highlighting works (green backgrounds)
- ✅ Question cards stack vertically
- ✅ Header stats update in real-time
- ✅ Transcript shows at bottom during voice input

### Voice Recognition Quality:
- ✅ Questions detected correctly (ending with "?")
- ✅ Keywords recognized accurately
- ✅ "back" command works
- ✅ "cancel" command works
- ✅ Multiple keywords in sequence work

### Performance:
- ✅ AI responses in 5-10 seconds
- ✅ No lag in keyword detection
- ✅ Smooth scrolling with multiple questions
- ✅ Export happens instantly

---

## Summary

**Total Tests:** 11
**Passed:** _____ / 11
**Failed:** _____ / 11

**Critical Issues Found:**
1.
2.
3.

**Minor Issues Found:**
1.
2.
3.

**Overall Status:** ✅ READY FOR PRODUCTION / ⚠️ NEEDS FIXES / ❌ MAJOR ISSUES

---

## Notes

Add any observations, issues, or feedback here:
