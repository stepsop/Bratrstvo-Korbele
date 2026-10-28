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

    public renderHeroDetailModal(heroId: string): void {
        const h = this.state.party.find(p => p.id === heroId);
        if (!h) return;

        const ui = this.state.heroUiState;
        if (ui.heroId !== h.id) {
            ui.heroId = h.id;
            ui.leftInspect = { type: 'equipped', key: 'weapon' };
            ui.selectedTalentId = h.talents[0]?.id || null;
            ui.selectedStatusKey = h.injuries.length > 0 ? 'inj_0' : 'passive';
        }

        this.view.renderHeroDetails(this.state, h);
    }

    public selectHeroLeftInspect(heroId: string, type: 'stat' | 'equipped' | 'skill', key: string): void {
        this.state.heroUiState.heroId = heroId;
        this.state.heroUiState.leftInspect = { type, key };
        this.renderHeroDetailModal(heroId);
    }

    public selectHeroTalentNode(heroId: string, talentId: string): void {
        this.state.heroUiState.heroId = heroId;
        this.state.heroUiState.selectedTalentId = talentId;
        this.renderHeroDetailModal(heroId);
    }

    public selectHeroStatusBadge(heroId: string, statusKey: string): void {
        this.state.heroUiState.heroId = heroId;
        this.state.heroUiState.selectedStatusKey = statusKey;
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
        this.renderHeroDetailModal(heroId);
    }

    public unlockTalent(heroId: string, talentId: string): void {
        const h = this.state.party.find(p => p.id === heroId);
        if (!h) return;

        const unlockedNode = h.unlockTalent(talentId);
        if (!unlockedNode) return;

        this.state.heroUiState.selectedTalentId = unlockedNode.id;
        this.hudView.appendLog(`Изучен талант <span class="hl-green">«${unlockedNode.name}»</span> для бойца ${h.name}!`);
        this.topBarView.renderStats(this.state);
        this.renderHeroDetailModal(heroId);
    }
}
