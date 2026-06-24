import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import App from './App.tsx'
import { AudiencePage } from './pages/AudiencePage.tsx'
import { ControllerPage } from './pages/ControllerPage.tsx'
import { LayoutDemoPage } from './pages/LayoutDemoPage.tsx'
import { LibraryPage } from './pages/LibraryPage.tsx'
import { AuthGate } from './components/auth/AuthGate.tsx'
import { Toaster } from 'sonner'
import { runMigration, getMigrationStatus } from './lib/storage-migration'
import './index.css'

// Run storage migration on app startup (V1 → V2)
const migrationStatus = getMigrationStatus();
if (migrationStatus.needsMigration) {
  console.log('🔄 Storage migration needed, running migration...');
  const result = runMigration();

  if (result.success) {
    console.log('✅ Migration completed successfully');
    if (result.migratedKeys.length > 0) {
      console.log('   Migrated keys:', result.migratedKeys.join(', '));
    }
  } else {
    console.error('❌ Migration failed:', result.errors);
    // App will continue to work, but with fresh state
  }
} else {
  console.log('✅ Storage is up to date (V' + migrationStatus.version + ')');
}

// Router configuration for VerbaDeck V2.0
// App.tsx handles all main routes with proper MainLayout integration
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        // Dashboard/Home - shows CreatePresentation component
        index: true,
        element: null, // Handled by App.tsx viewMode='create'
      },
      {
        // Create hub
        path: 'create',
        element: null, // Handled by App.tsx viewMode='create'
      },
      {
        // CreateFromScratch wizard
        path: 'create/scratch',
        element: null, // Handled by App.tsx viewMode='create-from-scratch'
      },
      {
        // AIScriptProcessor
        path: 'create/process',
        element: null, // Handled by App.tsx viewMode='ai-processor'
      },
      {
        // Editor workspace
        path: 'editor',
        element: null, // Handled by App.tsx viewMode='editor'
      },
      {
        // Presenter view
        path: 'presenter',
        element: null, // Handled by App.tsx viewMode='presenter'
      },
      {
        // Know It All mode
        path: 'know-it-all',
        element: null, // Handled by App.tsx viewMode='know-it-all'
      },
      {
        // Knowledge Brain — semantic store for live recall
        path: 'knowledge',
        element: null, // Handled by App.tsx viewMode='knowledge'
      },
    ],
  },
  {
    // Library browser - standalone page with MainLayout
    path: '/library',
    element: <LibraryPage />,
  },
  {
    // Audience view (separate window/screen) - no MainLayout
    path: '/audience',
    element: <AudiencePage />,
  },
  {
    // Phone controller (no MainLayout) - dark theme remote control
    path: '/controller',
    element: <ControllerPage />,
  },
  {
    // Layout demo page (for testing V2.0 layout)
    path: '/demo/layout',
    element: <LayoutDemoPage />,
  },
  {
    // 404 catch-all
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthGate>
      <RouterProvider router={router} />
    </AuthGate>
    <Toaster richColors position="top-center" closeButton />
  </React.StrictMode>,
)
