import { HeroModel } from '../models/HeroModel';

/**
 * Отрисовщик портретов НПС и куклы персонажа в модальных окнах (SRP)
 */
export class PortraitCanvasDrawer {
    private static sharedSprites: Record<string, HTMLImageElement> = {};

    public static drawPaperDollFigure(
        h: HeroModel,
        unitImages: Record<string, { img: HTMLImageElement; loaded: boolean }>
    ): void {
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

        const unitEntry = unitImages[h.sprite] || unitImages.szlachta;
        const renderImg = () => {
            const targetCv = document.getElementById('doll-canvas') as HTMLCanvasElement | null;
            if (!targetCv || !unitEntry || !unitEntry.img.naturalWidth) return;
            const tc = targetCv.getContext('2d')!;
            tc.clearRect(0, 0, targetCv.width, targetCv.height);
            tc.strokeStyle = 'rgba(198, 156, 109, 0.25)';
            tc.lineWidth = 1.2;
            tc.beginPath(); tc.arc(cx, cy, 44, 0, Math.PI * 2); tc.stroke();

            tc.save();
            tc.imageSmoothingEnabled = false;
            const maxH = targetCv.height - 8;
            const aspect = unitEntry.img.naturalWidth / unitEntry.img.naturalHeight;
            const drawH = maxH;
            const drawW = drawH * aspect;
            tc.drawImage(unitEntry.img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
            tc.restore();
        };

        if (unitEntry && unitEntry.loaded && unitEntry.img.naturalWidth > 0) {
            renderImg();
        } else if (unitEntry) {
            unitEntry.img.addEventListener('load', renderImg, { once: true });
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
            host:    { url: 'sprites/npc_host.png?v=3',    sx: 18,  sy: 4,   sw: 126, sh: 126 },
            verbirz: { url: 'sprites/npc_verbirz.png?v=3', sx: 22,  sy: 0,   sw: 128, sh: 128 },
            clinic:  { url: 'sprites/npc_clinic.png?v=3',  sx: 205, sy: 135, sw: 105, sh: 105 },
            mercs:   { url: 'sprites/npc_mercs.png?v=3',   sx: 150, sy: 8,   sw: 115, sh: 115 },
            quests:  { url: 'sprites/npc_quests.png?v=3',  sx: 20,  sy: 15,  sw: 200, sh: 200 }
        };

        const cfg = spriteMap[sec];
        if (!cfg) return;

        let img = PortraitCanvasDrawer.sharedSprites[sec];
        if (!img) {
            img = new Image();
            img.src = cfg.url;
            PortraitCanvasDrawer.sharedSprites[sec] = img;
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
