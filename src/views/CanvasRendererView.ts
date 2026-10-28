import { GameStateModel, GuildHotspot, TavernBgPresetKey } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';

export const SPRITES: Record<string, string[]> = {
    szlachta: [
        "   RRRRRR   ",
        "  RRRRRRRR  ",
        "  ..####..  ",
        "   #.##.#   ",
        "  ########  ",
        "   ######   ",
        " RRRRRRRRRR ",
        "RRRR G RRRRR",
        "RRR  G   RRR",
        "  ########  ",
        "  ###  ###  ",
        " ###    ### "
    ],
    monk: [
        "    ####    ",
        "  ########  ",
        "  #..##..#  ",
        "   ######   ",
        "    ####    ",
        "  ########  ",
        " ########## ",
        "#### G  ####",
        "### GGG  ###",
        "  ########  ",
        "  ########  ",
        "  ###  ###  "
    ],
    musketeer: [
        "  ########  ",
        " ########## ",
        "     ####   ",
        "    #.##.#  ",
        "   ######   ",
        "  ########  ",
        " ####..#### ",
        "####....####",
        "###  ..  ###",
        "   ######   ",
        "   ##  ##   ",
        "  ###  ###  "
    ],
    husita: [
        "    ....    ",
        "   ......   ",
        "  ........  ",
        "   #.##.#   ",
        "   ######   ",
        "  RRRRRRRR  ",
        " RRRRGGGRRR ",
        "RRRR G G RRR",
        "RRR  GGG RRR",
        "   ######   ",
        "   ##  ##   ",
        "  ###  ###  "
    ]
};

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
 * View-компонент отрисовки на HTML5 Canvas с поддержкой мульти-форматных фонов (16:9, 4:3, 3:4, 9:16)
 * и отдельных независимых спрайтов НПС с попиксельной контурной подсветкой (MVP View)
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

    constructor(canvasId = 'view', hotspots: GuildHotspot[] = []) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.initBackgrounds();
        this.initNpcCutoutSprites(hotspots);
    }

    private initBackgrounds(): void {
        const urls: Record<TavernBgPresetKey, string> = {
            '16x9': 'backgrounds/tavern_bg_16x9.png',
            '4x3':  'backgrounds/tavern_bg_4x3.png',
            '3x4':  'backgrounds/tavern_bg_3x4.png',
            '9x16': 'backgrounds/tavern_bg_9x16.png'
        };
        (Object.keys(urls) as TavernBgPresetKey[]).forEach(key => {
            const entry = this.bgImages[key];
            entry.img.onload = () => {
                entry.loaded = true;
            };
            entry.img.src = urls[key];
        });
    }

    /**
     * Определяет оптимальный размер фона под текущее соотношение сторон окна/телефона (Landscape / Portrait)
     */
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
    }

    /**
     * Загружает отдельные cutout-спрайты для всех 5 НПС/объектов таверны
     * и генерирует для каждого золотой контур (Sprite Outline + Highlight) по форме самого спрайта
     */
    private initNpcCutoutSprites(hotspots: GuildHotspot[]): void {
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
                // Читаем альфа-маску спрайта для точного попадания мышью и контурного свечения
                const tmp = document.createElement('canvas');
                tmp.width = W;
                tmp.height = H;
                const tctx = tmp.getContext('2d')!;
                tctx.drawImage(img, 0, 0);
                const imgData = tctx.getImageData(0, 0, W, H);
                layer.alphaData = imgData.data;

                // Создаем золотой силуэт для контурной обводки спрайта (как в изометрических RPG / Unity Sprite Outline)
                const sil = document.createElement('canvas');
                sil.width = W;
                sil.height = H;
                const sctx = sil.getContext('2d')!;
                sctx.drawImage(img, 0, 0);
                sctx.globalCompositeOperation = 'source-in';
                sctx.fillStyle = '#ffd700';
                sctx.fillRect(0, 0, W, H);

                // Рисуем контур толщиной 4px вокруг реального силуэта спрайта
                const offsets = [
                    [-4, 0], [4, 0], [0, -4], [0, 4],
                    [-3, -3], [3, -3], [-3, 3], [3, 3]
                ];
                offsets.forEach(([ox, oy]) => {
                    gctx.drawImage(sil, 4 + ox, 4 + oy);
                });

                // Поверх золотого контура рисуем сам спрайт с легким теплым высветлением
                gctx.drawImage(img, 4, 4);
                gctx.save();
                gctx.globalCompositeOperation = 'source-atop';
                gctx.fillStyle = 'rgba(255, 220, 90, 0.22)';
                gctx.fillRect(4, 4, W, H);
                gctx.restore();

                layer.loaded = true;
            };
            img.src = h.spriteUrl;
        });
    }

    /**
     * Попиксельная проверка попадания курсора/касания в непрозрачный пиксель отдельного спрайта НПС
     * с учетом активного размера фона (16:9, 4:3, 3:4, 9:16)
     */
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

    public drawSprite(key: string, cx: number, cy: number, scale: number, mainColor = '#fff', dead = false, flash = false): void {
        const grid = SPRITES[key];
        if (!grid) return;
        const size = 12;
        const sx = Math.floor(cx - (size * scale) / 2);
        const sy = Math.floor(cy - (size * scale) / 2);

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const ch = grid[r][c];
                if (ch === ' ') continue;
                if (flash) this.ctx.fillStyle = '#fff';
                else if (dead) this.ctx.fillStyle = '#554444';
                else if (ch === '#') this.ctx.fillStyle = mainColor;
                else if (ch === '.') this.ctx.fillStyle = '#ccc';
                else if (ch === 'G') this.ctx.fillStyle = '#ffd700';
                else if (ch === 'R') this.ctx.fillStyle = '#cc3333';

                if (dead) {
                    this.ctx.fillRect(sx + r * scale, sy + (size - c) * scale * 0.6 + 12, scale, scale);
                } else {
                    this.ctx.fillRect(sx + c * scale, sy + r * scale, scale, scale);
                }
            }
        }
    }

    public renderFrame(state: GameStateModel): void {
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (state.shake > 0) {
            ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
            state.shake *= 0.85;
            if (state.shake < 0.5) state.shake = 0;
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

    private static sharedSprites: Record<string, HTMLImageElement> = {};

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
            this.drawDetailedTavernArt(state.frame);
        }

        // Отрисовка каждого отдельного независимого спрайта НПС поверх нового чистого фона таверны
        for (const h of state.guildHotspots) {
            const layer = this.npcLayers[h.id];
            if (!layer || !layer.loaded) continue;
            const p = state.getActiveHotspotPlacement(h);
            const scaleX = this.canvas.width / p.bgW;
            const scaleY = this.canvas.height / p.bgH;

            // Мягкая тень на каменном полу под столом наемников и вербовщиком
            if (h.id === 'mercs' || h.id === 'verbirz') {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
                ctx.beginPath();
                const cx = (p.srcX + p.srcW * 0.5) * scaleX;
                const cy = (p.srcY + p.srcH * 0.93) * scaleY;
                const rx = (p.srcW * (h.id === 'mercs' ? 0.46 : 0.36)) * scaleX;
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

        // Подсветка контура самого спрайта при наведении
        if (state.hoveredHotspot) {
            const h = state.hoveredHotspot;
            const layer = this.npcLayers[h.id];
            const p = state.getActiveHotspotPlacement(h);
            const scaleX = this.canvas.width / p.bgW;
            const scaleY = this.canvas.height / p.bgH;

            ctx.save();
            if (layer && layer.loaded) {
                const padX = (4 / layer.w) * p.srcW;
                const padY = (4 / layer.h) * p.srcH;
                const dx = (p.srcX - padX) * scaleX;
                const dy = (p.srcY - padY) * scaleY;
                const dw = (p.srcW + padX * 2) * scaleX;
                const dh = (p.srcH + padY * 2) * scaleY;
                ctx.drawImage(layer.glowCanvas, dx, dy, dw, dh);
            }

            // Всплывающая табличка с названием над подсвеченным спрайтом
            ctx.font = 'bold 12px Courier New';
            const tw = ctx.measureText(h.title).width + 16;
            const centerCanvasX = (p.srcX + p.srcW * 0.5) * scaleX;
            const topCanvasY = p.srcY * scaleY;
            const tx = this.clamp(centerCanvasX - tw / 2, 6, this.canvas.width - tw - 6);
            const ty = this.clamp(topCanvasY - 22, 4, this.canvas.height - 24);

            ctx.fillStyle = 'rgba(18, 13, 9, 0.94)';
            ctx.fillRect(tx, ty, tw, 20);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(tx, ty, tw, 20);

            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.fillText(h.title, tx + tw / 2, ty + 14);
            ctx.restore();
        }
    }

    private drawDetailedTavernArt(frame: number): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#26211d'; ctx.fillRect(0, 0, 520, 118);
        ctx.fillStyle = '#2d2823'; ctx.fillRect(0, 142, 520, 148);
        ctx.fillStyle = (frame % 24 < 12) ? '#ffd700' : '#fff394';
        ctx.fillRect(439, 74, 4, 4);
    }

    public drawMapScene(state: GameStateModel): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#c8b082';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = '#5c4028'; ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, this.canvas.width - 8, this.canvas.height - 8);

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
    }

    public drawCombatScene(state: GameStateModel): void {
        const ctx = this.ctx;
        const combat = state.combat;
        ctx.fillStyle = '#0d0907';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.strokeStyle = '#c69c6d'; ctx.lineWidth = 4;
        ctx.strokeRect(20, 30, this.canvas.width - 40, this.canvas.height - 52);
        ctx.strokeStyle = '#5c3d22'; ctx.lineWidth = 2;
        ctx.strokeRect(26, 36, this.canvas.width - 52, this.canvas.height - 64);

        ctx.fillStyle = '#1f1610';
        ctx.fillRect(28, 38, this.canvas.width - 56, this.canvas.height - 68);
        ctx.fillStyle = '#2b2017';
        ctx.fillRect(28, 175, this.canvas.width - 56, 48);

        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
        const buffInfo = combat.psaKrevBuffTurns > 0 ? ` | 🔥 ПСЯ КРЕВ (${combat.psaKrevBuffTurns} х.)` : '';
        ctx.fillText((combat.paused ? '=== ТАКТИЧЕСКАЯ ПАУЗА ===' : '=== АВТО-БОЙ (Кликни на Героя или Врага) ===') + buffInfo, this.canvas.width / 2, 19);

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

            if (combat.selectedHeroId === h.id) {
                ctx.strokeStyle = '#66ff66'; ctx.lineWidth = 1.5;
                ctx.strokeRect(baseX - 24, baseY - 22, 48, 46);
            }

            this.drawSprite(h.sprite, baseX, baseY + bob, 3, h.color, h.hp <= 0, h.flash > 0);
            if (h.flash > 0) h.flash--;

            this.drawUnitBar(baseX, baseY - 26, h.hp, h.maxHp, h.tempHp || 0, '#55cc55', h.name);
        });

        combat.enemies.forEach((e, idx) => {
            let baseX = 395 - (idx % 2) * 38;
            const baseY = 95 + idx * 54;
            if (e.lunge > 0) { baseX -= 14; e.lunge--; }
            const bob = e.hp > 0 ? Math.sin(state.frame * 0.12 + idx + 2) * 2 : 0;
            e.x = baseX; e.y = baseY;

            if (combat.focusEnemyIndex === idx && e.hp > 0) {
                ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5;
                ctx.strokeRect(baseX - 24, baseY - 22, 48, 46);
            }

            this.drawSprite(e.sprite, baseX, baseY + bob, 3, e.color, e.hp <= 0, e.flash > 0);
            if (e.flash > 0) e.flash--;

            const title = e.isSuperReadyNextTurn ? '!! СУПЕР !!' : e.name;
            this.drawUnitBar(baseX, baseY - 26, e.hp, e.maxHp, 0, '#dd4444', title);
        });
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
        const cv = document.getElementById('doll-canvas') as HTMLCanvasElement | null;
        if (!cv) return;
        const c = cv.getContext('2d')!;
        c.clearRect(0, 0, cv.width, cv.height);

        const cx = Math.floor(cv.width / 2);
        const cy = Math.floor(cv.height / 2);

        c.strokeStyle = 'rgba(198, 156, 109, 0.28)';
        c.lineWidth = 1.2;
        c.beginPath(); c.arc(cx, cy, 44, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(cx, 6); c.lineTo(cx, cv.height - 6); c.moveTo(8, cy); c.lineTo(cv.width - 8, cy); c.stroke();

        c.fillStyle = 'rgba(122, 82, 48, 0.25)';
        c.fillRect(cx - 11, 12, 22, 18);
        c.fillRect(cx - 18, 32, 36, 36);
        c.fillRect(cx - 27, 34, 8, 30);
        c.fillRect(cx + 19, 34, 8, 30);
        c.fillRect(cx - 15, 70, 12, 28);
        c.fillRect(cx + 3, 70, 12, 28);

        const grid = SPRITES[h.sprite] || SPRITES.szlachta;
        const scale = 6;
        const sx = Math.floor(cx - (12 * scale) / 2);
        const sy = Math.floor(cy - (12 * scale) / 2 + 2);
        for (let r = 0; r < 12; r++) {
            for (let col = 0; col < 12; col++) {
                const ch = grid[r][col];
                if (ch === ' ') continue;
                if (ch === '#') c.fillStyle = h.color;
                else if (ch === '.') c.fillStyle = '#ccc';
                else if (ch === 'G') c.fillStyle = '#ffd700';
                else if (ch === 'R') c.fillStyle = '#cc3333';
                c.fillRect(sx + col * scale, sy + r * scale, scale, scale);
            }
        }
    }

    public static drawNpcAvatar(sec: string): void {
        const cv = document.getElementById('npc-avatar') as HTMLCanvasElement | null;
        if (!cv) return;
        const c = cv.getContext('2d')!;
        c.clearRect(0, 0, 72, 72);
        c.fillStyle = '#140d08';
        c.fillRect(0, 0, 72, 72);

        const spriteMap: Record<string, { url: string; sx: number; sy: number; sw: number; sh: number }> = {
            host:    { url: 'sprites/npc_host.png',    sx: 18,  sy: 4,   sw: 126, sh: 126 },
            verbirz: { url: 'sprites/npc_verbirz.png', sx: 22,  sy: 0,   sw: 128, sh: 128 },
            clinic:  { url: 'sprites/npc_clinic.png',  sx: 175, sy: 132, sw: 135, sh: 135 },
            mercs:   { url: 'sprites/npc_mercs.png',   sx: 105, sy: 5,   sw: 145, sh: 145 },
            quests:  { url: 'sprites/npc_quests.png',  sx: 20,  sy: 15,  sw: 200, sh: 200 }
        };

        const cfg = spriteMap[sec];
        if (!cfg) return;

        let img = CanvasRendererView.sharedSprites[sec];
        if (!img) {
            img = new Image();
            img.src = cfg.url;
            CanvasRendererView.sharedSprites[sec] = img;
        }

        const renderPortrait = () => {
            const targetCv = document.getElementById('npc-avatar') as HTMLCanvasElement | null;
            if (!targetCv) return;
            const tc = targetCv.getContext('2d')!;
            tc.fillStyle = '#18100a';
            tc.fillRect(0, 0, 72, 72);
            tc.drawImage(img, cfg.sx, cfg.sy, cfg.sw, cfg.sh, 2, 2, 68, 68);
        };

        if (img.complete && img.naturalWidth > 0) {
            renderPortrait();
        } else {
            img.onload = renderPortrait;
        }
    }
}
