# Version 3.3.0

- Rename the antagonist to G-man throughout the campaign, subtitles, British voice dialogue and Story Archive.
- Redesign him as a dark armoured robot with angular crimson eyes, crown spikes, claws, a large glowing G chest emblem and red thrusters. Keep animated speech and shared co-op staging.
- Latch onto static and moving ladders automatically; use W/S to climb and Space or touch JUMP to detach. Prevent immediate reattachment and preserve the second air jump.
- Exit ladder endpoints safely. Reverse W/S on a landing to climb back; preserve platform grabbing, revival and teammate head-riding.
- Condense the opening from 11 speaking beats to seven and remove padded waits after successful narration. Preserve reading time for caption-only players.
- Add a host-controlled 1×/2× cutscene toggle, applied at the next line to animation, speech and mouth timing.
- Reset points, purchases, appearance and the reward ledger on a confirmed solo campaign restart; preserve them on level retries.
- Add six purchasable heads with matching gameplay and cinematic artwork: Signal Scout, Gearhead, Battery Buddy, Flood Diver, Orbit Operator and Recovery Royalty.
- Update keyboard and touch guidance. Preserve checkpoints and gold outlines around every quiz answer.

# Version 3.2.2

- Give every quiz answer the same permanent gold outline, with extra spacing so the outlines stay separate.
- Preserve a distinct keyboard-focus indicator inside the focused answer.

# Version 3.2.1

- Start all cinematics automatically, including the opening, equipment-room completion scenes, finale and archive replays.
- Begin room-completion scenes as soon as the crew clears the fifth map; remove the separate Play Cinematic prompt.
- Share automatic playback in co-op while preserving host pause/resume, skip, narration timing and explicit story confirmations.

# Version 3.2.0

- Added 80 visible checkpoints, two in each level, with shared co-op activation, minimap indicators, health restoration and safe static respawns.
- Added checkpoint retries that keep fuses, relays, optical gates and route progress, plus an explicit full level restart. Checkpoints last for the current level session.
- Preserved the wrong-quiz-answer entrance penalty, co-op revivals, host-only retries and cosmetic reward ledger.
- Replaced free-running mouth oscillation with sound-shape sequences, actual word-cue anchors, learned voice pace, closed-mouth pauses and smoothly blended jaw/width/rounding/teeth/tongue poses.
- Added both customized technicians to cinematics with matching staging on both clients and smooth interpolation between network snapshots.
- Added scene IDs and narration take numbers to reject stale completion packets, including after Retry Voice. Stop remaining local narration on a shared-scene timeout.
- Verified shared playback for all nine chapters using two real network clients, including pause/resume, skip permissions, voice retries and host transfer.

# Version 3.1.0

- Fixed the opaque/blurred menu overlay that obscured animated cutscenes.
- Added large, jointed on-screen actors for the customized technician, Maya, Eli, C0-R3 and Google, with animated faces, six mouth shapes, gestures, running, radios and reactions.
- Added ten Google speaking beats across all nine chapters and an animated villain breakdown; the story now contains 57 beats.
- Explicitly select British English voices (`en-GB`) with different role preferences, visible voice status and Retry Voice.
- Link mouth activity to speech start/boundary/end events, pause and cancellation; keep caption-timed animation when narration is unavailable or muted.
- Wait for connected players' narration completion before advancing, with a bounded fallback for failed speech services.
- Preserve all 40 levels, gameplay mechanics, cosmetics, co-op, techno music, save compatibility and manual GitHub/Railway deployment.

# Version 3.0.0

- Replaced the repeated multi-row generator with 40 authored scenario routes and 80 non-repeating level-assigned questions.
- Added a confirmed Restart Solo lobby door; retained cosmetic progression.
- Added orange player-positioned rail platforms, docking outlines and recall posts.
- Added tracking/locking laser sentries, leaping hoppers, charging enemies and aimed drone projectiles.
- Restricted slides to six useful, unobstructed downhill chutes.
- Added fast conveyors, spikes, saws, vertical springs and directional launch blocks.
- Added directional route plaques, solid shortcut barriers and an ordered-route exit interlock.
- Added eight movable-emitter puzzles that reflect through two mirrors to release a physical gate.
- Added shared 10-point fuse rewards, persistent wallets and four purchasable heads in a Character Lab shop tab.
- Added the supplied fictional storyline as nine animated chapters with 47 captioned, synthesized-voice beats, shared co-op playback, a finale confirmation and a replay archive.
- Preserved the eight-room progression, 40 levels, same-door lobby return, head-riding, revival, single-player routes, techno music and GitHub/Railway deployment package.
- Kept the existing save key and compatible save format; no deployment performed.

# Version 2.0.0

- Added an optional Character Lab door before the first equipment room.
- Rebuilt all forty levels into larger, multi-floor environments with ascending and descending routes.
- Added static and horizontally moving ladders with E + W/S controls, real descending slides, more NPCs, flooded gaps, fire and arcade arc-flash zones.
- Added a forty-question equipment bank and two mandatory multiple-choice exit checks per player per map. A wrong answer teleports that player to the entrance and resets their answer streak.
- Added server-authoritative two-player online co-op, shared collectibles, paired relay gates, revival, disconnect fallback, and host transfer.
- Added head-riding: players can carry each other while walking, jumping, climbing and sliding, and riders can jump off independently.
- Preserved solo completion with timed relays and ladder routes to every required area.
- Added original procedural techno music, sound effects, a music toggle and volume control.
- Added Node server, Dockerfile, Railway configuration, GitHub CI checks, source documentation and an offline solo build.
- Retained the eight-room, five-maps-per-room equipment restoration progression and same-door lobby returns.
