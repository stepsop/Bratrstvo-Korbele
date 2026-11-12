import { GameStateModel, GuildHotspot, TavernBgPresetKey } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';
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
        const cacheBust = '?v=7';
        (Object.keys(urls) as TavernBgPresetKey[]).forEach(key => {
            const entry = this.bgImages[key];
            entry.img.onload = () => {
                entry.loaded = true;
            };
            entry.img.src = urls[key] + cacheBust;
        });
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
        const targetW = state.scene === 'guild' ? preset.width : 520;
        const targetH = state.scene === 'guild' ? preset.height : 290;
        if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
            this.canvas.width = targetW;
            this.canvas.height = targetH;
        }
    }

    private initNpcCutoutSprites(hotspots: GuildHotspot[]): void {
        const cacheBust = '?v=7';
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

            if (h.id === 'verbirz') {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
                ctx.beginPath();
                const cx = (p.srcX + p.srcW * 0.5) * scaleX;
                const cy = (p.srcY + p.srcH * 0.93) * scaleY;
                const rx = (p.srcW * 0.36) * scaleX;
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

    public drawMapScene(state: GameStateModel): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#c8b082';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = '#3d2817'; ctx.font = 'bold 16px Courier New'; ctx.textAlign = 'center';
        ctx.fillText('~ КАРТА КОРОЛЕВСТВА БОГЕМИЯ ~', this.canvas.width / 2, 32);

        ctx.strokeStyle = '#5b8499'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(210, 8); ctx.quadraticCurveTo(250, 140, 190, 282); ctx.stroke();

        const startX = 95, startY = 215;
        const endX = 420, endY = 90;

        ctx.strokeStyle = '#8b261d'; ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#2b1d12'; ctx.fillRect(startX - 10, startY - 10, 20, 20);
        ctx.fillStyle = '#3d2817'; ctx.font = 'bold 11px Courier New';
        ctx.fillText('Гильдия Bratrstvo', startX, startY + 24);

        ctx.fillStyle = '#8b0000';
        ctx.beginPath(); ctx.arc(endX, endY, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillText('Отряд Чашников', endX, endY + 24);

        const t = state.mapState.dir === 'to_quest' ? state.mapState.progress : (1 - state.mapState.progress);
        const px = startX + (endX - startX) * t;
        const py = startY + (endY - startY) * t;

        this.drawSprite('szlachta', px, py - 8 + Math.sin(state.frame * 0.25) * 3, 2, '#2b1d12');
        ctx.fillStyle = '#8b0000';
        ctx.fillText(state.mapState.dir === 'to_quest' ? 'Идем на задание...' : 'Возвращаемся в гильдию...', this.canvas.width / 2, 265);

        WoodenFrameDrawer.drawWoodenFrame(ctx, this.canvas.width, this.canvas.height);
    }

    public drawCombatScene(state: GameStateModel): void {
        const ctx = this.ctx;
        const combat = state.combat;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const T = 9;

        ctx.fillStyle = '#1f1610';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2b2017';
        ctx.fillRect(T, 175, W - T * 2, 48);

        ctx.fillStyle = 'rgba(13, 9, 7, 0.78)';
        ctx.fillRect(T, T, W - T * 2, 18);
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
        const buffInfo = combat.psaKrevBuffTurns > 0 ? ` | 🔥 ПСЯ КРЕВ (${combat.psaKrevBuffTurns} х.)` : '';
        ctx.fillText((combat.paused ? '=== ТАКТИЧЕСКАЯ ПАУЗА ===' : '=== АВТО-БОЙ (ПРОБЕЛ — Пауза) ===') + buffInfo, W / 2, 22);

        const activeHeroes = state.party.filter(h => h.inSquad && h.status === 'ready');
        const hCount = activeHeroes.length;
        const stepH = hCount > 3 ? 42 : 54;
        const startH = hCount > 3 ? 66 : 95;
        activeHeroes.forEach((h, idx) => {
            let baseX = 105 + (idx % 2) * 32;
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

        combat.enemies.forEach((e, idx) => {
            let baseX = 395 - (idx % 2) * 38;
            const baseY = 95 + idx * 54;
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
