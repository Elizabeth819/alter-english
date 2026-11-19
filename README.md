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
4. **A shareable artifact.** Each episode ends with a poster card ("the scene you made") you can download and send to friends.

You pick a **persona** (The Softie / The Roaster / The Wildcard). It changes the closing narration of every episode and the card styling — self-expression, not just correctness.

## What's inside

- **3 seasons · 15 episodes · 45 acts · 135 real speaking turns**, each with distractor chunks, multiple accepted answers and a short usage note
- Difficulty ramps by season: A2–B1 (school) → B1 (first job / travel / family / online friend) → B2 (interview, flight disruption, argument, online event, farewell)
- 3 personas, XP, daily streak, "native lines" counter, total progress
- 2-way branches with distinct endings; the next episode contains a `callbacks` block keyed by the previous choice, so every branch is referenced later
- Canvas-generated share card (1080×1350 PNG)
- Phrase book: save / replay / delete the lines you actually said
- Built-in TTS for every NPC line (Web Speech API, no key)
- Installable PWA with offline cache
- 37 automated tests, zero dependencies

**Not in scope yet:** accounts & cloud sync, LLM free chat, speech scoring, friends/leaderboards, payments. The MVP deliberately proves the core loop with no backend and no API keys.

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
node tests/run.js        # 37/37 passing, Node >= 12, no dependencies
```

Or open `tests/test.html` in a browser — same suite, zero install.

Coverage: scoring (5 grades, normalization, multi-answer best pick), XP anti-farming, unlock chain, scene state machine, storage migration, streak, phrase book, **content integrity** (every reference answer must be assemblable from its chunk bank; no Chinese in English lines; tips ≤ 2 sentences; every episode declares a valid season and carries callbacks for both branches of the previous episode), and an end-to-end simulation playing all 135 turns and finishing all 15 episodes.

## Stack

Plain HTML/CSS/JS. `src/engine.js` is a UMD pure-function core (scoring, progress, persistence) so it runs in both the browser and Node tests. Content lives in per-season files merged by `src/catalog.js` — still zero build, but the first screen does not need to parse one huge file. `localStorage` is the only storage. No frameworks, no CDN, no third-party fonts or images.

```
index.html              entry point
src/content.js          season 1: 5 episodes / personas
src/seasons/season2.js  season 2: episodes 6–10
src/seasons/season3.js  season 3: episodes 11–15
src/catalog.js          merges seasons into window.ALTER_CONTENT
src/engine.js           scoring, progress, unlock, storage, content validator
src/app.js              UI: routing, rendering, events, canvas card, TTS
src/styles.css          all styles
tests/                  harness + 37 specs + node/browser runners
docs/product.md         product thinking (Chinese)
docs/README.zh-CN.md    full Chinese guide
```

## Add an episode

Append an object to the last season file (or add a new season file and register it in `src/catalog.js`), then run `node tests/run.js`. Each episode needs `season`, `callbacks` (keyed by both options of the previous episode) and 3 acts × 3 beats. The validator tells you exactly which chunk is missing, which id collides, or which field is empty. No UI changes needed.

## Status

Playable end to end across 3 seasons (15 episodes, 135 turns). Next: adaptive hints based on past accuracy, read-aloud comparison, share-link challenges, then accounts and cloud sync.

## Notes

- The UI is in Simplified Chinese by design — the learners are Chinese students; the **learning content is English**.
- No accounts, no analytics, no network requests. Progress lives in `localStorage` and can be erased in-app.
- Speech volume/voice depends on the OS; no cloud TTS is used.

## License

[MIT](LICENSE)
