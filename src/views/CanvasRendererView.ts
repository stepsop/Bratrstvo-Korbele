import { GameStateModel, GuildHotspot, TavernBgPresetKey } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';
import { QuestFactory } from '../models/QuestFactory';
import { WoodenFrameDrawer } from './WoodenFrameDrawer';
import { PortraitCanvasDrawer } from './PortraitCanvasDrawer';

interface NpcCutoutLayer {
    img: HTMLImageElement;
    loaded: boolean;
    glowCanvas: HTMLCanvasElement;
    alphaData: Uint8ClampedArray | null;
    w: number;
    h: number;
}

interface BgLayer {
    img: HTMLImageElement;
    loaded: boolean;
}

/**
 * View-компонент отрисовки сцен на HTML5 Canvas (SRP: отвечает за рендер игровых сцен Гильдии, Карты и Боя)
 */
export class CanvasRendererView {
    public readonly canvas: HTMLCanvasElement;
    public readonly ctx: CanvasRenderingContext2D;
    private bgImages: Record<TavernBgPresetKey, BgLayer> = {
        '16x9': { img: new Image(), loaded: false },
        '4x3':  { img: new Image(), loaded: false },
        '3x4':  { img: new Image(), loaded: false },
        '9x16': { img: new Image(), loaded: false }
    };
    private bohemiaMapLayer: BgLayer = { img: new Image(), loaded: false };
    private npcLayers: Record<string, NpcCutoutLayer> = {};
    private static unitImages: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};

    constructor(canvasId = 'view', hotspots: GuildHotspot[] = []) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.initBackgrounds();
        this.initNpcCutoutSprites(hotspots);
        CanvasRendererView.initUnitCutoutSprites();
    }

    public static initUnitCutoutSprites(): void {
        if (Object.keys(CanvasRendererView.unitImages).length > 0) return;
        const urls: Record<string, string> = {
            szlachta:  'sprites/unit_knight.png?v=1',
            monk:      'sprites/unit_halberd.png?v=1',
            halberd:   'sprites/unit_halberd.png?v=1',
            musketeer: 'sprites/unit_musketeer.png?v=1',
            husita:    'sprites/unit_flail.png?v=1'
        };
        Object.keys(urls).forEach(key => {
            const img = new Image();
            const entry = { img, loaded: false };
            CanvasRendererView.unitImages[key] = entry;
            img.onload = () => {
                entry.loaded = true;
            };
            img.src = urls[key];
        });
    }

    private initBackgrounds(): void {
        const urls: Record<TavernBgPresetKey, string> = {
            '16x9': 'backgrounds/tavern_bg_16x9.png',
            '4x3':  'backgrounds/tavern_bg_4x3.png',
            '3x4':  'backgrounds/tavern_bg_3x4.png',
            '9x16': 'backgrounds/tavern_bg_9x16.png'
        };
        const cacheBust = '?v=14';
        (Object.keys(urls) as TavernBgPresetKey[]).forEach(key => {
            const entry = this.bgImages[key];
            entry.img.onload = () => {
                entry.loaded = true;
            };
            entry.img.src = urls[key] + cacheBust;
        });

        this.bohemiaMapLayer.img.onload = () => {
            this.bohemiaMapLayer.loaded = true;
        };
        this.bohemiaMapLayer.img.src = 'backgrounds/bohemia_map.png?v=1';
    }

    public updateResponsiveBgPreset(state: GameStateModel): void {
        const vp = document.getElementById('viewport-container') || this.canvas;
        const rect = vp.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const aspect = rect.width / rect.height;
        let nextPreset: TavernBgPresetKey = '4x3';
        if (aspect >= 1.50) {
            nextPreset = '16x9';
        } else if (aspect >= 1.05) {
            nextPreset = '4x3';
        } else if (aspect >= 0.68) {
            nextPreset = '3x4';
        } else {
            nextPreset = '9x16';
        }
        state.activeBgPreset = nextPreset;

        const preset = state.tavernBgPresets[nextPreset] || state.tavernBgPresets['4x3'];
        let targetW = 520;
        let targetH = 290;
        if (state.scene === 'guild') {
            targetW = preset.width;
            targetH = preset.height;
        } else if (state.scene === 'map') {
            if (aspect >= 1) {
                targetH = 1024;
                targetW = Math.max(1024, Math.min(2048, Math.round(1024 * aspect)));
            } else {
                targetW = 1024;
                targetH = Math.max(1024, Math.min(2048, Math.round(1024 / Math.max(0.45, aspect))));
            }
        } else if (state.scene === 'combat') {
            if (aspect >= 1) {
                targetH = 290;
                targetW = Math.max(440, Math.min(760, Math.round(290 * aspect)));
            } else {
                targetW = 360;
                targetH = Math.max(290, Math.min(540, Math.round(360 / Math.max(0.5, aspect))));
            }
        }
        if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
            this.canvas.width = targetW;
            this.canvas.height = targetH;
        }
    }

    private initNpcCutoutSprites(hotspots: GuildHotspot[]): void {
        const cacheBust = '?v=16';
        hotspots.forEach(h => {
            const img = new Image();
            const glowCanvas = document.createElement('canvas');
            const layer: NpcCutoutLayer = {
                img,
                loaded: false,
                glowCanvas,
                alphaData: null,
                w: h.srcW,
                h: h.srcH
            };
            this.npcLayers[h.id] = layer;

            img.onload = () => {
                const W = img.naturalWidth || h.srcW;
                const H = img.naturalHeight || h.srcH;
                layer.w = W;
                layer.h = H;
                glowCanvas.width = W + 8;
                glowCanvas.height = H + 8;

                const gctx = glowCanvas.getContext('2d')!;
                try {
                    const tmp = document.createElement('canvas');
                    tmp.width = W;
                    tmp.height = H;
                    const tctx = tmp.getContext('2d')!;
                    tctx.drawImage(img, 0, 0);
                    const imgData = tctx.getImageData(0, 0, W, H);
                    layer.alphaData = imgData.data;
                } catch {
                    layer.alphaData = null;
                }

                const sil = document.createElement('canvas');
                sil.width = W;
                sil.height = H;
                const sctx = sil.getContext('2d')!;
                sctx.drawImage(img, 0, 0);
                sctx.globalCompositeOperation = 'source-in';
                sctx.fillStyle = '#ffd700';
                sctx.fillRect(0, 0, W, H);

                const offsets = [
                    [-4, 0], [4, 0], [0, -4], [0, 4],
                    [-3, -3], [3, -3], [-3, 3], [3, 3]
                ];
                offsets.forEach(([ox, oy]) => {
                    gctx.drawImage(sil, 4 + ox, 4 + oy);
                });

                gctx.drawImage(img, 4, 4);
                gctx.save();
                gctx.globalCompositeOperation = 'source-atop';
                gctx.fillStyle = 'rgba(255, 220, 90, 0.22)';
                gctx.fillRect(4, 4, W, H);
                gctx.restore();

                layer.loaded = true;
            };
            img.src = h.spriteUrl + cacheBust;
        });
    }

    public hitTestHotspot(h: GuildHotspot, canvasX: number, canvasY: number, state?: GameStateModel): boolean {
        const p = state
            ? state.getActiveHotspotPlacement(h)
            : { srcX: h.srcX, srcY: h.srcY, srcW: h.srcW, srcH: h.srcH, bgW: 1200, bgH: 896 };

        const bgX = canvasX * (p.bgW / this.canvas.width);
        const bgY = canvasY * (p.bgH / this.canvas.height);
        if (bgX < p.srcX || bgX > p.srcX + p.srcW || bgY < p.srcY || bgY > p.srcY + p.srcH) {
            return false;
        }
        const layer = this.npcLayers[h.id];
        if (!layer || !layer.loaded || !layer.alphaData) {
            return true;
        }
        const lx = Math.floor(((bgX - p.srcX) / p.srcW) * layer.w);
        const ly = Math.floor(((bgY - p.srcY) / p.srcH) * layer.h);
        if (lx < 0 || lx >= layer.w || ly < 0 || ly >= layer.h) return false;
        const alpha = layer.alphaData[(ly * layer.w + lx) * 4 + 3];
        return alpha > 20;
    }

    private clamp(v: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, v));
    }

    public drawSprite(
        key: string,
        cx: number,
        cy: number,
        scale: number,
        _mainColor = '#fff',
        dead = false,
        flash = false,
        flipX = false,
        highlightColor: string | null = null
    ): void {
        const unitEntry = CanvasRendererView.unitImages[key] || CanvasRendererView.unitImages.szlachta;
        if (unitEntry && unitEntry.loaded && unitEntry.img.naturalWidth > 0) {
            const ctx = this.ctx;
            const targetH = scale * 19;
            const aspect = unitEntry.img.naturalWidth / unitEntry.img.naturalHeight;
            const targetW = targetH * aspect;

            ctx.save();
            ctx.imageSmoothingEnabled = false;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + (dead ? 14 : targetH * 0.44), targetW * 0.38, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();

            if (highlightColor && !dead) {
                ctx.save();
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 2;
                ctx.fillStyle = highlightColor === '#ffd700'
                    ? 'rgba(255, 215, 0, 0.22)'
                    : 'rgba(102, 255, 102, 0.16)';
                ctx.beginPath();
                ctx.ellipse(cx, cy + targetH * 0.44, targetW * 0.48, 7, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            ctx.translate(cx, cy);
            if (dead) {
                ctx.translate(0, 10);
                ctx.rotate(flipX ? Math.PI / 2 : -Math.PI / 2);
                ctx.globalAlpha = 0.55;
            } else if (flipX) {
                ctx.scale(-1, 1);
            }

            if (highlightColor && !dead) {
                ctx.save();
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 8;
                const offsets = [
                    [-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5],
                    [-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]
                ];
                offsets.forEach(([ox, oy]) => {
                    ctx.drawImage(unitEntry.img, -targetW / 2 + ox, -targetH / 2 + oy, targetW, targetH);
                });
                ctx.restore();
            }

            if (flash) {
                ctx.filter = 'brightness(2.6) contrast(1.2)';
            } else if (highlightColor && !dead) {
                ctx.filter = 'brightness(1.18) contrast(1.06)';
            }

            ctx.drawImage(unitEntry.img, -targetW / 2, -targetH / 2, targetW, targetH);
            ctx.restore();
        }
    }

    public renderFrame(state: GameStateModel): void {
        this.updateResponsiveBgPreset(state);
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (state.shake > 0) {
            ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
            state.shake *= 0.85;
            if (state.shake < 0.5) state.shake = 0;
        }

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.classList.toggle('guild-scene-active', state.scene === 'guild' || state.scene === 'combat');
        }

        if (state.scene === 'guild') {
            this.drawGuildScene(state);
        } else if (state.scene === 'map') {
            this.drawMapScene(state);
        } else if (state.scene === 'combat') {
            this.drawCombatScene(state);
        }

        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.2;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.life--;
            if (p.life <= 0) state.particles.splice(i, 1);
        }

        ctx.font = 'bold 11px Courier New';
        ctx.textAlign = 'center';
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
            const ft = state.floatingTexts[i];
            ft.y += ft.vy;
            ctx.fillStyle = '#000';
            ctx.fillRect(ft.x - 48, ft.y - 10, 96, 13);
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
            ft.life--;
            if (ft.life <= 0) state.floatingTexts.splice(i, 1);
        }

        ctx.restore();
    }

    public drawGuildScene(state: GameStateModel): void {
        this.updateResponsiveBgPreset(state);
        const ctx = this.ctx;
        const activeBg = this.bgImages[state.activeBgPreset] || this.bgImages['4x3'];
        const fallbackBg = this.bgImages['4x3'];

        if (activeBg && activeBg.loaded) {
            ctx.drawImage(activeBg.img, 0, 0, this.canvas.width, this.canvas.height);
        } else if (fallbackBg && fallbackBg.loaded) {
            ctx.drawImage(fallbackBg.img, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            ctx.fillStyle = '#140f0a';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        for (const h of state.guildHotspots) {
            const layer = this.npcLayers[h.id];
            if (!layer || !layer.loaded) continue;
            const p = state.getActiveHotspotPlacement(h);
            const scaleX = this.canvas.width / p.bgW;
            const scaleY = this.canvas.height / p.bgH;

            if (h.id === 'verbirz' || h.id === 'smith') {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
                ctx.beginPath();
                const cx = (p.srcX + p.srcW * 0.5) * scaleX;
                const cy = (p.srcY + p.srcH * 0.93) * scaleY;
                const rx = (p.srcW * (h.id === 'smith' ? 0.44 : 0.36)) * scaleX;
                const ry = (p.srcH * 0.08) * scaleY;
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            if (state.hoveredHotspot && state.hoveredHotspot.id === h.id) continue;
            ctx.drawImage(
                layer.img,
                p.srcX * scaleX,
                p.srcY * scaleY,
                p.srcW * scaleX,
                p.srcH * scaleY
            );
        }

        if (state.hoveredHotspot) {
            const h = state.hoveredHotspot;
            const layer = this.npcLayers[h.id];
            const p = state.getActiveHotspotPlacement(h);
            const scaleX = this.canvas.width / p.bgW;
            const scaleY = this.canvas.height / p.bgH;

            if (layer && layer.loaded) {
                ctx.save();
                const padX = (4 / layer.w) * p.srcW;
                const padY = (4 / layer.h) * p.srcH;
                const dx = (p.srcX - padX) * scaleX;
                const dy = (p.srcY - padY) * scaleY;
                const dw = (p.srcW + padX * 2) * scaleX;
                const dh = (p.srcH + padY * 2) * scaleY;
                ctx.drawImage(layer.glowCanvas, dx, dy, dw, dh);
                ctx.restore();
            }
        }
        ctx.restore();

        WoodenFrameDrawer.drawWoodenFrame(ctx, this.canvas.width, this.canvas.height);

        if (state.hoveredHotspot) {
            const h = state.hoveredHotspot;
            const p = state.getActiveHotspotPlacement(h);
            const scaleX = this.canvas.width / p.bgW;
            const scaleY = this.canvas.height / p.bgH;
            const uiScale = Math.max(1, Math.round(Math.min(this.canvas.width / 520, this.canvas.height / 290)));

            ctx.save();
            ctx.font = `bold ${12 * uiScale}px Courier New`;
            const tw = ctx.measureText(h.title).width + 16 * uiScale;
            const th = 20 * uiScale;
            const centerCanvasX = (p.srcX + p.srcW * 0.5) * scaleX;
            const topCanvasY = p.srcY * scaleY;
            const tx = this.clamp(centerCanvasX - tw / 2, 12 * uiScale, this.canvas.width - tw - 12 * uiScale);
            const ty = this.clamp(topCanvasY - 22 * uiScale, 12 * uiScale, this.canvas.height - 30 * uiScale);

            ctx.fillStyle = 'rgba(18, 13, 9, 0.94)';
            ctx.fillRect(tx, ty, tw, th);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1.5 * uiScale;
            ctx.strokeRect(tx, ty, tw, th);

            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.fillText(h.title, tx + tw / 2, ty + 14 * uiScale);
            ctx.restore();
        }
    }

    private drawMapBadge(
        ctx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        text: string,
        uiScale: number,
        borderColor = '#d4a24c',
        textColor = '#ffd700'
    ): void {
        ctx.save();
        ctx.font = `bold ${Math.round(13 * uiScale)}px "Segoe UI", Tahoma, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(text);
        const padX = 10 * uiScale;
        const bw = metrics.width + padX * 2;
        const bh = 22 * uiScale;
        const bx = this.clamp(cx - bw / 2, 16 * uiScale, this.canvas.width - bw - 16 * uiScale);
        const by = this.clamp(cy - bh / 2, 16 * uiScale, this.canvas.height - bh - 16 * uiScale);

        ctx.fillStyle = 'rgba(18, 12, 7, 0.9)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = Math.max(1.5, 1.5 * uiScale);
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = textColor;
        ctx.fillText(text, bx + bw / 2, by + bh / 2 + 0.5 * uiScale);
        ctx.restore();
    }

    public drawMapScene(state: GameStateModel): void {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const s = Math.max(1, Math.round(Math.min(W / 520, H / 290)));
        const T = 9 * s;
        const innerW = W - T * 2;
        const innerH = H - T * 2;

        ctx.fillStyle = '#18100a';
        ctx.fillRect(0, 0, W, H);

        // Вписываем карту Богемии (1536x1024) с сохранением пропорций и без обрезки границ
        const srcW = 1536;
        const srcH = 1024;
        const scale = Math.min(innerW / srcW, innerH / srcH);
        const mapW = Math.round(srcW * scale);
        const mapH = Math.round(srcH * scale);
        const mapX = Math.round(T + (innerW - mapW) / 2);
        const mapY = Math.round(T + (innerH - mapH) / 2);
        const ui = Math.max(0.75, mapW / 1150);

        if (this.bohemiaMapLayer.loaded) {
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(this.bohemiaMapLayer.img, mapX, mapY, mapW, mapH);
            ctx.strokeStyle = '#5c4028';
            ctx.lineWidth = Math.max(2, 2.5 * ui);
            ctx.strokeRect(mapX, mapY, mapW, mapH);
            ctx.restore();
        } else {
            ctx.fillStyle = '#c8b082';
            ctx.fillRect(mapX, mapY, mapW, mapH);
        }

        const route = QuestFactory.getQuestMapRoute(state.activeQuest);
        const pts = route.map(p => ({
            x: mapX + (p.x / srcW) * mapW,
            y: mapY + (p.y / srcH) * mapH
        }));

        // Рассчитываем суммарную длину маршрута и текущую точку отряда
        const segLens: number[] = [];
        let totalLen = 0;
        for (let i = 0; i < pts.length - 1; i++) {
            const dx = pts[i + 1].x - pts[i].x;
            const dy = pts[i + 1].y - pts[i].y;
            const len = Math.hypot(dx, dy);
            segLens.push(len);
            totalLen += len;
        }

        const t = state.mapState.dir === 'to_quest' ? state.mapState.progress : (1 - state.mapState.progress);
        const targetDist = totalLen * this.clamp(t, 0, 1);

        let acc = 0;
        let px = pts[0].x;
        let py = pts[0].y;
        let moveDx = pts.length > 1 ? (pts[1].x - pts[0].x) : 1;
        let currentSegIdx = 0;
        for (let i = 0; i < segLens.length; i++) {
            const len = segLens[i];
            if (targetDist <= acc + len || i === segLens.length - 1) {
                const localT = len > 0 ? this.clamp((targetDist - acc) / len, 0, 1) : 0;
                px = pts[i].x + (pts[i + 1].x - pts[i].x) * localT;
                py = pts[i].y + (pts[i + 1].y - pts[i].y) * localT;
                const segDx = pts[i + 1].x - pts[i].x;
                moveDx = state.mapState.dir === 'to_quest' ? segDx : -segDx;
                currentSegIdx = i;
                break;
            }
            acc += len;
        }

        // Рисуем маршрут (подложка + пунктирная дорожка + пройденный золотой участок)
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([12 * ui, 8 * ui]);

        ctx.strokeStyle = 'rgba(20, 12, 6, 0.78)';
        ctx.lineWidth = 6 * ui;
        ctx.beginPath();
        pts.forEach((pt, idx) => idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.stroke();

        ctx.strokeStyle = '#a82218';
        ctx.lineWidth = 3.2 * ui;
        ctx.beginPath();
        pts.forEach((pt, idx) => idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.stroke();

        // Пройденная часть пути золотом
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3.2 * ui;
        ctx.beginPath();
        if (state.mapState.dir === 'to_quest') {
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i <= currentSegIdx; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.lineTo(px, py);
        } else {
            const endPt = pts[pts.length - 1];
            ctx.moveTo(endPt.x, endPt.y);
            for (let i = pts.length - 2; i > currentSegIdx; i--) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        // Точка старта — Прага (Таверна Bratrstvo)
        const startPt = pts[0];
        ctx.save();
        ctx.fillStyle = '#1b1109';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5 * ui;
        ctx.beginPath();
        ctx.arc(startPt.x, startPt.y, 7.5 * ui, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        this.drawMapBadge(ctx, startPt.x, startPt.y - 22 * ui, '🏰 Прага (Таверна)', ui, '#d4a24c', '#ffd700');

        // Точка цели — место задания
        const endPt = pts[pts.length - 1];
        const pulse = 1 + Math.sin(state.frame * 0.14) * 0.22;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 70, 50, 0.72)';
        ctx.lineWidth = 2.5 * ui;
        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 14 * ui * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#7a1111';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.2 * ui;
        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 8 * ui, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const destLabel = state.activeQuest ? `⚔️ ${state.activeQuest.location}` : '⚔️ Цель похода';
        this.drawMapBadge(ctx, endPt.x, endPt.y + 24 * ui, destLabel, ui, '#cc4444', '#ffdf9e');

        // Рисуем точку текущего положения на дороге + шагающий спрайт лидера отряда
        const leader = state.party.find(h => h.inSquad && h.status === 'ready' && h.hp > 0);
        const spriteKey = leader?.sprite || 'szlachta';
        const isMarching = state.mapState.encounterPending === null;
        const bob = isMarching ? Math.sin(state.frame * 0.28) * 3.5 * ui : 0;
        const flipLeft = moveDx < -0.5;

        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#1a0f08';
        ctx.lineWidth = 2 * ui;
        ctx.beginPath();
        ctx.arc(px, py, 5 * ui, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(px, py - 2 * ui, 16 * ui, 5.5 * ui, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (state.mapState.encounterPending === 'ambush') {
            const ambushPulse = 1 + Math.sin(state.frame * 0.22) * 0.24;
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 55, 40, 0.85)';
            ctx.lineWidth = 3 * ui;
            ctx.beginPath();
            ctx.arc(px, py, 16 * ui * ambushPulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        const unitEntry = CanvasRendererView.unitImages[spriteKey];
        if (unitEntry && unitEntry.loaded && unitEntry.img.naturalWidth > 0) {
            const drawH = 66 * ui;
            const aspect = unitEntry.img.naturalWidth / unitEntry.img.naturalHeight;
            const drawW = drawH * aspect;
            const drawY = py - drawH * 0.48 + bob;

            ctx.save();
            ctx.translate(px, drawY);
            if (flipLeft) ctx.scale(-1, 1);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 6 * ui;
            ctx.drawImage(unitEntry.img, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();

            const squadBadge = state.mapState.encounterPending === 'ambush' ? '⚠️ Засада!' : '🛡️ Отряд';
            const badgeBorder = state.mapState.encounterPending === 'ambush' ? '#ff5544' : '#ffd700';
            this.drawMapBadge(ctx, px, drawY - drawH / 2 - 14 * ui, squadBadge, ui, badgeBorder, '#ffffff');
        } else {
            this.drawSprite(spriteKey, px, py - 14 * ui + bob, 2.2 * ui, leader?.color || '#2b1d12', false, false, flipLeft, '#ffd700');
            const squadBadge = state.mapState.encounterPending === 'ambush' ? '⚠️ Засада!' : '🛡️ Отряд';
            const badgeBorder = state.mapState.encounterPending === 'ambush' ? '#ff5544' : '#ffd700';
            this.drawMapBadge(ctx, px, py - 42 * ui, squadBadge, ui, badgeBorder, '#ffffff');
        }

        WoodenFrameDrawer.drawWoodenFrame(ctx, W, H);
    }

    public drawCombatScene(state: GameStateModel): void {
        const ctx = this.ctx;
        const combat = state.combat;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const T = 9;
        const yOff = Math.max(0, Math.round((H - 290) * 0.5));

        ctx.fillStyle = '#1f1610';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2b2017';
        ctx.fillRect(T, 175 + yOff, W - T * 2, Math.max(48, H - (175 + yOff) - T - 24));

        ctx.fillStyle = 'rgba(13, 9, 7, 0.78)';
        ctx.fillRect(T, T, W - T * 2, 18);
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
        const buffInfo = combat.psaKrevBuffTurns > 0 ? ` | 🔥 ПСЯ КРЕВ (${combat.psaKrevBuffTurns} х.)` : '';
        ctx.fillText((combat.paused ? '=== ТАКТИЧЕСКАЯ ПАУЗА ===' : '=== АВТО-БОЙ (ПРОБЕЛ — Пауза) ===') + buffInfo, W / 2, 22);

        const heroAnchorX = Math.max(82, Math.round(W * 0.21));
        const enemyAnchorX = Math.min(W - 82, Math.round(W * 0.79));

        const activeHeroes = state.party.filter(h => h.inSquad && h.status === 'ready');
        const hCount = activeHeroes.length;
        const stepH = hCount > 3 ? 42 : 54;
        const startH = (hCount > 3 ? 66 : 95) + yOff;
        activeHeroes.forEach((h, idx) => {
            let baseX = heroAnchorX + (idx % 2) * 34;
            const baseY = startH + idx * stepH;
            if (h.lunge > 0) { baseX += 14; h.lunge--; }
            const bob = h.hp > 0 ? Math.sin(state.frame * 0.12 + idx) * 2 : 0;
            h.x = baseX; h.y = baseY;

            const isSel = combat.selectedHeroId === h.id;
            const isHov = combat.hoveredHeroId === h.id;
            const hlColor = isSel ? '#ffd700' : (isHov ? '#66ff66' : null);

            this.drawSprite(h.sprite, baseX, baseY + bob, 3, h.color, h.hp <= 0, h.flash > 0, false, hlColor);
            if (h.flash > 0) h.flash--;

            this.drawUnitBar(baseX, baseY - 32, h.hp, h.maxHp, h.tempHp || 0, isSel ? '#ffd700' : '#55cc55', h.name);

            if (isSel && combat.paused) {
                ctx.save();
                ctx.fillStyle = 'rgba(20, 14, 9, 0.92)';
                ctx.fillRect(baseX - 38, baseY - 56, 76, 13);
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 1;
                ctx.strokeRect(baseX - 38, baseY - 56, 76, 13);
                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 8px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText('⚙ РАСПОРЯДОК', baseX, baseY - 47);
                ctx.restore();
            }
        });

        const eCount = combat.enemies.length;
        const stepE = eCount > 3 ? 42 : 54;
        const startE = (eCount > 3 ? 66 : 95) + yOff;
        combat.enemies.forEach((e, idx) => {
            let baseX = enemyAnchorX - (idx % 2) * 38;
            const baseY = startE + idx * stepE;
            if (e.lunge > 0) { baseX -= 14; e.lunge--; }
            const bob = e.hp > 0 ? Math.sin(state.frame * 0.12 + idx + 2) * 2 : 0;
            e.x = baseX; e.y = baseY;

            const isFocused = combat.focusEnemyIndex === idx && e.hp > 0;
            const isHovEn = combat.hoveredEnemyIndex === idx && e.hp > 0;
            const enHlColor = isFocused ? '#ffd700' : (isHovEn ? '#ff6666' : null);

            this.drawSprite(e.sprite, baseX, baseY + bob, 3, e.color, e.hp <= 0, e.flash > 0, true, enHlColor);
            if (e.flash > 0) e.flash--;

            const title = e.isSuperReadyNextTurn ? '!! СУПЕР !!' : e.name;
            this.drawUnitBar(baseX, baseY - 32, e.hp, e.maxHp, 0, isFocused ? '#ffd700' : '#dd4444', title);
        });

        WoodenFrameDrawer.drawCombatPauseCornerIcon(ctx, W, combat.paused, state.frame);
        WoodenFrameDrawer.drawWoodenFrame(ctx, W, H);
    }

    private drawUnitBar(x: number, y: number, hp: number, maxHp: number, tempHp: number, color: string, label: string): void {
        const ctx = this.ctx;
        ctx.font = 'bold 9px Courier New'; ctx.textAlign = 'center';
        ctx.fillStyle = '#f0e6d2';
        ctx.fillText(label + (tempHp > 0 ? ` (+${tempHp})` : ''), x, y - 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(x - 28, y, 56, 6);
        ctx.fillStyle = color;
        const w = this.clamp((hp / maxHp) * 54, 0, 54);
        ctx.fillRect(x - 27, y + 1, w, 4);
        if (tempHp > 0) {
            ctx.fillStyle = '#44ccff';
            const tw = this.clamp((tempHp / maxHp) * 54, 4, 54);
            ctx.fillRect(x - 27, y - 2, tw, 2);
        }
    }

    public static drawPaperDollFigure(h: HeroModel): void {
        CanvasRendererView.initUnitCutoutSprites();
        PortraitCanvasDrawer.drawPaperDollFigure(h, CanvasRendererView.unitImages);
    }

    public static drawNpcAvatar(sec: string): void {
        PortraitCanvasDrawer.drawNpcAvatar(sec);
    }
}
