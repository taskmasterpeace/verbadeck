# Section Marker Title Extraction - Implementation Update

## Problem
When users provide content with explicit section markers like:
```
SECTION 1: OPENING HOOK (15 seconds)
Content goes here...
```

The title generation system was not properly extracting just "Opening Hook". Instead, it was either:
- Including the full marker with "SECTION 1:" prefix and "(15 seconds)" timing
- Generating a new title instead of extracting the existing one

## Solution
Updated the `generateTitles` prompt in `server/prompts.js` to:

1. **Prioritize SECTION marker extraction** at the top of the extraction logic
2. **Add specific pattern matching** for `"SECTION [NUMBER]: [TITLE] ([time])"`
3. **Include explicit cleanup instructions** to remove prefixes and timing
4. **Provide concrete examples** showing the exact extraction pattern
5. **Add multiple safeguards** with "NEVER include" warnings

## Changes Made

### File: `server/prompts.js` (lines 654-717)

#### Key Updates:

**1. SECTION MARKER Detection (lines 665-666):**
```javascript
- **SECTION MARKERS**: Lines like "SECTION 1: OPENING HOOK (15 seconds)" → extract "Opening Hook"
- **PATTERN**: "SECTION [NUMBER]: [TITLE] ([time])" → extract only the [TITLE] part
```

**2. Cleanup Instructions (lines 675-676):**
```javascript
- Remove "SECTION X:" prefix
- Remove time markers like "(15 seconds)", "(20 seconds)"
```

**3. Concrete Examples (lines 693-701):**
```javascript
EXAMPLES:
Input: "SECTION 1: OPENING HOOK (15 seconds)\nAI can write your emails..."
Output: "Opening Hook"

Input: "SECTION 2: THE PROBLEM (20 seconds)\nThink about your last meeting..."
Output: "The Problem"
```

**4. Multiple Safeguards (lines 690-691, 715):**
```javascript
- NEVER include "Section X:" in the output
- NEVER include timing like "(15 seconds)"
```

**5. Increased Extraction Priority:**
Changed from 80% to 90% preference for extraction over generation (line 711)

## How It Works

### Data Flow:
1. User pastes content with `SECTION 1: OPENING HOOK (15 seconds)\n[content]`
2. `/api/process-script` endpoint processes text into sections
3. Client receives sections and calls `generateTitles()` in `App.tsx:505`
4. `/api/generate-titles` endpoint uses updated prompt
5. AI extracts "Opening Hook" from the section content
6. Title is applied to section as `heading` property
7. Sections display with clean titles in Editor and Presenter views

### Expected Results:
- Input: `"SECTION 1: OPENING HOOK (15 seconds)"`
- Output: `"Opening Hook"`

- Input: `"SECTION 7: USE CASES (20 seconds)"`
- Output: `"Use Cases"`

## Testing

Created `tests/section-marker-extraction.spec.ts` to verify:
- ✅ Titles are extracted correctly
- ✅ No "SECTION X:" prefix in output
- ✅ No timing markers like "(15 seconds)" in output
- ✅ Proper Title Case formatting
- ✅ Works in both Editor and Presenter views

## Files Modified

1. **server/prompts.js** (lines 654-717) - Updated generateTitles prompt
2. **tests/section-marker-extraction.spec.ts** (NEW) - Test for verification

## Files Referenced (No Changes):
- `server/openrouter.js:822` - Already uses `getPrompt('generateTitles', sections)`
- `server/server.js:425-444` - `/api/generate-titles` endpoint
- `client/src/hooks/useOpenRouter.ts:198-225` - Client-side API call
- `client/src/App.tsx:487-519` - Auto-generation after sections created

## User Test Case

The user provided an 8-section presentation with this format:
```
SECTION 1: OPENING HOOK (15 seconds)
SECTION 2: THE PROBLEM (20 seconds)
SECTION 3: THE COST (20 seconds)
SECTION 4: THE EXISTING LANDSCAPE (15 seconds)
SECTION 5: WHAT WE DO (20 seconds)
SECTION 6: WHY IT MATTERS (15 seconds)
SECTION 7: USE CASES (20 seconds)
SECTION 8: THE CLOSE (20 seconds)
```

Expected extracted titles:
1. Opening Hook
2. The Problem
3. The Cost
4. The Existing Landscape
5. What We Do
6. Why It Matters
7. Use Cases
8. The Close

## Notes

- The prompt is now in the editable prompts system, so users can customize it
- Works with any format: "SECTION 1:", "SECTION 2:", etc.
- Handles various time formats: "(15 seconds)", "(20 seconds)", etc.
- Falls back to intelligent title generation if no markers found
- Title Case conversion ensures consistent formatting

## Next Steps

To verify the fix works:
1. Run the test: `npx playwright test section-marker-extraction.spec.ts --headed`
2. Or manually test by pasting the user's content into "Process Existing Content"
3. Check that titles in Editor and Presenter views are clean (no "SECTION X:" or timing)
