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
                let overUnit = false;
                this.state.combat.enemies.forEach(en => {
                    if (en.hp > 0 && Math.abs(mx - en.x) < 25 && Math.abs(my - en.y) < 28) overUnit = true;
                });
                this.state.party.filter(h => h.status === 'ready').forEach(h => {
                    if (Math.abs(mx - h.x) < 25 && Math.abs(my - h.y) < 28) overUnit = true;
                });
                canvas.style.cursor = overUnit ? 'pointer' : 'default';
            } else {
                canvas.style.cursor = 'default';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            this.state.hoveredHotspot = null;
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
            const my = (e.clientY - rect.top) * (canvas.height / rect.height);

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
                const activeHeroes = this.state.party.filter(h => h.status === 'ready');
                for (const h of activeHeroes) {
                    if (Math.abs(mx - h.x) < 25 && Math.abs(my - h.y) < 28) {
                        this.state.combat.selectedHeroId = h.id;
                        this.state.combat.paused = true;
                        this.hudView.appendLog(`Выбран боец <span class="hl-gold">${h.name}</span>. Настрой его распорядок атак и целей ниже!`);
                        this.hudView.renderCombatControls(this.state);
                        return;
                    }
                }
                this.state.combat.enemies.forEach((en, idx) => {
                    if (en.hp > 0 && Math.abs(mx - en.x) < 25 && Math.abs(my - en.y) < 28) {
                        this.state.combat.focusEnemyIndex = idx;
                        this.state.addFloatingText("ФОКУС!", en.x, en.y - 25, '#ffd700');
                        this.hudView.appendLog(`Отряд фокусирует удары на цели: <span class="hl-gold">${en.name}</span>!`);
                        this.hudView.renderCombatControls(this.state);
                    }
                });
            }
        });
    }

    private bindWindowActions(): void {
        const w = window as any;

        // Squad & Hero RPG Modal
        w.openSquadModal = (id?: string) => this.squadPresenter.openSquadModal(id || null);
        w.closeSquadModal = () => this.squadPresenter.closeSquadModal();
        w.renderSquadListModal = () => this.squadPresenter.renderSquadListModal();
        w.renderHeroDetailModal = (id: string) => this.squadPresenter.renderHeroDetailModal(id);
        w.selectHeroLeftInspect = (id: string, type: 'stat' | 'equipped' | 'skill', key: string) => this.squadPresenter.selectHeroLeftInspect(id, type, key);
        w.selectHeroTalentNode = (id: string, tid: string) => this.squadPresenter.selectHeroTalentNode(id, tid);
        w.selectHeroStatusBadge = (id: string, skey: string) => this.squadPresenter.selectHeroStatusBadge(id, skey);
        w.equipItemOnHero = (id: string, idx: number) => this.squadPresenter.equipItemOnHero(id, idx);
        w.unequipHeroSlot = (id: string, slot: any) => this.squadPresenter.unequipHeroSlot(id, slot);
        w.unlockTalent = (id: string, tid: string) => this.squadPresenter.unlockTalent(id, tid);

        // Guild & NPC Dialogs
        w.enterGuild = () => this.guildPresenter.enterGuild();
        w.openHostDialog = (speech?: string) => this.guildPresenter.openHostDialog(speech || null);
        w.buyShopItem = (type: string) => this.guildPresenter.buyShopItem(type);
        w.treatHeroInClinic = (idx: number, mode: 'hp' | 'injuries') => this.guildPresenter.treatHeroInClinic(idx, mode);
        w.hireMercenary = (idx: number) => this.guildPresenter.hireMercenary(idx);
        w.selectRecruiterCampaign = (idx: number) => this.guildPresenter.selectRecruiterCampaign(idx);
        w.toggleHeroWarPick = (id: string) => this.guildPresenter.toggleHeroWarPick(id);
        w.dispatchHeroesToWar = () => this.guildPresenter.dispatchHeroesToWar();
        w.toggleHeroMissionPick = (id: string) => this.guildPresenter.toggleHeroMissionPick(id);

        // Map & Combat
        w.startQuest = () => this.combatPresenter.startQuest();
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
