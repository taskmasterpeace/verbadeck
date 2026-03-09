import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LibraryView } from '@/components/library/LibraryView';
import { MainLayout } from '@/layouts/MainLayout';
import { loadFromLibrary } from '@/lib/presentation-library';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { loadPresentation } from '@/lib/file-storage';

export function LibraryPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get Zustand actions
  const loadPresentationData = usePresentationStore(state => state.loadPresentationData);
  const setViewMode = usePresentationStore(state => state.setViewMode);

  const handleLoad = (id: string) => {
    try {
      const data = loadFromLibrary(id);
      if (!data) {
        alert('Failed to load presentation from library');
        return;
      }

      // Load into Zustand store
      loadPresentationData({
        sections: data.sections,
        knowledgeBase: data.knowledgeBase,
        settings: data.settings,
      });

      console.log(`✅ Loaded presentation from library: ${data.title}`);
      console.log('   - Sections:', data.sections.length);
      console.log('   - Knowledge base:', data.knowledgeBase?.length || 0);
      console.log('   - Settings:', data.settings);

      // Navigate to editor
      setViewMode('editor');
      navigate('/editor');
    } catch (error) {
      console.error('Error loading from library:', error);
      alert('Failed to load presentation');
    }
  };

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await loadPresentation(file);

      // Load into Zustand store
      loadPresentationData({
        sections: data.sections,
        knowledgeBase: data.knowledgeBase,
        settings: data.settings,
      });

      console.log(`✅ Imported presentation file: ${file.name}`);
      console.log('   - Sections:', data.sections.length);

      // Reset file input
      event.target.value = '';

      // Navigate to editor
      setViewMode('editor');
      navigate('/editor');
    } catch (error) {
      console.error('Error importing file:', error);
      alert(error instanceof Error ? error.message : 'Failed to import file');
    }
  };

  const handleNewPresentation = () => {
    navigate('/create');
  };

  const handleLoadSampleTalkAdvantagePro = async () => {
    try {
      const response = await fetch('/sample-data/presentation-talkadvantage-pro-full.json');
      if (!response.ok) {
        throw new Error('Failed to load sample presentation');
      }

      const data = await response.json();

      // Load into Zustand store
      loadPresentationData({
        sections: data.sections,
        knowledgeBase: undefined,
        settings: undefined,
      });

      console.log(`✅ Loaded TalkAdvantage Pro sample presentation`);
      console.log('   - Sections:', data.sections.length);

      // Wait a tiny bit for Zustand persist to save
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to presenter view (ready to present!)
      setViewMode('presenter');
      navigate('/presenter');
    } catch (error) {
      console.error('Error loading TalkAdvantage Pro sample:', error);
      alert('Failed to load sample presentation');
    }
  };

  const handleLoadAdaptiveShowcase = async () => {
    try {
      const response = await fetch('/sample-data/adaptive-showcase.json');
      if (!response.ok) {
        throw new Error('Failed to load adaptive showcase');
      }

      const data = await response.json();

      // Load into Zustand store
      loadPresentationData({
        sections: data.sections,
        knowledgeBase: undefined,
        settings: undefined,
      });

      console.log(`✅ Loaded Adaptive Layout Showcase`);
      console.log('   - Sections:', data.sections.length);
      console.log('   - Description:', data.description);

      // Wait a tiny bit for Zustand persist to save
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to presenter view (ready to present!)
      setViewMode('presenter');
      navigate('/presenter');
    } catch (error) {
      console.error('Error loading Adaptive Showcase:', error);
      alert('Failed to load sample presentation');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Sample Presentations Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-purple-900">📊 Sample Presentations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleLoadAdaptiveShowcase}
              className="flex flex-col gap-2 p-4 bg-white border-2 border-blue-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-blue-900 group-hover:text-blue-600">
                  Adaptive Layout Showcase
                </h3>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  8 slides
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Demonstrates VerbaDeck's intelligent content-density formatting system across Normal, Compact, and Two-Column tiers. See how slides adapt automatically based on word count.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                  ✨ NEW
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  Click to load and present →
                </span>
              </div>
            </button>

            <button
              onClick={handleLoadSampleTalkAdvantagePro}
              className="flex flex-col gap-2 p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-purple-900 group-hover:text-purple-600">
                  TalkAdvantage Pro - VC Pitch Deck
                </h3>
                <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  13 slides
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Complete VC pitch deck with TalkAdvantage Pro format: profound statements, 3 talking points (Data/Vision/Proof), high impact paragraphs, and recommended images.
              </p>
              <div className="text-xs text-purple-600 font-medium mt-2">
                Click to load and present →
              </div>
            </button>
          </div>
        </div>

        <LibraryView
          onLoad={handleLoad}
          onImportFile={handleImportFile}
          onNewPresentation={handleNewPresentation}
        />

        {/* Hidden file input for importing */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".verbadeck,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </MainLayout>
  );
}
