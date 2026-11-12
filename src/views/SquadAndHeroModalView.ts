import { GameStateModel } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';
import { HeroDetailModalView } from './HeroDetailModalView';

/**
 * View-компонент управления составом Отряда и Резерва (SRP: отвечает за доску Отряда/Резерва и делегирует осмотр бойца HeroDetailModalView)
 */
export class SquadAndHeroModalView {
    private modalOverlay = document.getElementById('modal-overlay')!;
    private modalContent = document.getElementById('modal-content')!;

    public showModal(): void {
        this.modalOverlay.style.display = 'block';
    }

    public hideModal(): void {
        this.modalOverlay.style.display = 'none';
    }

    public renderSquadList(state: GameStateModel): void {
        this.showModal();
        const aliveHeroes = state.party.filter(h => h.status !== 'dead');
        const squadHeroes = aliveHeroes.filter(h => h.inSquad).slice(0, state.squadMax);
        const reserveHeroes = aliveHeroes.filter(h => !h.inSquad);

        let squadCardsHtml = '';
        for (let i = 0; i < state.squadMax; i++) {
            const h = squadHeroes[i];
            if (h) {
                const mastery = h.getMasteryTier();
                const hasInjuries = h.injuries.length > 0;
                const isMissingHpOrBusy = h.hp < h.maxHp || h.status !== 'ready';

                const injHtml = hasInjuries
                    ? `<div class="concept-card-wounds">🩸 ${h.injuries.join(', ')}</div>`
                    : '';
                const hpStateText = h.status === 'ready'
                    ? `ХП: ${h.hp} / ${h.maxHp}`
                    : (h.status === 'war' ? `На войне (${h.timer} ц.) • ХП: ${h.hp}/${h.maxHp}` : `В палатах (${h.timer} ц.) • ХП: ${h.hp}/${h.maxHp}`);
                const hpHtml = isMissingHpOrBusy
                    ? `<div class="concept-hp-line">${hpStateText}</div>`
                    : '';
                const woundsAndHpBlock = (injHtml || hpHtml)
                    ? `<div class="concept-squad-hp">${injHtml}${hpHtml}</div>`
                    : '';

                const talentDot = h.talentPts > 0
                    ? `<span class="concept-talent-dot" title="Доступно очков талантов: ${h.talentPts}">+${h.talentPts} тал.</span>`
                    : '';

                squadCardsHtml += `
                    <div class="concept-squad-card mastery-${mastery.key}"
                         draggable="true"
                         data-hero-id="${h.id}"
                         data-drop-zone="squad"
                         title="Перетащите в Резерв или на другого бойца • Ранг: ${mastery.label}">
                        <div class="concept-squad-card-top">
                            <span class="concept-mastery-tag">${mastery.label}</span>
                            ${talentDot}
                        </div>
                        <div class="concept-squad-name">${h.name}</div>
                        <div class="concept-squad-class">${h.cls} <span style="font-size:11px; opacity:0.85;">(Ур.${h.lvl})</span></div>
                        ${woundsAndHpBlock}
                        <button class="concept-inspect-btn" onclick="event.stopPropagation(); renderHeroDetailModal('${h.id}')">Осмотреть</button>
                    </div>
                `;
            } else {
                squadCardsHtml += `
                    <div class="concept-squad-card empty-slot" data-drop-zone="squad"></div>
                `;
            }
        }

        const totalReserveSlots = 12;
        let reserveCellsHtml = '';
        for (let i = 0; i < totalReserveSlots; i++) {
            const h = reserveHeroes[i];
            if (h) {
                const mastery = h.getMasteryTier();
                const hasInjuries = h.injuries.length > 0;
                const isMissingHpOrBusy = h.hp < h.maxHp || h.status !== 'ready';

                const parts: string[] = [];
                if (hasInjuries) parts.push(`🩸 ${h.injuries.join(', ')}`);
                if (h.status !== 'ready') {
                    parts.push(h.status === 'war' ? `Война (${h.timer}ц)` : `Палаты (${h.timer}ц)`);
                }
                if (isMissingHpOrBusy) {
                    parts.push(`ХП ${h.hp}/${h.maxHp}`);
                }
                const line2Html = parts.length > 0
                    ? `<div class="concept-reserve-line2">\\ ${parts.join(' • ')}</div>`
                    : '';

                reserveCellsHtml += `
                    <div class="concept-reserve-card mastery-${mastery.key}"
                         draggable="true"
                         data-hero-id="${h.id}"
                         data-drop-zone="reserve"
                         onclick="renderHeroDetailModal('${h.id}')"
                         title="Перетащите в Отряд или нажмите для осмотра • Ранг: ${mastery.label}">
                        <div class="concept-reserve-text">
                            <div class="concept-reserve-line1">${h.name} \\ ${h.cls} (Ур.${h.lvl})</div>
                            ${line2Html}
                        </div>
                    </div>
                `;
            } else {
                reserveCellsHtml += `
                    <div class="concept-reserve-card empty-reserve-slot" data-drop-zone="reserve"></div>
                `;
            }
        }

        this.modalContent.innerHTML = `
            <div class="concept-squad-board">
                <div class="concept-squad-section" data-drop-zone="squad">
                    <div class="concept-squad-header">
                        <span class="concept-squad-hint">Перетаскивайте бойцов между Отрядом и Резервом (цвет = тир вещей + талантов)</span>
                        <span class="concept-squad-title">Отряд (${squadHeroes.length} / ${state.squadMax})</span>
                        <button class="concept-close-btn" onclick="closeSquadModal()">✕ ЗАКРЫТЬ</button>
                    </div>
                    <div class="concept-squad-grid" data-drop-zone="squad">
                        ${squadCardsHtml}
                    </div>
                </div>

                <div class="concept-reserve-section" data-drop-zone="reserve">
                    <div class="concept-reserve-header">
                        <span>Резерв гильдии (${reserveHeroes.length} / ${state.reserveMax}) — перетащите бойца в верхнее окно Отряда (или нажмите на карточку для осмотра)</span>
                    </div>
                    <div class="concept-reserve-grid" data-drop-zone="reserve">
                        ${reserveCellsHtml}
                    </div>
                </div>
            </div>
        `;

        this.bindSquadDragAndDrop();
    }

