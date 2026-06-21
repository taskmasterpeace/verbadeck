# VerbaDeck Mobile Architecture

**Dual-View System Architecture for Mobile Devices**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     VerbaDeck Mobile System                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐          ┌──────▼───────┐
        │ Presenter View │          │ Audience View│
        │   /presenter   │          │  /audience   │
        └───────┬────────┘          └──────┬───────┘
                │                           │
                │   BroadcastChannel API    │
                │   'verbadeck-presentation'│
                └───────────┬───────────────┘
                            │
                    ┌───────▼───────┐
                    │ Zustand Store │
                    │ (Shared State)│
                    └───────────────┘
```

---

## Component Architecture

### Presenter View (`/presenter`)

```
┌─────────────────────────────────────────────────────────────┐
│                       PresenterView.tsx                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────┐  │
│  │  LEFT (70%)                 │  │  RIGHT (30%)       │  │
│  │  Speaker Notes Panel        │  │  Preview Panel     │  │
│  ├─────────────────────────────┤  ├────────────────────┤  │
│  │                             │  │                    │  │
│  │  ┌─ PresentationTimer ───┐ │  │  ┌─ Preview ─────┐ │  │
│  │  │ ⏱ 00:05:30  Slide 2/5 │ │  │  │ 📺 Audience   │ │  │
│  │  └───────────────────────┘ │  │  │    Sees:      │ │  │
│  │                             │  │  │               │ │  │
│  │  ┌─ Section Info ────────┐ │  │  │ [Slide Image] │ │  │
│  │  │ Section 2 of 5        │ │  │  │               │ │  │
│  │  │ Say: "data"           │ │  │  └───────────────┘ │  │
│  │  └───────────────────────┘ │  │                    │  │
│  │                             │  │  ┌─ Next Up ─────┐ │  │
│  │  ┌─ Heading ──────────────┐│  │  │               │ │  │
│  │  │ Market Opportunity    ││  │  │ [Next Slide]  │ │  │
│  │  └───────────────────────┘ │  │  │               │ │  │
│  │                             │  │  └───────────────┘ │  │
│  │  ┌─ Speaker Notes ────────┐│  │                    │  │
│  │  │ The global market...   ││  └────────────────────┘  │
│  │  │ (2xl text, readable)   ││                          │
│  │  └───────────────────────┘ │                          │
│  │                             │                          │
│  │  ┌─ Structured Notes ─────┐│                          │
│  │  │                         ││                          │
│  │  │ ┌─ Key Message ──────┐ ││                          │
│  │  │ │ "Profound quote..."│ ││                          │
│  │  │ └────────────────────┘ ││                          │
│  │  │                         ││                          │
│  │  │ ┌─ Talking Points ───┐ ││                          │
│  │  │ │ Data│Vision│Proof │ ││  ← Touch Tabs            │
│  │  │ ├───────────────────┬┘││                          │
│  │  │ │ According to...   │ ││  ← Active Tab Content   │
│  │  │ └───────────────────┘ ││                          │
│  │  │                         ││                          │
│  │  │ ┌─ High Impact ──────┐ ││                          │
│  │  │ │ Closing paragraph..│ ││                          │
│  │  │ └────────────────────┘ ││                          │
│  │  │                         ││                          │
│  │  └─────────────────────────┘│                          │
│  │                             │                          │
│  │  ┌─ Progress Bar ──────────┐│                          │
│  │  │ [━━━━━━━━░░░░░]  60%   ││                          │
│  │  └─────────────────────────┘│                          │
│  │                             │                          │
│  └─────────────────────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Props:**
- `onSectionClick?: (index: number) => void`
- `onNavigateNext?: () => void`
- `onNavigatePrev?: () => void`
- `onStopStreaming?: () => void`

**Data Sources:**
```typescript
const sections = usePresentationStore((state) => state.sections);
const sectionIndex = usePresentationStore((state) => state.currentSectionIndex);
const isStreaming = useVoiceStore((state) => state.isStreaming);
```

---

### Audience View (`/audience`)

