<!--
@file docs/reference/control-ui-theme-dev-workflow.md
@version 0.1.0
@status active
@owner Bart / Archon
@scope openclaw-ui-theme-work
@purpose step by step programming workflow for editing, building, deploying, and verifying the OpenCraft Control UI theme
@updated 2026-04-21
@branch feat/control-ui-opencraft-theme
@source-root D:\openclaw\forks\openclaw-ui-theme-work
-->

# Control UI Theme Developer Workflow

## Goal
Use this when you need to modify, extend, or debug the OpenCraft theme in the OpenClaw Control UI.

This is the exact practical workflow we used.

---

# A. Start in the correct place

## Editable source repo
Work here:
- `D:\openclaw\forks\openclaw-ui-theme-work`

## Live deployment target
OpenClaw serves from here:
- `C:\Users\bart\AppData\Roaming\npm\node_modules\openclaw\dist\control-ui`

Important rule:
- edit source in the fork
- build from the fork
- deploy the built output into the installed runtime

---

# B. Files to inspect first

Before changing anything, check these files.

## Theme registration
- `ui/src/ui/theme.ts`
- `ui/src/ui/storage.ts`
- `ui/index.html`

## Theme picker UI
- `ui/src/ui/views/config.ts`
- `ui/src/ui/views/config-quick.ts`

## Main style surfaces
- `ui/src/styles/base.css`
- `ui/src/styles/layout.css`
- `ui/src/styles/components.css`
- `ui/src/styles/config.css`
- `ui/src/styles/config-quick.css`
- `ui/src/styles/chat/layout.css`
- `ui/src/styles/chat/grouped.css`

## Branding and assets
- `ui/public/opencraft-steve.svg`
- `ui/public/pickaxe-cursor.svg`
- `ui/src/ui/views/login-gate.ts`
- `ui/src/ui/components/dashboard-header.ts`

---

# C. Step by step implementation workflow

## Step 1. Create or extend the theme family
Edit:
- `ui/src/ui/theme.ts`

What to do:
- add the new theme id to `ThemeName`
- add resolved dark and light outputs if needed
- add the theme to `VALID_THEME_NAMES`
- update `LEGACY_MAP` if persisted legacy values should resolve to it
- update `resolveTheme()` so mode selection works

## Step 2. Make boot-time HTML understand the theme
Edit:
- `ui/index.html`

What to do:
- add the family name to `THEMES`
- add any legacy name mappings if needed
- update the inline resolver so `data-theme` can become the new family before the app mounts

Why this step is mandatory:
- this is where early theme fallback happens
- forgetting this step creates a fake-success state where the picker shows the theme but the page boots into another one

## Step 3. Expose the theme in the settings UI
Edit:
- `ui/src/ui/views/config.ts`
- `ui/src/ui/views/config-quick.ts`

What to do:
- add the theme option to the theme option arrays
- keep the label human-readable

## Step 4. Add or adjust theme tokens
Edit:
- `ui/src/styles/base.css`

What to do:
- define the theme-level CSS variables for dark and light variants
- settle colors here first before styling individual components
- keep names consistent with the rest of the design token system

Recommended order:
1. background and panel colors
2. text and muted text
3. border colors
4. accent and focus ring
5. semantic colors like success or danger
6. shadows and radii

## Step 5. Theme the major surfaces
Edit the appropriate CSS file by surface.

Use this map:
- shell and sidebar: `ui/src/styles/layout.css`
- general shared surfaces: `ui/src/styles/components.css`
- advanced settings: `ui/src/styles/config.css`
- quick settings: `ui/src/styles/config-quick.css`
- chat shell and composer: `ui/src/styles/chat/layout.css`
- chat bubbles and avatars: `ui/src/styles/chat/grouped.css`

Preferred pattern:
- scope changes with selectors like `:root[data-theme="minecraft"] ...`
- do not rewrite default theme behavior unless necessary
- keep Minecraft-specific rules clearly isolated

## Step 6. Add or update themed assets
Edit or add:
- `ui/public/*.svg`

Examples already used:
- `opencraft-steve.svg`
- `pickaxe-cursor.svg`

