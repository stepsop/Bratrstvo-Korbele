import { GameStateModel, MetalType } from '../models/GameStateModel';
import { GameDataCatalog } from '../models/GameDataCatalog';
import { EquipmentItem } from '../models/EquipmentItem';
import { HeroModel } from '../models/HeroModel';
import { GuildNpcModalView } from '../views/GuildNpcModalView';
import { TopStatsBarView } from '../views/TopStatsBarView';
import { CombatHudView } from '../views/CombatHudView';
import { SquadPresenter } from './SquadPresenter';

/**
 * Presenter сцены Таверны (Гильдии) и взаимодействий с НПС (MVP Presenter)
 */
export class GuildPresenter {
    constructor(
        private state: GameStateModel,
        private npcView: GuildNpcModalView,
        private topBarView: TopStatsBarView,
        private hudView: CombatHudView,
        private squadPresenter: SquadPresenter
    ) {}

    private roll(sides: number): number {
        return Math.floor(Math.random() * sides) + 1;
    }

    public toggleWarTrackerPopup(event?: Event): void {
        this.topBarView.togglePopup(this.state, event);
    }

    public closeWarTrackerPopup(event?: Event): void {
        this.topBarView.closePopup(this.state, event);
    }

    public toggleClinicTrackerPopup(event?: Event): void {
        this.topBarView.toggleClinicPopup(this.state, event);
    }

    public closeClinicTrackerPopup(event?: Event): void {
        this.topBarView.closeClinicPopup(this.state, event);
    }

    public enterGuild(showBattleSummary = false): void {
        if (showBattleSummary && this.state.expeditionReport.hasReport && this.state.expeditionReport.outcome === 'defeat') {
            this.advanceCycle(1);
        }

        // По приходу в таверну все живые герои восполняют здоровье на максимум, но травмы сохраняются
        this.state.party.forEach(h => {
            if (h.status !== 'dead') {
                h.hp = h.maxHp;
                h.tempHp = 0;
            }
        });

        this.state.scene = 'guild';
        this.topBarView.renderStats(this.state);
        this.topBarView.updateSceneLayout(this.state);

        if (showBattleSummary && this.state.expeditionReport.hasReport) {
            this.state.expeditionReport.hasReport = false;
            this.state.expeditionReport.selectedLootIndex = null;
            this.npcView.renderBattleSummaryModal(this.state);
        }
    }

    public inspectBattleLoot(idx: number): void {
        const rep = this.state.expeditionReport;
        rep.selectedLootIndex = (rep.selectedLootIndex === idx) ? null : idx;
        this.npcView.renderBattleSummaryModal(this.state);
    }

    public advanceCycle(amount = 1): void {
        for (let c = 0; c < amount; c++) {
            this.state.cycle++;
            this.state.party.forEach(h => {
                if (h.status === 'clinic' && h.timer > 0) {
                    h.timer--;
                    if (h.timer <= 0) {
                        h.status = 'ready';
                        h.injuries = [];
                        h.hp = h.maxHp;
                        this.hudView.appendLog(`<span class="hl-green">ПАЛАТЫ ВРАЧЕБНЫЕ:</span> ${h.name} выписан здоровым и без травм!`);
                    }
                } else if (h.status === 'war' && h.timer > 0) {
                    h.timer--;
                    if (h.timer <= 0) {
                        this.resolvePrivateWar(h);
                    }
                }
            });
        }
        this.state.generateDailyQuests();
        this.topBarView.renderStats(this.state);
    }

