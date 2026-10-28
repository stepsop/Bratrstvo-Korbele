import { GameStateModel } from '../models/GameStateModel';

/**
 * View верхней панели ресурсов и переключения макета сцены (MVP View)
 */
export class TopStatsBarView {
    public renderStats(state: GameStateModel): void {
        const squadCount = state.party.filter(h => h.inSquad && h.status !== 'dead').length;
        const reserveCount = state.party.filter(h => !h.inSquad && h.status !== 'dead').length;

        const goldEl = document.getElementById('st-gold');
        const squadEl = document.getElementById('st-squad');
        const resEl = document.getElementById('st-reserve');
        const cycEl = document.getElementById('st-cycle');

        if (goldEl) goldEl.innerText = `Гроши: ${state.gold}`;
        if (squadEl) squadEl.innerText = `Отряд: ${squadCount}/5`;
        if (resEl) resEl.innerText = `Резерв: ${reserveCount}/15`;
        if (cycEl) cycEl.innerText = `Цикл: ${state.cycle}`;
    }

    public updateSceneLayout(state: GameStateModel): void {
        const vp = document.getElementById('viewport-container') as HTMLElement | null;
        const logEl = document.getElementById('log-container') as HTMLElement | null;
        const controlsEl = document.getElementById('controls') as HTMLElement | null;
        if (!vp || !logEl || !controlsEl) return;

        if (state.scene === 'guild' || state.scene === 'map') {
            logEl.style.display = 'none';
            controlsEl.style.display = 'none';
            vp.style.flex = '1 1 auto';
            vp.style.height = '100%';
            vp.style.maxHeight = 'none';
            vp.style.borderBottom = 'none';
        } else {
            logEl.style.display = 'block';
            controlsEl.style.display = 'flex';
            vp.style.flex = '1 1 58%';
            vp.style.height = '58vh';
            vp.style.maxHeight = '64vh';
            vp.style.borderBottom = '3px solid #7a5230';
        }
    }
}
