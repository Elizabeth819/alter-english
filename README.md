# ALTER

**A story-driven English speaking app for Chinese teenagers (12–18).**
Instead of memorizing word lists, you build the line your character would say — and the story moves on.

> **▶ Live demo: https://elizabeth819.github.io/alter-english/**
> Best on a phone. Takes 3 minutes to play the first episode.

---

## The idea

Teen English apps are good at making you *remember* words (flashcards, streaks, multiple-choice). None of them make you *speak*. ALTER flips the loop:

1. **Output first.** You get a Chinese intent ("she's asking if the seat is taken — let her sit") and a bank of **chunks** (`go ahead`, `if you don't mind`, `came out wrong`). You assemble the sentence yourself.
2. **Instant, honest feedback.** A 5-level naturalness verdict, the native version, and one line explaining *why* — e.g. `"all yours"` feels native, `"you can sit"` sounds like a textbook. You must get it right to continue.
3. **A serialized story in 3 seasons.** 15 episodes: school life → first job, travel, family negotiations, a foreign friend, graduation. Every episode ends with a two-way choice that is remembered; the next episode opens by referring to what you picked.
4. **Say it out loud.** Once the line is assembled, tap **开口说** and actually say it. The browser transcribes your speech; a tolerant matcher forgives contractions, connected speech, filler words and small word-order slips, then tells you *said it / almost / didn't catch that* and which words it missed. No audio is recorded, uploaded or stored — only the recognized text is compared on-device. If speech recognition is unavailable or mic permission is denied, the app falls back to chip submission automatically.
5. **A shareable artifact.** Each episode ends with a poster card ("the scene you made") you can download and send to friends.

You pick a **persona** (The Softie / The Roaster / The Wildcard). It changes the closing narration of every episode and the card styling — self-expression, not just correctness.

## What's inside

- **3 seasons · 15 episodes · 45 acts · 135 real speaking turns**, each with distractor chunks, multiple accepted answers and a short usage note
- Difficulty ramps by season: A2–B1 (school) → B1 (first job / travel / family / online friend) → B2 (interview, flight disruption, argument, online event, farewell)
- **Daily pacing:** home shows one clear "today's 3 minutes". The next episode unlocks tomorrow; finishing today's episode does not hard-block you — the next one is still playable, marked as early access
- **Review queue:** lines you got wrong (or only "ok") come back on a forgetting curve; only a correct answer in review removes them
- **Say-it-out-loud check:** speak the line you just assembled; tolerant transcript matching (contractions, reductions, fillers, minor word-order slips) marks it 说对了 / 差一点 / 没听清 and lists missed words. Scoring stays on the original 5-level scale — speaking is an extra "did you actually say it" signal, never a score change
- **Graceful speech fallback:** unsupported browsers or a denied microphone return to chip submission automatically, with a quiet inline note (no error dialog). First use shows a one-time guide covering why speak, the permission prompt, privacy, and how to turn it off
- 3 personas, XP, daily streak, "native lines" counter, total progress
- 2-way branches with distinct endings; the next episode contains a `callbacks` block keyed by the previous choice, so every branch is referenced later
- Canvas-generated share card (1080×1350 PNG) with the episode number, native-line count and a **scannable QR code** to the live app
- Phrase book: save / replay / delete the lines you actually said
- Built-in TTS for every NPC line (Web Speech API, no key)
- Installable PWA with offline cache; seasons load on demand and a first-paint skeleton keeps weak networks from showing a white screen
- **On-device funnel log:** nine key events (open, persona, scene start, beat, scene finish, speech, card generated/saved, next-day return) stored in `localStorage`, capped at 500 events, with a JSON export. No third-party analytics, no uploads
- **Hidden data page:** funnel conversion, 14-day activity, average beats per scene, speech-usage ratio and share rate. Open `#stats` or tap the ALTER wordmark 5 times
- **Parent weekly report:** one printable/savable page with study days, episodes, native lines, speaking turns, review clears, week-over-week trend and one specific, data-derived suggestion. It contains statistics only — never dialogue text
- 78 automated tests, zero dependencies

**Not in scope yet:** accounts & cloud sync, LLM free chat, pronunciation scoring (we only check which words were heard), friends/leaderboards, payments. The MVP deliberately proves the core loop with no backend and no API keys.

## Run it

