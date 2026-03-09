/**
 * VerbaDeck V2.0 - Zustand State Management
 *
 * Centralized state stores for the application:
 * - presentation: Core presentation data (sections, knowledge base, settings)
 * - voice: Voice streaming and transcript state
 * - ui: UI state (view modes, modals, loading states)
 * - qa: Q&A feature state
 */

export { usePresentationStore } from './usePresentationStore';
export { useVoiceStore } from './voice';
export { useUIStore } from './ui';
export { useQAStore } from './qa';

export type { Answer } from './qa';
export type { ViewMode, EditorTab } from './ui';
