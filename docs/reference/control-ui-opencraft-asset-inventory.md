<!--
@file docs/reference/control-ui-opencraft-asset-inventory.md
@version 0.1.0
@status active
@owner Bart / Archon
@scope openclaw-ui-theme-work
@purpose inventory the user-supplied Minecraft/OpenCraft asset pack, record what each file is for, and document how the Control UI redesign uses or may use them
@updated 2026-04-21
@branch feat/control-ui-opencraft-theme
@source-root D:\openclaw\forks\openclaw-ui-theme-work
@applies-to D:\openclaw\source\assets, ui/public, ui/src/ui, ui/src/styles
-->

# Control UI OpenCraft Asset Inventory

## Purpose
This is the working inventory for the user-supplied asset pack placed in:

- `D:\openclaw\source\assets`

The goal is not only to list files, but to record their likely role in the OpenCraft Control UI.

## Source asset list

### Branding and character art
- `avatar-placeholder.svg`
  - Type: SVG
  - Likely role: generic placeholder avatar or fallback profile tile
  - Current use: not wired yet

- `Minecraft-Steve-Head.jpg`
  - Type: JPG
  - Likely role: primary OpenCraft brand icon
  - Current use: wired into the sidebar logo and login gate logo via `agentLogoUrl()`, and used as the assistant-side identity head in the themed chat composer

- `pickaxe.png`
  - Type: PNG
  - Likely role: cursor/icon source art
  - Current use: now converted into served cursor assets for the live themed pointer
  - Served derivatives:
    - `ui/public/pickaxe-cursor.png`
    - `ui/public/pickaxe-cursor-active.png`

### Texture and concept art
- `cobblestone.jpg`
  - Type: JPG
  - Likely role: shell chrome, content background, stone panel texture
  - Current use: used for topbar, content, chat thread, and login-shell background texture layers

- `dirt.jpg`
  - Type: JPG
  - Likely role: dirt panel surfaces and grounded card texture
  - Current use: used in the login card and assistant chat bubble texture layers

- `dirtandgrass.jpg`
  - Type: JPG
  - Likely role: iconic Minecraft grass-top block treatment
  - Current use: used in the sidebar shell, chat composer, and chat action button texture layers

- `grass2.jpg`
  - Type: JPG
  - Likely role: grassy accent surface and lighter chat/action texture
  - Current use: used in user chat bubble texture layers

- `Minecraft Sprites.png`
  - Type: PNG
  - Likely role: future decorative sprite-sheet source for buttons, dividers, or inventory cues
  - Current use: not wired yet

- `Theme Concept.png`
  - Type: PNG
  - Likely role: visual direction board for the OpenCraft redesign
  - Current use: design reference only
  - Observed direction:
    - grass-topped bars and ledges
    - dirt and cobblestone frame language
    - thick beveled brown panels
    - torch/workbench mood lighting
    - chunkier UI framing over flat modern surfaces

### Character head assets
- `Minecraft-Creeper-Head.jpg`
  - Current use: served as `ui/public/minecraft-creeper-head.jpg` for themed user/subagent avatar selection
- `Minecraft-Enderman-Head.jpg`
  - Current use: served as `ui/public/minecraft-enderman-head.jpg` for themed user/subagent avatar selection
- `Minecraft-Pig-Head.jpg`
  - Current use: served as `ui/public/minecraft-pig-head.jpg` for themed user avatar selection
- `Minecraft-Sheep-Head.jpg`
  - Current use: served as `ui/public/minecraft-sheep-head.jpg` for themed user avatar selection
- `Minecraft-Skeleton-Head.jpg`
  - Current use: served as `ui/public/minecraft-skeleton-head.jpg` for themed user/tool avatar selection
  - Type: JPG set
  - Likely role: future avatar pack, agent identity variants, or playful status/icon treatments
  - Current use: not wired yet

### Miscellaneous imagery
- `dmg-background.png`
- `dmg-background-small.png`
  - Type: PNG
  - Likely role: unrelated generic/tech background material
  - Current use: not used for the OpenCraft theme pass because they do not match the Minecraft visual language closely enough

### Chrome extension icon set
- `chrome-extension/icons/icon16.png`
- `chrome-extension/icons/icon32.png`
- `chrome-extension/icons/icon48.png`
- `chrome-extension/icons/icon128.png`
  - Type: PNG set
  - Likely role: extension packaging assets, separate from Control UI theming
  - Current use: not wired into the Control UI

## Sound pack inventory

### UI-positive / reward / soft feedback
- `orb.mp3`
  - Personality: light interaction ping
  - Best fit: generic clicks, lightweight navigation
  - Current mapping: default click sound

- `levelup.mp3`
  - Personality: strong positive confirmation
  - Best fit: successful connection, successful copy, rewarding state change
  - Current mapping: success sound

- `villagerhmm.mp3`
  - Personality: playful menu-selection voice cue
  - Best fit: theme selection, preset selection, playful configuration actions
  - Current mapping: theme/preset sound

### Mechanical / structural interaction
- `doorclose.mp3`
  - Personality: tactile open-close thunk
  - Best fit: toggles, mode switches, sidebar collapse, segmented controls
  - Current mapping: toggle sound

