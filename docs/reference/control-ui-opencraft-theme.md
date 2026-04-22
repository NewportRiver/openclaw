<!--
@file docs/reference/control-ui-opencraft-theme.md
@version 0.1.0
@status active
@owner Bart / Archon
@scope openclaw-ui-theme-work
@purpose document exactly how the OpenCraft Minecraft-style Control UI theme was implemented, which files own which responsibilities, and what future developers must preserve
@updated 2026-04-21
@branch feat/control-ui-opencraft-theme
@source-root D:\openclaw\forks\openclaw-ui-theme-work
@applies-to ui, dist/control-ui, live npm install deployment
-->

# Control UI OpenCraft Theme

## Why this exists
This document explains the actual engineering changes behind the OpenCraft Control UI theme.

The goal was not a one-off CSS prank. The goal was to add a first-class `minecraft` theme family to the OpenClaw Control UI so it can:
- appear in the theme picker
- persist in UI settings
- resolve correctly on boot before app hydration
- ship both dark and light variants
- restyle major UI surfaces with a Minecraft-adjacent visual language
- support branded assets like the Steve head logo, pickaxe cursor, and texture-backed surfaces
- add restrained contextual Minecraft UI sounds that match the action being taken

## Source vs live runtime split
There are two different places involved in this workflow.

### 1. Editable source fork
This is the authoring source of truth.

- `D:\openclaw\forks\openclaw-ui-theme-work`

All real theme edits should happen here.

### 2. Live installed runtime
This is what OpenClaw actually serves when the local gateway is running.

- `C:\Users\bart\AppData\Roaming\npm\node_modules\openclaw\dist\control-ui`

This folder is deployment output, not the place to do primary authoring.

## Branch and commit context
Primary working branch:
- `feat/control-ui-opencraft-theme`

Important commits so far:
- `7f34d80327 feat(control-ui): add OpenCraft minecraft theme pass`
- `27ae4fcb01 feat(control-ui): polish OpenCraft theme details`
- `600560d373 feat(control-ui): sharpen pickaxe cursor`

This document also covers the later asset-backed redesign pass that introduced supplied Minecraft textures, Steve head branding, a contextual soundboard, the real pickaxe cursor asset, and a lightweight interactive voxel-world chat backdrop.

## Theme architecture summary
The theme works because multiple layers were changed together.

1. theme names and resolution logic
2. persisted settings parsing
3. boot-time HTML allowlisting
4. UI controls that expose the theme
5. visual tokens and component-specific CSS
6. themed assets and branding
7. build and deployment into the live runtime

If one of those layers is skipped, the theme looks half-installed or silently falls back.

---

# 1. Theme registration and resolution

## File: `ui/src/ui/theme.ts`
This is the canonical theme type and resolver.

### What changed
- Added `minecraft` to `ThemeName`
- Added `minecraft` and `minecraft-light` to `ResolvedTheme`
- Added `minecraft` to `VALID_THEME_NAMES`
- Added legacy mappings for:
  - `minecraft`
  - `minecraft-light`
- Extended `resolveTheme()` so the family resolves to:
  - `minecraft` for dark mode
  - `minecraft-light` for light mode

### Why it matters
Without this file change, the rest of the app cannot treat the theme as a valid first-class option.

---

# 2. Settings persistence and recovery

## File: `ui/src/ui/storage.ts`
This file loads and saves Control UI settings from local storage.

### What changed
- No schema rewrite was required, because `theme` already persists as a string.
- The important part is that `parseThemeSelection()` now accepts `minecraft` through `theme.ts`.
- Existing settings load correctly and new selections persist under the normal settings key space.

### Why it matters
This is what makes the theme selection survive refreshes and reconnects.

---

# 3. Boot-time theme allowlisting

## File: `ui/index.html`
This is the most important non-obvious file in the whole implementation.

### What changed
The bootstrap script in `ui/index.html` must understand the new family before the app mounts.

Specifically, the inline script needs to:
- recognize `minecraft` as a valid theme family
- understand `minecraft` and `minecraft-light` from persisted state
- resolve the correct early `data-theme` and `data-theme-mode` values

### Why it matters
The Control UI applies a theme before Lit mounts the app. That means a CSS-only theme is not enough.

If `ui/index.html` is not updated:
- the theme can appear in settings
- local storage can contain `minecraft`
- but the boot layer can still reject it and fall back to `claw`

This was the main blocker we hit during deployment.

### Operational lesson
Any new theme family requires two approvals:
- app-level approval in `ui/src/ui/theme.ts`
- boot-level approval in `ui/index.html`

---

# 4. Theme picker and settings surface

## Files
- `ui/src/ui/views/config.ts`
- `ui/src/ui/views/config-quick.ts`