    private resolvePrivateWar(hero: HeroModel): void {
        const contract = hero.warContract || {
            goldMin: 40, goldMax: 60, deathChance: 10, injuryChance: 25,
            name: 'Частная война', needHeroes: 1, cycles: 4
        };
        const r = Math.random() * 100;

        if (r < contract.deathChance) {
            hero.status = 'dead';
            this.hudView.appendLog(`<span class="hl-red">ВЕРБОВЩИК СООБЩАЕТ:</span> Поход «${contract.name}» закончился трагедией! Боец ${hero.name} пал смертью храбрых...`);
        } else {
            hero.status = 'ready';
            const goldEarned = contract.goldMin + this.roll(contract.goldMax - contract.goldMin + 1);
            this.state.gold += goldEarned;
            const lvls = contract.lvlGain || 1;
            hero.talentPts += lvls;
            hero.maxHp += 4 * lvls;
            hero.hp = hero.maxHp;

            if (r < contract.deathChance + contract.injuryChance) {
                hero.injuries.push('Боевое ранение (-2 HP)');
                hero.maxHp = Math.max(10, hero.maxHp - 2);
                hero.hp = hero.maxHp;
                this.hudView.appendLog(`<span class="hl-gold">ВОЗВРАЩЕНИЕ С ВОЙНЫ (${contract.name}):</span> ${hero.name} принес <b>${goldEarned} грошей</b>, получил +${lvls} очк. талантов, но получил ранение!`);
            } else {
                const bonusText = contract.bonusItem ? `, а также привез трофей: ${contract.bonusItem.name}` : '';
                if (contract.bonusItem) {
                    this.state.spareEquip.push(
                        new EquipmentItem(contract.bonusItem.name, contract.bonusItem.slot, contract.bonusItem.atk, contract.bonusItem.armor, contract.bonusItem.block)
                    );
                }
                this.hudView.appendLog(`<span class="hl-gold">ТРИУМФ ВОЙНЫ (${contract.name}):</span> ${hero.name} вернулся с победой! Принес <b>${goldEarned} грошей</b> и +${lvls} очк. талантов${bonusText}!`);
            }
        }
        delete hero.warContract;
        this.topBarView.renderStats(this.state);
    }

    public openGuildSection(sec: string): void {
        if (sec === 'host') {
            this.state.hostMenuState.activeTab = 'hub';
            this.openHostDialog();
        } else if (sec === 'clinic') this.openClinicDialog();
        else if (sec === 'mercs') this.openMercsDialog();
        else if (sec === 'verbirz') this.openVerbirzDialog();
        else if (sec === 'quests') this.openQuestsDialog();
        else if (sec === 'smith') this.openSmithDialog();
    }

    public openHostDialog(customSpeech: string | null = null): void {
        const tales = this.state.tavernTales;
        const speech = customSpeech || tales[Math.floor(Math.random() * tales.length)];
        this.npcView.renderHostDialog(this.state, speech);
    }

    public switchHostTab(tab: 'hub' | 'upgrades' | 'consumables' | 'armor'): void {
        this.state.hostMenuState.activeTab = tab;
        this.npcView.renderHostDialog(this.state, this.state.hostMenuState.speech);
    }

    public selectHostArmorItem(itemId: string): void {
        this.state.hostMenuState.selectedArmorId = itemId;
        this.npcView.renderHostDialog(this.state, this.state.hostMenuState.speech);
    }

    public buyHostArmorItem(itemId: string): void {
        const item = this.state.hostArmorShop.find(x => x.id === itemId);
        if (!item || item.purchased || this.state.gold < item.price) return;

        this.state.gold -= item.price;
        item.purchased = true;
        this.state.spareEquip.push(
            new EquipmentItem(item.name, item.slot, item.atk, item.armor, item.block, item.desc)
        );
        this.hudView.appendLog(`<span class="hl-gold">ЛАВКА ХОЗЯИНА:</span> Куплено снаряжение <b>${item.name}</b>! Наденьте его на бойца в меню ОТРЯД.`);
        this.topBarView.renderStats(this.state);
        this.openHostDialog('«Отменная обновка, пане! Сразу отправляй в арсенал отряда!»');
    }

    public selectHostUpgrade(upgradeId: string): void {
        this.state.hostMenuState.selectedUpgradeId = upgradeId;
        this.npcView.renderHostDialog(this.state, this.state.hostMenuState.speech);
    }

