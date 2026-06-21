# VerbaDeck Mobile - Quick Test Card

**5-Minute Smoke Test for Mobile Dual-View System**

---

## Setup (1 min)

```bash
# Terminal
npm run dev

# Get IP address
ipconfig          # Windows
ifconfig          # Mac/Linux

# Example: 192.168.1.100
```

**Mobile Setup:**
- Connect to same WiFi
- Open browser
- Go to: `http://192.168.1.100:5173`

---

## Test 1: Presenter View Mobile (2 min)

**URL:** `http://192.168.1.100:5173/presenter`

### Checklist

- [ ] Speaker notes visible (large text)
- [ ] Heading displays at top
- [ ] "Say: [trigger]" badge visible
- [ ] **Tap Data tab** → content changes
- [ ] **Tap Vision tab** → content changes
- [ ] **Tap Proof tab** → content changes
- [ ] Slide preview shows on right (or below)
- [ ] Progress bar visible
- [ ] Jump buttons (1, 2, 3...) work

**Pass Criteria:** All tabs switch on tap, no layout overflow

---

## Test 2: Audience View Mobile (2 min)

**URL:** `http://192.168.1.100:5173/audience`

### Checklist

- [ ] Clean slide layout (no clutter)
- [ ] Slide content centered
- [ ] Image loads (if present)
- [ ] Progress bar at bottom
- [ ] "Slide X of Y" text visible
- [ ] **Tap settings icon (⚙)** → controls expand
- [ ] **Tap Zoom In (+)** → text gets larger
- [ ] **Tap Zoom Out (-)** → text gets smaller
- [ ] **Tap Reset** → back to 100%
- [ ] **Tap Fullscreen** → enters fullscreen
- [ ] **Tap Exit Fullscreen** → exits fullscreen

**Pass Criteria:** All controls work, text scales correctly

---

## Test 3: Dual-Tab Sync (1 min)

**Setup:**
- Tab 1: `/presenter`
- Tab 2: `/audience`

### Checklist

- [ ] Tab 2 shows same slide as Tab 1
- [ ] **Tab 1: Tap Next** → Tab 2 updates
- [ ] Flash effect appears on Tab 2
- [ ] Progress bar syncs
- [ ] **Tab 1: Tap Previous** → Tab 2 goes back
- [ ] Reload Tab 2 → resyncs to current slide

**Pass Criteria:** Updates appear within 100ms, no errors

---

## Common Issues

| Issue | Fix |
|-------|-----|
| Can't access IP | Check same WiFi, try `http://localhost:5173` on mobile |
| Tabs not syncing | Check console for BroadcastChannel errors |
| Text too small | Use zoom controls (settings icon) |
| Image not loading | Check network tab, verify image URL |
| Fullscreen fails | Requires HTTPS or user gesture (manual F11) |

---

## Console Logs (Expected)

**Presenter Tab:**
```
📡 BroadcastChannel initialized in presenter mode
📤 Presenter: Broadcasting update - Slide 2/5
```

**Audience Tab:**
```
📡 BroadcastChannel initialized in audience mode
📥 Audience: Received update - Slide 2/5
```

---

## Pass/Fail

**PASS:** All checkboxes completed, sync works, no console errors

**FAIL:** Any checkbox fails, sync doesn't work, or console errors present

---

**Time to Complete:** 5 minutes
**Devices Needed:** 1 mobile device (phone or tablet)
**Alternative:** Use Chrome DevTools device emulation (Ctrl+Shift+M)

---

## Full Guide

For detailed testing: See `MOBILE_TESTING_GUIDE.md`
