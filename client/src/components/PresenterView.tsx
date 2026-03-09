import { useEffect, useState } from 'react';
import { Progress } from './ui/progress';
import { type Section } from '@/lib/script-parser';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CurrentSlidePreview } from './CurrentSlidePreview';
import { PresentationTimer } from './PresentationTimer';
import { CountdownProgressBar } from './CountdownProgressBar';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { usePresenterCountdown } from '@/hooks/usePresenterCountdown';
import { Database, Eye, CheckCircle, ImageIcon } from 'lucide-react';

interface PresenterViewProps {
  onSectionClick?: (index: number) => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  onStopStreaming?: () => void;
}

export function PresenterView({
  onSectionClick,
  onNavigateNext,
  onNavigatePrev,
  onStopStreaming,
}: PresenterViewProps) {
  // Get data from stores
  const sections = usePresentationStore((state) => state.sections);
  const presenterDisplayIndex = usePresentationStore((state) => state.presenterDisplayIndex); // What presenter sees

  // Countdown timer hook (delays note changes after trigger word)
  const { isCountingDown, countdownDuration } = usePresenterCountdown();

  // Use presenterDisplayIndex for what the presenter sees
  const sectionIndex = presenterDisplayIndex;

  const currentSection = sections[sectionIndex];
  const nextSection = sectionIndex < sections.length - 1 ? sections[sectionIndex + 1] : undefined;
  const totalSections = sections.length;
  const progress = totalSections > 0 ? ((sectionIndex + 1) / totalSections) * 100 : 0;

  // Tab state for talking points
  const [activeTab, setActiveTab] = useState<'data' | 'vision' | 'proof'>('data');

  // Calculate content density for adaptive layout
  const calculateWordCount = (section: Section): number => {
    let count = 0;

    // Base content
    if (section.speakerNotes) count += section.speakerNotes.split(/\s+/).length;
    if (section.content) count += section.content.split(/\s+/).length;

    // Structured speaker notes
    if (section.structuredSpeakerNotes) {
      const sns = section.structuredSpeakerNotes;
      if (sns.profoundStatement) count += sns.profoundStatement.split(/\s+/).length;
      if (sns.talkingPoints) {
        count += (sns.talkingPoints.data?.split(/\s+/).length || 0);
        count += (sns.talkingPoints.vision?.split(/\s+/).length || 0);
        count += (sns.talkingPoints.proof?.split(/\s+/).length || 0);
      }
      if (sns.highImpactParagraph) count += sns.highImpactParagraph.split(/\s+/).length;
    }

    // Image penalty - images take vertical space
    if (section.imageUrl || section.recommendedImage || section.structuredSpeakerNotes?.recommendedImage) {
      count += 50; // Add 50 words equivalent for image space
    }

    return count;
  };

  const wordCount = currentSection ? calculateWordCount(currentSection) : 0;

  // THREE-TIER adaptive layout thresholds
  const useUltraDense = wordCount > 570;      // Slides 9-12 (576-688 words) - EXTREME compression
  const useTwoColumnLayout = wordCount > 400; // Slide 7+ (566+ words) - Two columns
  const useCompactFonts = wordCount > 300;    // Medium density - Compact fonts

  // Dynamic classes based on density - MINIMUM 14px for main content
  const layoutClasses = {
    container: useUltraDense ? 'grid grid-cols-2 gap-1' : (useTwoColumnLayout ? 'grid grid-cols-2 gap-1.5' : 'space-y-6'),  // Minimal gap
    heading: useUltraDense ? 'text-sm' : (useTwoColumnLayout ? 'text-base' : (useCompactFonts ? 'text-2xl' : 'text-3xl')),  // 14px/16px/24px/30px
    subheading: useTwoColumnLayout ? 'text-sm' : (useCompactFonts ? 'text-lg' : 'text-xl'), // Keep 14px minimum
    content: useCompactFonts ? 'text-lg' : 'text-2xl',
    sectionTitle: useTwoColumnLayout ? 'text-[7px]' : 'text-xs',     // 7px/12px - ultra tiny labels ok
    sectionContent: useCompactFonts ? 'text-sm leading-[1.1]' : 'text-base',  // Keep 14px MIN, SUPER-tight line height
    spacing: useUltraDense ? 'space-y-0' : (useTwoColumnLayout ? 'space-y-0.5' : (useCompactFonts ? 'space-y-2' : 'space-y-6')),
    padding: useUltraDense ? 'px-1 py-0.5' : (useTwoColumnLayout ? 'p-1.5' : (useCompactFonts ? 'p-3' : 'p-6')),  // Asymmetric padding
    sectionSpacing: 'mb-0',  // NO bottom margin for all two-column modes
    structuredNotesMargin: useUltraDense ? 'mt-0' : (useTwoColumnLayout ? 'mt-0.5' : 'mt-8'),
    profoundStatementFont: useTwoColumnLayout ? 'text-sm' : (useCompactFonts ? 'text-lg' : 'text-xl'), // Keep 14px MIN
    mainPadding: useUltraDense ? 'px-2 py-1' : (useTwoColumnLayout ? 'p-3' : 'p-8'),  // Asymmetric for ultra-dense
  };
  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          if (onNavigateNext) onNavigateNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          if (onNavigatePrev) onNavigatePrev();
          break;
        case 'Home':
          e.preventDefault();
          if (onSectionClick) onSectionClick(0);
          break;
        case 'End':
          e.preventDefault();
          if (onSectionClick) onSectionClick(totalSections - 1);
          break;
        case 'Escape':
          e.preventDefault();
          if (onStopStreaming) onStopStreaming();
          break;
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          e.preventDefault();
          const slideNum = parseInt(e.key) - 1;
          if (onSectionClick && slideNum < totalSections) {
            onSectionClick(slideNum);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigateNext, onNavigatePrev, onSectionClick, onStopStreaming, totalSections]);

  if (!currentSection) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        No sections loaded.
      </div>
    );
  }

  // Render content with trigger words highlighted
  const renderContent = (section: Section) => {
    const triggers = section.selectedTriggers || [section.advanceToken];
    const primaryTrigger = triggers[0];
    const textToDisplay = section.speakerNotes || section.content;
    const isShowingNotes = !!section.speakerNotes;

    let triggerHighlight: { word: string; index: number } | undefined;
    if (primaryTrigger && primaryTrigger.trim() !== '') {
      let triggerToHighlight = primaryTrigger;
      let triggerIndex = textToDisplay.toLowerCase().indexOf(primaryTrigger.toLowerCase());

      if (triggerIndex === -1 && triggers.length > 1) {
        for (const trigger of triggers) {
          const idx = textToDisplay.toLowerCase().indexOf(trigger.toLowerCase());
          if (idx !== -1) {
            triggerToHighlight = trigger;
            triggerIndex = idx;
            break;
          }
        }
      }

      if (triggerIndex !== -1) {
        triggerHighlight = { word: triggerToHighlight, index: triggerIndex };
      }
    }

    return (
      <div>
        {isShowingNotes && (
          <div className="mb-3 px-3 py-2 bg-amber-100 border border-amber-300 rounded text-xs text-amber-900 font-medium">
            📝 Speaker Notes (audience sees slide content)
          </div>
        )}
        <MarkdownRenderer content={textToDisplay} highlightTrigger={triggerHighlight} />
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* LEFT SIDE: Presenter Notes (70%) - What YOU read */}
      <div className="flex-[7] flex flex-col min-w-0 border-r">
        {/* Top Bar */}
        <div className="flex-shrink-0 border-b">
          <PresentationTimer
            isActive={true}
            currentSection={sectionIndex}
            totalSections={totalSections}
            estimatedTimePerSection={60}
          />
          {onSectionClick && totalSections > 1 && (
            <div className="px-4 py-2 border-t bg-muted/30">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Jump:</span>
                {Array.from({ length: totalSections }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => onSectionClick(i)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      i === sectionIndex ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Countdown Progress Bar (shows when notes are about to update) */}
        {isCountingDown && (
          <CountdownProgressBar
            duration={countdownDuration}
            onComplete={() => {
              // Handled by usePresenterCountdown hook
            }}
          />
        )}

        {/* Presenter Notes Content */}
        <div className={`flex-1 min-h-0 ${layoutClasses.mainPadding} overflow-auto`}>
          <div className="max-w-4xl">
            {/* Section Info with Density Indicator - Hide for ultra-dense */}
            {!useUltraDense && (
              <div className={`flex items-center justify-between ${useTwoColumnLayout ? 'mb-1' : 'mb-4'}`}>
                <div className="flex items-center gap-2">
                  <span className={`${useTwoColumnLayout ? 'text-xs' : 'text-sm'} font-semibold text-muted-foreground`}>
                    Section {sectionIndex + 1} of {totalSections}
                  </span>
                  {useTwoColumnLayout && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-900 rounded text-[9px] font-semibold">
                      2-COL LAYOUT
                    </span>
                  )}
                  {useCompactFonts && !useTwoColumnLayout && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-[10px] font-semibold">
                      COMPACT
                    </span>
                  )}
                </div>
                <span className={`${useTwoColumnLayout ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} bg-amber-100 text-amber-900 rounded-full font-mono font-semibold`}>
                  Say: "{currentSection.advanceToken}"
                </span>
              </div>
            )}

            {/* Heading with tighter spacing to subtitle/content */}
            {currentSection.heading && (
              <h2 className={`${layoutClasses.heading} font-bold text-primary ${useUltraDense ? 'mb-0 pb-0 border-b' : (useTwoColumnLayout ? 'mb-0.5 pb-0.5 border-b' : 'mb-2 pb-2 border-b-2')} border-primary/20`}>
                {currentSection.heading}
              </h2>
            )}

            {/* Speaker Notes / Script - Subtitle appearance with tight spacing */}
            <div className={`${layoutClasses.subheading} ${useUltraDense ? 'leading-[1.1]' : (useTwoColumnLayout ? 'leading-snug' : 'leading-relaxed')} ${layoutClasses.spacing} text-foreground`}>
              {renderContent(currentSection)}
            </div>

            {/* Structured Speaker Notes Section */}
            {currentSection.structuredSpeakerNotes && (
              <div className={`${layoutClasses.structuredNotesMargin} ${useUltraDense ? 'border-t-0 pt-0' : (useTwoColumnLayout ? 'border-t pt-1' : 'border-t-2 pt-4')} border-primary/20 ${layoutClasses.container}`}>

                {/* LEFT COLUMN (or full width in single-column mode) */}
                <div className={layoutClasses.spacing}>
                  {/* Profound Statement */}
                  {currentSection.structuredSpeakerNotes.profoundStatement && (
                    <div className={`bg-primary/5 ${useUltraDense ? 'border-l-2' : 'border-l-4'} border-primary ${layoutClasses.padding} rounded-r`}>
                      <div className={`${layoutClasses.sectionTitle} font-semibold text-primary uppercase tracking-wide ${layoutClasses.sectionSpacing}`}>
                        Key Message
                      </div>
                      <div className={`${layoutClasses.profoundStatementFont} font-semibold text-foreground italic ${useUltraDense ? 'leading-[1.1]' : (useTwoColumnLayout ? 'leading-snug' : 'leading-relaxed')}`}>
                        "{currentSection.structuredSpeakerNotes.profoundStatement}"
                      </div>
                    </div>
                  )}

                  {/* Talking Points - Always use tabs to save vertical space */}
                  {currentSection.structuredSpeakerNotes.talkingPoints && (
                    <div className={`bg-muted/30 rounded-lg ${layoutClasses.padding}`}>
                      <div className={`${layoutClasses.sectionTitle} font-semibold text-muted-foreground uppercase tracking-wide ${layoutClasses.sectionSpacing}`}>
                        Talking Points
                      </div>

                      {false ? (
                        // DISABLED: Stacking all 3 takes too much vertical space
                        <div className="space-y-3">
                          {currentSection.structuredSpeakerNotes.talkingPoints.data && (
                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1.5">
                                <Database className="w-3 h-3" />
                                Data
                              </div>
                              <p className={`${layoutClasses.sectionContent} leading-relaxed text-foreground`}>
                                {currentSection.structuredSpeakerNotes.talkingPoints.data}
                              </p>
                            </div>
                          )}
                          {currentSection.structuredSpeakerNotes.talkingPoints.vision && (
                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1.5">
                                <Eye className="w-3 h-3" />
                                Vision
                              </div>
                              <p className={`${layoutClasses.sectionContent} leading-relaxed text-foreground`}>
                                {currentSection.structuredSpeakerNotes.talkingPoints.vision}
                              </p>
                            </div>
                          )}
                          {currentSection.structuredSpeakerNotes.talkingPoints.proof && (
                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1.5">
                                <CheckCircle className="w-3 h-3" />
                                Proof
                              </div>
                              <p className={`${layoutClasses.sectionContent} leading-relaxed text-foreground`}>
                                {currentSection.structuredSpeakerNotes.talkingPoints.proof}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Tabbed interface (more space-efficient)
                        <>
                          <div className={`flex space-x-1 border-b ${useUltraDense ? 'mb-1' : (useTwoColumnLayout ? 'mb-2' : 'mb-4')}`}>
                            <button
                              onClick={() => setActiveTab('data')}
                              className={`flex items-center gap-1 ${useUltraDense ? 'px-1 py-0.5' : (useTwoColumnLayout ? 'px-2 py-1' : 'px-4 py-2')} font-medium transition-colors ${useUltraDense ? 'text-[10px]' : 'text-xs'} ${
                                activeTab === 'data'
                                  ? 'border-b-2 border-primary text-primary'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <Database className={useUltraDense ? 'w-2 h-2' : (useTwoColumnLayout ? 'w-3 h-3' : 'w-4 h-4')} />
                              {!useUltraDense && 'Data'}
                            </button>
                            <button
                              onClick={() => setActiveTab('vision')}
                              className={`flex items-center gap-1 ${useUltraDense ? 'px-1 py-0.5' : (useTwoColumnLayout ? 'px-2 py-1' : 'px-4 py-2')} font-medium transition-colors ${useUltraDense ? 'text-[10px]' : 'text-xs'} ${
                                activeTab === 'vision'
                                  ? 'border-b-2 border-primary text-primary'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <Eye className={useUltraDense ? 'w-2 h-2' : (useTwoColumnLayout ? 'w-3 h-3' : 'w-4 h-4')} />
                              {!useUltraDense && 'Vision'}
                            </button>
                            <button
                              onClick={() => setActiveTab('proof')}
                              className={`flex items-center gap-1 ${useUltraDense ? 'px-1 py-0.5' : (useTwoColumnLayout ? 'px-2 py-1' : 'px-4 py-2')} font-medium transition-colors ${useUltraDense ? 'text-[10px]' : 'text-xs'} ${
                                activeTab === 'proof'
                                  ? 'border-b-2 border-primary text-primary'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <CheckCircle className={useUltraDense ? 'w-2 h-2' : (useTwoColumnLayout ? 'w-3 h-3' : 'w-4 h-4')} />
                              {!useUltraDense && 'Proof'}
                            </button>
                          </div>

                          <div className={`${layoutClasses.sectionContent} ${useUltraDense ? 'leading-[1.1]' : (useTwoColumnLayout ? 'leading-tight' : 'leading-relaxed')} text-foreground`}>
                            {activeTab === 'data' && currentSection.structuredSpeakerNotes.talkingPoints.data && (
                              <p>{currentSection.structuredSpeakerNotes.talkingPoints.data}</p>
                            )}
                            {activeTab === 'vision' && currentSection.structuredSpeakerNotes.talkingPoints.vision && (
                              <p>{currentSection.structuredSpeakerNotes.talkingPoints.vision}</p>
                            )}
                            {activeTab === 'proof' && currentSection.structuredSpeakerNotes.talkingPoints.proof && (
                              <p>{currentSection.structuredSpeakerNotes.talkingPoints.proof}</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN (or continuation in single-column mode) */}
                <div className={layoutClasses.spacing}>
                  {/* High Impact Paragraph */}
                  {currentSection.structuredSpeakerNotes.highImpactParagraph && (
                    <div className={`bg-amber-50 border border-amber-200 rounded-lg ${layoutClasses.padding}`}>
                      <div className={`${layoutClasses.sectionTitle} font-semibold text-amber-900 uppercase tracking-wide ${layoutClasses.sectionSpacing}`}>
                        High Impact Closer
                      </div>
                      <div className={`${layoutClasses.sectionContent} leading-relaxed text-amber-950`}>
                        {currentSection.structuredSpeakerNotes.highImpactParagraph}
                      </div>
                    </div>
                  )}

                  {/* Recommended Image */}
                  {currentSection.recommendedImage && (
                    <div className={`bg-blue-50 border border-blue-200 rounded-lg ${layoutClasses.padding}`}>
                      <div className={`flex items-center gap-2 ${layoutClasses.sectionTitle} font-semibold text-blue-900 uppercase tracking-wide ${layoutClasses.sectionSpacing}`}>
                        <ImageIcon className="w-3 h-3" />
                        Recommended Image
                      </div>
                      <div className={`${layoutClasses.sectionContent} leading-relaxed text-blue-950 italic`}>
                        {currentSection.recommendedImage}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress - Hide in two-column mode to save space */}
            {!useTwoColumnLayout && (
              <div className="mt-10">
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {Math.round(progress)}% complete
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Slide Preview & Next (30%) */}
      <div className="flex-[3] flex flex-col bg-muted/20">
        {/* What Audience Sees - Top Half */}
        <div className="flex-1 min-h-0 p-4 border-b flex flex-col">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex-shrink-0">
            📺 Audience Sees
          </h3>
          <div className="flex-1 min-h-0 bg-white rounded-lg border-2 border-primary/30 shadow-lg overflow-hidden">
            <CurrentSlidePreview section={currentSection} />
          </div>
        </div>

        {/* Next Section - Bottom Half */}
        <div className="flex-1 min-h-0 p-4 flex flex-col">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex-shrink-0">
            ⏭️ Next Up
          </h3>
          <div className="flex-1 min-h-0 overflow-auto bg-background rounded-lg border-2 border-muted p-4">
            {nextSection ? (
              <div className="space-y-2">
                {nextSection.heading && (
                  <div className="font-bold text-sm text-foreground mb-2">
                    {nextSection.heading}
                  </div>
                )}
                <div className="text-sm text-muted-foreground line-clamp-8">
                  {renderContent(nextSection)}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground text-sm">
                🎉 This is the final section
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
