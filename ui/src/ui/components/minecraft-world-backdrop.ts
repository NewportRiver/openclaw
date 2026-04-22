import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";

type PrismPalette = {
  top: string;
  sideA: string;
  sideB: string;
  stroke: string;
};

type TerrainColumn = {
  x: number;
  z: number;
  height: number;
  palette: PrismPalette;
};

type Tree = {
  x: number;
  z: number;
  trunkHeight: number;
};

type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
};

const WORLD_SIZE = 16;
const TERRAIN_COLUMNS = buildTerrain();
const TREES: Tree[] = [
  { x: 3, z: 4, trunkHeight: 2 },
  { x: 11, z: 6, trunkHeight: 3 },
  { x: 8, z: 12, trunkHeight: 2 },
];

function buildTerrain(): TerrainColumn[] {
  const columns: TerrainColumn[] = [];
  for (let x = 0; x < WORLD_SIZE; x += 1) {
    for (let z = 0; z < WORLD_SIZE; z += 1) {
      const wave =
        Math.sin(x * 0.58) + Math.cos(z * 0.52) + Math.sin((x + z) * 0.27) * 0.8;
      const ridge = Math.cos((x - 6) * 0.46) * Math.sin((z - 9) * 0.41) * 0.7;
      const height = Math.max(1, Math.min(5, Math.round(2.2 + wave * 0.9 + ridge)));
      const pond = x >= 1 && x <= 4 && z >= 10 && z <= 13 && height <= 2;
      const highStone = height >= 4 && (x + z) % 3 === 0;
      const palette = pond
        ? {
            top: "#68b8ff",
            sideA: "#4f8dd9",
            sideB: "#4174b8",
            stroke: "rgba(185, 228, 255, 0.42)",
          }
        : highStone
          ? {
              top: "#9ca2aa",
              sideA: "#747b84",
              sideB: "#656b73",
              stroke: "rgba(224, 230, 236, 0.28)",
            }
          : {
              top: "#7bb661",
              sideA: "#7a5234",
              sideB: "#69452b",
              stroke: "rgba(226, 246, 183, 0.24)",
            };
      columns.push({ x, z, height, palette });
    }
  }
  return columns;
}