```
┌─────────────────────────────────────────────────────────────┐
│                       AudienceView.tsx                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                  ┌───────────────────────┐                  │
│                  │   TransitionEffects   │                  │
│                  │   (Flash on change)   │                  │
│                  └───────────┬───────────┘                  │
│                              │                              │
│              ┌───────────────▼────────────────┐             │
│              │                                │             │
│              │  ┌──────────────────────────┐  │             │
│              │  │  Heading (bold, large)   │  │             │
│              │  └──────────────────────────┘  │             │
│              │                                │             │
│              │  ┌──────────────────────────┐  │             │
│              │  │                          │  │             │
│              │  │   [Image]                │  │  ← If present
│              │  │   or                     │  │             │
│              │  │   Content Text           │  │             │
│              │  │   (Dynamic sizing)       │  │             │
│              │  │                          │  │             │
│              │  └──────────────────────────┘  │             │
│              │                                │             │
│              │  ┌──────────────────────────┐  │             │
│              │  │ [━━━━━━━━░░░░░]  60%     │  │  ← Progress
│              │  │ Slide 2 of 5             │  │             │
│              │  └──────────────────────────┘  │             │
│              │                                │             │
│              └────────────────────────────────┘             │
│                                                             │
│                                              ┌────────────┐ │
│                                              │  [⚙]       │ │ ← Zoom
│                                              └────────────┘ │   Controls
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Layout Modes:**
1. **Balanced** (`md:grid-cols-2`): Image left, text right (stacks on mobile)
2. **Image Top**: Full-width image, text below
3. **Image Bottom**: Text top, image below
4. **Image Focus**: Large image, small caption
5. **Text Focus**: Large text, small image thumbnail
6. **Image Only**: Fullscreen image

**Zoom Controls (Expandable):**
```
┌─────────────────────────────────┐
│ Collapsed:                      │
│   [⚙] (Settings icon, pulse)    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Expanded (on hover/tap):        │
│ ┌───────────────────────────┐   │
│ │ [-] Text Size  100%  [+]  │   │
│ │ [Reset]                   │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ [Fullscreen]              │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

---

## Data Flow Architecture

### Initialization Flow

```
User Opens Page
      │
      ▼
┌─────────────┐
│   App.tsx   │ (or PresenterPage.tsx / AudiencePage.tsx)
└──────┬──────┘
       │
       ├─── Initialize Zustand Stores
       │    ├── usePresentationStore (sections, currentIndex)
       │    ├── useVoiceStore (isStreaming, transcript)
       │    └── useLibraryStore (saved presentations)
       │
       └─── Initialize BroadcastChannel
            │
            ▼
       ┌────────────────────┐
       │ useBroadcastSync   │
       │ (mode: presenter   │
       │  or audience)      │
       └────────┬───────────┘
                │
                ├─── Create BroadcastChannel('verbadeck-presentation')
                │
                ├─── If audience: Send 'request-state' message
                │
                └─── Listen for updates
```

### Navigation Flow (Presenter → Audience)

```
Presenter: User Clicks "Next"
      │
      ▼
┌─────────────────────┐
│ PresenterView.tsx   │
│ onNavigateNext()    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ usePresentationStore│
│ .advanceSection()   │
└──────┬──────────────┘
       │
       ├─── Update: currentSectionIndex++
       │
       ▼
┌─────────────────────┐
│ useBroadcastSync    │
│ (useEffect trigger) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ BroadcastChannel    │
│ .postMessage({      │
│   type: 'update',   │
│   state: {...}      │
│ })                  │
└──────┬──────────────┘
       │
       ▼ (Message broadcast)
       │
       ▼
┌─────────────────────┐
│ Audience Tab:       │
│ BroadcastChannel    │
│ .onmessage          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ useBroadcastSync    │
│ handleMessage()     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ usePresentationStore│
│ .setState({...})    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ AudienceView.tsx    │
│ Re-renders with     │
│ new section         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ TransitionEffects   │
│ Flash animation     │
│ (800ms duration)    │
└─────────────────────┘
```

**Latency:** < 100ms from click to audience update

---

## Mobile Responsive Strategy

### Breakpoint System

```
┌────────────────────────────────────────────────────────────┐
│  Screen Width  │  Breakpoint  │  Layout Changes           │
├────────────────┼──────────────┼───────────────────────────┤
│  < 640px       │  (default)   │  Single column            │
│                │              │  Stacked cards            │
│                │              │  Reduced padding          │
├────────────────┼──────────────┼───────────────────────────┤
│  640px - 767px │  sm:         │  Larger buttons           │
│                │              │  More spacing             │
├────────────────┼──────────────┼───────────────────────────┤
│  768px - 1023px│  md:         │  2-column grids           │
│                │              │  Side-by-side image/text  │
│                │              │  Visible sidebar          │
├────────────────┼──────────────┼───────────────────────────┤
│  1024px+       │  lg:         │  Full desktop layout      │
│                │              │  70/30 presenter split    │
│                │              │  Multi-column grids       │
└────────────────┴──────────────┴───────────────────────────┘
```

### Component Adaptation

**Home Cards:**
```typescript
// Desktop (md:):
className="grid md:grid-cols-3 gap-6"
// Result: 3 cards side-by-side

// Mobile (< 768px):
className="grid grid-cols-1 gap-6"
// Result: Cards stack vertically
```

