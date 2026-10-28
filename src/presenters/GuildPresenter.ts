import { GameStateModel } from '../models/GameStateModel';
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

    public enterGuild(): void {
        this.state.scene = 'guild';
        this.topBarView.renderStats(this.state);
        this.topBarView.updateSceneLayout(this.state);
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
            hero.lvl += lvls;
            hero.talentPts += lvls;
            hero.maxHp += 4 * lvls;
            hero.hp = hero.maxHp;

            if (r < contract.deathChance + contract.injuryChance) {
                hero.injuries.push('Боевое ранение (-2 HP)');
                hero.maxHp = Math.max(10, hero.maxHp - 2);
                hero.hp = hero.maxHp;
                this.hudView.appendLog(`<span class="hl-gold">ВОЗВРАЩЕНИЕ С ВОЙНЫ (${contract.name}):</span> ${hero.name} принес <b>${goldEarned} грошей</b>, поднял Ур.${hero.lvl}, но получил ранение!`);
            } else {
                const bonusText = contract.bonusItem ? `, а также привез трофей: ${contract.bonusItem.name}` : '';
                if (contract.bonusItem) {
                    this.state.spareEquip.push(
                        new EquipmentItem(contract.bonusItem.name, contract.bonusItem.slot, contract.bonusItem.atk, contract.bonusItem.armor, contract.bonusItem.block)
                    );
                }
                this.hudView.appendLog(`<span class="hl-gold">ТРИУМФ ВОЙНЫ (${contract.name}):</span> ${hero.name} вернулся с победой! Принес <b>${goldEarned} грошей</b> и поднял Ур.${hero.lvl}${bonusText}!`);
            }
        }
        delete hero.warContract;
        this.topBarView.renderStats(this.state);
    }

    public openGuildSection(sec: string): void {
        if (sec === 'host') this.openHostDialog();
        else if (sec === 'clinic') this.openClinicDialog();
        else if (sec === 'mercs') this.openMercsDialog();
        else if (sec === 'verbirz') this.openVerbirzDialog();
        else if (sec === 'quests') this.openQuestsDialog();
    }

    public openHostDialog(customSpeech: string | null = null): void {
        const tales = this.state.tavernTales;
        const speech = customSpeech || tales[Math.floor(Math.random() * tales.length)];
        this.npcView.renderHostDialog(this.state, speech);
    }

    public buyShopItem(type: string): void {
        if (type === 'beer' && this.state.gold >= 10) {
            this.state.gold -= 10;
            this.state.beer++;
            this.hudView.appendLog(`Куплена бутылка пенного пива (1d10 HP).`);
        } else if (type === 'pot' && this.state.gold >= 25) {
            this.state.gold -= 25;
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
        this.npcView.renderMercsDialog(this.state);
    }

    public hireMercenary(idx: number): void {
        const m = this.state.mercsForHire[idx];
        if (!m || this.state.gold < m.price) return;

        this.state.gold -= m.price;
        const currentSquad = this.state.party.filter(h => h.inSquad && h.status !== 'dead').length;
        m.inSquad = (currentSquad < this.state.squadMax);
        this.state.mercsForHire.splice(idx, 1);
        this.state.party.push(m);

        this.topBarView.renderStats(this.state);
        this.openMercsDialog();
    }

    public openVerbirzDialog(): void {
        this.npcView.renderVerbirzDialog(this.state);
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

    public dispatchHeroesToWar(): void {
        const camp = this.state.warCampaigns[this.state.selectedRecruiterCampaign];
        if (this.state.selectedHeroesForWar.length !== camp.needHeroes) return;

        this.state.selectedHeroesForWar.forEach(hid => {
            const h = this.state.party.find(p => p.id === hid);
            if (h) {
                h.status = 'war';
                h.timer = camp.cycles;
                h.warContract = { ...camp };
            }
        });

        this.state.selectedHeroesForWar = [];
        this.topBarView.renderStats(this.state);
        this.squadPresenter.closeSquadModal();
        this.topBarView.updateSceneLayout(this.state);
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
}