    public buyTavernUpgrade(upgradeId: string): void {
        const node = this.state.tavernUpgrades.find(u => u.id === upgradeId);
        if (!node || node.unlocked) return;

        const prevOk = node.tier === 1 || this.state.tavernUpgrades.some(
            u => u.branch === node.branch && u.tier === node.tier - 1 && u.unlocked
        );
        if (!prevOk || this.state.gold < node.price) return;

        this.state.gold -= node.price;
        node.unlocked = true;

        // Реальное применение эффекта улучшения таверны
        const aliveParty = this.state.party.filter(h => h.status !== 'dead');
        if (node.id === 'upg_b1_t1') {
            this.state.reserveMax += 3;
            aliveParty.forEach(h => { h.maxHp += 2; h.hp += 2; });
        } else if (node.id === 'upg_b1_t2') {
            aliveParty.forEach(h => { h.atkBonus += 1; h.blockChance += 3; });
        } else if (node.id === 'upg_b1_t3') {
            aliveParty.forEach(h => { h.armor += 1; h.maxHp += 4; h.hp += 4; });
        } else if (node.id === 'upg_b1_t4') {
            aliveParty.forEach(h => { h.atkBonus += 2; h.armor += 1; h.blockChance += 5; });
        } else if (node.id === 'upg_b2_t1') {
            this.state.beer += 2;
        } else if (node.id === 'upg_b2_t2') {
            aliveParty.forEach(h => { h.maxHp += 4; h.hp += 4; h.initBase += 1; });
        } else if (node.id === 'upg_b2_t3') {
            this.state.pots += 2;
        } else if (node.id === 'upg_b2_t4') {
            this.state.gold += 50;
        } else if (node.id === 'upg_b3_t1') {
            this.state.medkits += 2;
        } else if (node.id === 'upg_b3_t2') {
            aliveParty.forEach(h => {
                h.maxHp += 3;
                h.hp = h.maxHp;
                h.injuries = [];
            });
        } else if (node.id === 'upg_b3_t3') {
            this.state.warCampaigns.forEach(c => {
                c.deathChance = Math.max(1, c.deathChance - 4);
                c.goldMin += 20;
                c.goldMax += 20;
            });
        } else if (node.id === 'upg_b3_t4') {
            aliveParty.forEach(h => { h.maxHp += 5; h.hp += 5; });
            this.state.warCampaigns.forEach(c => {
                c.goldMin += 35;
                c.goldMax += 35;
            });
        } else if (node.id === 'upg_b4_t1') {
            this.state.metals.iron += 4;
            this.state.metals.bronze += 2;
            this.state.metals.steel += 1;
        } else if (node.id === 'upg_b4_t2') {
            this.state.metals.iron += 3;
            this.state.metals.bronze += 2;
        } else if (node.id === 'upg_b4_t3') {
            this.state.metals.steel += 2;
            this.state.metals.damask += 1;
        } else if (node.id === 'upg_b4_t4') {
            this.state.metals.damask += 2;
            aliveParty.forEach(h => { h.atkBonus += 1; h.armor += 1; });
        } else if (node.id === 'upg_b5_t1') {
            aliveParty.forEach(h => { h.initBase += 1; });
            this.state.herbs += 2;
            this.state.pots += 1;
        } else if (node.id === 'upg_b5_t2') {
            aliveParty.forEach(h => { h.atkBonus += 2; h.blockChance += 3; });
            this.state.warCampaigns.forEach(c => {
                c.deathChance = Math.max(1, c.deathChance - 3);
            });
        } else if (node.id === 'upg_b5_t3') {
            aliveParty.forEach(h => {
                h.maxHp += 4;
                h.hp += 4;
                h.initBase += 1;
                h.blockChance += 2;
            });
            this.state.warCampaigns.forEach(c => {
                c.goldMin += 20;
                c.goldMax += 20;
            });
        } else if (node.id === 'upg_b5_t4') {
            aliveParty.forEach(h => { h.atkBonus += 3; h.initBase += 2; h.blockChance += 5; });
            this.state.warCampaigns.forEach(c => {
                c.goldMin += 40;
                c.goldMax += 40;
            });
        }

        this.hudView.appendLog(`<span class="hl-green">УЛУЧШЕНИЕ ТАВЕРНЫ:</span> Построено «<b>${node.name}</b>»! Бонусы применены к братству.`);
        this.topBarView.renderStats(this.state);
        this.openHostDialog('«Мастера потрудились на славу! Наша корчма крепнет день ото дня!»');
    }

    public selectHostConsumable(consumableId: 'beer' | 'medkit' | 'pot'): void {
        this.state.hostMenuState.selectedConsumableId = consumableId;
        this.npcView.renderHostDialog(this.state, this.state.hostMenuState.speech);
    }

