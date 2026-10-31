#!/usr/bin/env python3
"""Generate SEO landing pages in play/<slug>.html, play/index.html, and refresh sitemap.xml.
Run from repo root: python3 tools/build_landing_pages.py"""
import json, html, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from landing_content import G
BASE = "https://a2.games"
data = {g["id"]: g for g in json.load(open("data/games-data.json"))["games"]}
by_id = {g["id"]: g for g in G}
e = html.escape
os.makedirs("play", exist_ok=True)

CSS = """*{box-sizing:border-box}body{margin:0;font-family:'Poppins',system-ui,sans-serif;background:#0b1029;color:#eef0ff;line-height:1.6}
a{color:#8fb4ff}.wrap{max-width:900px;margin:0 auto;padding:20px}header.top{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#050713}
header.top a{color:#fff;text-decoration:none;font-weight:700}nav.crumbs{font-size:.85rem;opacity:.8;margin:8px 0}
h1{font-size:2rem;margin:.3em 0}h2{margin-top:1.6em;font-size:1.35rem}.lede{font-size:1.1rem}
.player{position:relative;width:100%;aspect-ratio:4/3;max-height:80vh;background:#000;border-radius:14px;overflow:hidden;margin:16px 0}
.player iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.cta{display:inline-block;background:#6c5ce7;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700;margin:6px 8px 6px 0}
.cta.alt{background:transparent;border:1px solid #6c5ce7}details{background:#141a3a;border-radius:10px;padding:12px 16px;margin:8px 0}summary{font-weight:600;cursor:pointer}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}.card{background:#141a3a;border-radius:12px;padding:10px;text-decoration:none;color:#eef0ff}
.card img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;background:#222}.tags span{display:inline-block;background:#1f2752;border-radius:6px;padding:2px 8px;margin:2px;font-size:.8rem}
footer{opacity:.7;font-size:.85rem;text-align:center;padding:30px 10px}"""

def img(g):
    return BASE + "/" + data[g["id"]]["image"].lstrip("./")

def head(title, desc, url, image, extra=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="a2.games">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(desc)}">
<meta name="twitter:image" content="{image}">
<link rel="icon" type="image/x-icon" href="/images/logo.png">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style>
{extra}
</head>
<body>
<header class="top"><a href="/">a2.games</a><a href="/play/">All games</a></header>
"""

FOOT = '<footer>a2.games, free open-source browser games. <a href="/">Home</a> · <a href="/play/">All games</a> · <a href="https://github.com/raghuchinnannan/a2.games">GitHub</a></footer>\n</body>\n</html>\n'

def page(g):
    d = data[g["id"]]; url = f"{BASE}/play/{g['slug']}"; game_url = f"/games/{g['file']}"
    title = f"{g['name']}: Play Free Online, No Download | a2.games"
    if len(title) > 65: title = f"{g['name']}: Play Free Online | a2.games"
    desc = f"Play {g['name']} free in your browser. {d['description'].rstrip('.!')}. No download or sign-up, works on desktop, mobile and Chromebook."
    if len(desc) > 165: desc = f"Play {g['name']} free online: {g['genre'].lower()} that runs in your browser on desktop, mobile and Chromebook. No download."
    links = g.get("links", {})
    same_as = [v for v in links.values()]
    vg = {"@context":"https://schema.org","@type":"VideoGame","name":g["name"],"url":url,"description":g["intro"],
          "image":img(g),"genre":g["genre"],"gamePlatform":["Web browser","Desktop","Mobile"],"applicationCategory":"Game",
          "operatingSystem":"Any","playMode":"SinglePlayer" if g["id"]!="pong-game" else "MultiPlayer",
          "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},
          "publisher":{"@type":"Organization","name":"a2.games","url":BASE+"/"},"keywords":", ".join([g["kw"]]+g["kw2"])}
    if same_as: vg["sameAs"] = same_as
    fq = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in g["faq"]]}
    bc = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"a2.games","item":BASE+"/"},
        {"@type":"ListItem","position":2,"name":"Games","item":BASE+"/play/"},
        {"@type":"ListItem","position":3,"name":g["name"],"item":url}]}
    ld = "\n".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in (vg, fq, bc))
    li = lambda xs: "<ul>" + "".join(f"<li>{e(x)}</li>" for x in xs) + "</ul>"
    rel = "".join(f'<a class="card" href="/play/{by_id[r]["slug"]}"><img src="{img(by_id[r])}" alt="{e(by_id[r]["name"])}" loading="lazy" width="180" height="135"><strong>{e(by_id[r]["name"])}</strong><br><small>{e(by_id[r]["genre"])}</small></a>' for r in g["related"])
    ext = "".join(f'<a class="cta alt" href="{e(v)}" rel="noopener" target="_blank">{e(k)}</a>' for k,v in links.items())
    faq = "".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q,a in g["faq"])
    tags = "".join(f"<span>{e(t)}</span>" for t in d["tags"])
    body = f"""<main class="wrap">
