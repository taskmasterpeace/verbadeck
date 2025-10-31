# VerbaDeck PWA Mobile Implementation Plan

## Executive Summary
Convert VerbaDeck into a mobile-optimized Progressive Web App (PWA) with right-handed thumb-friendly controls, full-screen presentation mode, and offline capabilities.

## Critical Architectural Decision: Mobile vs Desktop

### Desktop Mode (Existing)
- **Dual-monitor support**: Presenter view + Audience view (/audience route)
- BroadcastChannel API syncs presenter and audience displays
- Use case: Laptop with external monitor/projector

### Mobile Mode (New)
- **Single presenter view ONLY** - NO audience view/route on mobile
- Shows script content (words) directly on device screen
- Use case: Presenter reads from their mobile device during presentation
- Simplified architecture: No BroadcastChannel needed on mobile

**Key Point:** The audience view and dual-monitor functionality are **desktop-only features**. Mobile is focused solely on the presenter's experience.

---

## Phase 1: PWA Foundation (Week 1)

### 1.1 Install vite-plugin-pwa
```bash
npm install -D vite-plugin-pwa
npm install -D @vite-pwa/assets-generator
```

### 1.2 Configure vite.config.ts
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.ico'],
      manifest: {
        name: 'VerbaDeck - Voice Presentations',
        short_name: 'VerbaDeck',
        description: 'Voice-driven presentation system',
        theme_color: '#2563eb', // blue-600
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ]
})
```

### 1.3 Generate PWA Assets
```bash
npx @vite-pwa/assets-generator --preset minimal public/logo.png
```

---

## Phase 2: Mobile-First Responsive Design (Week 2)

### 2.1 Breakpoint Strategy (Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '375px',      // Small phones
      'sm': '640px',      // Large phones (landscape)
      'md': '768px',      // Tablets
      'lg': '1024px',     // Small laptops
      'xl': '1280px',     // Desktops
      '2xl': '1536px',    // Large desktops
      '3xl': '1920px',    // Ultrawide monitors
    }
  }
}
```

### 2.2 Mobile Layout Architecture

> **IMPORTANT:** Mobile uses a single unified presenter view. The dual-monitor audience view is desktop-only and will be blocked on mobile devices via route protection.

**Current Desktop Layout:**
```
┌─────────────────────────────────┐
│  Logo  [Status]    [🎤 Voice]  │ ← Header
├─────────────────────────────────┤
│ [AI] [Edit] [Present]    [Load]│ ← Tabs
├─────────────────────────────────┤
│                                 │
│      Main Content Area          │
│                                 │
└─────────────────────────────────┘
```

**Proposed Mobile Layout (Portrait):**
```
┌──────────────┐
│ VerbaDeck ▼  │ ← Hamburger menu (top-right for right-handed)
├──────────────┤
│              │
│   Content    │
│   Full       │
│   Screen     │
│              │
├──────────────┤
│ [◀] [▶] [⋮] │ ← Bottom nav (thumb zone)
└──────────────┘
```

**Proposed Mobile Presenter View (Full Screen):**
```
┌──────────────────┐
│                  │
│                  │
│  Slide Content   │
│    + Image       │
│                  │
│                  │
├──────────────────┤
│ Progress Bar     │ ← Visual indicator
│ [Back] [🎤][Next]│ ← Thumb zone controls
└──────────────────┘
```

### 2.3 Right-Handed Thumb Zone Optimization

**Thumb Zone Map (Right-Handed Users):**
```
┌──────────────────┐
│  HARD   │  HARD  │  ← Top corners = hard to reach
├─────────┼────────┤
│  STRETCH│STRETCH │  ← Middle = stretch zone
├─────────┼────────┤
│  EASY   │  EASY  │  ← Bottom = natural thumb rest
└──────────────────┘
     ↑         ↑
  Easy for  Easiest
  lefties   for righties
```

**Control Placement Strategy:**
- **Bottom-Right:** Primary action (Next slide, Voice Control)
- **Bottom-Center:** Secondary action (Play/Pause)
- **Bottom-Left:** Back navigation
- **Top-Right:** Menu (hamburger) - acceptable for infrequent use
- **Top-Left:** Logo/Home
- **Avoid:** Top center, middle of screen for critical actions

---

## Phase 3: Mobile Presenter View (Week 3)

