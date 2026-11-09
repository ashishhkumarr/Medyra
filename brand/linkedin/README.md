# Medyra — LinkedIn brand assets

Sage shield-heart brand (matches the app's 2026 redesign and favicon).

| File | Size | Where it goes |
|---|---|---|
| `medyra-linkedin-logo.png` | 600×600 (1:1) | LinkedIn → Page info → **Logo** |
| `medyra-linkedin-banner.png` | 2256×382 (LinkedIn's 1128×191 ratio) | LinkedIn → Page info → **Banner** |
| `logo.svg` / `banner.svg` | vector sources | edit, then re-render |

PNGs are rendered at 2× for retina sharpness; LinkedIn downscales them.

## Palette
- Forest `#2E3A26` · Lime `#9FBF60` · Sage-cream `#F6F8EF` · Secondary green `#4F7A63`
- Wordmark font: **Fraunces** (weight 500)

## Re-render
Requires `rsvg-convert` (`brew install librsvg`) and the Fraunces font installed locally.

```bash
rsvg-convert -w 600 -h 600 logo.svg -o medyra-linkedin-logo.png
rsvg-convert -w 2256 -h 382 banner.svg -o medyra-linkedin-banner.png
```
