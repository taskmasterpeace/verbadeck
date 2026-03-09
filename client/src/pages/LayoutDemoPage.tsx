import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { TopBar } from '../components/layout/TopBar';
import { TranscriptBar } from '../components/layout/TranscriptBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function LayoutDemoPage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState('');

  const topBar = (
    <TopBar
      isStreaming={isStreaming}
      streamStatus={isStreaming ? 'connected' : 'disconnected'}
      onToggleStream={() => setIsStreaming(!isStreaming)}
      showQAControls={false}
      showFileControls={true}
      selectedModel="openai/gpt-4o-mini"
      onModelChange={() => {}}
    />
  );

  const transcriptBar = (
    <TranscriptBar
      transcript={transcript}
      lastTranscript={lastTranscript}
      isVisible={isStreaming}
    />
  );

  return (
    <MainLayout topBar={topBar} transcriptBar={transcriptBar}>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Layout Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This page demonstrates the new MainLayout component with sidebar integration.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Responsive sidebar (collapsible on desktop)</li>
                    <li>Mobile drawer/sheet on small screens</li>
                    <li>Persistent sidebar state in localStorage</li>
                    <li>React Router NavLink integration</li>
                    <li>Collapsible navigation groups</li>
                    <li>Keyboard shortcut (Ctrl+B) to toggle</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Components:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>MainLayout - Wrapper with sidebar</li>
                    <li>TopBar - Global actions bar</li>
                    <li>TranscriptBar - Bottom transcript ticker</li>
                    <li>Sidebar navigation with icons</li>
                    <li>Active route highlighting</li>
                  </ul>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsStreaming(!isStreaming);
                    if (!isStreaming) {
                      setLastTranscript('This is a demo transcript...');
                      setTranscript(['Previous transcript 1', 'Previous transcript 2']);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isStreaming ? 'Hide' : 'Show'} Transcript Bar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate between different sections of the app.
              On mobile, tap the menu icon to open the drawer.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
