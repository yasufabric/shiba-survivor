# Renders icon-192.png and icon-512.png from the in-game shiba sprite.
# Needs: pip install playwright && playwright install chromium
# Run: python3 tools/make-icons.py
import asyncio, pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
from playwright.async_api import async_playwright
async def main():
  src=open(ROOT/'index.html').read();k=src.rindex('\n})();');html=src[:k]+"window.__icon=(n)=>{const c=document.createElement('canvas');c.width=c.height=n;const q=c.getContext('2d');q.imageSmoothingEnabled=false;q.fillStyle='#78bf63';q.fillRect(0,0,n,n);q.fillStyle='#ffd23f';q.beginPath();q.arc(n/2,n/2,n*.42,0,7);q.fill();const s=SHIBA[0];const sc=Math.floor(n*.62/s.w);q.drawImage(s.r,Math.round((n-s.w*sc)/2),Math.round((n-s.h*sc)/2+n*.03),s.w*sc,s.h*sc);return c.toDataURL('image/png');};"+src[k:]
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page()
    await pg.set_content('<!doctype html><html><body>'+html+'</body></html>')
    import base64
    for n in (192,512):
      u=await pg.evaluate(f"window.__icon({n})");open(ROOT/f'icon-{n}.png','wb').write(base64.b64decode(u.split(',')[1]))
    await b.close()
asyncio.run(main())
