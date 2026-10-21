// Plays a sped-up run of the game in headless Chromium and fails on any page error.
// CI: npm i --no-save playwright@1.47.2 && npx playwright install --with-deps chromium && node tools/smoke.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const end = src.lastIndexOf('\n})();');
if (end < 0) { console.error('could not find the end of the game script'); process.exit(1); }
const hook = 'window.__smoke={get G(){return G;},update,get state(){return state;}};';
const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + src.slice(0, end) + hook + src.slice(end) + '</body></html>';

const browser = await chromium.launch();
const errors = [];
let failed = false;
for (const [label, setup] of [
  ['meadow', ''],
  ['snow+hard', "G.map='snow';G.hard=true;"],
  ['endless', 'G.T=299;'],
]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push(`${label}: ${e.message}`));
  await page.setContent(html);
  await page.click('#startBtn');
  const r = await page.evaluate((setup) => {
    const t = window.__smoke; const G = t.G; new Function('G', setup)(G);
    let steps = 0;
    for (; steps < 9000; steps++) {
      if (t.state === 'level') { const c = document.querySelector('.card'); G.pendingLv = Math.max(0, G.pendingLv); c && c.dispatchEvent(new Event('click')); if (t.state === 'level') { document.getElementById('level').hidden = true; } }
      if (t.state === 'over') { const more = document.getElementById('moreBtn'); if (!more.hidden) { more.click(); continue; } break; }
      G.p.hp = Math.max(G.p.hp, 60);
      const a = G.T * .7; G.p.x += Math.cos(a) * 1.8; G.p.y += Math.sin(a) * 1.8;
      t.update(1 / 30);
    }
    return { T: Math.round(G.T), lv: G.lv, kills: G.kills, enemies: G.en.length, state: t.state, steps };
  }, setup);
  console.log(label, JSON.stringify(r));
  if (r.kills < 50) { console.error(`::error::${label}: too few kills (${r.kills}), weapons may be broken`); failed = true; }
  await page.close();
}
await browser.close();
if (errors.length) { for (const e of errors) console.error('::error::' + e.replace(/\n/g, ' ')); process.exit(1); }
if (failed) process.exit(1);
console.log('ok: smoke runs finished without page errors');
