import { GameStateModel } from '../models/GameStateModel';
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

/**
 * View-компонент отрисовки на HTML5 Canvas (аналог View / SpriteRenderer в Unity)
 */
export class CanvasRendererView {
    public readonly canvas: HTMLCanvasElement;
    public readonly ctx: CanvasRenderingContext2D;
    private bgImage = new Image();
    private bgLoaded = false;
    private cleanBgCanvas = document.createElement('canvas');
    private cleanBgCtx = this.cleanBgCanvas.getContext('2d')!;

    constructor(canvasId = 'view') {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.initBackground();
    }

    private initBackground(): void {
        this.bgImage.onload = () => {
            const W = this.bgImage.naturalWidth || 1200;
            const H = this.bgImage.naturalHeight || 896;
            this.cleanBgCanvas.width = W;
            this.cleanBgCanvas.height = H;
            this.cleanBgCtx.drawImage(this.bgImage, 0, 0, W, H);

            const sx = W / 1200, sy = H / 896;
            this.cleanBgCtx.drawImage(this.bgImage, 320*sx, 14*sy, 80*sx, 75*sy, 152*sx, 6*sy, 82*sx, 80*sy);
            this.cleanBgCtx.drawImage(this.bgImage, 320*sx, 14*sy, 80*sx, 75*sy, 234*sx, 6*sy, 80*sx, 80*sy);
            this.cleanBgCtx.drawImage(this.bgImage, 480*sx, 38*sy, 134*sx, 52*sy, 616*sx, 38*sy, 134*sx, 52*sy);
            this.cleanBgCtx.drawImage(this.bgImage, 966*sx, 80*sy, 110*sx, 70*sy, 966*sx, 152*sy, 112*sx, 80*sy);
            this.cleanBgCtx.drawImage(this.bgImage, 966*sx, 80*sy, 110*sx, 70*sy, 1078*sx, 152*sy, 110*sx, 80*sy);
            this.cleanBgCtx.drawImage(this.bgImage, 40*sx, 550*sy, 228*sx, 26*sy, 40*sx, 579*sy, 228*sx, 25*sy);
            this.cleanBgCtx.drawImage(this.bgImage, 40*sx, 630*sy, 228*sx, 26*sy, 40*sx, 604*sy, 228*sx, 25*sy);
            this.cleanBgCtx.drawImage(this.bgImage, 520*sx, 414*sy, 94*sx, 42*sy, 1017*sx, 414*sy, 96*sx, 42*sy);
            this.cleanBgCtx.drawImage(this.bgImage, 944*sx, 372*sy, 73*sx, 24*sy, 944*sx, 414*sy, 73*sx, 34*sy);

            this.bgLoaded = true;
        };
        this.bgImage.src = 'guild_bg.png';
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

    public drawGuildScene(state: GameStateModel): void {
        const ctx = this.ctx;
        if (this.bgLoaded) {
            ctx.drawImage(this.cleanBgCanvas, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.drawDetailedTavernArt(state.frame);
        }

        if (state.hoveredHotspot) {
            const h = state.hoveredHotspot;
            ctx.save();
            ctx.fillStyle = 'rgba(255, 215, 0, 0.14)';
            ctx.fillRect(h.x, h.y, h.w, h.h);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(h.x, h.y, h.w, h.h);

            ctx.font = 'bold 13px Courier New';
            const tw = ctx.measureText(h.title).width + 18;
            const tx = this.clamp(h.labelX - tw / 2, 6, this.canvas.width - tw - 6);
            const ty = Math.max(6, h.labelY - 12);

            ctx.fillStyle = 'rgba(18, 14, 11, 0.92)';
            ctx.fillRect(tx, ty, tw, 22);
            ctx.strokeStyle = '#c69c6d';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(tx, ty, tw, 22);

            ctx.fillStyle = '#f5ebd6';
            ctx.textAlign = 'center';
            ctx.fillText(h.title, tx + tw / 2, ty + 15);
            ctx.restore();
        }
    }

    private drawDetailedTavernArt(frame: number): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#26211d'; ctx.fillRect(0, 0, 520, 118);
        ctx.fillStyle = '#2d2823'; ctx.fillRect(0, 142, 520, 148);

        ctx.strokeStyle = '#171310'; ctx.lineWidth = 1;
        for (let y = 0; y < 118; y += 14) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(520, y); ctx.stroke();
            const off = (Math.floor(y / 14) % 2) * 16;
            for (let x = off; x < 520; x += 32) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 14); ctx.stroke();
            }
        }
        for (let y = 145; y < 290; y += 18) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(520, y); ctx.stroke();
            const off = (Math.floor(y / 18) % 2) * 22;
            for (let x = off; x < 520; x += 44) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 18); ctx.stroke();
            }
        }

        ctx.fillStyle = '#332214'; ctx.fillRect(195, 26, 175, 76);
        ctx.strokeStyle = '#5c3c20'; ctx.lineWidth = 4; ctx.strokeRect(195, 26, 175, 76);
        ctx.fillStyle = '#734f2c'; ctx.fillRect(8, 114, 504, 16);
        ctx.fillStyle = '#472f18'; ctx.fillRect(8, 130, 504, 24);
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

        if (sec === 'host') {
            c.fillStyle = '#26180f'; c.fillRect(0, 0, 72, 72);
            c.fillStyle = '#4a2f18'; c.fillRect(16, 38, 40, 34);
            c.fillStyle = '#e0c9aa'; c.fillRect(24, 38, 24, 34);
            c.fillStyle = '#d4a379'; c.beginPath(); c.arc(36, 26, 16, 0, Math.PI*2); c.fill();
            c.fillStyle = '#22150c'; c.fillRect(20, 10, 32, 10);
            c.fillStyle = '#1a0d06'; c.fillRect(28, 28, 16, 6);
            c.fillStyle = '#fff'; c.fillRect(29, 29, 4, 4);
            c.fillStyle = '#ffd700'; c.fillRect(34, 29, 5, 5);
            c.fillStyle = '#c69c6d'; c.fillRect(50, 44, 16, 22);
            c.fillStyle = '#fff'; c.fillRect(50, 40, 16, 6);
        } else if (sec === 'clinic') {
            c.fillStyle = '#1c1713'; c.fillRect(0, 0, 72, 72);
            c.fillStyle = '#e8e2d8'; c.beginPath(); c.arc(36, 30, 24, 0, Math.PI*2); c.fill();
            c.fillStyle = '#d4a379'; c.beginPath(); c.arc(36, 34, 13, 0, Math.PI*2); c.fill();
            c.fillStyle = '#3a2b1f'; c.fillRect(30, 30, 3, 3); c.fillRect(39, 30, 3, 3);
            c.fillStyle = '#b03030';
            c.fillRect(34, 10, 4, 14); c.fillRect(29, 15, 14, 4);
            c.fillStyle = '#9e9689'; c.fillRect(16, 52, 40, 20);
        } else if (sec === 'mercs') {
            c.fillStyle = '#161311'; c.fillRect(0, 0, 72, 72);
            c.fillStyle = '#6b7278'; c.beginPath(); c.arc(36, 26, 18, 0, Math.PI, true); c.fill();
            c.fillRect(14, 24, 44, 6);
            c.fillStyle = '#d4a379'; c.fillRect(22, 28, 28, 22);
            c.fillStyle = '#3a1f18'; c.fillRect(22, 38, 28, 14);
            c.fillStyle = '#8b2020'; c.fillRect(28, 30, 2, 8);
            c.fillStyle = '#4f555c'; c.fillRect(14, 50, 44, 22);
        } else if (sec === 'verbirz') {
            c.fillStyle = '#220e0e'; c.fillRect(0, 0, 72, 72);
            c.fillStyle = '#7a7d82'; c.beginPath(); c.arc(36, 28, 15, 0, Math.PI*2); c.fill();
            c.fillStyle = '#d4a379'; c.beginPath(); c.arc(36, 29, 10, 0, Math.PI*2); c.fill();
            c.fillStyle = '#a82020'; c.fillRect(14, 44, 44, 28);
            c.fillStyle = '#ffd700'; c.lineWidth = 2; c.strokeRect(14, 44, 44, 28);
            c.fillStyle = '#fff'; c.fillRect(30, 52, 12, 12);
            c.fillStyle = '#fff'; c.fillRect(34, 48, 6, 4);
        } else if (sec === 'quests') {
            c.fillStyle = '#1f160e'; c.fillRect(0, 0, 72, 72);
            c.fillStyle = '#d9c6a3'; c.fillRect(12, 10, 48, 52);
            c.strokeStyle = '#5a3d24'; c.lineWidth = 2; c.strokeRect(12, 10, 48, 52);
            c.fillStyle = '#4a3b2c';
            c.fillRect(18, 20, 36, 2); c.fillRect(18, 26, 32, 2); c.fillRect(18, 32, 36, 2);
            c.fillStyle = '#8f1d1d'; c.beginPath(); c.arc(36, 50, 9, 0, Math.PI*2); c.fill();
        }
    }
}
