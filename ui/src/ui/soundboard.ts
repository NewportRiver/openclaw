import type { ResolvedTheme } from "./theme.ts";

type SoundKey = "click" | "focus" | "toggle" | "send" | "theme" | "success" | "danger";

const SOUND_FILES: Record<SoundKey, string> = {
  click: "/sounds/orb.mp3",
  focus: "/sounds/villagerhmm.mp3",
  toggle: "/sounds/doorclose.mp3",
  send: "/sounds/bow_shoot.mp3",
  theme: "/sounds/levelup.mp3",
  success: "/sounds/levelup.mp3",
  danger: "/sounds/creeperfuse.mp3",
};

const SOUND_VOLUMES: Record<SoundKey, number> = {
  click: 0.2,
  focus: 0.2,
  toggle: 0.32,
  send: 0.38,
  theme: 0.34,
  success: 0.34,
  danger: 0.24,
};

const SOUND_THROTTLE_MS: Record<SoundKey, number> = {
  click: 110,
  focus: 180,
  toggle: 180,
  send: 180,
  theme: 240,
  success: 260,
  danger: 700,
};

export function isMinecraftResolvedTheme(theme: ResolvedTheme | null | undefined): boolean {
  return theme === "minecraft" || theme === "minecraft-light";
}

function toElement(target: EventTarget | null): Element | null {
  return target instanceof Element ? target : null;
}

function resolveClickSound(target: EventTarget | null): SoundKey | null {
  const el = toElement(target);
  if (!el) {
    return null;
  }
  if (el.closest(".chat-send-btn--stop, [data-sound='danger']")) {
    return "danger";
  }
  if (el.closest(".settings-theme-card, .qs-preset")) {
    return "theme";
  }
  if (el.closest(".chat-copy-btn, .chat-expand-btn")) {
    return "success";
  }
  if (el.closest(".chat-send-btn, .login-gate__connect, .btn.primary")) {
    return "send";
  }
  if (
    el.closest(
      ".nav-collapse-toggle, .skill-toggle, .qs-toggle, .qs-segmented__btn, .cfg-segmented__btn, .settings-roundness__btn, .settings-theme-card--active",
    )
  ) {
    return "toggle";
  }
  if (
    el.closest(
      ".nav-item, .topbar-search, .dashboard-header__breadcrumb-link, .sidebar-brand, .session-link, button, [role='button']",
    )
  ) {
    return "click";
  }
  return null;
}

function resolveChangeSound(target: EventTarget | null): SoundKey | null {
  const el = toElement(target);
  if (!el) {
    return null;
  }
  const control = el.closest("input, select, textarea");
  if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) {
    return null;
  }
  if (
    control instanceof HTMLInputElement &&
    control.type !== "checkbox" &&
    control.type !== "radio" &&
    control.type !== "range"
  ) {
    return null;
  }
  return "toggle";
}

function resolveFocusSound(target: EventTarget | null): SoundKey | null {
  const el = toElement(target);
  if (!el) {
    return null;
  }
  const control = el.closest("input, select, textarea");
  if (
    control instanceof HTMLInputElement ||
    control instanceof HTMLSelectElement ||
    control instanceof HTMLTextAreaElement
  ) {
    return "focus";
  }
  return null;
}

export class MinecraftSoundboard {
  private theme: ResolvedTheme = "dark";
  private warmed = new Set<SoundKey>();
  private lastPlayed = new Map<SoundKey, number>();

  setTheme(theme: ResolvedTheme) {
    this.theme = theme;
  }

  isActive() {
    return isMinecraftResolvedTheme(this.theme);
  }

  handleClick(event: Event) {
    const sound = resolveClickSound(event.target);
    if (sound) {
      this.play(sound);
    }
  }

  handleChange(event: Event) {
    const sound = resolveChangeSound(event.target);
    if (sound) {
      this.play(sound);
    }
  }

  handleFocus(event: Event) {
    const sound = resolveFocusSound(event.target);
    if (sound) {
      this.play(sound);
    }
  }

  play(sound: SoundKey) {
    if (!this.isActive() || typeof Audio === "undefined") {
      return;
    }
    const now = Date.now();
    const last = this.lastPlayed.get(sound) ?? 0;
    if (now - last < SOUND_THROTTLE_MS[sound]) {
      return;
    }
    this.lastPlayed.set(sound, now);
    const audio = new Audio(SOUND_FILES[sound]);
    audio.preload = this.warmed.has(sound) ? "metadata" : "auto";
    audio.volume = SOUND_VOLUMES[sound];
    this.warmed.add(sound);
    void audio.play().catch(() => {});
  }
}