### 3.1 Full-Screen API Implementation

```typescript
// hooks/useFullscreen.ts
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Fullscreen failed:', err);
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return { isFullscreen, enterFullscreen, exitFullscreen };
}
```

### 3.2 Screen Wake Lock (Prevent Sleep)

```typescript
// hooks/useWakeLock.ts
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake lock activated');
      }
    } catch (err) {
      console.error('Wake lock failed:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  return { requestWakeLock, releaseWakeLock };
}
```

### 3.3 Mobile Gesture Support

```typescript
// hooks/useSwipeGesture.ts
export function useSwipeGesture(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    touchEnd.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeDistance = touchStart.current - touchEnd.current;
    const minSwipeDistance = 50; // pixels

    if (swipeDistance > minSwipeDistance) {
      // Swipe left → Next slide
      onSwipeLeft();
    } else if (swipeDistance < -minSwipeDistance) {
      // Swipe right → Previous slide
      onSwipeRight();
    }
  };

  return { handleTouchStart, handleTouchEnd };
}
```

### 3.4 Vibration Feedback

```typescript
// utils/haptics.ts
export const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Usage examples:
// vibrate(50);           // Quick tap
// vibrate([100, 50, 100]); // Double tap feedback
```

---

## Phase 4: Component Responsive Design (Week 4)

### 4.1 Mobile StatusBar Component

```tsx
// components/MobileStatusBar.tsx
export function MobileStatusBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo - smaller on mobile */}
        <img src="/logo.png" alt="VerbaDeck" className="h-10 md:h-20" />

        {/* Hamburger menu - top right (thumb-friendly) */}
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
```

### 4.2 Mobile Bottom Navigation

```tsx
// components/MobileBottomNav.tsx
export function MobileBottomNav({ onPrev, onNext, onVoiceToggle, isVoiceActive }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around px-4 py-3">
        {/* Left: Back button (easy for left thumb, acceptable for right) */}
        <button
          onClick={onPrev}
          className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center: Voice control */}
        <button
          onClick={onVoiceToggle}
          className={`p-5 rounded-full transition-all ${
            isVoiceActive
              ? 'bg-red-600 text-white shadow-lg scale-110'
              : 'bg-blue-600 text-white shadow-md'
          }`}
        >
          {isVoiceActive ? <Square className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        {/* Right: Next button (optimal for right thumb) */}
        <button
          onClick={onNext}
          className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-transform"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
```

### 4.3 Responsive Presenter View

```tsx
// components/PresenterView.tsx - Mobile optimizations
<div className="
  grid grid-cols-1 lg:grid-cols-3 gap-4

  /* Mobile: Full screen content */
  min-h-screen lg:min-h-0

  /* Mobile: Hide side panel in portrait */
  [&>aside]:hidden lg:[&>aside]:block
">
  {/* Main slide - full width on mobile */}
  <main className="lg:col-span-2 p-4 lg:p-12">
    {/* Larger text on mobile for readability */}
    <p className="text-lg md:text-xl lg:text-2xl leading-relaxed">
      {content}
    </p>
  </main>

  {/* Side panel - hidden on mobile, visible on tablet+ */}
  <aside className="hidden lg:block">
    {/* Next up preview */}
  </aside>
</div>
```

---

## Phase 5: Mobile Presenter Experience Enhancement (Week 5)

### 5.1 Mobile Device Detection & Routing

**Automatically detect mobile and prevent audience route:**

```typescript
// hooks/useMobileDetect.ts
export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const touchDevice = 'ontouchstart' in window;
      const smallScreen = window.innerWidth < 768;

      setIsMobile(mobile || (touchDevice && smallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
```

**Route Protection:**
```tsx
// App.tsx - Redirect mobile users away from /audience
function App() {
  const isMobile = useMobileDetect();

  useEffect(() => {
    if (isMobile && location.pathname === '/audience') {
      // Redirect mobile users to main presenter view
      navigate('/');
    }
  }, [isMobile, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<PresenterView />} />
      {/* Audience route only available on desktop */}
      {!isMobile && <Route path="/audience" element={<AudienceView />} />}
    </Routes>
  );
}
```

### 5.2 Mobile Presenter View Optimization

**Content Display Strategy:**
- Show slide image (if available) at top
- Show script content below with trigger words highlighted
- Large readable text for presenting
- No "next up" preview panel (single column)

