# Phone Controller Design for VerbaDeck

**Date:** 2026-03-09
**Status:** Design / Research
**Goal:** Enable a phone to serve as a wireless presenter remote for VerbaDeck, providing slide navigation, speaker notes, and timer from a mobile device.

---

## Current Infrastructure Analysis

### What Exists Today

**WebSocket (server/server.js, lines 1164-1268):**
- Single `WebSocketServer` instance on the `/ws` path
- Currently dedicated to AssemblyAI audio proxying: client sends binary PCM16 audio, server forwards to AAI, AAI transcripts flow back
- The upgrade handler only accepts connections to `/ws` and immediately pairs each client WebSocket with a dedicated AssemblyAI WebSocket
- No room/session concept exists -- each connection is 1:1 with an AAI stream
- Non-binary messages are only handled for `ping/pong`

**BroadcastChannel (useBroadcastSync.ts, useBroadcastChannel.ts):**
- Channel name: `verbadeck-presentation`
- Two modes: `presenter` (broadcasts state changes) and `audience` (receives updates)
- Messages: `presentation-update` (full sections array + currentSectionIndex) and `request-state`
- Hard constraint: same browser, same origin only. Cannot work cross-device at all.

**Zustand Store (usePresentationStore.ts):**
- `nextSection()` and `previousSection()` actions already exist
- `setCurrentSectionIndex(index)` for direct navigation
- `sections`, `currentSectionIndex`, `presenterDisplayIndex` are the key state
- Countdown system: `isCountingDown`, `countdownDuration` separate audience view from presenter notes

**Routes (main.tsx):**
- `/audience` is already a standalone route without MainLayout
- Audience view receives state exclusively via BroadcastChannel
- No existing `/controller` or `/remote` route

### Key Constraint
The existing WebSocket path (`/ws`) is fully dedicated to the AssemblyAI audio pipeline. A phone controller needs a separate WebSocket path or a separate signaling mechanism.

---

## Approach Options

### Option A: WebSocket Room Relay (Recommended)

**How it works:**
1. Add a new WebSocket path `/ws/control` on the Node.js server (port 3002)
2. Server maintains "presentation rooms" -- simple in-memory Map of `roomCode -> { presenter: ws, controllers: ws[], audience: ws[], state }`
3. Desktop presenter creates a room (generates 6-digit code), connects as the room's presenter
4. Phone opens `http://<desktop-ip>:5173/controller?room=ABC123` (or scans QR code), connects to `/ws/control` and joins the room
5. Navigation commands from phone (next, prev, goto) are relayed to the presenter's browser via the room
6. Presenter browser receives the command, calls `nextSection()`/`previousSection()` on Zustand store, which triggers BroadcastChannel to update the audience view as it does today

**Message Protocol:**
```
Phone -> Server:     { type: 'join-room', roomCode: 'ABC123', role: 'controller' }
Server -> Phone:     { type: 'room-joined', state: { currentIndex, totalSlides, sections } }
Phone -> Server:     { type: 'navigate', direction: 'next' | 'prev' | number }
Server -> Presenter: { type: 'navigate', direction: 'next' | 'prev' | number }
Presenter -> Server: { type: 'state-update', currentIndex, totalSlides, isStreaming }
Server -> Phone:     { type: 'state-update', currentIndex, totalSlides, isStreaming }
```

**Pairing Flow:**
1. Presenter clicks "Enable Remote Control" button in presenter view
2. Server generates a 6-character alphanumeric room code (collision-resistant for single-server use)
3. Desktop shows: (a) the room code in large text, and (b) a QR code encoding `http://<server-ip>:5173/controller?room=ABC123`
4. Phone scans QR or manually enters code at `/controller`
5. Server confirms pairing, phone UI loads