export class MinecraftWorldBackdrop extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      inset: 0;
      display: block;
      overflow: hidden;
      pointer-events: none;
      z-index: 2;
      border-radius: inherit;
    }

    :host([playing]) {
      pointer-events: auto;
      z-index: 4;
    }

    .world {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      overflow: hidden;
      pointer-events: none;
    }

    :host([playing]) .world {
      pointer-events: auto;
    }

    canvas,
    iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      border: 0;
    }

    canvas {
      z-index: 0;
      pointer-events: none;
    }

    iframe {
      z-index: 1;
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease-out, filter 180ms ease-out, transform 180ms ease-out;
      filter: saturate(0.9) blur(1px);
      transform: scale(1.02);
      background: rgba(0, 0, 0, 0.16);
    }

    :host([playing]) iframe {
      opacity: 1;
      pointer-events: auto;
      filter: none;
      transform: none;
    }

    .world-controls {
      position: absolute;
      inset: auto 14px 14px auto;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      pointer-events: none;
    }

    .world-chip,
    .world-exit {
      pointer-events: auto;
      border: 2px solid rgba(40, 28, 18, 0.88);
      border-radius: 4px;
      padding: 8px 12px;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      color: #f4f0dc;
      background:
        linear-gradient(180deg, rgba(127, 207, 83, 0.94) 0 34%, rgba(107, 169, 67, 0.94) 34% 38%, rgba(106, 75, 45, 0.96) 38% 100%);
      box-shadow:
        inset 1px 1px 0 rgba(255, 255, 255, 0.2),
        inset -1px -2px 0 rgba(0, 0, 0, 0.24),
        0 3px 0 rgba(0, 0, 0, 0.3);
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.52);
      cursor: pointer;
    }

    .world-chip {
      max-width: min(280px, calc(100vw - 48px));
      text-align: left;
    }

    .world-exit {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 4;
    }

    .world-play-hint {
      position: absolute;
      left: 14px;
      bottom: 14px;
      z-index: 3;
      max-width: min(320px, calc(100vw - 48px));
      padding: 8px 12px;
      border-radius: 4px;
      border: 2px solid rgba(33, 24, 18, 0.86);
      background: rgba(18, 14, 11, 0.76);
      color: #f4f0dc;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.35;
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.56);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
      pointer-events: none;
    }

    @media (max-width: 640px) {
      .world-controls {
        inset: auto 10px 10px 10px;
        align-items: stretch;
      }

      .world-chip {
        max-width: none;
      }

      .world-play-hint {
        left: 10px;
        right: 10px;
        max-width: none;
      }
    }
  `;

  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean, reflect: true, attribute: "playing" }) playing = false;
  @state() private classicLoaded = false;

  private frameHandle: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width = 0;
  private height = 0;
  private dpr = Math.max(1, Math.min(2, globalThis.devicePixelRatio || 1));
  private yaw = 0.82;
  private targetYaw = 0.82;
  private pitch = -0.62;
  private targetPitch = -0.62;
  private pointerNormX = 0;
  private pointerNormY = 0;
  private startedAt = performance.now();

  override render() {
    return html`
      <div class="world">
        <canvas aria-hidden="true"></canvas>
        <iframe
          title="Minecraft Classic background"
          src="https://classic.minecraft.net/"
          loading="lazy"
          allow="fullscreen; gamepad"
          tabindex=${this.playing ? "0" : "-1"}
          @load=${this.handleClassicLoad}
        ></iframe>
      </div>
      ${this.playing
        ? html`
            <button class="world-exit" type="button" @click=${this.exitClassicMode}>
              Return to chat
            </button>
            <div class="world-play-hint">
              You are in the world now. Click the game to focus it, press Escape if the game grabs the mouse, then use Return to chat when you want back out.
            </div>
          `
        : html`
            <div class="world-controls">
              <button class="world-chip" type="button" @click=${this.enterClassicMode}>
                ${this.classicLoaded
                  ? "Tap into world"
                  : "Loading Minecraft Classic... tap when ready"}
              </button>
            </div>
          `}
    `;
  }

  override firstUpdated() {
    this.canvas = this.renderRoot.querySelector("canvas");
    this.ctx = this.canvas?.getContext("2d", { alpha: true }) ?? null;
    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(this);
    this.resizeCanvas();
    this.syncAnimationState();
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("mousemove", this.handleMouseMove, { passive: true });
    window.addEventListener("keydown", this.handleWindowKeydown);
  }

  override disconnectedCallback() {
    this.stopAnimation();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("keydown", this.handleWindowKeydown);
    super.disconnectedCallback();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("active")) {
      this.syncAnimationState();
    }
  }

  private syncAnimationState() {
    if (this.active) {
      this.startAnimation();
      return;
    }
    this.stopAnimation();
    this.clearCanvas();
  }

  private startAnimation() {
    if (this.frameHandle != null || !this.ctx) {
      return;
    }
    this.startedAt = performance.now();
    const tick = (time: number) => {
      this.frameHandle = requestAnimationFrame(tick);
      this.draw(time);
    };
    this.frameHandle = requestAnimationFrame(tick);
  }

  private stopAnimation() {
    if (this.frameHandle != null) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }
  }

  private resizeCanvas() {
    if (!this.canvas || !this.ctx) {
      return;
    }
    const rect = this.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    this.dpr = Math.max(1, Math.min(2, globalThis.devicePixelRatio || 1));
    if (nextWidth === this.width && nextHeight === this.height) {
      return;
    }
    this.width = nextWidth;
    this.height = nextHeight;
    this.canvas.width = Math.round(nextWidth * this.dpr);
    this.canvas.height = Math.round(nextHeight * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.draw(performance.now());
  }

  private clearCanvas() {
    if (!this.ctx) {
      return;
    }
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (this.playing) {
      return;
    }
    this.pointerNormX = this.normalizeAxis(event.clientX, window.innerWidth);
    this.pointerNormY = this.normalizeAxis(event.clientY, window.innerHeight);
    this.targetYaw = 0.82 + this.pointerNormX * 0.42;
    this.targetPitch = -0.62 + this.pointerNormY * 0.1;
  };

  private handleClassicLoad = () => {
    this.classicLoaded = true;
  };

  private enterClassicMode = () => {
    this.playing = true;
    queueMicrotask(() => {
      const frame = this.renderRoot.querySelector("iframe");
      frame?.focus();
    });
  };

  private exitClassicMode = () => {
    this.playing = false;
  };

  private handleWindowKeydown = (event: KeyboardEvent) => {
    if (!this.playing) {
      return;
    }
    if (event.key === "Escape") {
      this.exitClassicMode();
    }
  };

  private normalizeAxis(value: number, size: number) {
    if (!size) {
      return 0;
    }
    return (value / size) * 2 - 1;
  }

  private draw(time: number) {
    if (!this.ctx || !this.width || !this.height) {
      return;
    }

    const ctx = this.ctx;
    const lightTheme = document.documentElement.dataset.theme === "minecraft-light";
    const elapsed = (time - this.startedAt) / 1000;
    const drift = Math.sin(elapsed * 0.28) * 0.08;
    this.yaw += (this.targetYaw + drift - this.yaw) * 0.045;
    this.pitch += (this.targetPitch - this.pitch) * 0.045;

    ctx.clearRect(0, 0, this.width, this.height);

    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    if (lightTheme) {
      sky.addColorStop(0, "rgba(179, 220, 255, 0.94)");
      sky.addColorStop(0.58, "rgba(145, 200, 255, 0.88)");
      sky.addColorStop(1, "rgba(84, 131, 173, 0.84)");
    } else {
      sky.addColorStop(0, "rgba(61, 106, 153, 0.96)");
      sky.addColorStop(0.58, "rgba(74, 122, 176, 0.9)");
      sky.addColorStop(1, "rgba(33, 54, 84, 0.88)");
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawSkyDecor(ctx, lightTheme, elapsed);
    this.drawWorld(ctx, lightTheme);
    this.drawAtmosphere(ctx, lightTheme);
  }

  private drawSkyDecor(ctx: CanvasRenderingContext2D, lightTheme: boolean, elapsed: number) {
    const sunSize = Math.max(28, Math.min(46, this.width * 0.04));
    const sunX = this.width * 0.82;
    const sunY = this.height * 0.18;
    ctx.fillStyle = lightTheme ? "rgba(255, 247, 189, 0.9)" : "rgba(255, 222, 142, 0.78)";
    ctx.fillRect(sunX, sunY, sunSize, sunSize);

    const cloudColor = lightTheme ? "rgba(255,255,255,0.34)" : "rgba(238,245,255,0.18)";
    const cloudOffset = Math.sin(elapsed * 0.09) * 18;
    this.drawCloud(ctx, this.width * 0.18 + cloudOffset, this.height * 0.14, 1.1, cloudColor);
    this.drawCloud(ctx, this.width * 0.58 - cloudOffset * 0.7, this.height * 0.26, 0.9, cloudColor);
  }

  private drawCloud(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    fill: string,
  ) {
    const w = 18 * scale;
    const h = 10 * scale;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w * 2, h);
    ctx.fillRect(x + w * 0.5, y - h * 0.65, w * 1.5, h);
    ctx.fillRect(x + w * 1.8, y + h * 0.2, w * 1.3, h * 0.8);
  }

  private drawWorld(ctx: CanvasRenderingContext2D, lightTheme: boolean) {
    const sorted = [...TERRAIN_COLUMNS].sort((a, b) => this.depthOf(a.x + 0.5, a.height / 2, a.z + 0.5) - this.depthOf(b.x + 0.5, b.height / 2, b.z + 0.5));
    for (const column of sorted) {
      this.drawPrism(ctx, column.x, 0, column.z, column.x + 1, column.height, column.z + 1, column.palette);
    }

    const trunkPalette: PrismPalette = {
      top: lightTheme ? "#a9784b" : "#8d633e",
      sideA: lightTheme ? "#88623d" : "#6d4d31",
      sideB: lightTheme ? "#785431" : "#5f432b",
      stroke: lightTheme ? "rgba(255, 227, 190, 0.16)" : "rgba(255, 230, 193, 0.1)",
    };
    const leavesPalette: PrismPalette = {
      top: lightTheme ? "#6bb662" : "#4d8d48",
      sideA: lightTheme ? "#4d924f" : "#417541",
      sideB: lightTheme ? "#437f45" : "#376438",
      stroke: lightTheme ? "rgba(220, 255, 199, 0.14)" : "rgba(220, 255, 199, 0.08)",
    };

    const trees = [...TREES].sort((a, b) => this.depthOf(a.x + 0.5, 4, a.z + 0.5) - this.depthOf(b.x + 0.5, 4, b.z + 0.5));
    for (const tree of trees) {
      const terrainHeight = this.columnHeightAt(tree.x, tree.z);
      this.drawPrism(
        ctx,
        tree.x + 0.28,
        terrainHeight,
        tree.z + 0.28,
        tree.x + 0.72,
        terrainHeight + tree.trunkHeight,
        tree.z + 0.72,
        trunkPalette,
      );
      const canopyBase = terrainHeight + tree.trunkHeight - 0.1;
      this.drawPrism(ctx, tree.x - 0.2, canopyBase, tree.z - 0.2, tree.x + 1.2, canopyBase + 0.9, tree.z + 1.2, leavesPalette);
      this.drawPrism(ctx, tree.x + 0.05, canopyBase + 0.86, tree.z + 0.05, tree.x + 0.95, canopyBase + 1.56, tree.z + 0.95, leavesPalette);
    }
  }

  private drawAtmosphere(ctx: CanvasRenderingContext2D, lightTheme: boolean) {
    const haze = ctx.createLinearGradient(0, this.height * 0.38, 0, this.height);
    haze.addColorStop(0, "rgba(255,255,255,0)");
    haze.addColorStop(0.7, lightTheme ? "rgba(209, 236, 255, 0.08)" : "rgba(161, 220, 255, 0.05)");
    haze.addColorStop(1, lightTheme ? "rgba(12, 22, 32, 0.22)" : "rgba(6, 10, 16, 0.34)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, this.width, this.height);

    const vignette = ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.45,
      Math.min(this.width, this.height) * 0.14,
      this.width * 0.5,
      this.height * 0.45,
      Math.max(this.width, this.height) * 0.82,
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, lightTheme ? "rgba(14, 22, 32, 0.24)" : "rgba(0, 0, 0, 0.36)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawPrism(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    palette: PrismPalette,
  ) {
    const p000 = this.project(x0, y0, z0);
    const p100 = this.project(x1, y0, z0);
    const p101 = this.project(x1, y0, z1);
    const p001 = this.project(x0, y0, z1);
    const p010 = this.project(x0, y1, z0);
    const p110 = this.project(x1, y1, z0);
    const p111 = this.project(x1, y1, z1);
    const p011 = this.project(x0, y1, z1);

    const showEast = Math.sin(this.yaw) <= 0;
    const showSouth = Math.cos(this.yaw) >= 0;

    const xFace = showEast ? [p100, p101, p111, p110] : [p000, p001, p011, p010];
    const zFace = showSouth ? [p001, p101, p111, p011] : [p000, p100, p110, p010];
    const topFace = [p010, p110, p111, p011];

    this.fillFace(ctx, xFace, palette.sideA, palette.stroke);
    this.fillFace(ctx, zFace, palette.sideB, palette.stroke);
    this.fillFace(ctx, topFace, palette.top, palette.stroke);
  }

  private fillFace(
    ctx: CanvasRenderingContext2D,
    points: ProjectedPoint[],
    fill: string,
    stroke: string,
  ) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private depthOf(x: number, y: number, z: number) {
    return this.project(x, y, z).z;
  }

  private columnHeightAt(x: number, z: number) {
    return TERRAIN_COLUMNS.find((column) => column.x === x && column.z === z)?.height ?? 2;
  }

  private project(x: number, y: number, z: number): ProjectedPoint {
    const centeredX = x - WORLD_SIZE / 2;
    const centeredZ = z - WORLD_SIZE / 2;
    const centeredY = y - 1.2;

    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);
    const yawX = centeredX * cosYaw - centeredZ * sinYaw;
    const yawZ = centeredX * sinYaw + centeredZ * cosYaw;

    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const pitchY = centeredY * cosPitch - yawZ * sinPitch;
    const pitchZ = centeredY * sinPitch + yawZ * cosPitch + 25;

    const focal = Math.min(this.width, this.height) * 1.22;
    const scale = focal / Math.max(0.1, pitchZ);

    return {
      x: this.width * 0.5 + yawX * scale + this.pointerNormX * 18,
      y: this.height * 0.74 - pitchY * scale + this.pointerNormY * 8,
      z: pitchZ,
    };
  }
}

if (!customElements.get("minecraft-world-backdrop")) {
  customElements.define("minecraft-world-backdrop", MinecraftWorldBackdrop);
}

declare global {
  interface HTMLElementTagNameMap {
    "minecraft-world-backdrop": MinecraftWorldBackdrop;
  }
}
