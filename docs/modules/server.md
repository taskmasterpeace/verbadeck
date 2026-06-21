# Server Module

## Overview
Express + WebSocket server on port 3002. Proxies audio to AssemblyAI, routes AI requests to OpenRouter, manages phone controller rooms.

## Files
| File | Lines | Purpose |
|------|-------|---------|
| `server/server.js` | 1367 | All routes + WebSocket (MONOLITHIC) |
| `server/openrouter.js` | 1320 | OpenRouter API client (MONOLITHIC) |
| `server/model-config.js` | 157 | Model defaults + routing config |
| `server/prompts.js` | 894 | All AI prompts |
| `server/constants.js` | ~100 | Tone personas, question starters |
| `server/room-manager.js` | 82 | Multi-client room management |
| `server/image-generator.js` | 131 | Replicate image generation |
| `server/pexels-client.js` | 83 | Pexels stock image search |
| `server/unsplash-client.js` | 115 | Unsplash stock image search |
| `server/timing-logger.js` | 246 | Request latency monitoring |

## WebSocket Endpoints
| Path | Purpose |
|------|---------|
| `/ws` | Audio proxy to AssemblyAI (binary PCM16 in, JSON transcript out) |
| `/presenter-room` | Presenter creates room, broadcasts state |
| `/controller` | Phone controller joins room, sends navigate commands |

## AssemblyAI WebSocket Flow
1. Client connects to ws://localhost:3002/ws
2. Server opens connection to wss://streaming.assemblyai.com/v3/ws
3. Server adds Authorization header with AAI_API_KEY
4. Client sends: Binary PCM16 audio chunks
5. Server forwards to AssemblyAI
6. AssemblyAI returns: {type:'Turn', transcript, end_of_turn}
7. Server forwards JSON to client
8. Server sends {type:'status', ready:true} when AssemblyAI is ready

## Room Manager (room-manager.js)
- In-memory Map: roomCode -> {presenter: WebSocket, controllers: Set<WebSocket>}
- Room code: 6-char alphanumeric
- Stale room cleanup: >30 minutes auto-deleted
- Messages: presenter broadcasts state, controllers send navigate commands

## Environment Variables
- AAI_API_KEY - AssemblyAI API key (required)
- OPENROUTER_API_KEY - OpenRouter API key (required)
- REPLICATE_API_KEY - Replicate image gen (optional)
- PEXELS_API_KEY - Pexels stock images (optional)

## Known Issues
- server.js at 1367 lines (should split into route files)
- openrouter.js at 1320 lines (should split by operation)
- No request validation on any endpoint
- No rate limiting
- Room manager is in-memory only (lost on restart)
- No health check for WebSocket connections
- Stale WebSocket connections can accumulate (manual restart needed)
- CORS allows all origins in dev mode

## Connections
- **Consumed by**: All client API calls via api-client.ts
- **External**: OpenRouter API, AssemblyAI API, Replicate API, Pexels API, Unsplash API
- **Config**: model-config.js controls model selection per operation
