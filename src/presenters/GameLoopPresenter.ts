import { GameStateModel } from '../models/GameStateModel';
import { CanvasRendererView } from '../views/CanvasRendererView';
import { CombatHudView } from '../views/CombatHudView';
import { SquadPresenter } from './SquadPresenter';
import { GuildPresenter } from './GuildPresenter';
import { CombatPresenter } from './CombatPresenter';

/**
 * Главный Presenter игрового цикла (60 FPS), ввода с Canvas и маршрутизации событий UI (MVP Coordinator)
 */
export class GameLoopPresenter {
    constructor(
        private state: GameStateModel,
        private canvasView: CanvasRendererView,
        private hudView: CombatHudView,
        private squadPresenter: SquadPresenter,
        private guildPresenter: GuildPresenter,
        private combatPresenter: CombatPresenter
    ) {
        this.bindCanvasEvents();
        this.bindWindowActions();
    }

    private bindCanvasEvents(): void {
        const canvas = this.canvasView.canvas;

        window.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.key === ' ') && this.state.scene === 'combat' && this.state.combat.active) {
                const modalOverlay = document.getElementById('modal-overlay');
                if (modalOverlay && modalOverlay.style.display === 'flex') return;
                e.preventDefault();
                this.combatPresenter.togglePause();
            } else if ((e.code === 'Space' || e.code === 'Enter') && this.state.scene === 'map' && this.state.mapState.encounterPending) {
                e.preventDefault();
                this.combatPresenter.confirmMapEncounter();
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
            const my = (e.clientY - rect.top) * (canvas.height / rect.height);

            if (this.state.scene === 'guild') {
                this.state.hoveredHotspot = null;
                for (const h of this.state.guildHotspots) {
                    if (this.canvasView.hitTestHotspot(h, mx, my, this.state)) {
                        this.state.hoveredHotspot = h;
                        break;
                    }
                }
                canvas.style.cursor = this.state.hoveredHotspot ? 'pointer' : 'default';
            } else if (this.state.scene === 'combat' && this.state.combat.active) {
                const combat = this.state.combat;
                combat.hoveredHeroId = null;
                combat.hoveredEnemyIndex = null;

                let overInteractive = false;
                // Иконка паузы в правом верхнем углу
                if (mx >= canvas.width - 48 && mx <= canvas.width - 12 && my >= 11 && my <= 47) {
                    overInteractive = true;
                }

                combat.enemies.forEach((en, idx) => {
                    if (en.hp > 0 && Math.abs(mx - en.x) < 28 && Math.abs(my - en.y) < 32) {
                        combat.hoveredEnemyIndex = idx;
                        overInteractive = true;
                    }
                });
                this.state.party.filter(h => h.inSquad && h.status === 'ready').forEach(h => {
                    if (Math.abs(mx - h.x) < 28 && Math.abs(my - h.y) < 32) {
                        combat.hoveredHeroId = h.id;
                        overInteractive = true;
                    }
                });
                canvas.style.cursor = overInteractive ? 'pointer' : 'default';
            } else {
                canvas.style.cursor = 'default';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            this.state.hoveredHotspot = null;
            this.state.combat.hoveredHeroId = null;
            this.state.combat.hoveredEnemyIndex = null;
        });

        const handleCanvasTap = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            const mx = (clientX - rect.left) * (canvas.width / rect.width);
            const my = (clientY - rect.top) * (canvas.height / rect.height);

            if (this.state.scene === 'guild') {
                let targetHotspot = this.state.hoveredHotspot;
                if (!targetHotspot) {
                    for (const h of this.state.guildHotspots) {
                        if (this.canvasView.hitTestHotspot(h, mx, my, this.state)) {
                            targetHotspot = h;
                            break;
                        }
                    }
                }
                if (targetHotspot) {
                    this.state.hoveredHotspot = targetHotspot;
                    this.guildPresenter.openGuildSection(targetHotspot.id);
                }
            } else if (this.state.scene === 'combat' && this.state.combat.active) {
                // Клик по иконке паузы в правом верхнем углу
                if (mx >= canvas.width - 48 && mx <= canvas.width - 12 && my >= 11 && my <= 47) {
                    this.combatPresenter.togglePause();
                    return;
                }

                const activeHeroes = this.state.party.filter(h => h.inSquad && h.status === 'ready');
                for (const h of activeHeroes) {
                    if (Math.abs(mx - h.x) < 28 && Math.abs(my - h.y) < 32) {
                        this.combatPresenter.selectHeroInCombat(h.id);
                        if (this.state.combat.selectedHeroId === h.id) {
                            this.hudView.appendLog(`Выбран боец <span class="hl-gold">${h.name}</span>. Настрой его распорядок атак и целей ниже!`, 'ally');
                        }
                        return;
                    }
                }
                this.state.combat.enemies.forEach((en, idx) => {
                    if (en.hp > 0 && Math.abs(mx - en.x) < 28 && Math.abs(my - en.y) < 32) {
                        this.state.combat.focusEnemyIndex = idx;
                        this.state.addFloatingText("ФОКУС!", en.x, en.y - 25, '#ffd700');
                        this.hudView.appendLog(`Отряд фокусирует удары на цели: <span class="hl-gold">${en.name}</span>!`, 'ally');
                        this.hudView.renderCombatControls(this.state);
                    }
                });
            }
        };

        canvas.addEventListener('click', (e) => {
            handleCanvasTap(e.clientX, e.clientY);
        });

        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const t = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const mx = (t.clientX - rect.left) * (canvas.width / rect.width);
                const my = (t.clientY - rect.top) * (canvas.height / rect.height);
                if (this.state.scene === 'guild') {
                    this.state.hoveredHotspot = null;
                    for (const h of this.state.guildHotspots) {
                        if (this.canvasView.hitTestHotspot(h, mx, my, this.state)) {
                            this.state.hoveredHotspot = h;
                            break;
                        }
                    }
                }
            }
        }, { passive: true });
    }

    private bindWindowActions(): void {
        const w = window as any;

        // Squad & Hero RPG Modal
        w.openSquadModal = (id?: string) => this.squadPresenter.openSquadModal(id || null);
        w.closeSquadModal = () => this.squadPresenter.closeSquadModal();
        w.renderSquadListModal = () => this.squadPresenter.renderSquadListModal();
        w.renderHeroDetailModal = (id: string) => this.squadPresenter.renderHeroDetailModal(id);
        w.toggleSquadHero = (id: string) => this.squadPresenter.toggleSquadHero(id);
        w.moveOrSwapSquadHero = (draggedId: string, zone: 'squad' | 'reserve', targetId?: string) => this.squadPresenter.moveOrSwapSquadHero(draggedId, zone, targetId);
        w.selectHeroLeftInspect = (id: string, type: 'stat' | 'equipped' | 'skill', key: string) => this.squadPresenter.selectHeroLeftInspect(id, type, key);
        w.selectCompareBagItem = (id: string, idx: number | null) => this.squadPresenter.selectCompareBagItem(id, idx);
        w.selectHeroTalentNode = (id: string, tid: string) => this.squadPresenter.selectHeroTalentNode(id, tid);
        w.selectHeroStatusBadge = (id: string, skey: string) => this.squadPresenter.selectHeroStatusBadge(id, skey);
        w.equipItemOnHero = (id: string, idx: number) => this.squadPresenter.equipItemOnHero(id, idx);
        w.unequipHeroSlot = (id: string, slot: any) => this.squadPresenter.unequipHeroSlot(id, slot);
        w.unlockTalent = (id: string, tid: string) => this.squadPresenter.unlockTalent(id, tid);
        w.resetHeroTalents = (id: string) => this.squadPresenter.resetHeroTalents(id);

        // Guild & NPC Dialogs
        w.enterGuild = (showSummary?: boolean) => this.guildPresenter.enterGuild(!!showSummary);
        w.inspectBattleLoot = (idx: number) => this.guildPresenter.inspectBattleLoot(idx);
        w.openClinicDialog = () => this.guildPresenter.openClinicDialog();
        w.openHostDialog = (speech?: string) => this.guildPresenter.openHostDialog(speech || null);
        w.switchHostTab = (tab: 'hub' | 'upgrades' | 'consumables' | 'armor') => this.guildPresenter.switchHostTab(tab);
        w.selectHostArmorItem = (id: string) => this.guildPresenter.selectHostArmorItem(id);
        w.buyHostArmorItem = (id: string) => this.guildPresenter.buyHostArmorItem(id);
        w.selectHostUpgrade = (id: string) => this.guildPresenter.selectHostUpgrade(id);
        w.buyTavernUpgrade = (id: string) => this.guildPresenter.buyTavernUpgrade(id);
        w.selectHostConsumable = (id: 'beer' | 'medkit' | 'pot') => this.guildPresenter.selectHostConsumable(id);
        w.buyShopItem = (type: string) => this.guildPresenter.buyShopItem(type);
        w.treatHeroInClinic = (idx: number, mode: 'hp' | 'injuries') => this.guildPresenter.treatHeroInClinic(idx, mode);
        w.hireMercenary = (idx: number) => this.guildPresenter.hireMercenary(idx);
        w.selectRecruiterCampaign = (idx: number) => this.guildPresenter.selectRecruiterCampaign(idx);
        w.toggleHeroWarPick = (id: string) => this.guildPresenter.toggleHeroWarPick(id);
        w.assignHeroToWarSlot = (heroId: string, campIdx: number, slotIdx?: number) => this.guildPresenter.assignHeroToWarSlot(heroId, campIdx, slotIdx);
        w.removeHeroFromWarSlot = (heroId: string) => this.guildPresenter.removeHeroFromWarSlot(heroId);
        w.dispatchHeroesToWar = (campIdx?: number) => this.guildPresenter.dispatchHeroesToWar(campIdx);
        w.toggleHeroMissionPick = (id: string) => this.guildPresenter.toggleHeroMissionPick(id);
        w.toggleWarTrackerPopup = (ev?: Event) => this.guildPresenter.toggleWarTrackerPopup(ev);
        w.closeWarTrackerPopup = (ev?: Event) => this.guildPresenter.closeWarTrackerPopup(ev);
        w.toggleClinicTrackerPopup = (ev?: Event) => this.guildPresenter.toggleClinicTrackerPopup(ev);
        w.closeClinicTrackerPopup = (ev?: Event) => this.guildPresenter.closeClinicTrackerPopup(ev);
        w.openSmithDialog = (speech?: string) => this.guildPresenter.openSmithDialog(speech || null);
        w.setSmithRecipeFilter = (filter: 'all' | 'weapon' | 'armor' | 'trinket') => this.guildPresenter.setSmithRecipeFilter(filter);
        w.smeltSpareItem = (idx: number) => this.guildPresenter.smeltSpareItem(idx);
        w.craftSmithRecipe = (recipeId: string) => this.guildPresenter.craftSmithRecipe(recipeId);

        // Map & Combat
        w.startQuest = (questId?: string) => this.combatPresenter.startQuest(questId);
        w.confirmMapEncounter = () => this.combatPresenter.confirmMapEncounter();
        w.togglePause = () => this.combatPresenter.togglePause();
        w.usePsaKrev = () => this.combatPresenter.usePsaKrev();
        w.selectHeroInCombat = (id: string) => this.combatPresenter.selectHeroInCombat(id);
        w.cycleHeroSkillOrder = (id: string) => this.combatPresenter.cycleHeroSkillOrder(id);
        w.cycleHeroTargetRule = (id: string) => this.combatPresenter.cycleHeroTargetRule(id);
        w.useMasterBeer = () => this.combatPresenter.useMasterBeer();
        w.useMasterPot = () => this.combatPresenter.useMasterPot();
        w.returnFromCombat = () => this.combatPresenter.returnFromCombat();
    }

    public start(): void {
        this.guildPresenter.enterGuild();
        const loop = () => {
            this.state.frame++;

            if (this.state.scene === 'map') {
                this.combatPresenter.updateMapLogic();
            } else if (this.state.scene === 'combat') {
                if (this.state.combat.active && !this.state.combat.paused) {
                    this.state.combat.tickTimer++;
                    if (this.state.combat.tickTimer >= 55) {
                        this.state.combat.tickTimer = 0;
                        this.combatPresenter.executeNextCombatTurn();
                    }
                }
            }

            this.canvasView.renderFrame(this.state);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