**Trade-offs:**
- (+) Works across any device on the same network (phone, tablet, another laptop)
- (+) Server mediates all communication, so no CORS or same-origin issues
- (+) Room codes are simple, no account system needed
- (+) Existing BroadcastChannel audience sync is untouched
- (+) Phone could be on cellular if the server is exposed (future: ngrok/tunnel)
- (-) Requires new server-side WebSocket handling code
- (-) Adds latency: phone -> server -> presenter -> BroadcastChannel -> audience (but sub-100ms on LAN)
- (-) Room state is in-memory; rooms lost on server restart (acceptable for presentation sessions)

### Option B: Server-Sent Events (SSE) + REST

**How it works:**
1. Phone opens an SSE connection to `GET /api/controller/events?room=ABC123`
2. Phone sends commands via `POST /api/controller/navigate` with `{ roomCode, direction }`
3. Server pushes state updates to all SSE subscribers in the room
4. Presenter also subscribes to SSE for incoming commands

**Trade-offs:**
- (+) Simpler than WebSocket -- SSE is just HTTP, works through more proxies/firewalls
- (+) REST endpoints are easy to test and debug
- (-) SSE is unidirectional (server -> client), so commands still need POST requests
- (-) Two transport mechanisms (SSE for receiving, REST for sending) adds complexity
- (-) Higher latency than WebSocket for round-trips
- (-) SSE has browser connection limits (~6 per domain in some browsers)
- (-) Not a natural fit since VerbaDeck already uses WebSockets extensively

### Option C: WebRTC Data Channel (Peer-to-Peer)

**How it works:**
1. Server acts only as a signaling relay (exchange SDP offers/answers via WebSocket)
2. Once peers connect, all navigation commands flow directly phone <-> desktop via RTCDataChannel
3. No server involvement after pairing

**Trade-offs:**
- (+) Lowest possible latency (direct peer-to-peer, sub-10ms on LAN)
- (+) No server load after pairing
- (+) Could extend to video preview of slides in the future
- (-) Significantly more complex: ICE negotiation, STUN/TURN servers, NAT traversal
- (-) Overkill for sending small JSON commands
- (-) Debugging WebRTC issues is notoriously difficult
- (-) May fail on restrictive networks without a TURN server
- (-) VerbaDeck has no WebRTC infrastructure currently

---

## Recommendation: Option A (WebSocket Room Relay)

Option A is the clear winner for VerbaDeck's use case:

1. **Minimal new infrastructure** -- just a new WS path and a room Map on the server
2. **Consistent with existing patterns** -- the app already uses WebSockets for audio streaming
3. **Reliable** -- WebSocket on LAN is effectively instant (<10ms round-trip)
4. **Simple pairing** -- 6-digit codes are phone-friendly, QR is a bonus
5. **Extensible** -- the room concept could later support multiple audience views via WebSocket (replacing BroadcastChannel for cross-device audience sync)

---

## Existing Code Reuse

| Existing Code | Reuse For |
|---|---|
| `server/server.js` upgrade handler pattern | Model for `/ws/control` path handling |
| `useBroadcastSync.ts` message protocol | Same `presentation-update` message shape for phone state sync |
| `usePresentationStore.ts` `nextSection()`/`previousSection()` | Phone commands trigger these same actions on the presenter |
| `AudiencePage.tsx` standalone route pattern | Model for `/controller` route (no MainLayout) |
| `PresenterView.tsx` section data display | Reuse section data shape for phone notes display |
| `PresentationTimer.tsx` | Could extract timer logic for phone UI |
| Vite dev server proxy | Already proxies `/ws` to server; add `/ws/control` to the same proxy config |

---

## Phone Controller UI Design

### Screen Layout (Portrait, One-Thumb Operation)

```
+----------------------------------+
|  VerbaDeck Remote    [Connected] |  <- Status bar (small)
+----------------------------------+
|                                  |
|     Slide 3 of 12               |  <- Large slide counter
|     "Market Opportunity"         |  <- Current section heading
|                                  |
|  +----------------------------+  |
|  | Brief speaker notes here   |  |  <- Truncated notes (first ~100 words)
|  | - Key point one            |  |
|  | - Key point two            |  |
|  +----------------------------+  |
|                                  |
|  Next trigger: "traction"        |  <- Current trigger word
|                                  |
|         00:12:34                 |  <- Presentation timer
|                                  |
+----------------------------------+
|                                  |
|  [    < PREV    ] [  NEXT >    ] |  <- Large touch targets (min 48px tall)
|                                  |
+----------------------------------+
```