### What changed
Both theme picker surfaces were updated to include:
- `{ id: "minecraft", label: "Minecraft" }`

### Why it matters
This makes the theme selectable from both the full settings interface and the quick settings interface.

If this step is missed, the theme can exist in code but stay inaccessible to users.

---

# 5. Branding and themed assets

## Asset files
- `ui/public/opencraft-steve.svg`
- `ui/public/minecraft-steve-head.jpg`
- `ui/public/pickaxe-cursor.svg`
- `ui/public/mc-cobblestone.jpg`
- `ui/public/mc-dirt.jpg`
- `ui/public/mc-dirt-grass.jpg`
- `ui/public/mc-grass.jpg`
- `ui/public/sounds/*.mp3`

## Supporting view files
- `ui/src/ui/views/agents-utils.ts`
- `ui/src/ui/views/login-gate.ts`
- `ui/src/ui/components/dashboard-header.ts`
- `ui/src/ui/views/chat.ts`
- `ui/src/ui/app-render.ts`
- `ui/src/ui/app.ts`
- `ui/src/ui/soundboard.ts`

### What changed
The theme is not only a palette. It also changes the visual identity:
- supplied Steve head art now drives the upper-left brand icon and login logo
- OpenClaw branding rendered as `OpenCraft` in themed presentation points
- custom pickaxe cursor remains the interaction pointer
- real dirt, grass, and cobblestone textures now back key Minecraft surfaces
- contextual Minecraft sound effects now reinforce send, toggle, theme, success, and danger interactions

### Why it matters
This is what pushes the implementation from generic green theme into an actual concept-driven theme mode.

---

# 6. Visual token layer

## File: `ui/src/styles/base.css`
This file defines the theme token foundation.

### What changed
Added theme token blocks for:
- `:root[data-theme="minecraft"]`
- `:root[data-theme="minecraft-light"]`

These theme blocks define the major variables for:
- accent colors
- foreground and muted text
- background and panel surfaces
- borders and shadows
- focus rings
- success, warning, danger, and info colors

### Additional behavior
`base.css` also applies the pickaxe cursor to interactive surfaces for the Minecraft theme family.

### Why it matters
All downstream component styling depends on these variables. This is the theme's design system layer.

---

# 7. Component styling surfaces

## Main CSS files changed
- `ui/src/styles/layout.css`
- `ui/src/styles/components.css`
- `ui/src/styles/config.css`
- `ui/src/styles/config-quick.css`
- `ui/src/styles/chat/layout.css`
- `ui/src/styles/chat/grouped.css`

## What each one owns

### `layout.css`
Used for shell-level structure such as:
- sidebar branding
- shell chrome
- header and nav treatment
- Steve logo presentation
- texture-backed topbar and shell framing

This is where the broader application frame gets the blocky OpenCraft look.

### `components.css`
Used for shared surfaces such as:
- login gate visuals
- reusable cards and common components
- login background and texture-backed Steve entrance card

This gives global controls and entry surfaces the same style language.

### `config.css`
Used for advanced settings layout and controls.

### `config-quick.css`
Used for the quick settings cards and theme controls.

### `chat/layout.css`
Used for:
- chat composer
- send button cluster
- welcome state
- control bars
- chat input shell
- textured thread and composer framing

### `chat/grouped.css`
Used for:
- message bubbles
- bubble actions
- avatars
- divider labels
- assistant vs user bubble treatment
- dirt and grass texture treatments for chat bubbles

### Why these file splits matter
The Control UI is not themed from one monolithic stylesheet. It is segmented by surface area. Future edits should preserve that separation.

---

# 8. Exact changed file map

## Theme system
- `ui/index.html`
- `ui/src/ui/theme.ts`
- `ui/src/ui/storage.ts`

## Theme selection UI
- `ui/src/ui/views/config.ts`
- `ui/src/ui/views/config-quick.ts`

## Branding and themed render behavior
- `ui/src/ui/app-render.ts`
- `ui/src/ui/app.ts`
- `ui/src/ui/components/dashboard-header.ts`
- `ui/src/ui/views/agents-utils.ts`
- `ui/src/ui/views/chat.ts`
- `ui/src/ui/views/login-gate.ts`
- `ui/src/ui/soundboard.ts`

## Assets
- `ui/public/opencraft-steve.svg`
- `ui/public/minecraft-steve-head.jpg`
- `ui/public/pickaxe-cursor.svg`
- `ui/public/mc-cobblestone.jpg`
- `ui/public/mc-dirt.jpg`
- `ui/public/mc-dirt-grass.jpg`
- `ui/public/mc-grass.jpg`
- `ui/public/sounds/*.mp3`

