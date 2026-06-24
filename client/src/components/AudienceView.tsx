import { type Section } from '@/lib/script-parser';
import { Progress } from './ui/progress';
import { TransitionEffects } from './TransitionEffects';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useDynamicTextSize, TextSizeMeasurement } from '@/hooks/useDynamicTextSize';
import { Maximize, Minimize, ZoomIn, ZoomOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AudienceViewProps {
  currentSection?: Section;
  sectionIndex: number;
  totalSections: number;
  progress: number;
  shouldFlash?: boolean;
}

export function AudienceView({
  currentSection,
  sectionIndex,
  totalSections,
  progress,
  shouldFlash = false,
}: AudienceViewProps) {
  if (!currentSection) {
    return (
      <div className="dark relative min-h-screen overflow-hidden bg-background flex items-center justify-center">
        <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 38%, hsl(199 100% 22% / 0.28), transparent 70%)' }} />
        <div className="relative text-center">
          <div className="font-heading text-3xl font-bold text-gradient-brand mb-3">VerbaDeck</div>
          <p className="flex items-center justify-center gap-2.5 text-muted-foreground">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-70 animate-live-pulse" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            Waiting for the presentation to begin…
          </p>
          <p className="mt-3 text-xs text-muted-foreground/60">Open this from the Presenter view → “Open Audience View”.</p>
        </div>
      </div>
    );
  }

  // Calculate content density for adaptive layout
  const calculateWordCount = (): number => {
    let count = 0;
    if (currentSection.content) count += currentSection.content.split(/\s+/).length;
    if (currentSection.imageUrl) count += 50; // Image penalty
    return count;
  };

  const wordCount = calculateWordCount();
  const useTwoColumnLayout = wordCount > 100; // Threshold: 100+ words triggers two-column for audience view

  // Check if we have an image
  const hasImage = !!currentSection.imageUrl;
  const isImageOnly = currentSection.imageOnly && hasImage;
  const layout = currentSection.layout || 'balanced';

  // Dynamic text sizing hook
  const { fontSize, isOverflowing: _isOverflowing, containerRef, measurementRef } = useDynamicTextSize(
    currentSection.content,
    hasImage
  );

  // Zoom level state - persisted in localStorage
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('verbadeck-presentation-zoom');
    return saved ? parseFloat(saved) : 100;
  });

  // Save zoom level to localStorage
  useEffect(() => {
    localStorage.setItem('verbadeck-presentation-zoom', zoomLevel.toString());
  }, [zoomLevel]);

  // Calculate scaled font sizes based on zoom level
  const zoomMultiplier = zoomLevel / 100;
  // VD-3: hard cap by content length so a long slide never overflows the screen, even when the live
  // measurement hasn't settled yet (e.g. the audience window just opened on a second monitor). The
  // measurement still shrinks further when it can; this cap is the floor that guarantees a fit.
  const rawWords = currentSection.content ? currentSection.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const lengthCap = rawWords > 70 ? 2.6 : rawWords > 45 ? 3.2 : rawWords > 28 ? 4.2 : rawWords > 16 ? 5.2 : 8;
  const scaledFontSize = Math.min(fontSize, lengthCap) * zoomMultiplier;

  // Fullscreen state management
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsHovered, setIsControlsHovered] = useState(false);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 300));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoomLevel(100);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Plus/Equals key
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      }
      // Ctrl/Cmd + Minus key
      else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      // Ctrl/Cmd + 0 to reset
      else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render progress bar component (reused across layouts)
  const ProgressBar = () => (
    <div className="mt-8 w-full max-w-md space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="text-sm text-muted-foreground text-center">
        Slide {sectionIndex + 1} of {totalSections}
      </div>
    </div>
  );

  // Render heading component (reused across layouts)
  const Heading = ({ size = 'large' }: { size?: 'small' | 'medium' | 'large' | 'xlarge' }) => {
    const sizeMap = {
      small: 3,   // text-3xl = 1.875rem * zoom
      medium: 4,  // text-4xl = 2.25rem * zoom
      large: 5,   // text-5xl = 3rem * zoom
      xlarge: 6,  // text-6xl = 3.75rem * zoom
    };
    const baseFontSize = sizeMap[size];
    const scaledHeadingSize = baseFontSize * zoomMultiplier;

    return (
      <h2
        className={`font-bold text-primary text-center border-b-2 border-primary/20 mb-4 pb-4`}
        style={{ fontSize: `${scaledHeadingSize}rem` }}
      >
        {currentSection.heading || `Section ${sectionIndex + 1}`}
      </h2>
    );
  };

  return (
    <TransitionEffects
      transitionKey={sectionIndex}
      shouldFlash={shouldFlash}
      className="min-h-screen"
    >
      <div className="dark relative min-h-screen overflow-hidden bg-background text-foreground flex flex-col">
        {/* Cinematic backdrop — subtle brand glow + vignette for a projected slide */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ background: 'radial-gradient(80% 55% at 50% 0%, hsl(199 100% 18% / 0.35), transparent 60%), radial-gradient(60% 50% at 50% 100%, hsl(183 86% 16% / 0.22), transparent 70%)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ boxShadow: 'inset 0 0 200px 40px rgba(0,0,0,0.55)' }} />
        {/* content sits above the backdrop */}
        <div className="contents [&>*]:relative [&>*]:z-10">
        {/* Hidden measurement div for dynamic text sizing */}
        <TextSizeMeasurement
          content={<MarkdownRenderer content={currentSection.content} />}
          measurementRef={measurementRef}
          className="leading-relaxed font-light text-center"
        />

        {/* Image only mode - fullscreen image */}
        {isImageOnly ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted">
          <img
            src={currentSection.imageUrl}
            alt={`Slide ${sectionIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            style={{ transform: `scale(${zoomMultiplier})` }}
            onError={(_e) => {
              console.error('Failed to load image:', currentSection.imageUrl);
            }}
          />
          <ProgressBar />
        </div>
      ) : hasImage ? (
        /* Has image - render based on layout */
        <>
          {layout === 'balanced' && (
            /* Balanced: 50/50 side-by-side */
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image side */}
              <div className="flex items-center justify-center bg-muted p-8">
                <img
                  src={currentSection.imageUrl}
                  alt={`Slide ${sectionIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoomMultiplier})` }}
                  onError={(_e) => {
                    console.error('Failed to load image:', currentSection.imageUrl);
                  }}
                />
              </div>

              {/* Text side */}
              <div className="flex flex-col items-center justify-center p-12">
                <div ref={containerRef} className="space-y-6 w-full px-8">
                  <Heading size="large" />
                  <MarkdownRenderer
                    content={currentSection.content}
                    className="leading-relaxed font-light text-center"
                    style={{ fontSize: `${scaledFontSize}rem` }}
                  />
                </div>
                <ProgressBar />
              </div>
            </div>
          )}

          {layout === 'image-top' && (
            /* Image Top: Full-width image on top, text below */
            <div className="flex-1 flex flex-col">
              {/* Image section */}
              <div className="flex items-center justify-center bg-muted p-8 h-1/2">
                <img
                  src={currentSection.imageUrl}
                  alt={`Slide ${sectionIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoomMultiplier})` }}
                  onError={(_e) => {
                    console.error('Failed to load image:', currentSection.imageUrl);
                  }}
                />
              </div>

              {/* Text section */}
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div ref={containerRef} className="space-y-6 w-full px-8">
                  <Heading size="medium" />
                  <MarkdownRenderer
                    content={currentSection.content}
                    className="leading-relaxed font-light text-center"
                    style={{ fontSize: `${scaledFontSize}rem` }}
                  />
                </div>
                <ProgressBar />
              </div>
            </div>
          )}

          {layout === 'image-bottom' && (
            /* Image Bottom: Text on top, full-width image below */
            <div className="flex-1 flex flex-col">
              {/* Text section */}
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div ref={containerRef} className="space-y-6 w-full px-8">
                  <Heading size="medium" />
                  <MarkdownRenderer
                    content={currentSection.content}
                    className="leading-relaxed font-light text-center"
                    style={{ fontSize: `${scaledFontSize}rem` }}
                  />
                </div>
              </div>

              {/* Image section */}
              <div className="flex items-center justify-center bg-muted p-8 h-1/2">
                <img
                  src={currentSection.imageUrl}
                  alt={`Slide ${sectionIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoomMultiplier})` }}
                  onError={(_e) => {
                    console.error('Failed to load image:', currentSection.imageUrl);
                  }}
                />
              </div>

              <div className="pb-8 flex justify-center">
                <ProgressBar />
              </div>
            </div>
          )}

          {layout === 'image-focus' && (
            /* Image Focus: Large image with small text caption */
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted">
              <div ref={containerRef} className="space-y-6 w-full px-8 flex flex-col items-center">
                <Heading size="medium" />
                <img
                  src={currentSection.imageUrl}
                  alt={`Slide ${sectionIndex + 1}`}
                  className="max-w-full max-h-[60vh] object-contain"
                  style={{ transform: `scale(${zoomMultiplier})` }}
                  onError={(_e) => {
                    console.error('Failed to load image:', currentSection.imageUrl);
                  }}
                />
                <MarkdownRenderer
                  content={currentSection.content}
                  className="leading-relaxed font-light text-center w-full"
                  style={{ fontSize: `${scaledFontSize}rem` }}
                />
                <ProgressBar />
              </div>
            </div>
          )}

          {layout === 'text-focus' && (
            /* Text Focus: Large text with small image thumbnail */
            <div className="flex-1 flex flex-col items-center justify-center p-16">
              <div ref={containerRef} className="space-y-8 w-full px-8">
                <Heading size="xlarge" />
                <MarkdownRenderer
                  content={currentSection.content}
                  className="leading-relaxed font-light text-center"
                  style={{ fontSize: `${scaledFontSize}rem` }}
                />
                <div className="flex justify-center mt-8">
                  <img
                    src={currentSection.imageUrl}
                    alt={`Slide ${sectionIndex + 1}`}
                    className="max-w-md max-h-48 object-contain rounded-lg shadow-lg"
                    style={{ transform: `scale(${zoomMultiplier})` }}
                    onError={(_e) => {
                      console.error('Failed to load image:', currentSection.imageUrl);
                    }}
                  />
                </div>
              </div>
              <ProgressBar />
            </div>
          )}
        </>
      ) : useTwoColumnLayout ? (
        /* No image BUT dense content - use two-column layout */
        <div className="flex flex-col items-center justify-start p-4 min-h-screen">
          <div ref={containerRef} className="w-full max-w-7xl mt-8">
            <Heading size="small" />

            {/* Split content into two columns - Split paragraphs evenly */}
            {(() => {
              const paragraphs = currentSection.content.split('\n\n').filter(p => p.trim());
              const midpoint = Math.ceil(paragraphs.length / 2);
              const leftContent = paragraphs.slice(0, midpoint).join('\n\n');
              const rightContent = paragraphs.slice(midpoint).join('\n\n');

              return (
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <MarkdownRenderer
                      content={leftContent}
                      className="leading-tight font-light text-left"
                      style={{ fontSize: `${Math.max(scaledFontSize * 0.55, 1.0)}rem` }}
                    />
                  </div>
                  <div className="space-y-2">
                    <MarkdownRenderer
                      content={rightContent}
                      className="leading-tight font-light text-left"
                      style={{ fontSize: `${Math.max(scaledFontSize * 0.55, 1.0)}rem` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
          <ProgressBar />
        </div>
      ) : (
        /* No image - fullscreen text */
        <div className="flex-1 flex flex-col items-center justify-center p-16">
          <div ref={containerRef} className="space-y-8 w-full px-8">
            <Heading size="xlarge" />
            <MarkdownRenderer
              content={currentSection.content}
              className="leading-relaxed font-light text-center"
              style={{ fontSize: `${scaledFontSize}rem` }}
            />
          </div>
          <ProgressBar />
        </div>
      )}
        </div>

        {/* Presentation Controls - Hover to expand */}
        <div
          className="fixed bottom-4 right-4 z-50"
          onMouseEnter={() => setIsControlsHovered(true)}
          onMouseLeave={() => setIsControlsHovered(false)}
        >
          {/* Collapsed: Show only settings icon */}
          {!isControlsHovered && (
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all"
              title="Presentation Controls"
            >
              <Settings className="w-6 h-6 animate-pulse" />
            </button>
          )}

          {/* Expanded: Show all controls */}
          {isControlsHovered && (
            <div className="flex flex-col gap-2 items-end animate-in slide-in-from-bottom duration-200">
              {/* Zoom Controls Panel */}
              <div className="bg-white border-2 border-blue-300 rounded-lg shadow-lg p-3 flex items-center gap-3">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Zoom Out (Ctrl + -)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-xs font-semibold text-gray-600">Text Size</span>
                  <span className="text-lg font-bold text-blue-600">{zoomLevel}%</span>
                </div>

                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Zoom In (Ctrl + +)"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <button
                  onClick={handleZoomReset}
                  className="px-3 py-2 rounded bg-blue-100 hover:bg-blue-200 transition-colors text-xs font-semibold text-blue-700"
                  title="Reset to 100% (Ctrl + 0)"
                >
                  Reset
                </button>
              </div>

              {/* Fullscreen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2 font-medium"
                title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="w-5 h-5" />
                    <span className="text-sm">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize className="w-5 h-5" />
                    <span className="text-sm">Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </TransitionEffects>
  );
}