```tsx
// components/PresenterView.tsx - Mobile variant
export function MobilePresenterView({ section }: { section: Section }) {
  return (
    <div className="flex flex-col h-full">
      {/* Image section - if present */}
      {section.imageUrl && (
        <div className="w-full bg-black flex-shrink-0">
          <img
            src={section.imageUrl}
            alt="Slide"
            className="w-full h-auto max-h-[40vh] object-contain"
          />
        </div>
      )}

      {/* Script content - scrollable if needed */}
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-xl leading-relaxed">
          {renderContentWithTriggers(section)}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="px-6 pb-2">
        <Progress value={progress} className="h-1" />
        <p className="text-xs text-gray-500 mt-1 text-center">
          Slide {currentIndex + 1} / {totalSlides}
        </p>
      </div>
    </div>
  );
}
```

### 5.3 Text Sizing for Mobile Readability

```typescript
// utils/mobile-text-sizing.ts
export function getOptimalTextSize(contentLength: number, screenSize: 'small' | 'medium' | 'large') {
  // Auto-adjust text size based on content length and device
  if (screenSize === 'small') {
    return contentLength > 200 ? 'text-base' : 'text-lg';
  } else if (screenSize === 'medium') {
    return contentLength > 200 ? 'text-lg' : 'text-xl';
  } else {
    return contentLength > 200 ? 'text-xl' : 'text-2xl';
  }
}
```

---

## Phase 6: Performance & Offline (Week 6)

### 6.1 Offline Presentation Support

**Strategy:**
1. Cache presentation JSON in IndexedDB
2. Cache images as base64 in IndexedDB
3. Service worker caches all UI assets
4. Allow presentations to work fully offline

```typescript
// lib/offline-storage.ts
import { openDB } from 'idb';

const DB_NAME = 'verbadeck-offline';
const STORE_NAME = 'presentations';

export async function saveOfflinePresentation(presentation: Presentation) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  });

  await db.put(STORE_NAME, {
    id: presentation.id,
    sections: presentation.sections,
    timestamp: Date.now()
  });
}

export async function getOfflinePresentations() {
  const db = await openDB(DB_NAME, 1);
  return await db.getAll(STORE_NAME);
}
```

### 6.2 Image Optimization for Mobile

```typescript
// utils/image-compression.ts
export async function compressImage(dataUrl: string, maxWidth = 1920): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
}
```

---

## Phase 7: Mobile-Specific Features (Week 7)

### 7.1 Install Prompt

```typescript
// components/InstallPrompt.tsx
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-xl z-50">
      <p className="font-semibold mb-2">Install VerbaDeck</p>
      <p className="text-sm mb-3">Add to home screen for quick access</p>
      <div className="flex gap-2">
        <button onClick={handleInstall} className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold">
          Install
        </button>
        <button onClick={() => setShowInstall(false)} className="px-4 py-2 bg-blue-700 rounded-lg">
          Not now
        </button>
      </div>
    </div>
  );
}
```

### 7.2 Share API Integration

```typescript
// utils/share.ts
export async function sharePresentation(presentation: Presentation) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'VerbaDeck Presentation',
        text: `Check out my presentation: ${presentation.title}`,
        url: window.location.href
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  } else {
    // Fallback: Copy link
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
}
```

### 7.3 Mobile Microphone Handling

```typescript
// Enhanced mobile mic permissions
export async function requestMobileAudioPermissions() {
  try {
    // Request both getUserMedia AND Web Speech API permissions
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000 // Optimize for mobile
      }
    });

    // Test permissions work
    stream.getTracks().forEach(track => track.stop());

    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      alert('Microphone permission denied. Please enable in Settings > VerbaDeck > Microphone');
    }
    return false;
  }
}
```

---

## Phase 8: Testing & Optimization (Week 8)

### 8.1 Mobile Testing Checklist

**Devices to Test:**
- [ ] iPhone 12/13/14 (Safari iOS 15+)
- [ ] iPhone SE (small screen)
- [ ] Android Pixel (Chrome)
- [ ] Samsung Galaxy (Samsung Internet)
- [ ] iPad (tablet mode)

