# VerbaDeck Mobile Testing Guide

**Version:** 1.0
**Last Updated:** 2025-11-13
**Status:** Complete Test Guide for Dual-View Mobile Support

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start (5 Minutes)](#quick-start-5-minutes)
3. [Understanding the Dual-View System](#understanding-the-dual-view-system)
4. [Testing on Real Mobile Devices](#testing-on-real-mobile-devices)
5. [Testing Mobile Layouts](#testing-mobile-layouts)
6. [Testing Dual-Tab/Dual-Device Sync](#testing-dual-tabdual-device-sync)
7. [Feature Verification Checklist](#feature-verification-checklist)
8. [Expected Mobile Layouts](#expected-mobile-layouts)
9. [Known Limitations & Workarounds](#known-limitations--workarounds)
10. [Troubleshooting](#troubleshooting)

---

## Overview

VerbaDeck's dual-view system provides two distinct presentation modes:

- **Presenter View** (`/presenter`): Speaker-facing interface with speaker notes, talking points tabs (Data/Vision/Proof), trigger words, and navigation controls
- **Audience View** (`/audience`): Clean, fullscreen slides optimized for audience viewing

These views sync in real-time using the **BroadcastChannel API**, which works across:
- Multiple browser tabs (same device)
- Multiple devices on the same browser instance (e.g., phone + tablet logged into same account)
- Desktop + Mobile combinations

### Mobile-Specific Features

- **Responsive Breakpoint**: 768px (defined in `useIsMobile` hook)
- **Touch-Friendly Controls**: Minimum 44x44px touch targets
- **Mobile Layouts**: Grid-to-stack transitions for cards and content
- **Speaker Notes Tabs**: Data/Vision/Proof tabs optimized for touch
- **Swipe Support**: Optional gesture navigation (where implemented)
- **Zoom Controls**: Audience view has accessible zoom buttons for text sizing

---

## Quick Start (5 Minutes)

### Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Ensure server is running on `http://localhost:5173`

### Basic Test Flow

1. **Create a Presentation**:
   - Open `http://localhost:5173` on desktop
   - Choose "Create from Scratch"
   - Generate a 3-slide presentation
   - Save it to library

2. **Test Mobile Presenter View**:
   - Open `http://localhost:5173/presenter` on mobile
   - Verify speaker notes display correctly
   - Test Data/Vision/Proof tabs with touch
   - Check trigger words are visible

3. **Test Mobile Audience View**:
   - Open `http://localhost:5173/audience` in new tab
   - Verify clean slide layout
   - Test zoom controls (bottom-right corner)
   - Check fullscreen toggle

4. **Test Sync**:
   - Navigate forward/back on presenter view
   - Verify audience view updates instantly
   - Check flash transition effect

---

## Understanding the Dual-View System

### Architecture

```
┌─────────────────────────────┐          ┌─────────────────────────────┐
│   Presenter View            │          │   Audience View             │
│   /presenter                │          │   /audience                 │
├─────────────────────────────┤          ├─────────────────────────────┤
│                             │          │                             │
│ ┌─────────────────────────┐ │          │ ┌─────────────────────────┐ │
│ │   Speaker Notes         │ │          │ │                         │ │
│ │   (Large, Readable)     │ │          │ │   Clean Slide Content   │ │
│ │                         │ │          │ │   (Centered, Scaled)    │ │
│ │   Data | Vision | Proof │ │          │ │                         │ │
│ │   [Tab Interface]       │ │          │ │   [Image + Text]        │ │
│ │                         │ │          │ │                         │ │
│ │   "Say: moment"         │ │          │ │   [Progress Bar]        │ │
│ └─────────────────────────┘ │          │ │   Slide 1 of 5          │ │
│                             │          │ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │          │                             │
│ │   Slide Preview         │ │          │ ┌─────────────────────────┐ │
│ │   (What audience sees)  │ │          │ │   [Zoom Controls]       │ │
│ └─────────────────────────┘ │          │ │   Bottom-Right Corner   │ │
│                             │          │ └─────────────────────────┘ │
└─────────────────────────────┘          └─────────────────────────────┘
         │                                          │
         │         BroadcastChannel API             │
         │         'verbadeck-presentation'         │
         └──────────────────────────────────────────┘
                    (Real-time Sync)
```

### Key Components

1. **PresenterView.tsx**:
   - 70/30 split layout (notes/preview)
   - Speaker notes with markdown rendering
   - Structured speaker notes with tabs
   - Keyboard shortcuts (arrows, space, etc.)
   - Trigger word highlighting

2. **AudienceView.tsx**:
   - Clean, fullscreen slide display
   - Multiple layout modes (balanced, image-top, image-focus, etc.)
   - Dynamic text sizing based on content
   - Zoom controls (50%-300%)
   - Fullscreen toggle

3. **useBroadcastSync Hook**:
   - Manages BroadcastChannel lifecycle
   - Syncs Zustand store between views
   - Handles state requests/updates

---

## Testing on Real Mobile Devices

### Method 1: Local Network Access (Recommended)

1. **Find Your Computer's IP Address**:

   Windows:
   ```bash
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

   Mac/Linux:
   ```bash
   ifconfig | grep "inet "
   # Or: ip addr show
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   # Server starts on http://localhost:5173
   ```

3. **Access from Mobile**:
   - Ensure mobile is on **same WiFi network**
   - Open browser on mobile device
   - Navigate to: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

4. **Test Presenter View**:
   - Go to `http://YOUR_IP:5173/presenter`

5. **Test Audience View**:
   - Go to `http://YOUR_IP:5173/audience`

### Method 2: Playwright Mobile Emulation (Automated)

Already configured in `playwright.config.ts`:

```bash
# Run mobile tests
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari

# Run specific mobile test file
npx playwright test tests/mobile-responsive.spec.ts --project=mobile-chrome

# Run with UI mode for debugging
npx playwright test --ui --project=mobile-safari
```

### Method 3: Browser DevTools Device Emulation

1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select device: iPhone 12, Pixel 5, iPad Pro, etc.
4. Test responsive layouts and touch interactions
5. Use "Rotate" icon to test landscape/portrait

### Method 4: USB Debugging (Android)

1. Enable Developer Options on Android
2. Enable USB Debugging
3. Connect phone to computer via USB
4. Open Chrome on desktop
5. Navigate to `chrome://inspect`
6. Select your device
7. Open VerbaDeck on phone
8. Inspect and debug remotely

---

## Testing Mobile Layouts

### Responsive Breakpoints

VerbaDeck uses Tailwind CSS responsive classes:

- **Mobile (< 768px)**: Single column, stacked layout
- **Tablet (768px - 1024px)**: 2-column grids, visible sidebar
- **Desktop (> 1024px)**: Multi-column, full features

### Key Responsive Classes

| Component | Desktop | Tablet (md:) | Mobile (default) |
|-----------|---------|--------------|------------------|
| Home Cards | `md:grid-cols-3` | 2 columns | 1 column (stacked) |
| Audience Layout | `md:grid-cols-2` | Side-by-side | Stacked |
| Editor Panel | Fixed sidebar | Drawer | Bottom sheet |
| Presenter View | 70/30 split | 70/30 split | Single column |

### Testing Each Breakpoint

```bash
# Run responsive breakpoint tests
npx playwright test tests/mobile-responsive.spec.ts -g "Responsive Breakpoints"
```

Manual test:
1. Open DevTools
2. Resize browser to specific widths:
   - **320px**: iPhone SE (smallest)
   - **375px**: iPhone 12
   - **768px**: iPad
   - **1024px**: iPad Pro landscape
   - **1920px**: Desktop

3. Verify at each breakpoint:
   - No horizontal scrolling
   - Content fits viewport
   - Text is readable
   - Buttons are accessible
   - Images scale properly

---

## Testing Dual-Tab/Dual-Device Sync

### Scenario 1: Same Device, Two Tabs (Desktop)

**Setup:**
1. Tab 1: `http://localhost:5173/presenter`
2. Tab 2: `http://localhost:5173/audience`

**Test Steps:**
1. Create/load a presentation in Tab 1
2. Start presenting
3. Switch to Tab 2 (audience)
4. Verify it shows current slide
5. Switch back to Tab 1
6. Click "Next" button
7. Switch to Tab 2
8. **Expected**: Slide updates instantly with flash effect

**Console Logs to Check:**

Tab 1 (Presenter):
```
📡 BroadcastChannel initialized in presenter mode
📤 Presenter: Broadcasting update - Slide 2/5
```

Tab 2 (Audience):
```
📡 BroadcastChannel initialized in audience mode
📡 Audience: Requesting initial state from presenter
📥 Audience: Received update - Slide 2/5
```

### Scenario 2: Mobile + Desktop (Same WiFi)

**Setup:**
1. Desktop: `http://192.168.1.100:5173/presenter`
2. Mobile: `http://192.168.1.100:5173/audience`

**Test Steps:**
1. Open presenter on desktop
2. Create presentation
3. Start presenting
4. Open audience on mobile browser
5. **Expected**: Mobile shows current slide
6. Navigate on desktop
7. **Expected**: Mobile updates in real-time

**BroadcastChannel Limitation:**
- BroadcastChannel works **within the same browser instance**
- Desktop Chrome → Mobile Chrome (separate devices) = **NO SYNC**
- Solution: Use same browser profile synced across devices (e.g., Chrome Sync)

### Scenario 3: Mobile Phone + Tablet (Same Browser Account)

**Setup:**
1. Ensure both devices logged into same Google/Apple account
2. Open Chrome/Safari with sync enabled
3. Phone: `http://localhost:5173/presenter`
4. Tablet: `http://localhost:5173/audience`

**Test Steps:**
1. Load presentation on phone
2. Start presenting
3. Open audience on tablet
4. Navigate on phone
5. **Expected**: Tablet updates (if same browser instance)

**Note:** This scenario is limited by BroadcastChannel's same-origin and same-context requirements.

### Scenario 4: Two Mobile Tabs (Same Device)

**Setup:**
1. Open mobile browser (Chrome/Safari)
2. Tab 1: `http://YOUR_IP:5173/presenter`
3. Tab 2: `http://YOUR_IP:5173/audience`

**Test Steps:**
1. Create presentation in Tab 1
2. Switch to Tab 2
3. Verify sync
4. Switch back to Tab 1
5. Navigate with touch
6. Switch to Tab 2
7. **Expected**: Updates visible

**Mobile Browser Tabs:**
- Chrome Android: Full support
- Safari iOS 15.4+: Full support
- Firefox Mobile: Full support
- Samsung Internet: Full support

---

## Feature Verification Checklist

### Presenter View on Mobile

#### Layout & UI
- [ ] Speaker notes display in readable font size (2xl/text-2xl)
- [ ] Heading is bold and clearly visible
- [ ] Trigger word badge shows at top ("Say: moment")
- [ ] Slide preview shows in right panel (or below on narrow screens)
- [ ] Progress bar visible and accurate
- [ ] Jump buttons (1, 2, 3...) are touch-friendly

#### Speaker Notes Tabs
- [ ] Data/Vision/Proof tabs are visible
- [ ] Tabs have touch-friendly size (44px height)
- [ ] Active tab is highlighted with blue underline
- [ ] Tab content switches when tapped
- [ ] Tab icons (Database, Eye, CheckCircle) render correctly
- [ ] Text in tabs is readable (base font size)

#### Structured Speaker Notes
- [ ] "Key Message" box displays with primary color border
- [ ] "Talking Points" section has muted background
- [ ] "High Impact Closer" shows in amber box
- [ ] "Recommended Image" displays with icon

#### Navigation
- [ ] Touch targets are minimum 44x44px
- [ ] Buttons respond to tap (not just click)
- [ ] No accidental double-taps
- [ ] Swipe gestures work (if implemented)
- [ ] Keyboard shortcuts disabled on mobile (no physical keyboard)

### Audience View on Mobile

#### Layout & UI
- [ ] Slide content is centered and scaled
- [ ] No clutter (no controls visible initially)
- [ ] Progress bar at bottom
- [ ] "Slide X of Y" text is readable
- [ ] Image scales to fit screen (if present)
- [ ] Text size is dynamic and readable

#### Layout Modes
- [ ] **Balanced** (50/50): Image on left, text on right (or stacked on mobile)
- [ ] **Image Top**: Full-width image, text below
- [ ] **Image Bottom**: Text on top, image below
- [ ] **Image Focus**: Large image, small caption
- [ ] **Text Focus**: Large text, small image thumbnail
- [ ] **Image Only**: Fullscreen image, no text

#### Mobile Responsiveness
- [ ] Grid switches to single column on narrow screens (`md:grid-cols-2` → `grid-cols-1`)
- [ ] Padding adjusts (p-12 → p-8 → p-4)
- [ ] No horizontal scrolling
- [ ] Content fits viewport height

#### Zoom Controls
- [ ] Settings icon visible in bottom-right corner
- [ ] Hover/tap expands control panel
- [ ] Zoom In button increases text size (+10%)
- [ ] Zoom Out button decreases text size (-10%)
- [ ] Reset button returns to 100%
- [ ] Zoom level persists in localStorage
- [ ] Range: 50% - 300%
- [ ] Keyboard shortcuts work (Ctrl +/-/0)

#### Fullscreen
- [ ] Fullscreen button toggles fullscreen mode
- [ ] F11 keyboard shortcut works (desktop)
- [ ] Fullscreen exits with Escape key
- [ ] Controls remain accessible in fullscreen
- [ ] Status updates (Minimize ↔ Maximize icons)

### BroadcastChannel Sync

#### Initial Connection
- [ ] Audience requests state on load
- [ ] Presenter sends current state
- [ ] Audience displays correct initial slide
- [ ] "Waiting for presentation..." shows if presenter not ready

#### Real-Time Updates
- [ ] Slide changes sync within 100ms
- [ ] Flash effect appears on slide change (800ms duration)
- [ ] Progress bar updates
- [ ] Slide counter updates ("Slide X of Y")
- [ ] Image loads correctly on new slide

#### Edge Cases
- [ ] Reload audience page → resyncs correctly
- [ ] Reload presenter page → audience continues working
- [ ] Close audience tab → no errors in presenter
- [ ] Close presenter tab → audience shows "Waiting for presentation..."
- [ ] Multiple audience tabs → all sync simultaneously

### Touch Interactions

#### Tap Events
- [ ] Single tap activates buttons
- [ ] Tap feedback (visual highlight)
- [ ] No delay (300ms tap delay removed)
- [ ] Works on all interactive elements

#### Gestures (if implemented)
- [ ] Swipe left → next slide
- [ ] Swipe right → previous slide
- [ ] Long press → context menu (if implemented)
- [ ] Pinch-to-zoom (if enabled)

#### Accessibility
- [ ] Minimum touch target size: 44x44px (WCAG 2.1)
- [ ] Sufficient spacing between tap targets
- [ ] No accidental taps on adjacent buttons
- [ ] Visual feedback on tap (ripple effect, color change)

---

## Expected Mobile Layouts

### Home Page (Mobile)

```
┌─────────────────────────────┐
│  VerbaDeck                  │
│  [Settings Icon]            │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ Create from Scratch   │  │  ← Card 1
│  │ [Icon]                │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Process Content       │  │  ← Card 2
│  │ [Icon]                │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Know It All Wall      │  │  ← Card 3
│  │ [Icon]                │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**Key Points:**
- Cards stack vertically (no grid)
- Full width with margin
- Touch-friendly size
- Clear hierarchy

### Presenter View (Mobile Portrait)

```
┌─────────────────────────────┐
│ ┌─Timer─────────────────┐   │
│ │ ⏱ 00:05:30  Slide 2/5  │   │
│ └───────────────────────┘   │
├─────────────────────────────┤
│                             │
│ Section 2 of 5   "Say: data"│
│                             │
│ ╔═══════════════════════╗   │
│ ║ Market Opportunity    ║   │  ← Heading
│ ╚═══════════════════════╝   │
│                             │
│ The global market for AI... │  ← Speaker Notes
│ is expected to reach $500B  │    (Large text)
│ by 2028, growing at 40%...  │
│                             │
│ ┌─────────────────────────┐ │
│ │ Talking Points          │ │
│ ├─────────────────────────┤ │
│ │ Data | Vision | Proof   │ │  ← Tabs
│ ├─────────────────────────┤ │
│ │ "According to Gartner..."│ │  ← Active Tab
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ Key Message:            │ │
│ │ "We're at the inflection"│ │
│ │ "point of AI adoption"  │ │
│ └─────────────────────────┘ │
│                             │
│ [Progress Bar: 40%]         │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📺 Audience Sees:       │ │
│ │ [Slide Preview]         │ │  ← Small preview
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

**Key Points:**
- Single column layout
- Speaker notes prioritized
- Tabs below notes
- Preview at bottom

### Audience View (Mobile Portrait)

```
┌─────────────────────────────┐
│                             │
│                             │
│    ╔═════════════════╗      │
│    ║ Market          ║      │  ← Heading
│    ║ Opportunity     ║      │
│    ╚═════════════════╝      │
│                             │
│    The global market for    │
│    AI-powered solutions     │  ← Content
│    is expected to reach     │    (Scaled text)
│    $500B by 2028            │
│                             │
│    [━━━━━━━━━━░░░░]  40%    │  ← Progress
│    Slide 2 of 5             │
│                             │
│                             │
│                        [⚙]  │  ← Zoom controls
└─────────────────────────────┘    (bottom-right)
```

**Key Points:**
- Clean, minimal UI
- Content centered
- Large, readable text
- Controls hidden until needed

### Audience View with Image (Mobile Portrait - Balanced Layout)

```
┌─────────────────────────────┐
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │     [Image]           │  │  ← Image section
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ╔═══════════════════════╗  │
│  ║ Market Opportunity    ║  │  ← Heading
│  ╚═══════════════════════╝  │
│                             │
│  The global market for AI   │
│  is growing at 40% CAGR...  │  ← Text content
│                             │
│  [━━━━━━━━━━░░░░]  40%      │  ← Progress
│  Slide 2 of 5               │
│                             │
│                        [⚙]  │  ← Controls
└─────────────────────────────┘
```

**Key Points:**
- Image stacks above text on mobile
- `md:grid-cols-2` becomes single column
- Responsive padding adjusts
- Image maintains aspect ratio

---

## Known Limitations & Workarounds

### 1. BroadcastChannel Cross-Device Sync

**Limitation:**
- BroadcastChannel only works within the same browser instance
- Desktop Chrome → Mobile Chrome (different devices) = No sync

**Workarounds:**
- Use same device, multiple tabs (works perfectly)
- Use browser profile sync (limited support)
- Alternative: Server-sent events (SSE) or WebSockets (future enhancement)

**Detection:**
```javascript
// Check if BroadcastChannel is supported
if ('BroadcastChannel' in window) {
  console.log('✅ BroadcastChannel supported');
} else {
  console.log('❌ Use a modern browser');
}
```

### 2. Safari iOS < 15.4

**Limitation:**
- BroadcastChannel not supported in Safari < 15.4

**Workaround:**
- Update to iOS 15.4 or later
- Use Chrome/Firefox on iOS (recommended)

**Detection:**
```javascript
const ua = navigator.userAgent;
const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
const iOSVersion = parseFloat(ua.match(/OS (\d+)_/)?.[1] || '0');

if (isSafari && iOSVersion < 15.4) {
  console.warn('⚠️ Update Safari for BroadcastChannel support');
}
```

### 3. Keyboard Shortcuts on Mobile

**Limitation:**
- Most mobile browsers hide keyboard shortcuts
- Arrow keys, space, etc. not accessible without physical keyboard

**Workaround:**
- Touch controls prioritized on mobile
- Swipe gestures (future enhancement)
- On-screen navigation buttons

**Current Behavior:**
```typescript
// Keyboard shortcuts are still registered but won't fire on touch devices
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // These work on desktop only
    if (e.key === 'ArrowRight') advanceSection();
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 4. Presenter View 70/30 Split on Small Screens

**Limitation:**
- 70/30 split (`flex-[7]` / `flex-[3]`) becomes cramped on phones

**Workaround:**
- Presenter view best used on tablet+ screens
- Mobile users should use landscape orientation
- Consider single-column presenter view on very small screens (future)

**Breakpoint Suggestion:**
```css
/* Future enhancement */
@media (max-width: 640px) {
  .presenter-view {
    flex-direction: column; /* Stack notes above preview */
  }
}
```

### 5. Fullscreen API Restrictions

**Limitation:**
- Fullscreen requires user gesture on mobile
- Can't auto-fullscreen on page load

**Workaround:**
- Provide visible fullscreen button
- Clear instructions: "Tap fullscreen for best experience"

**Current Implementation:**
```typescript
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    console.error('Fullscreen toggle failed:', err);
    // Fallback: Maximize window, hide address bar
  }
};
```

### 6. Audio/Microphone on Mobile

**Limitation:**
- Web Audio API requires HTTPS on mobile (except localhost)
- Microphone permissions more strict on mobile

**Workaround:**
- Test on localhost or HTTPS domain
- Provide clear permission prompts
- Handle permission denied gracefully

**Detection:**
```javascript
if (!navigator.mediaDevices?.getUserMedia) {
  console.error('❌ Microphone not available');
  // Show alternative: manual navigation
}
```

---

## Troubleshooting

### Issue: "Mobile device can't access localhost:5173"

**Cause:** Firewall blocking local network access

**Solution:**
1. Find computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac)
2. Access via IP: `http://192.168.1.100:5173`
3. Ensure both devices on same WiFi
4. Disable firewall temporarily (Windows Defender, etc.)

### Issue: "Audience view not syncing on mobile"

**Cause:** BroadcastChannel limitations or browser incompatibility

**Solutions:**
1. Check browser version (Safari 15.4+, Chrome 80+)
2. Use same device, different tabs (guaranteed to work)
3. Check console for BroadcastChannel errors
4. Try different browser (Chrome recommended)

**Debug Steps:**
```javascript
// Open console on both devices
// Presenter:
console.log(broadcastChannel); // Should show BroadcastChannel object

// Audience:
console.log(broadcastChannel); // Should show BroadcastChannel object

// If null, BroadcastChannel not supported
```

### Issue: "Text too small on mobile audience view"

**Cause:** Dynamic text sizing not accounting for small screens

**Solution:**
1. Use zoom controls (bottom-right corner)
2. Tap settings icon (⚙)
3. Tap "Zoom In" (+) button
4. Adjust to comfortable size (100%-300%)
5. Zoom level persists in localStorage

**Manual Override:**
```javascript
// Set zoom level programmatically (testing)
localStorage.setItem('verbadeck-presentation-zoom', '150');
location.reload();
```

### Issue: "Speaker notes tabs not working on touch"

**Cause:** Touch event not registered or z-index issue

**Debug Steps:**
1. Open DevTools on mobile (USB debugging)
2. Inspect tab buttons
3. Check computed styles (should be `pointer-events: auto`)
4. Test with physical tap (not mouse emulation)

**CSS Check:**
```css
/* Tab buttons should have */
.tab-button {
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0,0,0,0.1);
}
```

### Issue: "Progress bar not updating"

**Cause:** Zustand store not syncing or BroadcastChannel issue

**Debug:**
```javascript
// Check Zustand store state
import { usePresentationStore } from '@/stores';

console.log(usePresentationStore.getState());
// Should show: { sections: [...], currentSectionIndex: 2 }
```

**Fix:**
1. Reload both presenter and audience pages
2. Ensure presentation is loaded before starting
3. Check for console errors

### Issue: "Image not loading on mobile"

**Cause:** Image URL unreachable, CORS issue, or slow network

**Solutions:**
1. Check image URL in browser: `http://YOUR_IP:5173/api/your-image.jpg`
2. Verify CORS headers if external image
3. Check network tab for 404/403 errors
4. Use base64-encoded images for testing

**Debug:**
```javascript
// Test image loading
const img = new Image();
img.onload = () => console.log('✅ Image loaded');
img.onerror = () => console.error('❌ Image failed to load');
img.src = currentSection.imageUrl;
```

### Issue: "Landscape orientation breaks layout"

**Cause:** Fixed height assumptions or viewport units issue

**Solution:**
1. Test both portrait and landscape
2. Use `min-h-screen` instead of `h-screen`
3. Check for hardcoded heights

**Responsive Check:**
```typescript
// Detect orientation
const isLandscape = window.innerWidth > window.innerHeight;
console.log(`Orientation: ${isLandscape ? 'Landscape' : 'Portrait'}`);
```

### Issue: "Fullscreen button not working"

**Cause:** Fullscreen API requires user gesture or HTTPS

**Debug:**
```javascript
// Check Fullscreen API support
if (document.fullscreenEnabled) {
  console.log('✅ Fullscreen API available');
} else {
  console.error('❌ Fullscreen API not available');
}

// Try to enter fullscreen
document.documentElement.requestFullscreen()
  .then(() => console.log('✅ Fullscreen entered'))
  .catch(err => console.error('❌ Fullscreen error:', err));
```

**Workaround:**
- Use F11 keyboard shortcut (desktop)
- Manually maximize browser window
- Use browser's native fullscreen (three dots menu)

---

## Automated Test Commands

### Run All Mobile Tests

```bash
# All mobile responsive tests
npx playwright test tests/mobile-responsive.spec.ts

# Specific device
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
npx playwright test --project=tablet

# With UI mode (debugging)
npx playwright test --ui --project=mobile-chrome

# Headed mode (see browser)
npx playwright test --headed tests/mobile-responsive.spec.ts
```

### Run Dual-View Sync Tests

```bash
# BroadcastChannel sync tests
npx playwright test tests/broadcastchannel-sync.spec.ts

# Full presenter/audience workflow
npx playwright test tests/full-presentation-sync-test.spec.ts

# Manual testing guide
# See: tests/MANUAL_BROADCASTCHANNEL_TEST.md
```

### Generate Mobile Screenshots

```bash
# Update visual regression screenshots
npx playwright test --update-snapshots --project=mobile-chrome

# Specific viewport
npx playwright test --update-snapshots -g "iPhone 12"
```

---

## Manual Test Script

### Complete Mobile Test (15 minutes)

#### Phase 1: Setup (3 min)
- [ ] Start dev server: `npm run dev`
- [ ] Find computer IP: `ipconfig`
- [ ] Connect mobile to same WiFi
- [ ] Open `http://YOUR_IP:5173` on mobile
- [ ] Verify home page loads

#### Phase 2: Create Presentation (3 min)
- [ ] Desktop: Create 3-slide presentation
- [ ] Desktop: Save to library
- [ ] Desktop: Open presenter view
- [ ] Desktop: Load presentation

#### Phase 3: Test Presenter View Mobile (4 min)
- [ ] Mobile: Open `http://YOUR_IP:5173/presenter`
- [ ] Verify speaker notes display
- [ ] Tap Data tab → check content
- [ ] Tap Vision tab → check content
- [ ] Tap Proof tab → check content
- [ ] Check trigger word badge
- [ ] Check slide preview panel
- [ ] Test navigation buttons
- [ ] Verify progress bar updates

#### Phase 4: Test Audience View Mobile (3 min)
- [ ] Mobile: Open new tab: `http://YOUR_IP:5173/audience`
- [ ] Verify clean slide layout
- [ ] Check image loads (if present)
- [ ] Tap settings icon (⚙)
- [ ] Test zoom in (+)
- [ ] Test zoom out (-)
- [ ] Test reset (Reset button)
- [ ] Toggle fullscreen
- [ ] Exit fullscreen

#### Phase 5: Test Sync (2 min)
- [ ] Desktop: Navigate to slide 2
- [ ] Mobile audience tab: Verify updates
- [ ] Check flash effect appears
- [ ] Desktop: Navigate to slide 3
- [ ] Mobile: Verify sync (< 100ms)
- [ ] Mobile: Check progress bar (3 of 3)

#### Pass/Fail Criteria
- **Pass**: All checkboxes completed, no errors
- **Fail**: Any checkbox fails, console errors present

---

## Key Files Reference

### Components
- `client/src/components/PresenterView.tsx` - Presenter interface
- `client/src/components/AudienceView.tsx` - Audience interface
- `client/src/components/PresentationTimer.tsx` - Timer component
- `client/src/components/CurrentSlidePreview.tsx` - Slide preview

### Pages
- `client/src/pages/PresenterPage.tsx` - Presenter route
- `client/src/pages/AudiencePage.tsx` - Audience route

### Hooks
- `client/src/hooks/useBroadcastSync.ts` - Sync logic
- `client/src/hooks/useBroadcastChannel.ts` - Legacy sync
- `client/src/hooks/use-mobile.tsx` - Mobile detection (768px breakpoint)
- `client/src/hooks/useDynamicTextSize.tsx` - Text scaling

### Stores
- `client/src/stores/presentation.ts` - Presentation state (Zustand)
- `client/src/stores/voice.ts` - Voice/streaming state

### Tests
- `tests/mobile-responsive.spec.ts` - Mobile layout tests
- `tests/broadcastchannel-sync.spec.ts` - Sync tests
- `tests/presenter-workflow.spec.ts` - Presenter view tests
- `tests/MANUAL_BROADCASTCHANNEL_TEST.md` - Manual test guide

### Configuration
- `playwright.config.ts` - Playwright test config
- `client/tailwind.config.js` - Responsive breakpoints

---

## Support & Feedback

### Reporting Issues

When reporting mobile issues, include:

1. **Device Info**:
   - Device: iPhone 12, Pixel 5, iPad Pro, etc.
   - OS: iOS 16.2, Android 13, etc.
   - Browser: Chrome 119, Safari 16, Firefox 120

2. **Network Info**:
   - WiFi or cellular
   - Same network as server? (Yes/No)
   - IP address used: `http://192.168.1.100:5173`

3. **Console Logs**:
   - Open DevTools on mobile (USB debugging)
   - Copy error messages
   - Include BroadcastChannel logs (📡/📤/📥)

4. **Steps to Reproduce**:
   - Detailed steps: "1. Open presenter, 2. Tap Data tab, 3. Error appears"
   - Expected behavior
   - Actual behavior

5. **Screenshots/Video**:
   - Mobile screenshot showing issue
   - Screen recording (if layout issue)

### Testing Assistance

Need help testing? Refer to:
- **Quick Start**: `BROADCASTCHANNEL_QUICK_START.md`
- **Manual Tests**: `tests/MANUAL_BROADCASTCHANNEL_TEST.md`
- **User Guide**: `VERBADECK_USER_GUIDE.md`

---

## Appendix: Browser Compatibility

### BroadcastChannel Support

| Browser | Version | Mobile Support | Notes |
|---------|---------|----------------|-------|
| Chrome | 80+ | ✅ Yes | Full support |
| Firefox | 38+ | ✅ Yes | Full support |
| Safari | 15.4+ | ✅ Yes | iOS 15.4+ required |
| Edge | 79+ | ✅ Yes | Chromium-based |
| Samsung Internet | 13+ | ✅ Yes | Full support |
| Opera | 67+ | ✅ Yes | Full support |

### Fullscreen API Support

| Browser | Version | Mobile Support | Notes |
|---------|---------|----------------|-------|
| Chrome | 71+ | ✅ Yes | Gesture required |
| Firefox | 64+ | ✅ Yes | Gesture required |
| Safari | 16.4+ | ⚠️ Limited | iOS restrictions |
| Edge | 79+ | ✅ Yes | Gesture required |

### Recommended Testing Devices

1. **iPhone 12** (iOS 16+): Primary iOS test device
2. **Pixel 5** (Android 12+): Primary Android test device
3. **iPad Pro** (11"): Tablet testing
4. **Samsung Galaxy S21**: Alternative Android

---

**Document Version:** 1.0
**Status:** Complete
**Last Verified:** 2025-11-13
**Next Review:** When adding new mobile features