**Audience Layout:**
```typescript
// Desktop (md:):
className="grid md:grid-cols-2"
// Result: Image left, text right (50/50)

// Mobile (< 768px):
className="grid grid-cols-1"
// Result: Image top, text bottom (stacked)
```

**Padding Adjustment:**
```typescript
// Desktop:
className="p-12"  // 48px padding

// Tablet:
className="md:p-8"  // 32px padding

// Mobile:
className="p-4"  // 16px padding
```

---

## Touch Interaction Architecture

### Touch Target Standards

**WCAG 2.1 Requirement:** 44x44px minimum

```
┌───────────────────────────────────────────────────┐
│  Element         │  Size (px)  │  Status          │
├──────────────────┼─────────────┼──────────────────┤
│  Tab Buttons     │  48 x 44    │  ✅ Pass         │
│  Navigation Btns │  48 x 48    │  ✅ Pass         │
│  Settings Icon   │  48 x 48    │  ✅ Pass         │
│  Zoom Controls   │  48 x 48    │  ✅ Pass         │
│  Fullscreen Btn  │  Auto x 48  │  ✅ Pass         │
│  Jump Buttons    │  36 x 36    │  ⚠️ Borderline   │
└──────────────────┴─────────────┴──────────────────┘
```

### Event Handling

**Current Implementation:**
- Uses React's `onClick` (works for both mouse and touch)
- No custom `onTouchStart`/`onTouchEnd` needed
- React SyntheticEvent handles cross-browser compatibility

**Future Enhancements:**
```typescript
// Swipe detection (future)
const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
};

const handleTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > 50) { // 50px swipe threshold
    if (diff > 0) {
      advanceSection(); // Swipe left → next
    } else {
      goBackSection(); // Swipe right → previous
    }
  }
};
```

---

## State Management (Zustand)

### Store Architecture

```typescript
// client/src/stores/presentation.ts
interface PresentationState {
  sections: Section[];
  currentSectionIndex: number;

  // Actions
  setSections: (sections: Section[]) => void;
  setCurrentSection: (index: number) => void;
  advanceSection: () => void;
  goBackSection: () => void;
  updateSection: (index: number, updates: Partial<Section>) => void;
}

// client/src/stores/voice.ts
interface VoiceState {
  isStreaming: boolean;
  transcript: string[];
  lastTranscript: string;

  // Actions
  setIsStreaming: (streaming: boolean) => void;
  addTranscript: (text: string) => void;
  clearTranscripts: () => void;
}
```

### Store Usage Pattern

```typescript
// In component:
import { usePresentationStore } from '@/stores/presentation';

function MyComponent() {
  // Subscribe to specific state slices (auto re-render on change)
  const sections = usePresentationStore((state) => state.sections);
  const currentIndex = usePresentationStore((state) => state.currentSectionIndex);
  const advanceSection = usePresentationStore((state) => state.advanceSection);

  return (
    <button onClick={advanceSection}>Next</button>
  );
}
```

**Benefits:**
- No prop drilling
- Auto re-render only when subscribed state changes
- Simple API (no reducers/actions boilerplate)
- Works seamlessly with BroadcastChannel

---

## Performance Optimization

### Bundle Splitting

```
client/dist/
├── index.html                    1.2 kB
├── assets/
│   ├── index-abc123.css         45 kB (Tailwind, gzipped)
│   ├── index-def456.js          180 kB (Main bundle)
│   ├── presenter-xyz789.js      25 kB (Lazy loaded)
│   ├── audience-ghi012.js       20 kB (Lazy loaded)
│   └── vendor-jkl345.js         120 kB (React, Zustand, etc.)
```

**Lazy Loading Routes:**
```typescript
// App.tsx
const PresenterPage = lazy(() => import('./pages/PresenterPage'));
const AudiencePage = lazy(() => import('./pages/AudiencePage'));

<Routes>
  <Route path="/presenter" element={
    <Suspense fallback={<Loading />}>
      <PresenterPage />
    </Suspense>
  } />
  <Route path="/audience" element={
    <Suspense fallback={<Loading />}>
      <AudiencePage />
    </Suspense>
  } />
</Routes>
```

### Image Optimization

**Current:**
- User uploads: PNG/JPG
- Stored as base64 or URL

**Future Enhancements:**
```typescript
// Convert to WebP on upload
async function optimizeImage(file: File): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = await createImageBitmap(file);

  canvas.width = Math.min(img.width, 1920); // Max 1920px wide
  canvas.height = canvas.width * (img.height / img.width);

  ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toBlob(
    (blob) => URL.createObjectURL(blob!),
    'image/webp',
    0.85 // 85% quality
  );
}
```

---

## Testing Architecture

### Test Pyramid

