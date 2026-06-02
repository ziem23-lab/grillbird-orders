# Grillbird Order Pads — Operating Manual
This is the manual for the vendor order-pad system: a set of phone-first web pages that let a manager build a vendor order by tapping quantities, then open their mail app with the order pre-written and addressed. This file is the source of truth for how the system is built and how to extend it.
Keep this file in the repo. When you want to add or edit a pad in a future chat, this is what you bring back.
---
## How to start a future session
There are two kinds of work, and they start differently.
**Adding or editing a pad (planning chat, claude.ai):**
Upload two files to the new chat —
1. This file (`HANDOFF.md`).
2. The current `sk-produce.html` from the repo. That file IS the live template. Do not trust any HTML copied into this manual; clone the real file so you inherit the latest design and fixes.
Then give Claude the new vendor's order guide (a CSV, or a photo of a handwritten sheet) and say what's changing. Claude produces the finished pad file plus a ready-to-paste Claude Code prompt to deploy it.
**Deploying (Claude Code, on the Mac Studio):**
Open `cd ~/AIops && claude`, then paste the deploy prompt. Claude Code copies the file into the repo, edits the launcher, commits, and pushes. GitHub Pages redeploys on its own within a minute.
---
## The system at a glance
| | |
|---|---|
| Repo (local) | `~/Projects/grillbird-orders` |
| GitHub | `ziem23-lab/grillbird-orders` (public) |
| Live launcher | https://ziem23-lab.github.io/grillbird-orders/ |
| Hosting | GitHub Pages, `main` branch, root (`/`) |
| Deploy | `git push` — Pages rebuilds automatically |
The marketing site (grillbird.com) is on Squarespace and is unrelated. This system is entirely on GitHub Pages and touches nothing on Squarespace.
---
## Architecture
Two kinds of files, one repo:
- **`index.html`** — the launcher. Lists every vendor as a tappable card. Managers add THIS page to their home screen; one icon covers every vendor. The list is a `VENDORS` array near the bottom of the file.
- **`<vendor>.html`** — one self-contained pad per vendor. Each file is fully standalone (all HTML, CSS, and JS inline), so a pad can be edited without touching any other file.
Adding a vendor is: drop in one new pad file, add one line to the `VENDORS` array, commit, push.
---
## Anatomy of a vendor pad
When cloning `sk-produce.html` to make a new pad, these are the only places that change. Everything else stays identical.
**1. Page identity (top of file)**
```html
<meta name="apple-mobile-web-app-title" content="SK Produce WS">
<title>SK Produce Order — Grillbird West Seattle</title>
```
**2. Masthead (in `<header>`)**
```html
<p class="kicker">Grillbird · West Seattle</p>      <!-- location -->
<h1>SK Produce Order</h1>                            <!-- vendor + "Order" -->
<a href="mailto:orders@asiadiscountcenter.com">orders@asiadiscountcenter.com</a><br>
206-300-6422
<div class="cutoff">Order by <strong>7:00 AM</strong> for same-day delivery.</div>
```
**3. Vendor email (in `<script>`)**
```js
const VENDOR_EMAIL = "orders@asiadiscountcenter.com";
```
**4. The item list** — the heart of it. Each item is one object:
```js
{cat:"Vegetables", name:"Mini Cucumbers", unit:"20 lb", note:""},
```
- `cat` — category; must match a value in `CAT_ORDER` below.
- `name` — what the manager sees, bold.
- `unit` — the pack/size, shown small under the name and after the em dash in the email.
- `note` — optional. Shows as a small italic chip on the row and rides along in parentheses in the email. Use for prep notes ("Cleaned, trimmed") or flags ("confirm size").
**5. Category order**
```js
const CAT_ORDER = ["Vegetables","Herbs","Pantry","Dairy","Protein","Juice"];
```
Categories render in this order; only categories that have items appear. Drop or add categories to fit the vendor.
**6. Email header lines (in `buildOrder()`)**
```js
lines.push('Grillbird — West Seattle');                  // location
lines.push('SK Produce order' + (pretty ? ' — ' + pretty : ''));
...
const subject = 'Grillbird West Seattle — Produce Order' + (pretty ? ' — ' + pretty : '');
```
---
## What a sent order looks like
The email body is plain text, grouped by category, only items with a quantity:
```
Grillbird — West Seattle
SK Produce order — Mon, Jun 1, 2026
Ordered by: Alex
VEGETABLES
  2 × Green Cabbage — Case, 45 lb
  1 × Mini Cucumbers — 20 lb
SPECIAL ITEMS / NOTES
  Need extra ginger if you have it
Thank you!
```
The "Special items & notes" box lets a manager add anything off-list. A notes-only order (zero quantities) still sends.
---
## Conventions
**Design tokens** (already in every file; keep them consistent):
- Palette: cream `#F6EFE2`, card `#FCF7ED`, pepper `#2A2520`, muted `#7A7064`, olive `#5F6E36`, olive tint `#EAEFD7`, terracotta `#BD4F2B`, dark terracotta `#9E4022`, line `#E6DCC8`.
- Fonts: Bebas Neue (headers), Karla (body). Loaded from Google Fonts.
**File naming:** lowercase, hyphenated, descriptive. Pattern: `<vendor>-<location-or-qualifier>.html`. Examples: `sk-produce.html` (Phinney, the original), `sk-produce-ws.html` (West Seattle). A new vendor might be `charlies-meats.html` or `food-services-ws.html`.
**Reading a handwritten or messy guide:**
- `#` in front of a number means pounds (e.g. `45#` = 45 lb).
- If a unit is ambiguous, don't guess — set a short `note:"confirm size"` flag and call it out so it can be confirmed before it goes live.
- Crossed-out lines are dropped.
- Honor explicit "leave this out" instructions exactly.
---
## Procedure: add a new vendor
**In the planning chat,** Claude generates `<vendor>.html` from the guide. Then deploy with this prompt in `cd ~/AIops && claude`. Fill in the two bracketed spots.
```
Add a new vendor pad to my grillbird-orders GitHub Pages site.
The repo is at ~/Projects/grillbird-orders. A new file, <NEW-FILE>.html, was just
downloaded — look in ~/Downloads.
Steps:
1. Copy ~/Downloads/<NEW-FILE>.html into the repo as <NEW-FILE>.html.
2. In index.html, find the VENDORS array and add this line at the end of it (before the closing ]):
     <PASTE THE EXACT VENDORS LINE CLAUDE GAVE YOU>
3. git add -A && git commit -m "Add <VENDOR NAME> pad" && git push
4. Wait for Pages to redeploy, then verify the launcher still loads and
   https://ziem23-lab.github.io/grillbird-orders/<NEW-FILE>.html returns 200.
5. Report back when it's live.
Make all file changes yourself, keep it to one terminal window, and use straight quotes only.
```
The `VENDORS` line format:
```js
{ name:"Vendor Name", tag:"Category · Location", note:"Order by 7 AM", file:"<NEW-FILE>.html" },
```
---
## Procedure: edit an existing pad
Item lists change — vendors add things, drop things, change pack sizes. To edit:
**Small edit you want to do yourself:** open the pad file in the repo, find the `ITEMS` array, change the line, save. Then in `cd ~/AIops && claude`:
```
In ~/Projects/grillbird-orders, I edited <FILE>.html. Commit and push it:
git add -A && git commit -m "Update <FILE> items" && git push
Then confirm the live page reflects the change. One terminal window, straight quotes only.
```
**Bigger change (new guide, several items):** bring this manual + the pad file into a planning chat, hand over the new guide, and let Claude regenerate the `ITEMS` array. Then deploy the same way.
---
## Current vendors
| Vendor | Location | File | Email | Cutoff |
|---|---|---|---|---|
| SK Produce (Asia Discount Center) | Phinney | `sk-produce.html` | orders@asiadiscountcenter.com | 7:00 AM same-day |
| SK Produce (Asia Discount Center) | West Seattle | `sk-produce-ws.html` | orders@asiadiscountcenter.com | 7:00 AM same-day |
Keep this table current as pads are added.
---
## Gotchas worth remembering
- **`gh` location.** The GitHub CLI is installed at `~/.local/bin/gh` (no Homebrew on the machine). If a fresh terminal can't find `gh`, add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc`.
- **Public repo.** Free GitHub Pages serves from a public repo, so the source files are viewable by anyone who finds them. Fine for order lists. If anything sensitive ever needs hosting, that's a different setup (GitHub Pro for private Pages, or another host).
- **Straight quotes only** in any pasted terminal command. Smart quotes break zsh.
- **Safari caches hard.** If a page looks stale or 404s right after a deploy, close the tab fully and reopen, or use a private tab. Give Pages a minute to rebuild after a push.
- **Home screen:** add the **launcher**, not an individual pad. The launcher covers all vendors and updates as you add more.
- **The "From" address** on a sent order is whatever the manager's phone mail app is set to. The order body names the location and the person, so it reads clearly regardless — but if you want consistent sender addresses, check each manager's mail account once.
---
*Last updated: June 2026. Two pads live (SK Produce, Phinney + West Seattle).*
