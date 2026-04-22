export type MinecraftHeadChoice =
  | "steve"
  | "pig"
  | "sheep"
  | "skeleton"
  | "creeper"
  | "enderman";

export type MinecraftHeadDef = {
  id: MinecraftHeadChoice;
  label: string;
  src: string;
};

const USER_HEAD_STORAGE_KEY = "opencraft.userHead";

export const MINECRAFT_HEADS: Record<MinecraftHeadChoice, MinecraftHeadDef> = {
  steve: { id: "steve", label: "Steve", src: "/minecraft-steve-head.jpg" },
  pig: { id: "pig", label: "Pig", src: "/minecraft-pig-head.jpg" },
  sheep: { id: "sheep", label: "Sheep", src: "/minecraft-sheep-head.jpg" },
  skeleton: { id: "skeleton", label: "Skeleton", src: "/minecraft-skeleton-head.jpg" },
  creeper: { id: "creeper", label: "Creeper", src: "/minecraft-creeper-head.jpg" },
  enderman: { id: "enderman", label: "Enderman", src: "/minecraft-enderman-head.jpg" },
};

export const USER_PICKABLE_HEADS: MinecraftHeadDef[] = [
  MINECRAFT_HEADS.pig,
  MINECRAFT_HEADS.sheep,
  MINECRAFT_HEADS.skeleton,
  MINECRAFT_HEADS.creeper,
  MINECRAFT_HEADS.enderman,
];

export function isMinecraftThemeActive(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  const theme = document.documentElement.dataset.theme;
  return theme === "minecraft" || theme === "minecraft-light";
}

export function getStoredUserHeadChoice(): MinecraftHeadChoice {
  try {
    const raw = globalThis.localStorage?.getItem(USER_HEAD_STORAGE_KEY) ?? "";
    if (raw in MINECRAFT_HEADS && raw !== "steve") {
      return raw as MinecraftHeadChoice;
    }
  } catch {
    // ignore storage access failures
  }
  return "pig";
}

export function setStoredUserHeadChoice(choice: MinecraftHeadChoice) {
  if (choice === "steve") {
    return;
  }
  try {
    globalThis.localStorage?.setItem(USER_HEAD_STORAGE_KEY, choice);
  } catch {
    // ignore storage access failures
  }
}

export function cycleStoredUserHeadChoice(): MinecraftHeadDef {
  const current = getStoredUserHeadChoice();
  const index = USER_PICKABLE_HEADS.findIndex((head) => head.id === current);
  const next = USER_PICKABLE_HEADS[(index + 1 + USER_PICKABLE_HEADS.length) % USER_PICKABLE_HEADS.length];
  setStoredUserHeadChoice(next.id);
  return next;
}

export function getCurrentUserHead(): MinecraftHeadDef {
  return MINECRAFT_HEADS[getStoredUserHeadChoice()];
}

export function getMainAssistantHead(): MinecraftHeadDef {
  return MINECRAFT_HEADS.steve;
}

export function resolveMinecraftHeadForRole(
  role: string,
  assistantName?: string | null,
): MinecraftHeadDef | null {
  if (!isMinecraftThemeActive()) {
    return null;
  }
  const normalized = role.trim().toLowerCase();
  if (normalized === "user") {
    return getCurrentUserHead();
  }
  if (normalized === "tool") {
    return MINECRAFT_HEADS.skeleton;
  }
  if (normalized === "assistant") {
    if (looksLikeMainAssistant(assistantName)) {
      return getMainAssistantHead();
    }
    return pickHeadFromName(assistantName || "assistant");
  }
  return pickHeadFromName(assistantName || normalized || "assistant");
}

function looksLikeMainAssistant(name?: string | null): boolean {
  const normalized = (name || "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return ["assistant", "archon", "main", "opencraft", "openclaw"].some((value) =>
    normalized.includes(value),
  );
}

function pickHeadFromName(name: string): MinecraftHeadDef {
  const pool = [
    MINECRAFT_HEADS.pig,
    MINECRAFT_HEADS.sheep,
    MINECRAFT_HEADS.skeleton,
    MINECRAFT_HEADS.creeper,
    MINECRAFT_HEADS.enderman,
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length] ?? MINECRAFT_HEADS.pig;
}
