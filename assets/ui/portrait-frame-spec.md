# Candlelight Production Portrait Frame Contract

The character sheet renderer is now designed around artwork layers instead of CSS-drawn ornament.

## Coordinate system

All portrait-frame artwork uses a `320 x 470` canvas/viewBox.

- Portrait opening: `x=73`, `y=88`, `width=174`, `height=258`
- Spirit crest center: `x=160`, `y=374`
- Spirit crest visible diameter: approximately `92`
- Nameplate center: `x=160`, `y=444`
- Nameplate usable width: approximately `176`

## Required production layers

### `portrait-frame-base.svg` (or later WebP equivalent)
Permanent neutral artwork:
- blackened/dark metal body
- polished/aged silver metal ornament
- bevels, engraved shading and cast shadows
- portrait-window structural frame
- Spirit crest metal housing
- nameplate metal housing

This layer must **not** contain a baked Spirit animal or Spirit name.

### `portrait-frame-accent.svg`
Palette-swappable artwork only:
- enamel panels
- gems/crystals
- small magical highlight channels
- optional subtle colored reflections

This layer should inherit `currentColor` / Candlelight frame variables so Purple, Gold, Red, Blue, Green, and Teal can be applied without recoloring the silver body.

### `portrait-frame-foreground.svg` (optional)
Any ornament that must overlap the portrait or Spirit icon in front:
- inner lip/highlight around portrait opening
- front-facing gem prongs
- Spirit-socket foreground rim

## Runtime layers

Bottom to top:
1. character portrait
2. base frame artwork
3. accent artwork
4. Spirit icon canvas at fixed crest coordinates
5. optional foreground artwork
6. dynamic Spirit name text

## Spirit positioning

Each Spirit has an explicit `x`, `y`, and `scale` calibration in `scripts/spirit-customization.mjs`. Automatic visual-centroid positioning is intentionally not used for final production alignment.

The approved visual target is the ornate silver + colored-enamel Candlelight mockup, with a large arched portrait opening, rich filigree, gem-like crest socket, and integrated lower nameplate.