**Tests:**
- [ ] Install PWA from home screen
- [ ] Works offline after install
- [ ] Full screen presentation mode
- [ ] Voice control with phone locked/unlocked
- [ ] Battery drain during 30-min presentation
- [ ] Swipe gestures work smoothly
- [ ] Bottom nav buttons in thumb reach
- [ ] Orientation changes (portrait/landscape)
- [ ] Screen doesn't sleep during presentation
- [ ] /audience route blocked on mobile (redirects to presenter view)
- [ ] Single presenter view displays correctly
- [ ] Script content readable at arm's length

### 8.2 Lighthouse PWA Audit

```bash
# Run Lighthouse audit
npm run build
npx serve -s dist
# Open Chrome DevTools > Lighthouse > Progressive Web App
```

**Target Scores:**
- PWA: 100/100
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+

---

## Implementation Priority

### Must-Have (Phase 1-3)
1. ✅ PWA manifest + service worker
2. ✅ Mobile responsive layout
3. ✅ Bottom navigation (thumb zone)
4. ✅ Full-screen mode
5. ✅ Screen wake lock

### Should-Have (Phase 4-5)
6. Swipe gestures
7. Haptic feedback
8. Mobile device detection & route protection
9. Responsive image sizing
10. Auto text sizing for readability

### Nice-to-Have (Phase 6-8)
11. Offline support
12. Install prompt
13. Share API
14. Image compression
15. Advanced caching

---

## Technical Debt & Challenges

### Challenge 1: iOS Safari Limitations
**Problem:** iOS Safari has limited PWA support
**Solution:**
- Provide fallback for features not available
- Clear messaging about iOS limitations
- Consider WKWebView wrapper for App Store version

### Challenge 2: Audio Permissions on Mobile
**Problem:** Mobile browsers are stricter with audio permissions
**Solution:**
- Require user gesture before requesting mic
- Clear UI explaining why permission is needed
- Fallback to manual navigation if audio denied

### Challenge 3: Battery Drain
**Problem:** Continuous mic listening drains battery
**Solution:**
- Add battery optimization mode
- Show battery status in UI
- Allow toggle between voice and manual mode

---

## File Structure After Implementation

```
client/
├── public/
│   ├── manifest.webmanifest       # PWA manifest
│   ├── sw.js                      # Service worker
│   ├── pwa-192x192.png           # PWA icons
│   └── pwa-512x512.png
├── src/
│   ├── components/
│   │   ├── mobile/
│   │   │   ├── MobileStatusBar.tsx
│   │   │   ├── MobileBottomNav.tsx
│   │   │   └── InstallPrompt.tsx
│   │   ├── PresenterView.tsx     # Responsive (mobile + desktop)
│   │   └── AudienceView.tsx      # Desktop only
│   ├── hooks/
│   │   ├── useFullscreen.ts      # Full-screen API
│   │   ├── useWakeLock.ts        # Prevent device sleep
│   │   ├── useSwipeGesture.ts    # Mobile gesture support
│   │   └── useMobileDetect.ts    # Device detection & routing
│   ├── lib/
│   │   ├── offline-storage.ts    # IndexedDB for offline
│   │   └── pwa-utils.ts
│   └── utils/
│       ├── haptics.ts            # Vibration feedback
│       ├── image-compression.ts  # Optimize images
│       ├── mobile-text-sizing.ts # Auto text sizing
│       └── share.ts              # Web Share API
└── vite.config.ts                # Updated with VitePWA
```

**Note:** AudienceView.tsx and BroadcastChannel sync are desktop-only features and will not be accessible on mobile devices.

---

## Success Metrics

### User Experience
- 95%+ mobile users can install PWA
- 90%+ presentations work offline
- Zero screen timeout during presentations
- <100ms gesture response time

### Performance
- <3 second load time on 3G
- <50MB installed size
- <10% battery drain per hour of presenting

### Adoption
- 40% of users access via mobile within 3 months
- 60% of mobile users install PWA
- 4.5+ star rating on mobile user feedback

---

## Next Steps

1. **Review this plan** with team
2. **Set up development environment** for mobile testing
3. **Start Phase 1** (PWA foundation)
4. **Create mobile wireframes** in Figma
5. **Test on real devices** weekly

---

## Resources

- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Mobile UX Thumb Zone Research](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [Can I Use - PWA Features](https://caniuse.com/?search=pwa)