    public buyShopItem(type: string): void {
        const hasBeerDisc = this.state.tavernUpgrades.some(u => u.id === 'upg_b2_t1' && u.unlocked);
        const hasMedDisc = this.state.tavernUpgrades.some(u => u.id === 'upg_b3_t1' && u.unlocked);
        const hasPotDisc = this.state.tavernUpgrades.some(u => u.id === 'upg_b2_t3' && u.unlocked);

        const beerCost = hasBeerDisc ? 8 : 10;
        const medCost = hasMedDisc ? 15 : 18;
        const potCost = hasPotDisc ? 20 : 25;

        if (type === 'beer' && this.state.gold >= beerCost) {
            this.state.gold -= beerCost;
            this.state.beer++;
            this.hudView.appendLog(`Куплена кружка чешского пенного пива (1d10 HP).`);
        } else if (type === 'medkit' && this.state.gold >= medCost) {
            this.state.gold -= medCost;
            this.state.medkits++;
            this.state.herbs += 3;
            const wounded = this.state.party.find(h => h.status !== 'dead' && h.injuries.length > 0);
            if (wounded) {
                const removed = wounded.injuries.pop();
                this.hudView.appendLog(`Куплена <b>Полевая аптечка</b>: снята травма «${removed}» у бойца ${wounded.name}!`);
            } else {
                this.hudView.appendLog(`Куплена <b>Полевая аптечка</b> (+1 в запас, +3 целебные травы).`);
            }
        } else if (type === 'pot' && this.state.gold >= potCost) {
            this.state.gold -= potCost;
            this.state.pots++;
            this.hudView.appendLog(`Куплен Штурмовой горшок (1d20 урона).`);
        } else if (type === 'sword' && this.state.gold >= 35) {
            this.state.gold -= 35;
            this.state.spareEquip.push(new EquipmentItem('Гусарская сабля', 'weapon', 2, 0, 5));
            this.hudView.appendLog(`Куплена <b>Гусарская сабля (+2 Ур)</b>! Наденьте её на бойца в меню ОТРЯД.`);
        } else if (type === 'plate' && this.state.gold >= 40) {
            this.state.gold -= 40;
            this.state.spareEquip.push(new EquipmentItem('Кованая кираса', 'armor', 0, 2, 8));
            this.hudView.appendLog(`Куплена <b>Кованая кираса (+2 Бр / +8% Блок)</b>! Наденьте её на бойца в меню ОТРЯД.`);
        }
        this.topBarView.renderStats(this.state);
        this.openHostDialog("«Хорошая покупка, пане! Честный товар за честное серебро!»");
    }

    public openClinicDialog(): void {
        this.npcView.renderClinicDialog(this.state);
    }

    public treatHeroInClinic(idx: number, mode: 'hp' | 'injuries'): void {
        const h = this.state.party[idx];
        if (!h || h.status !== 'ready') return;

        if (mode === 'hp') {
            if (this.state.gold < 10) return;
            this.state.gold -= 10;
            h.status = 'clinic';
            h.timer = 1;
        } else if (mode === 'injuries') {
            const cost = 15 * h.injuries.length;
            if (this.state.gold < cost) return;
            this.state.gold -= cost;
            h.status = 'clinic';
            h.timer = 1 + h.injuries.length;
        }

        this.topBarView.renderStats(this.state);
        this.openClinicDialog();
    }

    public openMercsDialog(): void {
        const jokes = this.state.mercJokes;
        if (jokes && jokes.length > 0) {
            const others = jokes.filter(j => j !== this.state.currentMercJoke);
            const pool = others.length > 0 ? others : jokes;
            this.state.currentMercJoke = pool[Math.floor(Math.random() * pool.length)];
        }
        this.npcView.renderMercsDialog(this.state);
    }

    public hireMercenary(idx: number): void {
        const m = this.state.mercsForHire[idx];
        if (!m || this.state.gold < m.price) return;

        const totalAlive = this.state.party.filter(h => h.status !== 'dead').length;
        if (totalAlive >= this.state.squadMax + this.state.reserveMax) return;

        this.state.gold -= m.price;
        const currentSquad = this.state.party.filter(h => h.inSquad && h.status !== 'dead').length;
        m.inSquad = (currentSquad < this.state.squadMax);
        this.state.mercsForHire.splice(idx, 1);
        this.state.party.push(m);

        this.hudView.appendLog(`<span class="hl-green">СТОЛ НАЕМНИКОВ:</span> В гильдию нанят боец <b>${m.name}</b> (${m.cls}, Ур.${m.lvl})!`);
        this.topBarView.renderStats(this.state);
        this.npcView.renderMercsDialog(this.state);
    }