<nav class="crumbs"><a href="/">Home</a> › <a href="/play/">Games</a> › {e(g['name'])}</nav>
<h1>Play {e(g['name'])} Online Free</h1>
<p class="lede">{e(g['intro'])}</p>
<div class="tags">{tags}<span>{e(g['genre'])}</span></div>
<div class="player" id="player"><iframe src="{game_url}" title="{e(g['name'])} game" loading="lazy" allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe></div>
<a class="cta" href="{game_url}">Play {e(g['name'])} full screen</a>{ext}
<h2>How to play {e(g['name'])}</h2>
{li(g['how'])}
<h2>Controls</h2>
{li(g['controls'])}
<h2>Features</h2>
{li(g['features'] + ['Free to play, no download, no account', 'Runs in any modern browser, including school Chromebooks'])}
<h2>{e(g['name'])} FAQ</h2>
{faq}
<h2>More games like {e(g['name'])}</h2>
<div class="cards">{rel}</div>
</main>
"""
    return head(title, desc, url, img(g), ld) + body + FOOT

for g in G:
    assert g["id"] in data, g["id"]
    assert os.path.exists(f"games/{g['file']}.html"), g["file"]
    open(f"play/{g['slug']}.html", "w").write(page(g))

# index
cards = "".join(f'<a class="card" href="/play/{g["slug"]}"><img src="{img(g)}" alt="{e(g["name"])}" loading="lazy" width="180" height="135"><strong>{e(g["name"])}</strong><br><small>{e(g["genre"])}</small></a>' for g in G)
il = {"@context":"https://schema.org","@type":"ItemList","itemListElement":[{"@type":"ListItem","position":i+1,"url":f"{BASE}/play/{g['slug']}","name":g["name"]} for i,g in enumerate(G)]}
idx = head("All Free Browser Games: Puzzle, Arcade & Classic | a2.games",
           f"Browse all {len(G)} free browser games on a2.games: puzzle, arcade, endless runner, space and classic games. No download, works on mobile and Chromebook.",
           BASE+"/play/", BASE+"/images/logo.png", f'<script type="application/ld+json">{json.dumps(il)}</script>')
idx += f'<main class="wrap"><h1>Free Browser Games</h1><p class="lede">Every game on a2.games, free to play in your browser with no download or sign-up. Pick one to read how it works, or jump straight in.</p><div class="cards">{cards}</div></main>\n' + FOOT
open("play/index.html", "w").write(idx)

# sitemap: keep existing, add play urls
sm = open("sitemap.xml").read()
locs = re.findall(r"<loc>(.*?)</loc>", sm)
locs = [l for l in locs if "/play/" not in l] + [BASE+"/play/"] + [f"{BASE}/play/{g['slug']}" for g in G]
open("sitemap.xml","w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{l}</loc></url>\n" for l in locs) + "</urlset>\n")

# homepage static crawlable links block
blk = "<!-- LANDING-LINKS:START (generated by tools/build_landing_pages.py) -->\n<section class=\"game-guides\" style=\"max-width:1100px;margin:40px auto;padding:0 20px\"><h2>Game guides</h2><p>" + " · ".join(f'<a href="/play/{g["slug"]}">{e(g["name"])}</a>' for g in G) + ' · <a href="/play/">All games</a></p></section>\n<!-- LANDING-LINKS:END -->'
ih = open("index.html").read()
if "LANDING-LINKS:START" in ih:
    ih = re.sub(r"<!-- LANDING-LINKS:START.*?LANDING-LINKS:END -->", blk, ih, flags=re.S)
else:
    ih = ih.replace('    <footer class="footer">', blk + '\n    <footer class="footer">', 1)
open("index.html","w").write(ih)
print("built", len(G), "pages")
