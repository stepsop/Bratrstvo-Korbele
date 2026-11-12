/**
 * Отрисовщик декоративной дубовой рамы и углового индикатора паузы на Canvas (SRP)
 */
export class WoodenFrameDrawer {
    public static drawWoodenFrame(ctx: CanvasRenderingContext2D, W: number, H: number): void {
        const s = Math.max(1, Math.round(Math.min(W / 520, H / 290)));
        const T = 9 * s;
        ctx.save();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.lineWidth = 3 * s;
        ctx.strokeRect(T + 1.5 * s, T + 1.5 * s, W - (T + 1.5 * s) * 2, H - (T + 1.5 * s) * 2);

        ctx.fillStyle = '#4a2f1b';
        ctx.fillRect(0, 0, W, T);
        ctx.fillRect(0, H - T, W, T);
        ctx.fillRect(0, T, T, H - T * 2);
        ctx.fillRect(W - T, T, T, H - T * 2);

        ctx.fillStyle = '#382212';
        ctx.fillRect(T, 3 * s, W - T * 2, 2 * s);
        ctx.fillRect(T, 6 * s, W - T * 2, 1 * s);
        ctx.fillRect(T, H - 6 * s, W - T * 2, 2 * s);
        ctx.fillRect(T, H - 3 * s, W - T * 2, 1 * s);

        ctx.fillRect(3 * s, T, 2 * s, H - T * 2);
        ctx.fillRect(6 * s, T, 1 * s, H - T * 2);
        ctx.fillRect(W - 6 * s, T, 2 * s, H - T * 2);
        ctx.fillRect(W - 3 * s, T, 1 * s, H - T * 2);

        ctx.fillStyle = '#6e472b';
        ctx.fillRect(T, 1 * s, W - T * 2, 1 * s);
        ctx.fillRect(T, H - T + 1 * s, W - T * 2, 1 * s);
        ctx.fillRect(1 * s, T, 1 * s, H - T * 2);
        ctx.fillRect(W - T + 1 * s, T, 1 * s, H - T * 2);

        ctx.fillStyle = '#24150a';
        const topBottomJoints = [0.18, 0.38, 0.62, 0.82].map(r => Math.round(W * r));
        for (const jx of topBottomJoints) {
            ctx.fillRect(jx, 0, 2 * s, T);
            ctx.fillRect(jx, H - T, 2 * s, T);
            ctx.fillStyle = '#6e472b';
            ctx.fillRect(jx + 2 * s, 1 * s, 1 * s, T - 2 * s);
            ctx.fillRect(jx + 2 * s, H - T + 1 * s, 1 * s, T - 2 * s);
            ctx.fillStyle = '#24150a';
        }

        const sideJoints = [0.26, 0.50, 0.74].map(r => Math.round(H * r));
        for (const jy of sideJoints) {
            ctx.fillRect(0, jy, T, 2 * s);
            ctx.fillRect(W - T, jy, T, 2 * s);
            ctx.fillStyle = '#6e472b';
            ctx.fillRect(1 * s, jy + 2 * s, T - 2 * s, 1 * s);
            ctx.fillRect(W - T + 1 * s, jy + 2 * s, T - 2 * s, 1 * s);
            ctx.fillStyle = '#24150a';
        }

        ctx.strokeStyle = '#1f1209';
        ctx.lineWidth = 1.5 * s;
        ctx.strokeRect(0.75 * s, 0.75 * s, W - 1.5 * s, H - 1.5 * s);

        ctx.strokeStyle = '#7c5333';
        ctx.lineWidth = 1 * s;
        ctx.strokeRect(T - 0.5 * s, T - 0.5 * s, W - T * 2 + 1 * s, H - T * 2 + 1 * s);

        const cornerLen = 18 * s;
        const corners = [
            { x: 0, y: 0, dx: 1, dy: 1 },
            { x: W, y: 0, dx: -1, dy: 1 },
            { x: 0, y: H, dx: 1, dy: -1 },
            { x: W, y: H, dx: -1, dy: -1 }
        ];

        for (const c of corners) {
            ctx.fillStyle = '#2d2926';
            const hx = c.dx === 1 ? 0 : W - cornerLen;
            const hy = c.dy === 1 ? 0 : H - T;
            ctx.fillRect(hx, hy, cornerLen, T);

            const vx = c.dx === 1 ? 0 : W - T;
            const vy = c.dy === 1 ? 0 : H - cornerLen;
            ctx.fillRect(vx, vy, T, cornerLen);

            ctx.strokeStyle = '#59514a';
            ctx.lineWidth = 1 * s;
            ctx.strokeRect(
                c.dx === 1 ? 0.5 * s : W - T + 0.5 * s,
                c.dy === 1 ? 0.5 * s : H - T + 0.5 * s,
                T - 1 * s,
                T - 1 * s
            );

            ctx.fillStyle = '#d4a24c';
            const rx1 = c.dx === 1 ? 4 * s : W - 5 * s;
            const ry1 = c.dy === 1 ? 4 * s : H - 5 * s;
            const rx2 = c.dx === 1 ? 13 * s : W - 14 * s;
            const ry2 = c.dy === 1 ? 13 * s : H - 14 * s;

            ctx.fillRect(rx1, ry1, 2 * s, 2 * s);
            ctx.fillRect(rx2, ry1, 2 * s, 2 * s);
            ctx.fillRect(rx1, ry2, 2 * s, 2 * s);
        }

        ctx.restore();
    }

    public static drawCombatPauseCornerIcon(ctx: CanvasRenderingContext2D, W: number, paused: boolean, frame: number): void {
        const bx = W - 46;
        const by = 13;
        const bw = 32;
        const bh = 32;

        ctx.save();

        if (paused) {
            const pulse = 0.55 + Math.sin(frame * 0.12) * 0.25;
            ctx.shadowColor = `rgba(255, 215, 0, ${pulse})`;
            ctx.shadowBlur = 10;
        }

        const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
        if (paused) {
            grad.addColorStop(0, '#4a3216');
            grad.addColorStop(1, '#241608');
        } else {
            grad.addColorStop(0, '#2a2018');
            grad.addColorStop(1, '#140f0b');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(bx, by, bw, bh);

        ctx.strokeStyle = paused ? '#ffd700' : '#8c6b3f';
        ctx.lineWidth = paused ? 2 : 1.5;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 2, by + 2, bw - 4, bh - 4);

        ctx.fillStyle = paused ? '#ffd700' : '#9c7a4c';
        ctx.fillRect(bx + 2, by + 2, 2, 2);
        ctx.fillRect(bx + bw - 4, by + 2, 2, 2);
        ctx.fillRect(bx + 2, by + bh - 4, 2, 2);
        ctx.fillRect(bx + bw - 4, by + bh - 4, 2, 2);

        ctx.shadowBlur = 0;
        ctx.fillStyle = paused ? '#ffd700' : '#c8b08a';
        ctx.fillRect(bx + 9, by + 6, 5, 13);
        ctx.fillRect(bx + 18, by + 6, 5, 13);

        ctx.font = 'bold 7px Courier New';
        ctx.textAlign = 'center';
        ctx.fillStyle = paused ? '#ffd700' : '#a89984';
        ctx.fillText('SPACE', bx + bw / 2, by + 28);

        ctx.restore();
    }
}
