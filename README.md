# PORTAL — QR experience (prototype)

Interactive companion site for **PORTAL**, a public sculpture by Kerry Lemon. People reach it by scanning the QR code on the sculpture.

This is a **review prototype**. It uses visual Direction A ("Gallery Label") from the Figma board. The design will change later, and the photos and some pages are placeholders.

## How it works

- A plain static site with no build step, hosted on GitHub Pages.
- **All content lives in [`content/portal.json`](content/portal.json).** The page engine ([`assets/app.js`](assets/app.js)) renders it. To change text or add a pathway or page, edit the JSON only.
- Routes use the URL hash: `#/` (landing), `#/index`, `#/p/<pathway>/<page>`, `#/credits`.
- Pathways can be visited in any order. Seen pages and pathways get a tick. This is stored only in the visitor's browser (localStorage); there are no accounts and no tracking.
- Layout is responsive. On desktop (≥960px) the pathway index stays visible on the left.
- Handwriting (Kerry's name and accent words) uses the Tori font, supplied as SVG outlines in `assets/tori/`. The font file itself is not included.

### Content blocks (in `portal.json`)

| type | fields | use |
|---|---|---|
| `text` | `text` | paragraph |
| `link` | `label`, `url` | external link (opens in a new tab) |
| `image` | `placeholder` | image slot (placeholder until photos arrive) |
| `placeholder` | `text` | whole section still to come |
| `note` | `text` | small side note |
| `table` | `columns`, `rows` | e.g. the "You said, I changed" log (stacks into cards on phones) |

## Run locally

```bash
python3 -m http.server 8743
```

Then open http://localhost:8743.

## Status

See [CHANGELOG.md](CHANGELOG.md). Every content or design change is logged there.