```
                       ┌─────────────┐
                       │   Manual    │  ← User acceptance
                       │   Testing   │
                       └─────────────┘
                      ┌───────────────┐
                      │  E2E Tests    │  ← Playwright
                      │  (Full flows) │
                      └───────────────┘
                 ┌─────────────────────┐
                 │  Integration Tests  │  ← Component + hooks
                 └─────────────────────┘
            ┌───────────────────────────┐
            │      Unit Tests           │  ← Functions, utils
            └───────────────────────────┘
```

### Playwright Test Projects

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },

  // Mobile projects
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  { name: 'tablet', use: { ...devices['iPad Pro'] } },
]
```

### Mobile Test Coverage

**Files:**
- `tests/mobile-responsive.spec.ts` - Layout & breakpoints
- `tests/broadcastchannel-sync.spec.ts` - Dual-view sync
- `tests/presenter-workflow.spec.ts` - Presenter interactions
- `tests/accessibility.spec.ts` - Touch targets, ARIA

**Key Test Scenarios:**
1. Responsive layouts at all breakpoints
2. Touch target sizes (WCAG 2.1)
3. BroadcastChannel sync across tabs
4. Speaker notes tab switching
5. Zoom controls functionality
6. Fullscreen toggle
7. Orientation change handling
8. Performance (< 5s load time)

---

## File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── PresenterView.tsx         ← Main presenter UI
│   │   ├── AudienceView.tsx          ← Main audience UI
│   │   ├── PresentationTimer.tsx     ← Timer component
│   │   ├── CurrentSlidePreview.tsx   ← Preview panel
│   │   ├── TransitionEffects.tsx     ← Flash animations
│   │   ├── MarkdownRenderer.tsx      ← Slide content
│   │   └── ui/                       ← shadcn components
│   │
│   ├── pages/
│   │   ├── PresenterPage.tsx         ← /presenter route
│   │   └── AudiencePage.tsx          ← /audience route
│   │
│   ├── hooks/
│   │   ├── useBroadcastSync.ts       ← BroadcastChannel hook
│   │   ├── use-mobile.tsx            ← Mobile detection (768px)
│   │   ├── useDynamicTextSize.tsx    ← Text scaling
│   │   └── usePresentation.ts        ← Presentation logic
│   │
│   ├── stores/
│   │   ├── presentation.ts           ← Zustand: sections, index
│   │   └── voice.ts                  ← Zustand: streaming, transcript
│   │
│   ├── lib/
│   │   ├── script-parser.ts          ← Section interface
│   │   └── file-storage.ts           ← localStorage utils
│   │
│   └── App.tsx                        ← Main app, routing
│
tests/
├── mobile-responsive.spec.ts          ← Mobile layout tests
├── broadcastchannel-sync.spec.ts      ← Sync tests
├── presenter-workflow.spec.ts         ← Presenter interactions
└── MANUAL_BROADCASTCHANNEL_TEST.md    ← Manual test guide
```

---

## Browser Support Matrix

### Desktop Browsers

| Browser | Version | BroadcastChannel | Fullscreen | Status |
|---------|---------|------------------|------------|--------|
| Chrome  | 80+     | ✅               | ✅         | Full   |
| Firefox | 38+     | ✅               | ✅         | Full   |
| Safari  | 15.4+   | ✅               | ⚠️ Limited | Good   |
| Edge    | 79+     | ✅               | ✅         | Full   |

### Mobile Browsers

| Browser | Version | BroadcastChannel | Fullscreen | Status |
|---------|---------|------------------|------------|--------|
| Chrome (Android) | 80+ | ✅           | ✅         | Full   |
| Safari (iOS)     | 15.4+ | ✅         | ⚠️ Limited | Good   |
| Firefox (Android)| 38+ | ✅           | ✅         | Full   |
| Samsung Internet | 13+ | ✅           | ✅         | Full   |

**Legend:**
- ✅ Full Support
- ⚠️ Limited (requires user gesture or has restrictions)
- ❌ Not Supported

---

## Future Enhancements

### Short-Term
1. **Swipe Gestures**: Swipe left/right for navigation
2. **Haptic Feedback**: Vibration on slide change
3. **Single-Column Presenter**: Optimized for phones < 640px

### Medium-Term
4. **Server-Side Sync**: WebSockets/SSE for cross-device sync
5. **PWA Support**: Service worker, offline mode, install prompt
6. **Voice Commands**: "Next slide", "Previous", "Go to slide 5"

### Long-Term
7. **Real-Time Collaboration**: Multiple presenters, live annotations
8. **Analytics**: Track slide timing, engagement, Q&A stats
9. **Adaptive Layouts**: AI-powered layout selection based on content

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Status:** Complete Architecture Reference