- `bow_shoot.mp3`
  - Personality: launch / commit / dispatch
  - Best fit: send, connect, primary action buttons
  - Current mapping: send/connect sound

### Danger / interruption / tension
- `creeperfuse.mp3`
  - Personality: danger warning
  - Best fit: abort, stop, destructive or high-stakes actions
  - Current mapping: danger sound

- `minecraftglassbreak.mp3`
  - Personality: brittle break / delete / remove
  - Best fit: future attachment removal or destructive-dismiss actions
  - Current mapping: not yet wired

- `pickaxebreak.mp3`
  - Personality: tool break / failure joke cue
  - Best fit: future error or invalid-action feedback, if used sparingly
  - Current mapping: not yet wired

- `scary.mp3`
  - Personality: horror sting
  - Best fit: ambient gag or special event only
  - Current mapping: intentionally not used in normal UI flows

### Creature / ambient / novelty voices
- `dog.mp3`
- `enderman.mp3`
- `sheep.mp3`
- `villager.mp3`
- `villagerblow.mp3`
- `zombie.mp3`
  - Personality: novelty character sounds
  - Best fit: future agent avatars, assistant identity flair, or optional easter eggs
  - Current mapping: not used in the base pass to avoid turning the UI into a soundboard toy

### Scene / ambience
- `building.mp3`
  - Personality: active construction / layered ambience
  - Best fit: optional onboarding ambience or special theme-preview mode
  - Current mapping: not used in the base pass because persistent ambience would likely become distracting

## Current applied redesign decisions

### Steve branding
The upper-left OpenCraft brand tile now uses the supplied Steve head art instead of the earlier hand-drawn SVG approximation.

Wired through:
- `ui/src/ui/views/agents-utils.ts`
- `ui/src/ui/app-render.ts`
- `ui/src/ui/views/login-gate.ts`

Served asset:
- `ui/public/minecraft-steve-head.jpg`

### Texture-backed surfaces
The redesigned pass uses textures selectively instead of wallpapering the whole UI.

Current applied texture usage:
- `mc-dirt-grass.jpg`
  - sidebar shell
  - the green top band / inset padding on the main chat input shell
  - small action surface accents where the grass treatment reads clearly
- `mc-grass.jpg`
  - the green top band on themed form inputs and textareas
  - user chat bubbles
- `mc-dirt.jpg`
  - login card
  - assistant bubbles
- `mc-cobblestone.jpg`
  - retained as an available asset, but pulled back from the main body/content/topbar backgrounds after live review because it was too heavy for the base UI

### Chat identity heads and avatar picker
The themed chat composer now includes Minecraft identity panels around the input area.

Implementation behavior:
- Steve head appears on the assistant side of the composer
- the user side shows a clickable mob-head picker
- clicking the user head cycles through pig, sheep, skeleton, creeper, and enderman
- themed chat message avatars also use these head assets when the Minecraft theme is active

Implementation files:
- `ui/src/ui/minecraft-avatars.ts`
- `ui/src/ui/views/chat.ts`
- `ui/src/ui/chat/grouped-render.ts`
- `ui/src/styles/chat/layout.css`
- `ui/src/styles/chat/grouped.css`

### Cursor system
The themed pointer now uses the supplied Minecraft pickaxe art rather than the earlier custom SVG approximation.

Implementation behavior:
- normal themed pointer uses `pickaxe-cursor.png`
- click interaction briefly swaps to `pickaxe-cursor-active.png`
- the swing is driven by a short-lived root class added during themed mousedown events

Implementation files:
- `ui/src/styles/base.css`
- `ui/src/ui/app.ts`

### Contextual soundboard
The redesign adds a restrained Minecraft sound layer that only activates for the `minecraft` theme family.

Implementation file:
- `ui/src/ui/soundboard.ts`

Behavior:
- only active when the resolved theme is `minecraft` or `minecraft-light`
- uses low volumes and throttle guards
- avoids ambient looping and most creature novelty sounds
- focuses on tactile UI confirmation rather than constant noise

Current mappings:
- click or lightweight navigation → `orb.mp3`
- field focus → `villagerhmm.mp3`
- toggle or collapse behavior → `doorclose.mp3`
- send or connect actions → `bow_shoot.mp3`
- theme or preset selection → `levelup.mp3`
- successful connection or reward-like confirmation → `levelup.mp3`
- stop or danger action → `creeperfuse.mp3`

Live-tuning note:
- after user feedback that only the orb was really noticeable, the non-orb mappings were made more audible and field focus was added as an explicit sound lane

## Deliberate non-uses
These files were intentionally not forced into the first redesign pass:
- mob-head JPG set
- `Minecraft Sprites.png`
- `building.mp3`
- horror/novelty sounds like `scary.mp3`
- tech-style `dmg-background*.png`

Reason:
The goal was to make the UI feel authentically Minecraft-like, not cluttered or gimmicky.

## Good future uses
If the theme keeps evolving, the next tasteful uses would be:
- mob heads as alternate agent/avatar packs
- sprite-sheet fragments for inventory-slot corners or decorative dividers
- `minecraftglassbreak.mp3` for attachment removal or panel dismiss actions
- `villager.mp3` or `enderman.mp3` as optional per-agent identity flourishes instead of global UI sounds
