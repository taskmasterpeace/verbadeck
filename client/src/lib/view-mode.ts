/**
 * The single source of truth for the app's view modes — the rendered surfaces that the
 * router and the stores switch between. Import this everywhere instead of redefining it.
 */
export type ViewMode =
  | 'create'
  | 'ai-processor'
  | 'editor'
  | 'presenter'
  | 'create-from-scratch'
  | 'know-it-all'
  | 'knowledge';
