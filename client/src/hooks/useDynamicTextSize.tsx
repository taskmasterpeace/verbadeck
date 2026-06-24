import { useEffect, useState, useRef, useCallback } from 'react';

interface TextSizeConfig {
  minSize: number; // rem - minimum font size
  maxSize: number; // rem - maximum font size
  containerHeightPercent: number; // percentage of viewport height to use
  step: number; // how much to decrease size on each iteration
}

const DEFAULT_CONFIG: TextSizeConfig = {
  minSize: 2,    // 32px minimum (increased for better readability)
  maxSize: 8,    // 128px maximum (increased for presentations)
  containerHeightPercent: 80, // use 80% of viewport height
  step: 0.2,     // decrease by 0.2rem each step (faster scaling)
};

export function useDynamicTextSize(
  content: string,
  hasImage: boolean = false,
  customConfig?: Partial<TextSizeConfig>
) {
  const config = { ...DEFAULT_CONFIG, ...customConfig };

  // Adjust available space if image is present
  if (hasImage && !customConfig?.containerHeightPercent) {
    config.containerHeightPercent = 50; // Use less space when image present
  }

  const [fontSize, setFontSize] = useState(config.maxSize);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);

  const calculateOptimalSize = useCallback(() => {
    if (!containerRef.current || !measurementRef.current) return;

    const container = containerRef.current;
    const measurement = measurementRef.current;
    // VD-3: measure against the ACTUAL available area (the flex parent), not a window %, so the
    // heading + chrome that share the slide are accounted for — long content no longer clips
    // off-screen. Reserve room for the heading (more when text shares the slide with no image).
    const parent = container.parentElement;
    const parentHeight = parent?.clientHeight || (window.innerHeight * config.containerHeightPercent) / 100;
    const availableHeight = parentHeight * (hasImage ? 0.8 : 0.66);
    const availableWidth = container.clientWidth || parent?.clientWidth || window.innerWidth * 0.85;

    // Start with max size
    let currentSize = config.maxSize;
    measurement.style.fontSize = `${currentSize}rem`;
    measurement.style.maxWidth = `${availableWidth}px`;

    // Check if content overflows
    const checkOverflow = () => {
      const contentHeight = measurement.scrollHeight;
      const contentWidth = measurement.scrollWidth;
      return contentHeight > availableHeight || contentWidth > availableWidth;
    };

    // Scale down until it fits
    let iterations = 0;
    const maxIterations = 50; // Prevent infinite loops

    while (checkOverflow() && currentSize > config.minSize && iterations < maxIterations) {
      currentSize -= config.step;
      currentSize = Math.max(currentSize, config.minSize); // Don't go below minimum
      measurement.style.fontSize = `${currentSize}rem`;
      iterations++;
    }

    // Check if still overflowing at minimum size
    setIsOverflowing(checkOverflow() && currentSize === config.minSize);
    setFontSize(parseFloat(currentSize.toFixed(2)));
  }, [content, config.maxSize, config.minSize, config.containerHeightPercent, config.step]);

  useEffect(() => {
    // Calculate on mount and when content changes
    calculateOptimalSize();
    // VD-3: re-measure after layout settles — on first mount (esp. a freshly opened audience window
    // on a second monitor) the parent height can read 0 and over-size the text. Recheck on the next
    // frame and shortly after so the fit is correct once the layout is real.
    const raf = requestAnimationFrame(() => calculateOptimalSize());
    const t = setTimeout(() => calculateOptimalSize(), 220);

    // Recalculate on window resize
    const handleResize = () => {
      calculateOptimalSize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateOptimalSize]);

  return {
    fontSize,
    isOverflowing,
    containerRef,
    measurementRef,
  };
}

// Helper component for measurement (hidden from view)
export function TextSizeMeasurement({
  content,
  measurementRef,
  className = ''
}: {
  content: React.ReactNode;
  measurementRef: React.RefObject<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div
      ref={measurementRef}
      className={className}
      style={{
        position: 'absolute',
        visibility: 'hidden',
        pointerEvents: 'none',
        top: 0,
        left: 0,
        width: '100%',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {content}
    </div>
  );
}
