import { type Section } from '../lib/script-parser';
import { PresenterView } from '../components/PresenterView';
import { TransitionEffects } from '../components/TransitionEffects';

interface PresenterPageProps {
  sections: Section[];
  currentSectionIndex: number;
  currentSection?: Section;
  previousSection?: Section;
  nextSection?: Section;
  shouldFlash: boolean;
  openAudienceView: () => void;
  goToSection: (index: number) => void;
  advanceSection: () => void;
  goBackSection: () => void;
  stopStreaming: () => void;
  isStreaming: boolean;
  viewMode: string;
}

export function PresenterPage({
  sections: _sections,
  currentSectionIndex: _currentSectionIndex,
  currentSection: _currentSection,
  previousSection: _previousSection,
  nextSection: _nextSection,
  shouldFlash,
  openAudienceView,
  goToSection,
  advanceSection,
  goBackSection,
  stopStreaming,
  isStreaming,
  viewMode: _viewMode,
}: PresenterPageProps) {
  return (
    <>
      {/* Open Audience View Button - Monitor Style */}
      {!isStreaming && (
        <div className="flex justify-center mb-4">
          <button
            onClick={openAudienceView}
            className="group relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            {/* Monitor Screen */}
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-1 shadow-xl">
              {/* Screen Bezel */}
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-md px-8 py-6 min-w-[280px]">
                {/* Screen Content */}
                <div className="text-center">
                  <div className="text-white font-bold text-lg mb-1">
                    Open Audience View
                  </div>
                  <div className="text-blue-100 text-sm">
                    Click to launch 2nd monitor
                  </div>
                </div>
                {/* Screen Glare Effect */}
                <div className="absolute top-2 left-2 w-8 h-8 bg-white/10 rounded-full blur-sm" />
              </div>
              {/* Power LED */}
              <div className="absolute bottom-2 right-3 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]" />
            </div>
            {/* Monitor Stand */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-3 bg-gradient-to-b from-slate-700 to-slate-800" />
              <div className="w-16 h-2 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-md" />
            </div>
            {/* Hover tooltip */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Opens a clean view for your audience
            </div>
          </button>
        </div>
      )}

      <TransitionEffects
        transitionKey={currentSectionIndex}
        shouldFlash={shouldFlash}
      >
        <PresenterView
          onSectionClick={goToSection}
          onNavigateNext={advanceSection}
          onNavigatePrev={goBackSection}
          onStopStreaming={stopStreaming}
        />
      </TransitionEffects>
    </>
  );
}
