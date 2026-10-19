# しばサバイバー

- Single file: `index.html` (HTML + CSS + JS). No build step, no runtime dependencies.
- Pixel art is generated in code by `makeSprite` (auto outline). Do not add image or audio files, ripped art, or paid assets.
- World draws to a small offscreen canvas at an integer scale (≥2, internal width near 195); HUD text draws on the full-resolution canvas.
- Tuning lives in `WEAP`, `PAS`, `KIND`, `spawner()` and `xpNeed()`. Weapon stat arrays have 6 entries: Lv1–5 plus the evolved form (index 5).
- Run is 5 minutes (`BOSS_T`); the boss St. Bernard spawns then. Beating it wins.
- Verify at 390×844 before merging. One theme per PR. Never force-push.