### Key UI Principles

1. **Large touch targets**: Next/Prev buttons should be at least 48px tall and span the full width. The "Next" button should be larger/more prominent since forward navigation is ~90% of use.

2. **Minimal information**: Show only what the presenter needs at a glance:
   - Current slide number / total
   - Section heading
   - Abbreviated speaker notes (collapsible)
   - Active trigger word(s)
   - Elapsed time

3. **Visual feedback**: Button press should show immediate visual confirmation (color flash) even before the server round-trip completes. Optimistic UI.

4. **Screen wake lock**: Use the Screen Wake Lock API (`navigator.wakeLock.request('screen')`) to prevent the phone screen from sleeping during presentation.

5. **Dark theme only**: Reduce distraction. Dark background, muted text, so the phone glow is minimal if visible to audience.

### Q&A Mode from Phone

The killer feature: tap a button on your phone to activate Q&A listening. Flow:

1. Phone shows a **"Q&A" toggle button** in the bottom bar (alongside PREV/NEXT)
2. Tap Q&A → phone sends `{ type: 'toggle-qa' }` to server → relayed to presenter
3. Presenter browser activates voice listening for questions (same as existing Q&A detection)
4. When a question is detected and answered, presenter sends `{ type: 'qa-update', question, answers, isLoading }` back through the room
5. Phone shows the Q&A side panel with the question + answer options
6. Presenter can tap "Dismiss" on phone to close Q&A on both devices

**Phone Q&A UI (replaces nav controls while active):**
```
+----------------------------------+
|  Q&A MODE ACTIVE       [Close]  |
+----------------------------------+
|                                  |
|  "How does this compare to       |
|   competitor X?"                 |
|                                  |
|  +----------------------------+  |
|  | QUICK ANSWER:              |  |
|  | We differentiate through   |  |
|  | real-time voice analysis   |  |
|  +----------------------------+  |
|                                  |
|  KEY POINTS:                     |
|  - Sub-second response time      |
|  - Works during live meetings    |
|  - No competitor has this        |
|                                  |
|  [Option A] [Option B]          |
|                                  |
+----------------------------------+
|  [ DISMISS Q&A ]                |
+----------------------------------+
```

**Additional protocol messages:**
```
Phone -> Server:     { type: 'toggle-qa', enabled: true }
Server -> Presenter: { type: 'toggle-qa', enabled: true }
Presenter -> Server: { type: 'qa-update', question: '...', answers: {...}, isLoading: bool }
Server -> Phone:     { type: 'qa-update', question: '...', answers: {...}, isLoading: bool }
Phone -> Server:     { type: 'dismiss-qa' }
Server -> Presenter: { type: 'dismiss-qa' }
```

### Component List

| Component | Description |
|---|---|
| `ControllerPage.tsx` | New route page at `/controller`, handles room connection |
| `ControllerPairingScreen.tsx` | Room code input UI (shown before connected) |
| `ControllerRemote.tsx` | Main remote control UI (shown after connected) |
| `ControllerQAPanel.tsx` | Phone-optimized Q&A display (question + answers) |
| `useControllerSocket.ts` | Hook: manages WebSocket to `/ws/control`, room join, state sync, Q&A relay |
| `PairingDialog.tsx` | Desktop-side modal showing room code + QR code |
| `QRCodeDisplay.tsx` | QR code renderer (use `qrcode` npm package or similar) |

### Server-Side Additions

| Module | Description |
|---|---|
| Room manager in `server/server.js` | In-memory `Map<string, Room>` with presenter/controller WebSocket references |
| `/ws/control` upgrade path | New WebSocket path alongside existing `/ws` for audio |
| `generateRoomCode()` | Utility: 6-char alphanumeric code generation |
| Room cleanup | Auto-cleanup rooms when presenter disconnects or after timeout (30 min) |

