import { GameStateModel } from '../models/GameStateModel';
import { EquipSlotType } from '../models/EquipmentItem';
import { SquadAndHeroModalView } from '../views/SquadAndHeroModalView';
import { TopStatsBarView } from '../views/TopStatsBarView';
import { CombatHudView } from '../views/CombatHudView';

/**
 * Presenter управления Отрядом, Куклой Экипировки и Деревом Талантов (MVP Presenter)
 */
export class SquadPresenter {
    constructor(
        private state: GameStateModel,
        private view: SquadAndHeroModalView,
        private topBarView: TopStatsBarView,
        private hudView: CombatHudView
    ) {}

    public openSquadModal(heroId: string | null = null): void {
        if (!heroId) {
            this.renderSquadListModal();
        } else {
            this.renderHeroDetailModal(heroId);
        }
    }

    public closeSquadModal(): void {
        this.view.hideModal();
    }

    public renderSquadListModal(): void {
        this.view.renderSquadList(this.state);
    }

    public toggleSquadHero(heroId: string): void {
        const h = this.state.party.find(p => p.id === heroId);
        if (!h || h.status !== 'ready') return;

        if (h.inSquad) {
            h.inSquad = false;
        } else {
            const activeCount = this.state.party.filter(p => p.inSquad && p.status !== 'dead').length;
            if (activeCount < this.state.squadMax) {
                h.inSquad = true;
            }
        }
        this.topBarView.renderStats(this.state);
        this.renderSquadListModal();
    }

    public moveOrSwapSquadHero(draggedHeroId: string, targetZone: 'squad' | 'reserve', targetHeroId?: string): void {
        const dragged = this.state.party.find(p => p.id === draggedHeroId && p.status !== 'dead');
        if (!dragged) return;

        const targetHero = targetHeroId
            ? this.state.party.find(p => p.id === targetHeroId && p.status !== 'dead')
            : undefined;

        // Если перетащили прямо на другого героя — меняем их местами (или переставляем в списке)
        if (targetHero && targetHero.id !== dragged.id) {
            const idxA = this.state.party.indexOf(dragged);
            const idxB = this.state.party.indexOf(targetHero);

            if (dragged.inSquad !== targetHero.inSquad) {
                // Обмен между Отрядом и Резервом
                const enteringSquad = dragged.inSquad ? targetHero : dragged;
                if (enteringSquad.status !== 'ready') return;
                const prevInSquad = dragged.inSquad;
                dragged.inSquad = targetHero.inSquad;
                targetHero.inSquad = prevInSquad;
            }
            if (idxA !== -1 && idxB !== -1) {
                this.state.party[idxA] = targetHero;
                this.state.party[idxB] = dragged;
            }
            this.topBarView.renderStats(this.state);
            this.renderSquadListModal();
            return;
        }

        // Перенос в зону Отряда (пустой слот или секция Отряда)
        if (targetZone === 'squad' && !dragged.inSquad) {
            if (dragged.status !== 'ready') return;
            const activeCount = this.state.party.filter(p => p.inSquad && p.status !== 'dead').length;
            if (activeCount < this.state.squadMax) {
                dragged.inSquad = true;
                this.topBarView.renderStats(this.state);
                this.renderSquadListModal();
            }
            return;
        }

        // Перенос в зону Резерва (пустой слот или секция Резерва)
        if (targetZone === 'reserve' && dragged.inSquad) {
            dragged.inSquad = false;
            this.topBarView.renderStats(this.state);
            this.renderSquadListModal();
        }
    }

    public renderHeroDetailModal(heroId: string): void {
        const h = this.state.party.find(p => p.id === heroId);
        if (!h) return;

        const ui = this.state.heroUiState;
        if (ui.heroId !== h.id) {
            ui.heroId = h.id;
            ui.leftInspect = { type: 'equipped', key: 'weapon' };
            ui.compareBagIndex = null;
            ui.selectedTalentId = h.talents[0]?.id || null;
            ui.selectedStatusKey = 'passive';
            ui.activeInspectorSource = 'left';
        }

        this.view.renderHeroDetails(this.state, h);
    }

