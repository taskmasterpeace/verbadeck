import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type ViewMode = 'create' | 'ai-processor' | 'editor' | 'presenter' | 'create-from-scratch' | 'know-it-all' | 'knowledge';

// Map routes to view modes
const routeToViewMode: Record<string, ViewMode> = {
  '/': 'create',
  '/create': 'create',
  '/create/scratch': 'create-from-scratch',
  '/create/process': 'ai-processor',
  '/editor': 'editor',
  '/presenter': 'presenter',
  '/know-it-all': 'know-it-all',
  '/knowledge': 'knowledge',
};

// Map view modes to routes
const viewModeToRoute: Record<ViewMode, string> = {
  'create': '/',
  'ai-processor': '/create/process',
  'editor': '/editor',
  'presenter': '/presenter',
  'create-from-scratch': '/create/scratch',
  'know-it-all': '/know-it-all',
  'knowledge': '/knowledge',
};

/**
 * Custom hook to manage bidirectional sync between URL routes and viewMode state
 * Ensures that URL changes update viewMode and viewMode changes update URL
 */
export function useRouteSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('create');

  // Sync viewMode with current route on mount and location changes
  useEffect(() => {
    const newViewMode = routeToViewMode[location.pathname];
    if (newViewMode && newViewMode !== viewMode) {
      console.log(`🔄 Route changed to ${location.pathname}, setting viewMode to ${newViewMode}`);
      setViewMode(newViewMode);
    }
  }, [location.pathname]);

  // Sync URL when viewMode changes (but don't create a loop)
  const setViewModeWithRoute = useCallback((mode: ViewMode) => {
    const targetRoute = viewModeToRoute[mode];
    if (targetRoute && location.pathname !== targetRoute) {
      console.log(`🔄 ViewMode changed to ${mode}, navigating to ${targetRoute}`);
      navigate(targetRoute);
    }
    setViewMode(mode);
  }, [location.pathname, navigate]);

  return {
    viewMode,
    setViewMode: setViewModeWithRoute,
  };
}
