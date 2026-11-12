import { GameStateModel } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';

interface ActiveWarOrderGroup {
    name: string;
    colorKey: string;
    timer: number;
    heroes: HeroModel[];
}

/**
 * View верхней панели ресурсов, всплывающего окошка активных заказов и переключения макета сцены (MVP View)
 */
export class TopStatsBarView {
    private isPopupOpen: boolean = false;
    private outsideClickBound: boolean = false;

    private groupActiveWarOrders(state: GameStateModel): ActiveWarOrderGroup[] {
        const warHeroes = state.party.filter(h => h.status === 'war');
        const map = new Map<string, ActiveWarOrderGroup>();

        warHeroes.forEach(h => {
            const name = h.warContract?.name || 'Поход Вербовщика';
            const colorKey = h.warContract?.colorKey || 'grey';
            const key = `${name}__${h.timer}`;
            const existing = map.get(key);
            if (existing) {
                existing.heroes.push(h);
            } else {
                map.set(key, {
                    name,
                    colorKey,
                    timer: h.timer,
                    heroes: [h]
                });
            }
        });

        return Array.from(map.values());
    }

    public renderStats(state: GameStateModel): void {
        this.bindOutsideClickOnce();

        const goldEl = document.getElementById('st-gold');
        const warTrackerEl = document.getElementById('st-war-tracker');

        if (goldEl) {
            goldEl.innerHTML = `🪙 Гроши: <span class="hl-gold">${state.gold}</span>`;
        }

        const orders = this.groupActiveWarOrders(state);

        if (warTrackerEl) {
            warTrackerEl.innerHTML = `
                <span class="war-tracker-label">⚔️ Активных заказов:</span>
                <span class="${orders.length > 0 ? 'hl-gold' : 'war-tracker-zero'}">${orders.length}</span>
                <span class="war-tracker-caret">${this.isPopupOpen ? '▴' : '▾'}</span>
            `;
            warTrackerEl.classList.toggle('active-open', this.isPopupOpen);
        }

        this.renderWarPopup(orders);
    }

    public togglePopup(state: GameStateModel, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        this.isPopupOpen = !this.isPopupOpen;
        this.renderStats(state);
    }

    public closePopup(state: GameStateModel, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isPopupOpen) return;
        this.isPopupOpen = false;
        this.renderStats(state);
    }

    private renderWarPopup(orders: ActiveWarOrderGroup[]): void {
        const popupEl = document.getElementById('war-tracker-popup');
        if (!popupEl) return;

        if (!this.isPopupOpen) {
            popupEl.style.display = 'none';
            return;
        }

        popupEl.style.display = 'flex';

        const cardsHtml = orders.length === 0
            ? `<div class="war-popup-empty">Нет активных заказных заданий. Отправить бойцов можно у Королевского Вербовщика.</div>`
            : orders.map(order => {
                const heroesText = order.heroes.map(h => `<span class="war-popup-hero-chip"><b>${h.name}</b> (${h.cls})</span>`).join(' ');
                return `
                    <div class="war-popup-card mastery-${order.colorKey}">
                        <div class="war-popup-card-top">
                            <span class="war-popup-quest-name">📜 ${order.name}</span>
                            <span class="war-popup-timer-badge">⏳ Ещё ${order.timer} ц.</span>
                        </div>
                        <div class="war-popup-card-heroes">
                            <span class="war-popup-sub-label">Кто на задании:</span> ${heroesText}
                        </div>
                    </div>
                `;
            }).join('');

        popupEl.innerHTML = `
            <div class="war-popup-header">
                <span class="war-popup-title">⚔️ Заказные задания (${orders.length})</span>
                <button class="war-popup-close-btn" onclick="closeWarTrackerPopup(event)">✕</button>
            </div>
            <div class="war-popup-body">
                ${cardsHtml}
            </div>
        `;
    }

    private bindOutsideClickOnce(): void {
        if (this.outsideClickBound) return;
        this.outsideClickBound = true;

        document.addEventListener('click', (e) => {
            if (!this.isPopupOpen) return;
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (target.closest('#war-tracker-popup') || target.closest('#st-war-tracker')) {
                return;
            }
            const w = window as unknown as Record<string, (ev?: Event) => void>;
            if (typeof w.closeWarTrackerPopup === 'function') {
                w.closeWarTrackerPopup();
            }
        });
    }

    public updateSceneLayout(state: GameStateModel): void {
        const gameContainer = document.getElementById('game-container') as HTMLElement | null;
        const vp = document.getElementById('viewport-container') as HTMLElement | null;
        const logEl = document.getElementById('log-container') as HTMLElement | null;
        const controlsEl = document.getElementById('controls') as HTMLElement | null;
        if (gameContainer) {
            gameContainer.classList.toggle('guild-scene-active', state.scene === 'guild');
        }
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
