<!--
@file BUGLOG.md
@version 0.1.0
@status active
@owner Bart / Archon
@scope openclaw-ui-theme-work
@purpose local mod bug ledger for OpenCraft theme implementation and deployment issues
@updated 2026-04-21
-->

# BUGLOG

## Status Legend
- `open`
- `watch`
- `fixed`
- `deployed`

## Entries

### BUG-0001 - Control UI boot script rejected the new `minecraft` theme family
- Status: `fixed`
- Symptoms:
  - The Control UI theme selector could expose `Minecraft`, but the page could still boot into a fallback theme.
  - Editing built CSS alone did not guarantee the live UI would load with the new theme.
  - Refreshes could appear to ignore the new family even when the theme name was present in settings state.
- Root cause:
  - The boot-time theme allowlist in `ui/index.html` and built `dist/control-ui/index.html` only knew about `claw`, `knot`, and `dash`.
  - Early boot theme resolution runs before the main app hydrates, so the HTML bootstrap script must also recognize any new theme family.
- Verified fix:
  - Added `minecraft` to the theme family allowlist and legacy mapping path in source theme handling.
  - Updated the boot-time resolver logic so `minecraft` and `minecraft-light` can be resolved before app startup.
  - Rebuilt the Control UI and deployed the generated `dist/control-ui` bundle into the live installed OpenClaw runtime.
- Files:
  - `ui/index.html`
  - `ui/src/ui/theme.ts`
  - `ui/src/ui/storage.ts`
  - live runtime mirror: `C:\Users\bart\AppData\Roaming\npm\node_modules\openclaw\dist\control-ui\index.html`
- Last updated: 2026-04-21