    public selectHeroLeftInspect(heroId: string, type: 'stat' | 'equipped' | 'skill', key: string): void {
        this.state.heroUiState.heroId = heroId;
        // Пассивка (s3) переключает осмотр на пассивку в окне состояния бойца
        if (type === 'skill' && key === 's3') {
            this.state.heroUiState.selectedStatusKey = 'passive';
            this.state.heroUiState.activeInspectorSource = 'status';
            this.renderHeroDetailModal(heroId);
            return;
        }
        this.state.heroUiState.leftInspect = { type, key };
        this.state.heroUiState.compareBagIndex = null;
        this.state.heroUiState.activeInspectorSource = 'left';
        this.renderHeroDetailModal(heroId);
    }

    public selectCompareBagItem(heroId: string, bagIdx: number | null): void {
        this.state.heroUiState.heroId = heroId;
        this.state.heroUiState.compareBagIndex = (this.state.heroUiState.compareBagIndex === bagIdx) ? null : bagIdx;
        this.state.heroUiState.activeInspectorSource = 'left';
        this.renderHeroDetailModal(heroId);
    }

    public selectHeroTalentNode(heroId: string, talentId: string): void {
        this.state.heroUiState.heroId = heroId;
        this.state.heroUiState.selectedTalentId = talentId;
        this.state.heroUiState.selectedStatusKey = `talent_${talentId}`;
        this.state.heroUiState.activeInspectorSource = 'status';
        this.renderHeroDetailModal(heroId);
    }

    public selectHeroStatusBadge(heroId: string, statusKey: string): void {
        this.state.heroUiState.heroId = heroId;
        this.state.heroUiState.selectedStatusKey = statusKey;
        if (statusKey.startsWith('talent_')) {
            this.state.heroUiState.selectedTalentId = statusKey.replace('talent_', '');
        }
        this.state.heroUiState.activeInspectorSource = 'status';
        this.renderHeroDetailModal(heroId);
    }

    public equipItemOnHero(heroId: string, eqIdx: number): void {
        const h = this.state.party.find(p => p.id === heroId);
        const item = this.state.spareEquip[eqIdx];
        if (!h || !item) return;

        this.state.spareEquip.splice(eqIdx, 1);
        const prevItem = h.equipItem(item);
        if (prevItem) {
            this.state.spareEquip.push(prevItem);
        }

        this.state.heroUiState.leftInspect = { type: 'equipped', key: item.slot };
        this.state.heroUiState.compareBagIndex = null;
        this.state.heroUiState.activeInspectorSource = 'left';
        this.hudView.appendLog(`Герой <span class="hl-gold">${h.name}</span> экипировал предмет: <b>${item.name}</b>!`);
        this.renderHeroDetailModal(heroId);
    }

    public unequipHeroSlot(heroId: string, slot: EquipSlotType): void {
        const h = this.state.party.find(p => p.id === heroId);
        if (!h) return;

        const removed = h.unequipSlot(slot);
        if (removed) {
            this.state.spareEquip.push(removed);
        }

        this.state.heroUiState.leftInspect = { type: 'equipped', key: slot };
        this.state.heroUiState.compareBagIndex = null;
        this.state.heroUiState.activeInspectorSource = 'left';
        this.renderHeroDetailModal(heroId);
    }

    public unlockTalent(heroId: string, talentId: string): void {
        const h = this.state.party.find(p => p.id === heroId);
        if (!h) return;

        const unlockedNode = h.unlockTalent(talentId);
        if (!unlockedNode) return;

        this.state.heroUiState.selectedTalentId = unlockedNode.id;
        this.state.heroUiState.selectedStatusKey = `talent_${unlockedNode.id}`;
        this.state.heroUiState.activeInspectorSource = 'status';
        this.hudView.appendLog(`Изучен талант <span class="hl-green">«${unlockedNode.name}»</span> — ${h.name} повысил уровень до <b>Ур.${h.lvl}</b>!`);
        this.topBarView.renderStats(this.state);
        this.renderHeroDetailModal(heroId);
    }

    public resetHeroTalents(heroId: string): void {
        const h = this.state.party.find(p => p.id === heroId);
        if (!h) return;

        const refunded = h.resetTalents();
        if (refunded <= 0) return;

        this.state.heroUiState.selectedTalentId = h.talents[0]?.id || null;
        this.state.heroUiState.selectedStatusKey = 'passive';
        this.state.heroUiState.activeInspectorSource = 'status';
        this.hudView.appendLog(`Таланты бойца <span class="hl-gold">${h.name}</span> сброшены (возвращено очков: <b>+${refunded}</b>).`);
        this.topBarView.renderStats(this.state);
        this.renderHeroDetailModal(heroId);
    }
}
