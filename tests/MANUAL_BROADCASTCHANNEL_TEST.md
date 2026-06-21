# Manual BroadcastChannel Synchronization Test Script

## Prerequisites
- ✅ Dev server running on http://localhost:5180 (or whatever port Vite chose)
- Two browser windows or tabs ready
- Optional: Second monitor for realistic testing

## Test Setup

### Window 1: Presenter View
1. Open http://localhost:5180
2. Click "Create from Scratch"
3. Enter topic: "BroadcastChannel Test"
4. Number of sections: 5
5. Click "Generate Sections" (wait ~30 seconds)
6. Click "Start Presenting"

### Window 2: Audience View
1. Open http://localhost:5180/audience (in a NEW window, not tab)
2. Should see "Waiting for presentation..." initially
3. After presenter starts, should sync to Slide 1

---

## Test Case 1: Initial State Synchronization

**Objective**: Verify audience receives initial state when loading after presenter

### Steps:
1. ✅ Presenter is in presenter mode
2. Open audience window
3. Observe audience view

### Expected:
- [ ] Audience shows same slide as presenter (Slide 1/5)
- [ ] Audience shows same content as presenter
- [ ] No errors in console

### Actual:
```
Result: ____________
Notes: ____________
```

---

## Test Case 2: Forward Navigation Sync

**Objective**: Verify audience updates when presenter advances

### Steps:
1. Click "Next" button on presenter
2. Observe audience view

### Expected:
- [ ] Audience advances to Slide 2/5
- [ ] Content updates immediately
- [ ] Flash effect appears on audience
- [ ] Console shows: "📥 Audience: Received update - Slide 2/5"

### Actual:
```
Result: ____________
Latency: ____________ms
```

---

## Test Case 3: Backward Navigation Sync

**Objective**: Verify audience updates when presenter goes back

### Steps:
1. Click "Previous" button on presenter
2. Observe audience view

### Expected:
- [ ] Audience goes back to Slide 1/5
- [ ] Content updates immediately
- [ ] Flash effect appears

### Actual:
```
Result: ____________
```

---

## Test Case 4: Rapid Navigation

**Objective**: Test sync stability with rapid clicks

### Steps:
1. Quickly click: Next → Next → Next → Previous → Next
2. Final position should be Slide 4/5
3. Observe audience

### Expected:
- [ ] Audience follows all changes
- [ ] Ends on Slide 4/5 (same as presenter)
- [ ] No lag or dropped updates

### Actual:
```
Final slide: ____________
Any issues: ____________
```

---

## Test Case 5: Audience Page Reload

**Objective**: Verify audience can restore state after reload

### Steps:
1. Navigate to Slide 3/5 on presenter
2. Reload audience window (F5 or Ctrl+R)
3. Observe audience view

### Expected:
- [ ] Audience shows "Waiting for presentation..." briefly
- [ ] Console shows: "📡 Audience: Requesting initial state from presenter"
- [ ] Presenter console shows: "📤 Presenter: Sending current state to audience"
- [ ] Audience restores to Slide 3/5

### Actual:
```
Result: ____________
```

---

## Test Case 6: Content Updates

**Objective**: Verify content changes sync to audience

### Steps:
1. Stop presenting on presenter
2. Go to Editor tab
3. Edit section 1 content to "UPDATED TEST CONTENT"
4. Click "Start Presenting"
5. Observe audience (might need to reload audience page)

### Expected:
- [ ] Audience shows "UPDATED TEST CONTENT"
- [ ] Content renders correctly

### Actual:
```
Result: ____________
```

---

## Test Case 7: Presenter Window Close

**Objective**: Verify audience handles presenter closure gracefully

### Steps:
1. Navigate to Slide 2/5 on presenter
2. Close presenter window completely
3. Observe audience window

### Expected:
- [ ] Audience remains showing Slide 2/5
- [ ] No errors in console
- [ ] Page doesn't crash

### Actual:
```
Result: ____________
```

---

## Test Case 8: Multiple Rapid Navigations

**Objective**: Stress test the sync mechanism

### Steps:
1. Rapidly click Next 10 times (as fast as possible)
2. Wait 2 seconds
3. Check both presenter and audience

### Expected:
- [ ] Both showing Slide 5/5 (last slide)
- [ ] No console errors
- [ ] Sync still working (test by clicking Previous)

### Actual:
```
Presenter slide: ____________
Audience slide: ____________
```

---

## Test Case 9: BroadcastChannel Console Logs

**Objective**: Verify logging is working correctly

### Steps:
1. Open DevTools console on both windows
2. Click Next on presenter
3. Review console logs

### Expected Presenter Logs:
```
📤 Presenter: Broadcasting update - Slide 2/5
```

### Expected Audience Logs:
```
📥 Audience: Received update - Slide 2/5
```

### Actual:
```
Presenter: ____________
Audience: ____________
```

---

## Test Case 10: Cross-Window BroadcastChannel Isolation

**Objective**: Verify BroadcastChannel works across windows (not just tabs)

### Steps:
1. Presenter in Window 1
2. Audience in Window 2 (separate window, not tab)
3. Navigate on presenter
4. Observe audience

### Expected:
- [ ] Sync works across separate windows
- [ ] No security warnings

### Actual:
```
Result: ____________
```

---

## Console Error Check

### Presenter Console
```
Errors: ____________
Warnings: ____________
```

### Audience Console
```
Errors: ____________
Warnings: ____________
```

---

## Browser Compatibility Test

Test in multiple browsers:

### Chrome
- [ ] All tests pass
- Issues: ____________

### Firefox
- [ ] All tests pass
- Issues: ____________

### Edge
- [ ] All tests pass
- Issues: ____________

### Safari (if available)
- [ ] All tests pass
- Issues: ____________

---

## Performance Observations

### Sync Latency
- Average delay between presenter action and audience update: ____________ms

### Flash Effect
- Flash effect timing appropriate: [ ] Yes [ ] No
- Suggestions: ____________

### Memory Usage
- Open DevTools → Performance → Memory
- Before testing: ____________MB
- After 50 navigations: ____________MB
- Memory leak detected: [ ] Yes [ ] No

---

## Issues Found

### Issue 1
- **Description**: ____________
- **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
- **Steps to reproduce**: ____________
- **Expected**: ____________
- **Actual**: ____________

### Issue 2
- **Description**: ____________
- **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
- **Steps to reproduce**: ____________
- **Expected**: ____________
- **Actual**: ____________

---

## Overall Assessment

### Functionality
- [ ] All core features working
- [ ] Sync is reliable
- [ ] No data loss
- [ ] Error handling adequate

### User Experience
- [ ] Sync feels instant
- [ ] Flash effect helpful
- [ ] No jarring transitions
- [ ] Smooth presentation experience

### Code Quality
- [ ] Console logs helpful for debugging
- [ ] No unnecessary re-renders
- [ ] Clean component unmounting

---

## Sign-Off

**Tester Name**: ____________
**Date**: ____________
**Overall Status**: [ ] ✅ Pass [ ] ⚠️ Pass with Issues [ ] ❌ Fail

**Summary**:
____________
____________
____________

**Recommendations**:
____________
____________
____________