## Styling
- `ui/src/styles/base.css`
- `ui/src/styles/layout.css`
- `ui/src/styles/components.css`
- `ui/src/styles/config.css`
- `ui/src/styles/config-quick.css`
- `ui/src/styles/chat/layout.css`
- `ui/src/styles/chat/grouped.css`

## Change ledger
- `CHANGELOG.md`

---

# 9. Design decisions we made on purpose

## First-class family, not patch CSS
We implemented `minecraft` as a proper theme family instead of only overriding built CSS.

Reason:
- better maintainability
- rebuild-safe
- easier future extension
- survives clean source builds

## Dark and light variants
We added both `minecraft` and `minecraft-light`.

Reason:
- matches the existing theme architecture
- respects system mode and explicit light mode
- avoids special-case hacks later

## Concept over literal game clone
The styling is Minecraft-inspired, not a pixel-perfect game HUD clone.

Chosen language:
- grass, wood, dirt, stone-like surface cues
- boxier geometry
- earthy palette
- playful themed assets

## Split by surfaces instead of single mega override
We kept changes in the existing CSS surface files.

Reason:
- easier diff review
- easier maintenance
- more obvious ownership of each visual treatment

## Additional themed runtime layer: interactive voxel backdrop

Later OpenCraft work added a lightweight animated block-world backdrop behind the chat UI.

### Files
- `ui/src/ui/components/minecraft-world-backdrop.ts`
- `ui/src/ui/views/chat.ts`
- `ui/src/ui/app-render.ts`
- `ui/src/styles/chat/sidebar.css`
- `ui/src/styles/chat/layout.css`

### What changed
- Added a dedicated custom element that renders a faux-3D Minecraft-style world to a canvas.
- Kept the effect theme-gated so it only appears for `minecraft` and `minecraft-light`.
- Mounted the backdrop behind the chat shell, not as a global page replacement.
- Made camera motion respond to mouse position so the world feels alive without turning the Control UI into a full game.
- Kept the chat thread and composer readable by layering semi-transparent foreground chrome over the backdrop.
- Later extended the same backdrop component with an opt-in embedded `https://classic.minecraft.net/` play layer, so the chat background can temporarily become a playable Minecraft Classic scene.

### Why it was done this way
The user wanted the feeling of a real Minecraft world behind the chat interface, but a full embedded game would have been too heavy, noisy, and fragile for a daily-driver dashboard.

This compromise keeps the fun part:
- depth
- motion
- Minecraft world energy

while preserving:
- readability
- performance
- maintainability
- rebuild-safe deployment

For the Classic prototype, the same principle still applies: gameplay is opt-in rather than always-on.

That means:
- the chat backdrop stays ambient by default
- the user explicitly taps into the world to play
- the user can return to chat without the game permanently stealing keyboard intent

---

# 10. What future developers must not forget

## Rule 1
Do not only edit built CSS in `dist/control-ui/assets/*.css` and assume the job is done.

That can be useful for emergency local testing, but it is not the durable implementation path.

## Rule 2
If you add or rename a theme family, update both:
- `ui/src/ui/theme.ts`
- `ui/index.html`

## Rule 3
If the theme should be user-selectable, update both:
- `ui/src/ui/views/config.ts`
- `ui/src/ui/views/config-quick.ts`

## Rule 4
For new visual concepts, start from tokens in `ui/src/styles/base.css`, then style components after the token layer is stable.

## Rule 5
Treat the globally installed runtime as deployment output only.

Primary edits belong in:
- `D:\openclaw\forks\openclaw-ui-theme-work`

---

# 11. Known deployment gotchas

## Gotcha: theme picker works, live UI still falls back
Check:
- `ui/index.html`
- built `dist/control-ui/index.html`
- live installed `dist/control-ui/index.html`

## Gotcha: source build looks right, live gateway does not
Likely causes:
- built assets were not copied into the installed runtime
- browser cached old assets
- the live install still points at older hashed JS or CSS files

## Gotcha: cursor or asset updates do not appear
Usually fixed by:
- rebuild
- redeploy into live runtime
- hard refresh in browser

---

# 12. Recommended future extension points

If the OpenCraft theme keeps evolving, these are the next logical places to deepen it:
- inventory-like settings cards
- more block-true button geometry
- stronger theme treatment for tabs and side panels
- themed iconography for system sections
- optional texture overlays that stay subtle enough for readability

---

# 13. Short maintainer summary

The OpenCraft theme succeeded because it was implemented across the full theme pipeline, not just the CSS layer.

The critical path is:
1. register theme family
2. allow it in boot HTML
3. expose it in settings
4. define tokens
5. style surfaces
6. build
7. deploy into the live runtime

That sequence is the real recipe. Preserve it.