    private bindSquadDragAndDrop(): void {
        const w = window as unknown as Record<string, (a?: unknown, b?: unknown, c?: unknown) => void>;
        const board = this.modalContent.querySelector('.concept-squad-board') as HTMLElement | null;
        if (!board) return;

        let draggedHeroId: string | null = null;

        const draggableCards = board.querySelectorAll<HTMLElement>('[data-hero-id]');
        draggableCards.forEach(card => {
            card.addEventListener('dragstart', (e: DragEvent) => {
                const id = card.getAttribute('data-hero-id');
                if (!id) return;
                draggedHeroId = id;
                card.classList.add('dragging-card');
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', id);
                }
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging-card');
                board.querySelectorAll('.drop-target-hover').forEach(el => el.classList.remove('drop-target-hover'));
            });
        });

        const dropZones = board.querySelectorAll<HTMLElement>('[data-drop-zone]');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                board.querySelectorAll('.drop-target-hover').forEach(el => el.classList.remove('drop-target-hover'));
                zone.classList.add('drop-target-hover');
            });

            zone.addEventListener('dragleave', (e: DragEvent) => {
                e.stopPropagation();
                zone.classList.remove('drop-target-hover');
            });

            zone.addEventListener('drop', (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.remove('drop-target-hover');
                const sourceId = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || draggedHeroId;
                if (!sourceId) return;

                const targetCard = (e.target as HTMLElement).closest('[data-hero-id]') as HTMLElement | null;
                const targetHeroId = targetCard ? (targetCard.getAttribute('data-hero-id') || undefined) : undefined;
                const targetZoneAttr = (targetCard?.getAttribute('data-drop-zone') || zone.getAttribute('data-drop-zone')) as 'squad' | 'reserve';

                if (typeof w.moveOrSwapSquadHero === 'function' && targetZoneAttr) {
                    w.moveOrSwapSquadHero(sourceId, targetZoneAttr, targetHeroId);
                }
                draggedHeroId = null;
            });
        });

        let touchHeroId: string | null = null;
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouchDragging = false;
        let ghostEl: HTMLElement | null = null;

        const clearTouchGhost = () => {
            if (ghostEl && ghostEl.parentNode) {
                ghostEl.parentNode.removeChild(ghostEl);
            }
            ghostEl = null;
            board.querySelectorAll('.dragging-card, .drop-target-hover').forEach(el => {
                el.classList.remove('dragging-card', 'drop-target-hover');
            });
            touchHeroId = null;
            isTouchDragging = false;
        };

        draggableCards.forEach(card => {
            card.addEventListener('touchstart', (e: TouchEvent) => {
                if ((e.target as HTMLElement).closest('button')) return;
                if (e.touches.length !== 1) return;
                const id = card.getAttribute('data-hero-id');
                if (!id) return;
                touchHeroId = id;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isTouchDragging = false;
            }, { passive: true });

            card.addEventListener('touchmove', (e: TouchEvent) => {
                if (!touchHeroId || e.touches.length !== 1) return;
                const tx = e.touches[0].clientX;
                const ty = e.touches[0].clientY;
                const dist = Math.hypot(tx - touchStartX, ty - touchStartY);

                if (!isTouchDragging && dist > 10) {
                    isTouchDragging = true;
                    card.classList.add('dragging-card');
                    ghostEl = document.createElement('div');
                    ghostEl.className = 'touch-drag-ghost';
                    ghostEl.textContent = card.querySelector('.concept-squad-name, .concept-reserve-line1')?.textContent || 'Боец';
                    document.body.appendChild(ghostEl);
                }

                if (isTouchDragging) {
                    e.preventDefault();
                    if (ghostEl) {
                        ghostEl.style.left = `${tx}px`;
                        ghostEl.style.top = `${ty}px`;
                    }
                    board.querySelectorAll('.drop-target-hover').forEach(el => el.classList.remove('drop-target-hover'));
                    const under = document.elementFromPoint(tx, ty) as HTMLElement | null;
                    const dropTarget = under?.closest('[data-drop-zone]') as HTMLElement | null;
                    if (dropTarget) dropTarget.classList.add('drop-target-hover');
                }
            }, { passive: false });

            card.addEventListener('touchend', (e: TouchEvent) => {
                if (!touchHeroId) return;
                if (isTouchDragging && e.changedTouches.length > 0) {
                    e.preventDefault();
                    const tx = e.changedTouches[0].clientX;
                    const ty = e.changedTouches[0].clientY;
                    if (ghostEl) ghostEl.style.display = 'none';
                    const under = document.elementFromPoint(tx, ty) as HTMLElement | null;
                    const targetCard = under?.closest('[data-hero-id]') as HTMLElement | null;
                    const dropZoneEl = under?.closest('[data-drop-zone]') as HTMLElement | null;
                    const targetHeroId = targetCard ? (targetCard.getAttribute('data-hero-id') || undefined) : undefined;
                    const targetZoneAttr = (targetCard?.getAttribute('data-drop-zone') || dropZoneEl?.getAttribute('data-drop-zone')) as 'squad' | 'reserve' | undefined;

                    const sourceId = touchHeroId;
                    clearTouchGhost();
                    if (typeof w.moveOrSwapSquadHero === 'function' && targetZoneAttr) {
                        w.moveOrSwapSquadHero(sourceId, targetZoneAttr, targetHeroId);
                    }
                    return;
                }
                clearTouchGhost();
            });

            card.addEventListener('touchcancel', () => {
                clearTouchGhost();
            });
        });
    }

    public renderHeroDetails(state: GameStateModel, h: HeroModel): void {
        this.showModal();
        HeroDetailModalView.renderHeroDetails(this.modalContent, state, h);
    }
}