    public openVerbirzDialog(): void {
        // Очищаем слоты от героев, которые больше не в статусе ready
        this.state.warCampaigns.forEach(c => {
            if (!c.assignedHeroIds) c.assignedHeroIds = [];
            c.assignedHeroIds = c.assignedHeroIds.filter(hid => {
                const h = this.state.party.find(p => p.id === hid);
                return !!h && h.status === 'ready';
            });
        });
        this.npcView.renderVerbirzDialog(this.state);
    }

    public assignHeroToWarSlot(heroId: string, campIdx: number, slotIdx?: number): void {
        const hero = this.state.party.find(p => p.id === heroId);
        const camp = this.state.warCampaigns[campIdx];
        if (!hero || !camp || hero.status !== 'ready') return;

        // Проверка требования по классу, если указано «Нужен: ...»
        if (camp.reqClass && camp.reqClass.startsWith('Нужен:')) {
            const reqCls = camp.reqClass.replace('Нужен:', '').trim();
            if (hero.cls !== reqCls) {
                this.hudView.appendLog(`<span class="hl-red">ВЕРБОВЩИК:</span> Для похода «${camp.name}» требуется класс <b>${reqCls}</b>!`);
                return;
            }
        }

        // Убираем героя из других слотов кампаний, если он там был
        this.state.warCampaigns.forEach(c => {
            if (!c.assignedHeroIds) c.assignedHeroIds = [];
            const i = c.assignedHeroIds.indexOf(heroId);
            if (i >= 0) c.assignedHeroIds.splice(i, 1);
        });

        if (!camp.assignedHeroIds) camp.assignedHeroIds = [];
        if (slotIdx !== undefined && slotIdx >= 0 && slotIdx < camp.needHeroes) {
            if (slotIdx < camp.assignedHeroIds.length) {
                camp.assignedHeroIds[slotIdx] = heroId;
            } else if (camp.assignedHeroIds.length < camp.needHeroes) {
                camp.assignedHeroIds.push(heroId);
            }
        } else if (camp.assignedHeroIds.length < camp.needHeroes) {
            camp.assignedHeroIds.push(heroId);
        } else {
            camp.assignedHeroIds[camp.needHeroes - 1] = heroId;
        }

        this.openVerbirzDialog();
    }

    public removeHeroFromWarSlot(heroId: string): void {
        this.state.warCampaigns.forEach(c => {
            if (!c.assignedHeroIds) return;
            const idx = c.assignedHeroIds.indexOf(heroId);
            if (idx >= 0) c.assignedHeroIds.splice(idx, 1);
        });
        this.openVerbirzDialog();
    }

    public selectRecruiterCampaign(idx: number): void {
        this.state.selectedRecruiterCampaign = idx;
        this.state.selectedHeroesForWar = [];
        this.openVerbirzDialog();
    }

    public toggleHeroWarPick(heroId: string): void {
        const camp = this.state.warCampaigns[this.state.selectedRecruiterCampaign];
        const idx = this.state.selectedHeroesForWar.indexOf(heroId);
        if (idx >= 0) {
            this.state.selectedHeroesForWar.splice(idx, 1);
        } else if (this.state.selectedHeroesForWar.length < camp.needHeroes) {
            this.state.selectedHeroesForWar.push(heroId);
        }
        this.openVerbirzDialog();
    }

    public dispatchHeroesToWar(campIdx?: number): void {
        const targetIdx = campIdx !== undefined ? campIdx : this.state.selectedRecruiterCampaign;
        const camp = this.state.warCampaigns[targetIdx];
        if (!camp) return;

        const heroIds = (camp.assignedHeroIds && camp.assignedHeroIds.length === camp.needHeroes)
            ? [...camp.assignedHeroIds]
            : (this.state.selectedHeroesForWar.length === camp.needHeroes ? [...this.state.selectedHeroesForWar] : []);

        if (heroIds.length !== camp.needHeroes) return;

        const sentNames: string[] = [];
        heroIds.forEach(hid => {
            const h = this.state.party.find(p => p.id === hid);
            if (h && h.status === 'ready') {
                h.status = 'war';
                h.inSquad = false;
                h.timer = camp.cycles;
                h.warContract = { ...camp };
                sentNames.push(h.name);
            }
        });

        camp.assignedHeroIds = [];
        this.state.selectedHeroesForWar = [];
        this.hudView.appendLog(`<span class="hl-gold">КОРОЛЕВСКИЙ ВЕРБОВЩИК:</span> ${sentNames.join(', ')} отправлены в поход «<b>${camp.name}</b>» на ${camp.cycles} ц.!`);
        this.topBarView.renderStats(this.state);
        this.openVerbirzDialog();
    }

