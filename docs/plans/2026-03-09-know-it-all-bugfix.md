# Know It All Mode Bugfix Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 5 bugs in the Know It All Mode commit (0346607) - tone not passed, stale closures, missing deps, tone mapping mismatch

**Architecture:** Fix client-side React hook bugs in KnowItAllWall.tsx, add tone param to useOpenRouter hook, and fix server-side tone mapping to use existing TONE_PERSONAS constant

**Tech Stack:** React, TypeScript, Node.js/Express, Playwright

---

### Task 1: Fix server-side tone mapping (use TONE_PERSONAS instead of hardcoded subset)

**Files:**
- Modify: `server/openrouter.js:809-816`

**Step 1: Replace hardcoded toneDescriptions with TONE_PERSONAS import**

The method `answerQuestionWithKeywords` has a hardcoded map of only 5 tones but the client offers 9. The `TONE_PERSONAS` constant in `constants.js` already has all 9. Replace the inline map with the imported constant.

Replace lines 809-818:
```javascript
    // Use TONE_PERSONAS from constants (has all 9 tones)
    const tonePersona = TONE_PERSONAS[tone] || TONE_PERSONAS.professional;
```

Then update the prompt to use `tonePersona` instead of `toneDesc`:
- Line 827: `**Tone:** ${tonePersona}`
- Line 829: Remove the `Use a ${toneDesc} tone throughout all answers.` since the persona already covers it

**Step 2: Verify TONE_PERSONAS is already imported at top of file**

Check line 4: `import { TONE_PERSONAS } from './constants.js';` - already present.

---

### Task 2: Fix useOpenRouter.answerQuestionWithKeywords to accept and pass tone

**Files:**
- Modify: `client/src/hooks/useOpenRouter.ts:191-209`

**Step 1: Add tone parameter to function signature**

```typescript
const answerQuestionWithKeywords = async (
  question: string,
  knowledgeBase: string,
  model?: string,
  tone?: string  // ADD THIS
): Promise<{ answer1: AnswerResponse; answer2: AnswerResponse }> => {
```

**Step 2: Pass tone in request body**

```typescript
body: JSON.stringify({ question, knowledgeBase, model, tone }),
```

---

### Task 3: Fix useQASession to pass tone through answerQuestionWithKeywords

**Files:**
- Modify: `client/src/hooks/useQASession.ts:56`

**Step 1: Pass selectedTone to answerQuestionWithKeywords call**

```typescript
answers = await answerQuestionWithKeywords(
  question,
  knowledgeBaseText,
  qaModel,
  selectedTone  // ADD THIS - was missing, always defaulted to 'professional'
);
```

---

### Task 4: Fix missing selectedTone in useEffect dependency array (KnowItAllWall.tsx:275)

**Files:**
- Modify: `client/src/components/KnowItAllWall.tsx:275`

**Step 1: Add selectedTone to deps**

```typescript
}, [detectedQuestion, knowledgeBase, selectedModel, selectedTone, onQuestionsChange]);
```

---

### Task 5: Fix stale closure in onQuestionsChange (KnowItAllWall.tsx:205)

**Files:**
- Modify: `client/src/components/KnowItAllWall.tsx:205`

**Step 1: Use updater function instead of direct value**

Replace:
```typescript
onQuestionsChange([...questions, newCard]);
```

With:
```typescript
onQuestionsChange((prev: QuestionCard[]) => [...prev, newCard]);
```

---

### Task 6: Fix hardcoded count mismatch in trigger words reference

**Files:**
- Modify: `client/src/components/KnowItAllWall.tsx:669-703`

**Step 1: Correct the counts**

- Line 669: Change `(68 phrases)` to actual count
- Line 697: "Verb Starters" lists 16 items in text but header says "(18)" - fix either text or count
- Line 702: "Command Starters" lists 17 items but header says "(16)" - fix to "(17)"

Count the actual items in the arrays (lines 114-136) and match the reference section.

---

### Task 7: Write Playwright tests and run headless

**Files:**
- Create: `tests/know-it-all-bugfix.spec.ts`

Tests to write:
1. Know It All page loads with tone selector visible
2. Tone selector shows all 9 tone options
3. Default tone is "professional"
4. Manual question input is available and submittable
5. Start Session button is disabled without knowledge base
6. Start Session button enabled with knowledge base content
7. Preset loading populates knowledge base

---

### Task 8: Run tests headed, take screenshots, examine UI

Run full headed test suite on the Know It All page, take screenshots of:
- Home page (3-card layout)
- Know It All setup page (with tone selector)
- Know It All active session (if possible)
- Presenter view
- Any visual issues found
