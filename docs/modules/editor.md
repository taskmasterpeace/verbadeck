# Editor Module

## Overview
Three-tab editor for presentation sections: Edit Content & Triggers, Knowledge Base (Q&A anticipation + FAQs), and Test Triggers.

## Files
| File | Lines | Purpose |
|------|-------|---------|
| `client/src/pages/EditorPage.tsx` | ~120 | Tab container, receives 22 props |
| `client/src/components/editor/EditorWorkspace.tsx` | ~300 | Section list + drag-and-drop |
| `client/src/components/editor/SectionEditor.tsx` | 316 | Single section editor |
| `client/src/components/editor/PropertiesPanel.tsx` | 342 | Section properties sidebar |
| `client/src/components/RichSectionEditor.tsx` | 181 | Tiptap rich text editor |
| `client/src/components/KnowledgeBaseEditor.tsx` | ~320 | FAQ management + Q&A anticipation toggle |
| `client/src/components/QAAnticipationPanel.tsx` | ~450 | Predict + prepare audience questions |
| `client/src/components/TriggerTestingMode.tsx` | 213 | Manual trigger testing |
| `client/src/components/ImageRecommendationDialog.tsx` | 335 | Image search/generation dialog |

## Tab System
1. **Edit Content & Triggers** - Drag-and-drop section reorder, inline editing
2. **Knowledge Base** - FAQ pairs + Q&A Anticipation panel
3. **Test Triggers** - Simulate voice input to test trigger matching

## Knowledge Base Tab
- "Anticipate Questions" button toggles QAAnticipationPanel
- "Auto-Generate FAQs" calls POST /api/generate-faqs
- "+ Add FAQ" opens inline form
- FAQ answers are stripped of markdown for display (stripMarkdown function)
- Each FAQ entry shows QUESTION: and ANSWER: labels

## Q&A Anticipation (QAAnticipationPanel)
- Calls POST /api/anticipate-questions with sections + knowledgeBase
- Returns predicted questions with: likelihood %, category, reasoning, slideReference
- Categories: ROI, Risk, Implementation, Proof, Alternative
- "Prepare Answer" generates short + detailed answers per question
- "Save to Both" adds detailed to KB + short to speaker notes
- Header is clean gray/blue (was previously loud purple)

## Section Editor Features
- Heading, content, speaker notes (Tiptap rich text)
- Trigger word selection (primary + alternatives)
- Image selection (upload, AI generate, stock photo search)
- Layout selection (text-only, image-left, image-right, full-image)
- Drag handle for reordering

## Known Issues
- EditorPage receives 22 props (should use Zustand directly)
- Editor shows blank when no presentation loaded (no empty state)
- No undo/redo for section edits
- Rich text editor (Tiptap) has no toolbar customization

## Connections
- **Reads from**: usePresentationStore (sections, knowledgeBase, editorTab)
- **Writes to**: usePresentationStore (updateSection, deleteSection, setKnowledgeBase)
- **API calls**: /api/generate-faqs, /api/anticipate-questions, /api/generate-qa-answer
- **Used by**: App.tsx (renders when viewMode === 'editor')
