<!--
@file FEATURES.md
@version 0.1.0
@status active
@owner Bart / Archon
@scope openclaw-ui-theme-work
@purpose future-feature backlog and scope-control ledger for local OpenCraft theme and Control UI ideas
@updated 2026-04-21
-->

# FEATURES

## Intent
This file is the holding pen for future ideas so active work stays disciplined.

These are not promises, shipped features, or changelog entries.
They are candidate directions for future implementation.

## Theme Backlog

### FEAT-0001 - Rust design theme
- Status: `idea`
- Goal:
  - add a Rust-inspired Control UI theme with industrial survival-game styling
- Direction:
  - oxidized metal panels
  - worn orange accents
  - steel/charcoal surfaces
  - hazard-strip or riveted depth cues
  - rugged utilitarian typography and control styling
- Notes:
  - should feel harsh, mechanical, and survival-oriented rather than clean sci-fi

### FEAT-0002 - Terraria design theme
- Status: `idea`
- Goal:
  - add a Terraria-inspired theme with pixel-adventure fantasy energy
- Direction:
  - bright but earthy palette
  - gem, grass, dirt, wood, and sky-toned UI surfaces
  - lightweight pixel-panel framing
  - whimsical but readable inventory-like cards and buttons
- Notes:
  - should lean charming and exploratory, not muddy or noisy

### FEAT-0003 - Roblox design theme
- Status: `idea`
- Goal:
  - add a Roblox-inspired theme with toy-like, blocky, playful UI language
- Direction:
  - chunky geometry
  - clean bold primary surfaces
  - polished game-platform card layout feel
  - bright accent colors with strong separation and legibility
- Notes:
  - should avoid looking generic mobile-app corporate, keep it playful and game-native

### FEAT-0004 - Mario design theme
- Status: `idea`
- Goal:
  - add a Mario-inspired Control UI theme with colorful platformer energy
- Direction:
  - bold red, blue, yellow, and green accents
  - toy-like rounded blocks and panel depth
  - mushroom kingdom style iconography cues
  - cheerful layered buttons and strong foreground/background contrast
- Notes:
  - should feel iconic, bright, and gamey without becoming visually exhausting

## Selection Notes
If multiple future themes are pursued, keep the implementation pattern consistent:
- register the theme family in `ui/src/ui/theme.ts`
- allow it in `ui/index.html` boot logic
- expose it in `config.ts` and `config-quick.ts`
- define tokens in `ui/src/styles/base.css`
- apply surface styling in the appropriate component CSS files
- document any major concept pass in `docs/reference/`
