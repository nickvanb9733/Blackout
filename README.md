# BLACKOUT: Reclaim the Data Center (v3.3.0)

An original data-center platformer with 40 equipment-themed maps, a Character Lab, technician exit questions, an original techno soundtrack, and solo or two-player online co-op.

## Run locally

Use Node.js 22 or newer. There are no third-party runtime dependencies.

```bash
npm start
```

Open **http://localhost:3000**. To try co-op on one computer, use two different browser windows/tabs, host a room in one, and join its six-character code in the other. Each tab is a separate player session. Two people can use the same hosted address on different computers.

```bash
npm test       # Physics, objectives, quizzes, co-op, transport, and audio scheduling checks
npm run build # Produce dist/Blackout.html for offline solo play
```

The downloadable `Blackout.html` runs solo by opening it directly. Online co-op requires the included server; it cannot run from an HTML attachment or GitHub Pages alone.

## Upload to GitHub and deploy on Railway

1. Unzip this project. Upload the **contents of the project folder** to your GitHub repository so that `package.json`, `server.js`, `Dockerfile`, `railway.json`, and `public/` are at the service's root. Do not upload only the ZIP or the offline HTML.
2. In Railway, create a service from that GitHub repository, or connect the repository to your existing service. If you keep the game inside a subfolder, set Railway's service root to that subfolder.
3. Railway can build the included `Dockerfile`; `railway.json` also selects it. The container runs `node server.js`. No manual build command or npm dependency installation is needed.
4. Keep **one replica in one region** for this version. Active multiplayer rooms live in that server process. Running independent replicas would separate their room lists.
5. The server listens on `0.0.0.0` and Railway's `PORT` variable. Its health check is **`/health`**, configured in `railway.json`.
6. Generate a public Railway domain under the service's networking settings. Open that **HTTPS address** in both players' browsers.
7. Choose **Host Co-op** in the first browser and share the room code. The second player chooses **Join Friend**. Join while the host is in the main lobby; the host selects maps for the whole crew.