```bash
# option 1: just open the file
open index.html          # macOS  (or double-click it on Windows)

# option 2: local server (enables PWA install / offline)
python3 -m http.server 8765
# → http://127.0.0.1:8765/
```

No build step, no `npm install`, no environment variables, no secrets.

## Tests

```bash
node tests/run.js        # 78/78 passing, Node >= 12, no dependencies
```

Or open `tests/test.html` in a browser — same suite, zero install.

Coverage: scoring (5 grades, normalization, multi-answer best pick), XP anti-farming, unlock chain, scene state machine, storage migration, streak, phrase book, **daily pacing** (today's episode, next-day unlock, early-access flag, legacy state fallback), **review scheduling** (wrong → today, "ok" → +3 days, review pass removes / fail postpones), **QR generation** (finder/timing patterns, capacity guard, deterministic output), **speech matching** (contractions, connected speech/reductions, fillers, small word-order slips, several missing words, completely off-topic, empty transcript, best of multiple answers) and a **fake-recognition controller** (result, denial, abort, unsupported — no real microphone involved), **local analytics** (event shape, privacy-field stripping, 500-event cap, malformed-log recovery, funnel/uniques, 14-day activity, per-scene averages, weekly metrics and trend, data-derived advice, JSON export), **content integrity** (every reference answer must be assemblable from its chunk bank; no Chinese in English lines; tips ≤ 2 sentences; every episode declares a valid season and carries callbacks for both branches of the previous episode), and an end-to-end simulation playing all 135 turns and finishing all 15 episodes.

## Stack

Plain HTML/CSS/JS. `src/engine.js` is a UMD pure-function core (scoring, progress, persistence) so it runs in both the browser and Node tests. Seasons live in separate files; `index.html` loads only season 1 for first paint and `src/catalog.js` injects seasons 2–3 on idle or on demand. `localStorage` is the only storage. No frameworks, no CDN, no third-party fonts or images.

```
index.html              entry point + first-paint skeleton
src/content.js          season 1: 5 episodes / personas
src/seasons/season2.js  season 2: episodes 6–10 (loaded on demand)
src/seasons/season3.js  season 3: episodes 11–15 (loaded on demand)
src/catalog.js          merges loaded seasons into window.ALTER_CONTENT
src/engine.js           scoring, progress, daily pacing, review queue, storage, validator
src/speech.js           tolerant transcript matching + Web Speech recognition controller
src/analytics.js        local funnel log, trimming, stats and weekly-report aggregation
src/qr.js               fixed-version QR encoder (share card link, zero deps)
src/app.js              UI: routing, rendering, events, speech flow, stats/report, canvas card, TTS
src/styles.css          all styles
tests/                  harness + 78 specs + node/browser runners
docs/product.md         product thinking (Chinese)
docs/README.zh-CN.md    full Chinese guide
```

## Add an episode

Append an object to the last season file (or add a new season file and register it in `src/catalog.js`), then run `node tests/run.js`. Each episode needs `season`, `callbacks` (keyed by both options of the previous episode) and 3 acts × 3 beats. The validator tells you exactly which chunk is missing, which id collides, or which field is empty. No UI changes needed.

## Status

v1.3 — measurement pass. A local, capped funnel log now records the key steps; a hidden data page shows conversion, 14-day activity, average beats per scene, speech usage and share rate; a printable parent weekly report summarizes the last 7 days and ends with one specific, data-derived suggestion. Nothing is uploaded and no conversation text appears in reports. 78 tests, 15 episodes playable end to end. Next: adaptive hints based on past accuracy, pronunciation-level feedback, share-link challenges, then accounts and cloud sync.

## Notes

- The UI is in Simplified Chinese by design — the learners are Chinese students; the **learning content is English**.
- No accounts, no third-party analytics, no network requests. Progress and the local event log live in `localStorage`, are capped at 500 events, and can be exported as JSON or erased in-app. The parent report reads only these local counters — never dialogue text.
- Hidden data page: open `#stats` (or `#report`) in the URL, or tap the ALTER wordmark five times. The parent report is also linked at the bottom of the persona page.
- Speech: we never record, upload or store audio; recognition is performed by the browser and only the resulting text is compared locally. Speech is optional and can be turned off at any time.
- Speech volume/voice depends on the OS; no cloud TTS is used.

## License

[MIT](LICENSE)
