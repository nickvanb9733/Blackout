# Multiplayer performance — v3.4.0

Ten people in five separate co-op rooms all share the Node server, even though each crew has its own game. Solo runs the same physics locally in the browser. Lag that appears only in co-op points toward online transport, server resources or network latency; it does not by itself identify which one is responsible.

The previous client sent an input HTTP request every 50 ms, including while idle. The server sent a complete game state to each player roughly 25 times a second. That repeated names, appearance, purchase and fuse ledgers, equipment state and NPC properties. The browser drew the most recent positions without gameplay interpolation.

## Recorded comparison

Both runs used one local Node process and ten real HTTP/SSE clients in five private two-player rooms. Each crew entered a different Utility map (levels 1–5) and repeatedly jumped for a 12-second measurement window, with the server simulating NPCs and hazards. The optimized run used the same InputChannel and StateDecoder as the browser. Room membership and continued state delivery were checked. The legacy run used the previous 50 ms polling and full-state protocol. Neither run targeted a deployed service.

| Measurement, across all ten clients | Legacy behavior | v3.4 |
| --- | ---: | ---: |
| Input requests per second | 199.2 | 25.0 |
| Outgoing SSE data, KB/s | 1,000.8 | 91.9 |
| Delivered state updates per second | 248.3 | 248.3 |
| Server CPU, fraction of one local core | 5.4% | 4.7% |
| Input response time, median | 2.64 ms | 3.57 ms |
| Input response time, 95th percentile | 4.13 ms | 5.28 ms |
| Request errors | 0 | 0 |

Outgoing game-state traffic fell **90.8%** and input requests fell **87.4%** in this workload. An uninterrupted movement key produces five refreshes per second instead of twenty, plus requests for actual input changes. Rapidly changing controls will produce more requests than holding a key still.

KB/s is decimal payload bytes read from SSE streams. It excludes HTTP/TLS overhead, static asset downloads and incoming input bodies. CPU measurements use Linux process CPU time. These results show lower transport overhead; local response times do not establish an Internet latency improvement. The original local server was not CPU saturated. Railway CPU allocation, region, network conditions and the users' browser frame rates were not available for measurement. This short test is not a capacity guarantee or a complete multiplayer playthrough.

## Reproduce locally

Use Node 22 or newer from the extracted project folder:

```bash
npm test
npm run test:load
node scripts/load-test.mjs --legacy
```

The script starts and stops its own server on an unused local port. It does not modify saved browser campaigns or contact Railway. Run the two modes sequentially on the same machine. `LOAD_SECONDS=30 npm run test:load` lengthens the measurement window on shells supporting that syntax.

## What remains authoritative

The server still runs at 60 Hz and broadcasts approximately 25 updates per second. It alone decides movement collisions, damage, head riding, co-op relays, checkpoints, quiz answers and progress. Only serialized values are rounded; server simulation precision is unchanged.

Rendering uses a 50 ms interpolation buffer. This makes motion between updates smoother, but it is not local movement prediction and cannot remove round-trip latency. It freezes when updates stop instead of predicting through gates or hazards. Checkpoint respawns, wrong-answer teleports, deaths and scene changes bypass interpolation. Cutscenes keep their original shared timing and local speech synchronization.

Full baselines recover a reconnect or skipped sequence. Backpressure prevents the application from queuing an unlimited train of obsolete states behind a slow connection. A stream that stays blocked for ten seconds disconnects so the existing reconnect and teammate fallback can operate.

## Updating the hosted game

Upload the extracted project contents to the existing repository and redeploy the same Railway service. Include the entire `public` folder and `server.js`; the new `public/network.js` is required. The included Dockerfile already copies these files and needs no new package installation. Keep one replica because rooms are stored in process memory.

After deployment, the service's `/health` response should show `version: "3.4.0"` and `protocol: 2`. Have all players refresh before creating new co-op rooms. Older pages can still connect, but will continue using the heavier protocol until refreshed. Updating only `dist/Blackout.html` does not update the co-op server.

Redeploy between sessions: a server restart ends active rooms, while completed campaign progress stays in each browser. The next verification is a real ten-person playtest on the hosted address. If lag remains, record whether everyone stalls simultaneously or only one crew does, and check the service's CPU/memory usage and players' latency during that interval before changing hosting resources.
