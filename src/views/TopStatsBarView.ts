import { GameStateModel } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';
import { uiIcon } from './UiIconHelper';

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
    private isClinicPopupOpen: boolean = false;
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
        const clinicTrackerEl = document.getElementById('st-clinic-tracker');

        if (goldEl) {
            goldEl.innerHTML = `${uiIcon('coins_stack', 'ui-icon-sm')} Гроши: <span class="hl-gold">${state.gold}</span>`;
        }

        const orders = this.groupActiveWarOrders(state);
        const clinicHeroes = state.party.filter(h => h.status === 'clinic');

        if (warTrackerEl) {
            warTrackerEl.innerHTML = `
                <span class="war-tracker-label">${uiIcon('crossed_swords', 'ui-icon-sm')} Активных заказов:</span>
                <span class="${orders.length > 0 ? 'hl-gold' : 'war-tracker-zero'}">${orders.length}</span>
                <span class="war-tracker-caret">${this.isPopupOpen ? '▴' : '▾'}</span>
            `;
            warTrackerEl.classList.toggle('active-open', this.isPopupOpen);
        }

        if (clinicTrackerEl) {
            clinicTrackerEl.innerHTML = `
                <span class="war-tracker-label">${uiIcon('heal_cross', 'ui-icon-sm')} На лечении:</span>
                <span class="${clinicHeroes.length > 0 ? 'hl-gold' : 'war-tracker-zero'}">${clinicHeroes.length}</span>
                <span class="war-tracker-caret">${this.isClinicPopupOpen ? '▴' : '▾'}</span>
            `;
            clinicTrackerEl.classList.toggle('active-open', this.isClinicPopupOpen);
        }

        this.renderWarPopup(orders);
        this.renderClinicPopup(clinicHeroes);
    }

    public togglePopup(state: GameStateModel, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        this.isPopupOpen = !this.isPopupOpen;
        if (this.isPopupOpen) {
            this.isClinicPopupOpen = false;
        }
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

    public toggleClinicPopup(state: GameStateModel, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        this.isClinicPopupOpen = !this.isClinicPopupOpen;
        if (this.isClinicPopupOpen) {
            this.isPopupOpen = false;
        }
        this.renderStats(state);
    }

    public closeClinicPopup(state: GameStateModel, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isClinicPopupOpen) return;
        this.isClinicPopupOpen = false;
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
                            <span class="war-popup-quest-name">${uiIcon('scroll', 'ui-icon-xs')} ${order.name}</span>
                            <span class="war-popup-timer-badge">${uiIcon('hourglass', 'ui-icon-xs')} Ещё ${order.timer} ц.</span>
                        </div>
                        <div class="war-popup-card-heroes">
                            <span class="war-popup-sub-label">Кто на задании:</span> ${heroesText}
                        </div>
                    </div>
                `;
            }).join('');

        popupEl.innerHTML = `
            <div class="war-popup-header">
                <span class="war-popup-title">${uiIcon('crossed_swords', 'ui-icon-xs')} Заказные задания (${orders.length})</span>
                <button class="war-popup-close-btn" onclick="closeWarTrackerPopup(event)">${uiIcon('close', 'ui-icon-xs')}</button>
            </div>
            <div class="war-popup-body">
                ${cardsHtml}
            </div>
        `;
    }

    private renderClinicPopup(clinicHeroes: HeroModel[]): void {
        const popupEl = document.getElementById('clinic-tracker-popup');
        if (!popupEl) return;

        if (!this.isClinicPopupOpen) {
            popupEl.style.display = 'none';
            return;
        }

        popupEl.style.display = 'flex';

        const cardsHtml = clinicHeroes.length === 0
            ? `<div class="war-popup-empty">В палатах сейчас никого нет. Отправить раненых на перевязку можно к сестре Берте.</div>`
            : clinicHeroes.map(h => {
                const mastery = h.getMasteryTier();
                const treatmentDesc = h.injuries.length > 0
                    ? `<span class="hl-red">Снятие травм: ${h.injuries.join(', ')}</span>`
                    : `<span class="hl-green">Перевязка ран (ХП ${h.hp}/${h.maxHp})</span>`;
                return `
                    <div class="war-popup-card mastery-${mastery.key}">
                        <div class="war-popup-card-top">
                            <span class="war-popup-quest-name">${uiIcon('heal_cross', 'ui-icon-xs')} ${h.name} <span style="font-weight:normal; color:#c8b8a6;">(${h.cls}, Ур.${h.lvl})</span></span>
                            <span class="war-popup-timer-badge">${uiIcon('hourglass', 'ui-icon-xs')} Ещё ${h.timer} ц.</span>
                        </div>
                        <div class="war-popup-card-heroes">
                            <span class="war-popup-sub-label">Лечение:</span> ${treatmentDesc}
                        </div>
                    </div>
                `;
            }).join('');

        popupEl.innerHTML = `
            <div class="war-popup-header">
                <span class="war-popup-title">${uiIcon('heal_cross', 'ui-icon-xs')} Палаты сестры Берты (${clinicHeroes.length})</span>
                <button class="war-popup-close-btn" onclick="closeClinicTrackerPopup(event)">${uiIcon('close', 'ui-icon-xs')}</button>
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
            if (!this.isPopupOpen && !this.isClinicPopupOpen) return;
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (
                target.closest('#war-tracker-popup') ||
                target.closest('#st-war-tracker') ||
                target.closest('#clinic-tracker-popup') ||
                target.closest('#st-clinic-tracker')
            ) {
                return;
            }
            const w = window as unknown as Record<string, (ev?: Event) => void>;
            if (this.isPopupOpen && typeof w.closeWarTrackerPopup === 'function') {
                w.closeWarTrackerPopup();
            }
            if (this.isClinicPopupOpen && typeof w.closeClinicTrackerPopup === 'function') {
                w.closeClinicTrackerPopup();
            }
        });
    }

    public updateSceneLayout(state: GameStateModel): void {
        const gameContainer = document.getElementById('game-container') as HTMLElement | null;
        const statsBarEl = document.getElementById('stats-bar') as HTMLElement | null;
        const warPopupEl = document.getElementById('war-tracker-popup') as HTMLElement | null;
        const clinicPopupEl = document.getElementById('clinic-tracker-popup') as HTMLElement | null;
        const vp = document.getElementById('viewport-container') as HTMLElement | null;
        const logEl = document.getElementById('log-container') as HTMLElement | null;
        const controlsEl = document.getElementById('controls') as HTMLElement | null;
        if (gameContainer) {
            gameContainer.classList.toggle('guild-scene-active', state.scene === 'guild');
            gameContainer.classList.toggle('combat-scene-active', state.scene === 'combat');
        }
        if (statsBarEl) {
            const showStatsBar = state.scene === 'guild';
            statsBarEl.style.display = showStatsBar ? 'flex' : 'none';
            if (!showStatsBar) {
                this.isPopupOpen = false;
                this.isClinicPopupOpen = false;
                if (warPopupEl) warPopupEl.style.display = 'none';
                if (clinicPopupEl) clinicPopupEl.style.display = 'none';
            }
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
            vp.style.flex = '1 1 0%';
            vp.style.height = 'auto';
            vp.style.maxHeight = 'none';
            vp.style.borderBottom = '3px solid #7a5230';
        }

        this.updateMapActionOverlay(state);
    }

    public updateMapActionOverlay(state: GameStateModel): void {
        const el = document.getElementById('map-action-overlay') as HTMLElement | null;
        if (!el) return;

        if (state.scene !== 'map') {
            el.style.display = 'none';
            return;
        }

        el.style.display = 'flex';
        const ms = state.mapState;
        const q = state.activeQuest;
        const questTitle = q ? q.title : 'Поход в Богемию';
        const questLoc = q ? q.location : 'Богемия';
        const questDesc = q?.desc || 'Отряд движется по королевскому тракту к цели.';

        if (ms.encounterPending === 'ambush') {
            el.innerHTML = `
                <div class="map-action-card map-alert-ambush">
                    <div class="map-action-texts">
                        <div class="map-action-title">${uiIcon('alert', 'ui-icon-sm')} НА ВАС НАПАЛИ НА ТРАКТЕ!</div>
                        <div class="map-action-sub">На полпути к «${questLoc}» дорогу преградила шайка мародёров!</div>
                    </div>
                    <button class="map-action-btn ambush-btn" onclick="confirmMapEncounter()">${uiIcon('crossed_swords', 'ui-icon-sm')} В БОЙ!</button>
                </div>
            `;
            return;
        }

        if (ms.encounterPending === 'quest') {
            el.innerHTML = `
                <div class="map-action-card map-alert-quest">
                    <div class="map-action-texts">
                        <div class="map-action-title">${uiIcon('flag', 'ui-icon-sm')} ВЫ ДОШЛИ ДО ТОЧКИ: ${questLoc}</div>
                        <div class="map-action-sub">«${questTitle}» — ${questDesc}</div>
                    </div>
                    <button class="map-action-btn quest-btn" onclick="confirmMapEncounter()">${uiIcon('crossed_swords', 'ui-icon-sm')} В БОЙ!</button>
                </div>
            `;
            return;
        }

        if (ms.encounterPending === 'guild') {
            el.innerHTML = `
                <div class="map-action-card map-alert-guild">
                    <div class="map-action-texts">
                        <div class="map-action-title">${uiIcon('castle', 'ui-icon-sm')} ВЫ ВЕРНУЛИСЬ В ПРАГУ</div>
                        <div class="map-action-sub">Отряд благополучно добрался до родной таверны «Bratrstvo».</div>
                    </div>
                    <button class="map-action-btn guild-btn" onclick="confirmMapEncounter()">${uiIcon('beer', 'ui-icon-sm')} В ТАВЕРНУ</button>
                </div>
            `;
            return;
        }

        const marchTitle = ms.dir === 'to_quest'
            ? `${uiIcon('crossed_swords', 'ui-icon-sm')} Поход: «${questTitle}» → ${questLoc}`
            : `${uiIcon('tavern', 'ui-icon-sm')} Возвращение в Прагу из «${questLoc}»`;
        const marchSub = ms.dir === 'to_quest'
            ? `Цель: ${questDesc}`
            : `Задание «${questTitle}» выполнено — отряд возвращается домой.`;

        el.innerHTML = `
            <div class="map-action-card">
                <div class="map-action-texts">
                    <div class="map-action-title">${marchTitle}</div>
                    <div class="map-action-sub">${marchSub}</div>
                </div>
            </div>
        `;
    }
}