    public openQuestsDialog(): void {
        this.npcView.renderQuestsDialog(this.state);
    }

    public toggleHeroMissionPick(heroId: string): void {
        const h = this.state.party.find(p => p.id === heroId);
        if (!h || h.status !== 'ready') return;
        if (h.inSquad) {
            h.inSquad = false;
        } else {
            const count = this.state.party.filter(p => p.inSquad && p.status === 'ready' && p.hp > 0).length;
            if (count < this.state.squadMax) {
                h.inSquad = true;
            }
        }
        this.topBarView.renderStats(this.state);
        this.openQuestsDialog();
    }

    public openSmithDialog(customSpeech: string | null = null): void {
        if (customSpeech) {
            this.state.smithMenuState.speech = customSpeech;
        }
        this.npcView.renderSmithDialog(this.state);
    }

    public setSmithRecipeFilter(filter: 'all' | 'weapon' | 'armor' | 'trinket'): void {
        this.state.smithMenuState.filter = filter;
        this.npcView.renderSmithDialog(this.state);
    }

    public smeltSpareItem(spareIdx: number): void {
        const item = this.state.spareEquip[spareIdx];
        if (!item) return;

        const forgeTier = GameDataCatalog.getForgeTier(this.state.tavernUpgrades);
        const yieldMap = GameDataCatalog.getSmeltYield(item, forgeTier);
        const gainedParts: string[] = [];

        (['iron', 'bronze', 'steel', 'damask'] as MetalType[]).forEach(m => {
            const amt = yieldMap[m] || 0;
            if (amt > 0) {
                this.state.metals[m] += amt;
                gainedParts.push(`+${amt} ${GameDataCatalog.METAL_META[m].name}`);
            }
        });

        this.state.spareEquip.splice(spareIdx, 1);
        const gainedStr = gainedParts.join(', ');
        this.hudView.appendLog(`<span class="hl-gold">КУЗНИЦА:</span> Предмет <b>${item.name}</b> переплавлен в слитки (${gainedStr}).`);
        this.openSmithDialog(`«Жар славный! Переплавили «${item.name}» и отлили слитки: ${gainedStr}.»`);
    }

    public craftSmithRecipe(recipeId: string): void {
        const recipe = GameDataCatalog.createSmithingRecipes().find(r => r.id === recipeId);
        if (!recipe) return;

        const metalKeys: MetalType[] = ['iron', 'bronze', 'steel', 'damask'];
        for (const m of metalKeys) {
            const need = recipe.cost[m] || 0;
            if (this.state.metals[m] < need) return;
        }
        for (const m of metalKeys) {
            const need = recipe.cost[m] || 0;
            if (need > 0) this.state.metals[m] -= need;
        }

        const bonus = GameDataCatalog.getForgeCraftBonus(this.state.tavernUpgrades);
        const atk = recipe.atk + (recipe.slot === 'weapon' ? bonus.atk : 0);
        const armor = recipe.armor + (recipe.slot === 'armor' ? bonus.armor : 0);
        const block = recipe.block + (recipe.slot === 'trinket' ? bonus.block : 0);
        const descSuffix = bonus.atk > 0 ? ' (Усилено клеймом Кузницы братства)' : '';

        const forged = new EquipmentItem(
            recipe.name,
            recipe.slot,
            atk,
            armor,
            block,
            recipe.desc + descSuffix
        );
        this.state.spareEquip.push(forged);

        const statsParts: string[] = [];
        if (atk > 0) statsParts.push(`+${atk} Ур`);
        if (armor > 0) statsParts.push(`+${armor} Бр`);
        if (block > 0) statsParts.push(`+${block}% Блок`);

        this.hudView.appendLog(`<span class="hl-green">КУЗНИЦА:</span> Выковано снаряжение <b>${forged.name}</b> (${statsParts.join(', ')})! Отправлено на склад отряда.`);
        this.openSmithDialog(`«Готово, пане! «${forged.name}» (${statsParts.join(', ')}) остыло и лежит в арсенале отряда!»`);
    }
}
