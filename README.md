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
3. **A serialized story.** 5 episodes: first day at school → canteen → group-chat drama → club audition → the night before an exam. Every episode ends with a two-way choice that is remembered, and the next episode picks it up.
4. **A shareable artifact.** Each episode ends with a poster card ("the scene you made") you can download and send to friends.

You pick a **persona** (The Softie / The Roaster / The Wildcard). It changes the closing narration of every episode and the card styling — self-expression, not just correctness.

## What's inside (v0.1)

- 5 episodes · 15 acts · **45 real speaking turns** with distractor chunks, multiple accepted answers and usage notes
- 3 personas, XP, daily streak, "native lines" counter, total progress
- 2-way branches with distinct endings per episode
- Canvas-generated share card (1080×1350 PNG)
- Phrase book: save / replay / delete the lines you actually said
- Built-in TTS for every NPC line (Web Speech API, no key)
- Installable PWA with offline cache
- 32 automated tests, zero dependencies

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
node tests/run.js        # 32/32 passing, Node >= 12, no dependencies
```

Or open `tests/test.html` in a browser — same suite, zero install.

Coverage: scoring (5 grades, normalization, multi-answer best pick), XP anti-farming, unlock chain, scene state machine, storage migration, streak, phrase book, **content integrity** (every reference answer must be assemblable from its chunk bank), and an end-to-end simulation playing all 45 turns.

## Stack

Plain HTML/CSS/JS. `src/engine.js` is a UMD pure-function core (scoring, progress, persistence) so it runs in both the browser and Node tests. `localStorage` is the only storage. No frameworks, no CDN, no third-party fonts or images.

```
index.html            entry point
src/content.js        5 episodes / 45 turns (data only)
src/engine.js         scoring, progress, unlock, storage, content validator
src/app.js            UI: routing, rendering, events, canvas card, TTS
src/styles.css        all styles
tests/                harness + 32 specs + node/browser runners
docs/product.md       product thinking (Chinese)
docs/README.zh-CN.md  full Chinese guide
```

## Add an episode

Append an object to `SCENES` in `src/content.js` and run `node tests/run.js`. The validator tells you exactly which chunk is missing, which id collides, or which field is empty. No code changes needed.

## Status

MVP, playable end to end. Next: more episodes (first job, fandom comments, negotiating with parents), adaptive hints, read-aloud comparison, share-link challenges, then accounts and cloud sync.

## Notes

- The UI is in Simplified Chinese by design — the learners are Chinese students; the **learning content is English**.
- No accounts, no analytics, no network requests. Progress lives in `localStorage` and can be erased in-app.
- Speech volume/voice depends on the OS; no cloud TTS is used.

## License

[MIT](LICENSE)