Useful official references: [Railway deployment guide](https://docs.railway.com/guides/express), [public networking](https://docs.railway.com/networking/public-networking), and [health checks](https://docs.railway.com/deployments/healthchecks).

Optional environment variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Listening port; Railway supplies this automatically. Local default: `3000`. |
| `MAX_ROOMS` | Maximum active room records. Default: `100`. |
| `PUBLIC_ORIGIN` | Optional additional exact allowed origin, such as your custom HTTPS domain. Ordinary same-origin hosting needs no value. |

## What changed in v3.2.1

Cutscenes start automatically on opening the first mission, completing the fifth map of an equipment room, and selecting an unlocked Story Archive chapter. This includes all nine chapters and the finale, in solo and co-op. There is no Play Cinematic screen or room-completion Play Story button. The shared server starts playback for both players; host pause/resume and skip controls remain available. The final Restore Facility confirmation and end-of-chapter return buttons remain interactive. If a browser blocks synthesized narration, animation and captions still run and Retry Voice remains available.

## What changed in v3.3

- **G-man:** an evil robot in dark angular armour, with crimson eyes, claws, crown spikes, red thrusters and a large glowing **G** on his chest. His name is updated throughout dialogue, subtitles, status displays and the archive.
- **Automatic ladders:** contact latches you onto static or moving ladders. Use **W/S** to climb; **Space** or touch **JUMP** detaches you with one air jump remaining. Move clear before reattaching. Top and bottom docks release safely; reverse W/S to climb back.
- **Shorter opening:** seven speaking beats preserve the breach, escape, rescue and mission. The campaign now has 53 beats. Voiced scenes move on as soon as both connected players finish speaking; muted or unavailable voices keep readable caption timing.
- **1× / 2× cutscenes:** use the speed button beside Pause. Speed changes apply at the next line so no dialogue is cut off or repeated. Animation, speech and mouth timing all use the chosen speed. The host controls this in co-op, and the choice carries into later chapters in the session.
- **Fresh solo campaign:** both the Restart Solo door and Reset Campaign menu clear completion, purchases, points, claimed fuse rewards and appearance. The default technician and three free heads remain. A level retry or checkpoint respawn preserves cosmetics.
- **Six more shop heads:** Signal Scout (40 points), Gearhead (50), Battery Buddy (60), Flood Diver (70), Orbit Operator (90) and Recovery Royalty (110). All have matching gameplay and speaking cinematic designs. Ten paid heads now cost 1,200 points combined, earnable from the campaign's 120 fuses.

## What changed in v3.2

- **Two visible checkpoints in every map (80 total).** Land on a flagged platform along the numbered route. The whole connected crew gets that respawn point, living teammates recover their hearts, and a sound and notification confirm activation. Checkpoints appear on the minimap and HUD. They occupy stationary landings with no hazards or NPCs placed on them. Route skips cannot activate a later checkpoint.
- **Resume instead of repeating the whole map.** Falls return you to your saved checkpoint. After a solo death or full team wipe, choose **Resume Checkpoint**. **R** or the pause menu also resumes there. Collected fuses, opened relays, solved optical gates, route progress and cosmetic rewards are retained. Enemies reset, both players regain full health, and three seconds of protection give the crew time to move. The host controls a co-op retry; a surviving teammate can still revive a downed player normally.
- **Explicit fresh starts.** **Restart Map From Entrance** clears the level's checkpoints and objectives. Completing/replaying a level, returning to the lobby or reloading starts a fresh level session; checkpoints are session state, not part of the browser's permanent campaign save. A wrong exit answer still sends only that player to the entrance and clears their personal checkpoint until they physically reach a checkpoint again. Retrying cannot bypass that penalty.
- **Improved lip sync.** Removed the repeated jaw oscillation. The mouth now follows timed sound groups with full M/B/P lip closures, F/V teeth, TH/L tongue shapes, rounded vowels and smooth transitions. Each actual word event resets its timing. The model learns the selected voice's pace from word intervals and closes the mouth after a word, during punctuation pauses and when playback stops. Voices without word events use a pronunciation-based estimate. The browser does not supply phoneme timestamps or an audio waveform, so timings within a word remain approximations.
- **Multiplayer cinematics.** Both customized technicians appear in the same scene composition on both devices. The shared scene clock controls staging, pause, resume and skip; each client's mouth motion follows that device's local speech. Rendering interpolates the shared clock between network updates. Each narration attempt has a scene ID and take number, so retrying a voice cannot be completed by a delayed acknowledgement from an earlier attempt. Both connected players finish before the scene advances, with the existing bounded fallback for a failed voice service. Host transfer also works during a cutscene.

## What changed in v3

- **40 individually authored routes:** storm yards, coil towers, drain chutes, piston stairs, rail workshops, laser corridors, battery vaults and cable-tray parkour. Smaller landings, timing and new mechanics create difficulty, not just world size. The equipment room identities remain intact; each map has a different scenario and route.
- **Restart Solo door:** beside the Character Lab. It asks for confirmation, clears campaign completion, and unlocks only Utility again. Appearance, purchased heads, points and the fuse reward ledger reset with the campaign. The door cannot reset an online room.
- **Route enforcement:** numbered directional plaques identify the next route leg. Solid path barriers block selected drop shortcuts. An exit bulkhead stays closed until the ordered route has been traversed. In co-op the route is shared; both players still need to reach and pass the exit.
- **Purposeful slides:** six dedicated downhill chutes, each crossing a containment gap into a landing. No moving platform crosses a chute’s player corridor.
- **Hand-operated rail platforms:** hold E + A/D on or beside an orange carriage. Position it at the outlined dock, release E, then jump. An E call post returns a stranded carriage. One player controls a carriage at a time; both can ride it.
- **Movement hazards:** fast conveyors lead toward spikes or spinning saws. Green spring blocks bounce upward. Directional launch blocks throw players across long gaps. Existing moving ladders, fire, arcade arc zones, floods, steam and fans remain.
- **Distinct enemies:** walkers, leaping hoppers, warning-then-rushing chargers, drones with aimed projectiles, and targeting laser sentries. Sentries track in pink, lock in amber, then fire; platforms and solid walls block their beams. Wrench combat remains available.
- **Mirror gates:** one optical puzzle in every equipment room. Hold E + A/D beside the cyan emitter to pull it along its rail. Its harmless beam must reflect through both mirrors into the receiver for a short stable hold. This permanently releases that puzzle’s gate for the current attempt. These puzzle emitters are separate from hostile laser sentries.
- **80 unique technician questions:** each level owns a different pair; questions are no longer recycled between levels. Incorrect answers still return the answering player to the entrance and explain the concept. A retry repeats that level’s pair so the player can learn it. Objectives already recovered by the crew remain.
- **Fuse points and Head Shop:** each newly collected fuse gives every connected player 10 points. Character Lab now has Appearance and Head Shop tabs. Buy CRT Commander (100), Hex Engineer (160), Live Wire (220), Rack Cat (300), or one of the six new heads listed above. Three original heads remain free. Each account can earn a given level/fuse reward once per campaign; level replays cannot farm it. Restart Solo clears that ledger along with all points and purchases.
- **Animated story:** the supplied fictional intrusion storyline starring G-man is adapted into nine chapters and 53 narrated beats: opening, seven intermissions, and finale. Scenes include the lockdown, maintenance escape and rescue, electrical/cooling/monitoring recovery, hall recovery, a playable **RESTORE FACILITY? → YES** confirmation, the 100% restoration, and the Microsoft cliffhanger. A Story Archive in the lobby session menu replays unlocked chapters.
- **Visible speaking cast:** large jointed actors portray your customized technician, Maya, Eli (the narrator), C0-R3, and G-man. They blink, move their mouths, nod, gesture, run, use radios, and react to the story. G-man has ten spoken villain lines across all nine chapters, dark angular armour, crimson eyes, clawed hands, a large glowing G chest emblem, red thrusters and an animated breakdown in the finale. The menu blur no longer covers cinematics; captions and controls occupy their own area beneath the cast.
- **British voices and music:** the game explicitly selects installed `en-GB` voices and requests British English for every actor. If several UK voices are available, it chooses different voices by role; otherwise it varies delivery. A status line identifies the selected voice. If no UK voice is installed, the game requests `en-GB` from the system and shows an installation hint; an accent cannot be guaranteed on devices lacking that voice. **Retry Voice** retries a blocked utterance from a user click. No prerecorded speech files or cloud speech service are included. Original techno music lowers automatically during dialogue.
- **Speech animation and controls:** the mouth starts and stops with actual speech events and uses word-boundary events when available; mouth shapes approximate sounds from the text using the adaptive timing described above. Without speech, animation follows caption timing. Pause freezes the scene and speech; skip cancels the utterance. In co-op, each device supplies its narration completion, and the shared scene advances once both voices finish. Muted or unavailable narration retains a caption-reading duration, with a 15-second story-time timeout to prevent a broken voice service from trapping the crew. The host controls shared playback. Each player may need to click **Retry Voice** to allow audio on their device.


The room sequence remains **Utility → Transformer → Switchgear → Generator → UPS → PDU → RPP → Server Rack**. Completing five maps restores the equipment, returns the crew through the same lobby door, and unlocks the next room. Previously cleared maps remain replayable.

## Controls

| Action | Keyboard |
| --- | --- |
| Move | A / D or left / right arrows |
| Jump / double jump | Space twice (Z also works) |
| Latch onto a ladder | Automatic on contact; W/S enters from a landing |
| Climb while latched | W to ascend; S to descend |
| Jump off a ladder | Space (or touch JUMP); move clear before reattaching |
| Enter a yellow maintenance slide | S near its labeled entrance |
| Drop through a one-way platform | S away from a ladder |
| Move a rail platform / optical emitter | Hold E + A/D nearby |
| Recall a rail platform | Tap E at its call post |
| Spring / directional launch block | Land on the green block; hold jump to maintain height |
| Wrench attack / deflect a bolt | X or J |
| Enter door / open exit questions | Tap E or Enter |
| Revive a downed teammate | Hold E close to them for about 1.4 seconds |
| Ride a teammate | Land on their helmet; Space jumps off |
| Resume checkpoint / retry from entrance | R (host controls online retries) |
| Pause / session menu | Escape or P |

Touch controls support holding E and W/S with separate fingers. Landscape orientation offers a wider view. Opening a menu pauses solo play; **online play continues**, so open menus from a safe place.

## Progress and multiplayer behavior

Completed maps, appearance, purchased heads, points and claimed fuse rewards are stored in each browser. The game imports the original version's completed-map save when it is available on the same browser origin. The session menu can export and import a portable compatible version-2 save format, extended with cosmetic account data. A save may need to be exported before moving from a local file to a new Railway domain because browser storage is origin-specific.

An online room begins with the host's saved campaign progress. Connected players receive the crew's completed progress. All connected players must finish their own exit checks and be at the exit to clear the map. A passed player waits safely at the exit. A wrong answer does not reset their teammate's successful check.

At zero health, a solo player retries the current map. In co-op, the player is downed and can be revived; if the entire connected crew is down, the host retries. A network interruption stops stale movement inputs and attempts reconnection. The remaining player can continue solo, and host controls transfer if the host leaves.

Rooms and in-progress map state are held in memory. **A server restart or redeployment ends active rooms.** Completed campaign progress remains in the browsers; the host can create a new room using that save. Idle abandoned rooms expire after 15 minutes. This version has no account system or database-backed cloud saves.

## Editing the game

| File | Contents |
| --- | --- |
| `public/data.js` | Equipment themes, 80 questions, cosmetic prices, references and avatar palette |
| `public/levels.js` | Forty authored routes, platforms, barriers, direction plaques and puzzle placements |
| `public/optics.js` | Mirror reflection and receiver alignment |
| `public/story.js` | Nine chapter scripts, British voice selection, playback lifecycle |
| `public/lipsync.js` | Sound-shape plans, word-cue timing, pace adaptation, pause/stop handling |
| `public/cinema.js` | Visible cast, co-op character staging and scene animation |
| `public/core.js` | Physics, hazards, interlocks, puzzles, points, purchases, story state, co-op and quiz validation |
| `public/render.js` | Original Canvas artwork, camera, characters, equipment, effects and minimap |
| `public/client.js` | Menus, inputs, local saves, multiplayer connection and question interface |
| `public/audio.js` | Original Web Audio techno synthesizer and effects |
| `public/style.css` | Responsive page and menus |
| `server.js` | Node HTTP server, room management, input validation and authoritative shared simulation |
| `scripts/build-offline.js` | Bundles the same game into the standalone solo HTML |
| `test/` | Dependency-free Node tests |

The server advances gameplay at 60 Hz and streams snapshots at approximately 25 Hz using Server-Sent Events. Clients submit authenticated input messages to the same origin. Positions, damage, relay activation, quiz results and progress are decided by the shared server engine. No external multiplayer service is needed.

Questions intentionally cover equipment concepts, documentation and hazard recognition. Arcade hazards, jumping over flashes, wrench combat and moving ladders are fiction. They are not live electrical operating instructions or professional certification. Adapt the questions to reviewed site-specific training before using the game as a formal training assessment. See `SOURCES.md`.

## Verification and remaining playtest

Automated checks cover all 40 authored maps, 381 solo jump/docked-platform/launch transitions, every ladder endpoint and slide corridor, solo and co-op relays, optical alignment, shared platform ownership, route gates, conveyors and launch blocks, every quiz gate, cosmetic rewards and purchases, story progression and final confirmation, head-riding, revival, host transfer and two real HTTP/SSE clients. Automatic ladder capture, jump detachment, endpoint reversal, head-riding and safe relay/checkpoint landings are covered. All routes, 53 story beats and thirteen head designs were rendered. Narration scheduling uses a speech API test double; the offline menus, purchases, reset and story controls use a DOM/canvas harness.

A full interactive browser playtest was not available in the build environment. Real browser speech output, Internet latency and touch interaction still need a playtest on your deployed address. See `LEVELS.md` for the map/mechanic catalog and `STORY.md` for the adapted script.

## Cinematic verification

The test suite covers British voice selection, speech event timing, stale callback cancellation, captions when speech fails, actor coverage, and both-player narration completion. The offline UI was exercised with a DOM/canvas harness, including the transparent cinematic overlay. Canvas rendering was checked for all 53 dialogue beats and every level route. Real browser/OS speech output was not audibly tested in this build; verify voice playback once on your target device by entering Utility or selecting an unlocked Story Archive chapter; use Retry Voice only if narration is blocked.

Version 3.2 verification also covers all 80 checkpoint landings, shared respawn, quiz-penalty preservation, stale narration packets, and all nine cutscenes over two real HTTP/SSE client connections, including shared pause/resume/skip and host transfer. All 53 scenes are rendered from both co-op viewpoints to check matching staging. Speech timing tests simulate browser events; actual UK voice output still needs a listening check on the target device.

Version 3.3 adds regression coverage for contact latching, jump detachment without recapture, remaining air jumps, safe endpoint reversal, moving-ladder head riding, 2× speech and clock timing, voiced versus caption-only transitions, and complete solo purchase resets. All 60 automated tests pass; real HTTP/SSE clients share host-controlled speed changes.
