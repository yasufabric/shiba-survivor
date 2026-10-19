// Fails if the inline game script in index.html does not parse,
// or if a level-up card or result row would reference a missing table entry.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('no inline <script> found'); process.exit(1); }
try { new vm.Script(m[1], { filename: 'index.html#script' }); }
catch (e) { console.error('script does not parse:', e.message); process.exit(1); }

const weap = [...m[1].matchAll(/^\s{2}(\w+):\{name:'([^']+)'/gm)].map(x => x[1]);
const evoPas = [...m[1].matchAll(/evo:\{pas:'(\w+)'/g)].map(x => x[1]);
const pasBlock = m[1].slice(m[1].indexOf('const PAS={'), m[1].indexOf('};', m[1].indexOf('const PAS={')));
const pas = [...pasBlock.matchAll(/^\s{2}(\w+):\{name:/gm)].map(x => x[1]);
const missing = evoPas.filter(p => !pas.includes(p));
if (missing.length) { console.error('evolutions point at unknown passives:', missing.join(', ')); process.exit(1); }
console.log(`ok: script parses; ${evoPas.length} evolutions, ${pas.length} passives, ${weap.length} named entries`);