---

## Voice Commands from Phone

**Can voice commands work from the phone?** Yes, but with caveats:

- The phone could capture audio and send it through the existing `/ws` AssemblyAI pipeline
- However, this creates a second audio stream competing with the desktop microphone
- Better approach: the phone controller sends a "start voice" command, and the existing desktop microphone handles all voice input
- Alternative: phone-local speech recognition via Web Speech API (`SpeechRecognition`) for simple commands ("next", "back") without needing the AssemblyAI pipeline -- free and low-latency but less accurate

**Recommendation:** Defer phone voice commands to a later phase. Touch navigation is the primary use case. If added later, use the Web Speech API on the phone for simple nav commands only.

---

## Technical Constraints and Risks

### Network Requirements
- Phone and desktop must be on the same network (or server must be publicly accessible)
- Corporate/university WiFi may isolate devices (client isolation). This is the single biggest deployment risk.
- Mitigation: document that devices must be on the same subnet, or use a tunnel service for remote access

### Security Considerations
- Room codes should expire after 30 minutes of inactivity
- No sensitive data flows through the control channel (just slide indices and headings)
- Rate-limit navigation commands to prevent abuse (max 2 commands/second per controller)
- Room codes should be random enough to prevent guessing (6 alphanumeric = 2.1 billion combinations)
- Optional: add a simple "approve controller" confirmation on the presenter side before the phone gains control

### Performance
- WebSocket round-trip on LAN: < 10ms typically
- Full path (phone -> server -> presenter -> BroadcastChannel -> audience): < 50ms
- Phone UI should use optimistic updates: show the slide counter advancing immediately, reconcile with server confirmation

### Browser Compatibility
- WebSocket: universal support
- Screen Wake Lock API: Chrome/Edge/Safari (not Firefox). Provide fallback for Firefox: show a note to disable auto-lock.
- QR code scanning: native camera app on iOS/Android handles it; no special API needed

### Vite Dev Server Config
- `vite.config.ts` already proxies `/ws` to the Node server. Need to add `/ws/control` to the proxy config.
- The Vite dev server must be accessible on the local network (not just localhost). May need `--host` flag: `vite --host 0.0.0.0`

### Edge Cases
- Presenter refreshes page: room persists on server, presenter re-joins. Phone should auto-reconnect.
- Phone loses connection: show reconnecting UI, auto-retry WebSocket every 2 seconds
- Multiple controllers: support it -- useful if a co-presenter also wants control. All controllers see the same state.
- Phone connects before presentation is loaded: show "Waiting for presentation..." state, update when presenter loads content

---

## Implementation Phases

### Phase 1: Core Remote Control (MVP)
- Server: room manager, `/ws/control` path, room CRUD
- Client: `/controller` route with pairing screen and basic remote UI
- Presenter: "Enable Remote" button, room code display
- Navigation: next/prev only, slide counter sync

### Phase 2: Enhanced Phone UI
- QR code pairing
- Speaker notes display on phone
- Presentation timer sync
- Screen wake lock
- Dark theme optimization

### Phase 3: Advanced Features
- Phone voice commands (Web Speech API)
- Laser pointer simulation (phone sends touch coordinates, presenter view shows dot)
- Slide preview thumbnails on phone
- Vibration feedback on slide change (`navigator.vibrate()`)
- Multiple controller support with presenter approval

---

## Open Questions

1. **Should the audience view also switch from BroadcastChannel to WebSocket?** This would enable true cross-device audience viewing (phones in the audience). However, it adds server load and is a separate feature.

2. **Should room codes be persisted (database/file)?** For MVP, in-memory is fine. Sessions are ephemeral by nature.

3. ~~Should the phone be able to control other features?~~ **YES** — Q&A mode toggle is included in MVP. Phone can activate voice listening for questions and see AI-generated answers.