Then wire them into the correct UI surfaces.

## Step 7. Build the UI
Run:

```powershell
pnpm --dir D:\openclaw\forks\openclaw-ui-theme-work\ui build
```

Expected output:
- built files land in `D:\openclaw\forks\openclaw-ui-theme-work\dist\control-ui`
- hashed JS and CSS asset names will usually change

## Step 8. Back up the live runtime before deployment
Recommended pattern:

```powershell
$src='D:\openclaw\forks\openclaw-ui-theme-work\dist\control-ui'
$dst='C:\Users\bart\AppData\Roaming\npm\node_modules\openclaw\dist\control-ui'
$stamp=Get-Date -Format 'yyyy-MM-ddTHH-mm-ss'
$backup="C:\Users\bart\AppData\Roaming\npm\node_modules\openclaw\dist\control-ui-backup-$stamp"
Copy-Item $dst $backup -Recurse -Force
```

## Step 9. Deploy the built UI into the live install
After backing up:

```powershell
Copy-Item (Join-Path $src '*') $dst -Recurse -Force
```

This replaces the served Control UI bundle with the new build.

## Step 10. Hard refresh and verify
In the browser:
- open the Control UI
- hard refresh with `Ctrl+Shift+R`

Verify all of the following:
- `Minecraft` appears in the theme selector
- switching to it updates the full UI, not only some controls
- the page still boots into the selected theme after refresh
- assets such as the logo or cursor show correctly
- no obvious unreadable text or broken contrast appears

---

# D. Fast debugging checklist

## Problem: theme appears in settings but does not load after refresh
Check:
- `ui/index.html`
- built `dist/control-ui/index.html`
- live deployed `dist/control-ui/index.html`

## Problem: theme works in source dev mode but not in installed OpenClaw
Check:
- whether the newest `dist/control-ui` folder was copied into the installed runtime
- whether the browser cached old hashed assets

## Problem: only colors changed, layout still feels default
Check the component surface files:
- `layout.css`
- `components.css`
- `chat/layout.css`
- `chat/grouped.css`

## Problem: asset update not showing
Check:
- asset file exists in `ui/public`
- build completed after the asset change
- deployed runtime contains the new asset file
- browser cache was hard refreshed

---

# E. Suggested editing strategy for future changes

Do not start by touching every file.

Use this sequence instead:
1. change theme tokens in `base.css`
2. style one major surface at a time
3. build and test after each logical batch
4. only then deploy into the installed runtime

Good batch order:
1. shell and sidebar
2. settings pages
3. chat composer
4. chat bubbles and avatars
5. assets and branding polish

This keeps regressions easier to isolate.

---

# F. Git workflow used for this theme work

## Branch
- `feat/control-ui-opencraft-theme`

## Example commit pattern
- first pass: add theme family and initial surfaces
- second pass: polish visual details
- third pass: refine assets like the cursor

## Push target
Because upstream `openclaw/openclaw` was not writable from this environment, the writable push remote used was Bart's fork.

Example remote setup:

```powershell
git remote add bartfork https://github.com/NewportRiver/openclaw.git
```

Example push:

```powershell
git push -u bartfork feat/control-ui-opencraft-theme
```

---

# G. Maintainer rules of thumb

- source first, live runtime second
- theme registration and boot allowlisting must both be updated
- build output is disposable, source changes are not
- always back up the live deployed `dist/control-ui` folder before replacing it
- treat the browser cache as part of debugging any visual change
- keep Minecraft-specific rules clearly scoped so other themes stay clean

---

# H. One-page condensed recipe

If you only need the shortest reliable process, this is it:

1. edit source files in `D:\openclaw\forks\openclaw-ui-theme-work`
2. update `ui/src/ui/theme.ts`
3. update `ui/index.html`
4. update settings pickers
5. add tokens in `ui/src/styles/base.css`
6. style component surfaces in the appropriate CSS files
7. build with `pnpm --dir ...\ui build`
8. back up live `dist\control-ui`
9. copy built output into the installed OpenClaw runtime
10. hard refresh and verify persistence, visuals, and boot behavior

That is the actual workflow we used.
