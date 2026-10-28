import { GameStateModel } from '../models/GameStateModel';
import { HeroModel, HeroSkillOrder, HeroTargetRule } from '../models/HeroModel';
import { EnemyModel } from '../models/EnemyModel';
import { UnitBase } from '../models/UnitBase';
import { EquipmentItem } from '../models/EquipmentItem';
import { TopStatsBarView } from '../views/TopStatsBarView';
import { CombatHudView } from '../views/CombatHudView';
import { GuildPresenter } from './GuildPresenter';

/**
 * Presenter Карты Богемии и Тактического Авто-боя (MVP Presenter)
 */
export class CombatPresenter {
    constructor(
        private state: GameStateModel,
        private topBarView: TopStatsBarView,
        private hudView: CombatHudView,
        private guildPresenter: GuildPresenter
    ) {}

    private roll(sides: number): number {
        return Math.floor(Math.random() * sides) + 1;
    }

    public startQuest(): void {
        this.state.scene = 'map';
        this.state.mapState = { dir: 'to_quest', progress: 0, ambushTriggered: false };
        this.topBarView.updateSceneLayout(this.state);
    }

    public updateMapLogic(): void {
        const ms = this.state.mapState;
        ms.progress += 0.008;

        if (this.state.questsDone >= 1 && !ms.ambushTriggered && Math.abs(ms.progress - 0.5) < 0.015) {
            ms.ambushTriggered = true;
            if (Math.random() < 0.5) {
                this.hudView.appendLog(`<span class="hl-red">ЗАСАДА НА ТРАКТЕ!</span> На обочине притаились мародеры!`);
                this.startCombat(true);
                return;
            }
        }

        if (ms.progress >= 1) {
            ms.progress = 1;
            if (ms.dir === 'to_quest') {
                this.startCombat(false);
            } else {
                this.guildPresenter.advanceCycle(1);
                this.guildPresenter.enterGuild();
            }
        }
    }

    public startCombat(isAmbush: boolean): void {
        this.state.scene = 'combat';
        this.topBarView.updateSceneLayout(this.state);
        this.hudView.clearLog();

        const combat = this.state.combat;
        combat.active = true;
        combat.paused = false;
        combat.isAmbush = isAmbush;
        combat.focusEnemyIndex = null;
        combat.selectedHeroId = null;
        combat.tickTimer = 0;
        combat.psaKrevCd = 0;
        combat.psaKrevBuffTurns = 0;

        const enemyCount = isAmbush ? 2 : 3;
        const names = ['Чашник с цепом', 'Гусит-стрелок', 'Чашник-ветеран'];
        combat.enemies = [];
        for (let i = 0; i < enemyCount; i++) {
            const maxHp = 15 + this.state.questsDone * 4 + (i === 2 ? 5 : 0);
            combat.enemies.push(new EnemyModel({
                id: 'en_' + i,
                name: names[i],
                hp: maxHp,
                maxHp: maxHp,
                atkSides: 4,
                initBase: 4 + i,
                superCharge: i === 2 ? 1 : 0
            }));
        }

        combat.turnOrder = [];
        const activeHeroes = this.state.party.filter(h => h.inSquad && h.status === 'ready' && h.hp > 0);
        activeHeroes.forEach(h => {
            h.cd1 = 0; h.cd2 = 0; h.tempHp = 0;
            h.rollInitiative();
            combat.turnOrder.push(h);
        });
        combat.enemies.forEach(e => {
            e.rollInitiative();
            combat.turnOrder.push(e);
        });

        combat.turnOrder.sort((a, b) => b.initRoll - a.initRoll);
        combat.turnIndex = 0;

        const orderStr = combat.turnOrder.map(u => `${u.name}(${u.initRoll})`).join(' → ');
        this.hudView.appendLog(`<span class="hl-gold">БРОСОК ИНИЦИАТИВЫ:</span> ${orderStr}`);
        this.hudView.renderCombatControls(this.state);
    }

    public togglePause(): void {
        this.state.combat.paused = !this.state.combat.paused;
        this.hudView.renderCombatControls(this.state);
    }

    public usePsaKrev(): void {
        const combat = this.state.combat;
        if (!combat.active || combat.psaKrevCd > 0) return;
        combat.psaKrevCd = 3;
        combat.psaKrevBuffTurns = 6;
        this.state.shake = 10;

        this.state.party.filter(h => h.status === 'ready' && h.hp > 0).forEach(h => {
            h.tempHp = 10;
            this.state.addParticles(h.x || 120, h.y || 120, '#ffd700', 15);
            this.state.addFloatingText("ПСЯ КРЕВ! +10 ЩИТ", h.x || 120, (h.y || 120) - 22, '#ffd700');
        });

        this.hudView.appendLog(`<span class="hl-gold">🔥 ПСЯ КРЕВ!</span> Вы громогласно ободряете поляков! Все герои получают <b>+10 временного здоровья</b> и <b>+2 к урону</b> на 6 ходов!`);
        this.hudView.renderCombatControls(this.state);
    }

    public selectHeroInCombat(id: string): void {
        this.state.combat.selectedHeroId = (this.state.combat.selectedHeroId === id) ? null : id;
        this.hudView.renderCombatControls(this.state);
    }

    public cycleHeroSkillOrder(id: string): void {
        const h = this.state.party.find(p => p.id === id);
        if (!h) return;
        const modes: HeroSkillOrder[] = ['skill1_first', 'basic_only', 'alternate'];
        h.skillOrder = modes[(modes.indexOf(h.skillOrder) + 1) % modes.length];
        this.hudView.renderCombatControls(this.state);
    }

    public cycleHeroTargetRule(id: string): void {
        const h = this.state.party.find(p => p.id === id);
        if (!h) return;
        const rules: HeroTargetRule[] = ['focus_or_random', 'lowest_hp', 'highest_hp'];
        h.targetRule = rules[(rules.indexOf(h.targetRule) + 1) % rules.length];
        this.hudView.renderCombatControls(this.state);
    }

    public useMasterBeer(): void {
        if (this.state.beer <= 0) return;
        const alive = this.state.party.filter(h => h.status === 'ready' && h.hp > 0);
        if (!alive.length) return;
        alive.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
        const target = alive[0];
        this.state.beer--;
        const heal = this.roll(10);
        target.hp = Math.min(target.maxHp, target.hp + heal);
        this.state.addFloatingText(`+${heal} ПИВО!`, target.x || 120, (target.y || 120) - 15, '#66ff66');
        this.hudView.appendLog(`<span class="hl-green">ИНВЕНТАРЬ:</span> ${target.name} выпивает пиво и лечит <b>${heal} HP</b> (1d10)!`);
        this.topBarView.renderStats(this.state);
        this.hudView.renderCombatControls(this.state);
    }

    public useMasterPot(): void {
        if (this.state.pots <= 0) return;
        this.state.pots--;
        const dmg = this.roll(20);
        this.state.shake = 14;
        this.hudView.appendLog(`<span class="hl-gold">ШТУРМОВОЙ ГОРШОК!</span> Взрыв порохового горшка наносит <b>${dmg} урона</b> (1d20) всем врагам!`);
        this.state.combat.enemies.forEach(e => {
            if (e.hp > 0) {
                e.hp = Math.max(0, e.hp - dmg);
                e.flash = 10;
                this.state.addParticles(e.x || 360, e.y || 120, '#ff8800', 18);
                this.state.addFloatingText(`-${dmg} БУМ!`, e.x || 360, (e.y || 120) - 15, '#ffcc00');
            }
        });
        this.topBarView.renderStats(this.state);
        this.checkCombatEnd();
        if (this.state.combat.active) this.hudView.renderCombatControls(this.state);
    }

    private pickEnemyTargetForHero(hero: HeroModel): { target: EnemyModel; index: number } | null {
        const combat = this.state.combat;
        const alive = combat.enemies.map((e, i) => ({ target: e, index: i })).filter(x => x.target.hp > 0);
        if (!alive.length) return null;

        if (combat.focusEnemyIndex !== null) {
            const fe = combat.enemies[combat.focusEnemyIndex];
            if (fe && fe.hp > 0) return { target: fe, index: combat.focusEnemyIndex };
        }
        if (hero.targetRule === 'lowest_hp') {
            alive.sort((a, b) => a.target.hp - b.target.hp);
            return alive[0];
        }
        if (hero.targetRule === 'highest_hp') {
            alive.sort((a, b) => b.target.hp - a.target.hp);
            return alive[0];
        }
        return alive[Math.floor(Math.random() * alive.length)];
    }

    private applyDamageToUnit(attacker: UnitBase | null, defender: UnitBase, rawDmg: number): number {
        let dmg = rawDmg;
        if (attacker && attacker.id === 'pan') {
            if (Math.random() < 0.5) {
                this.state.addFloatingText("ИК! 0 УРОНА", attacker.x, attacker.y - 20, '#ffd700');
                this.hudView.appendLog(`<i>Непросыхаемый алкаш (50%):</i> Пан Вшивец мажет спьяну! Исходящий урон = <b>0</b>.`);
                return 0;
            }
        }
        if (defender && defender.id === 'pan') {
            if (Math.random() < 0.5) {
                this.state.addFloatingText("ПЬЯНЫЙ УВОРОТ! 0", defender.x, defender.y - 20, '#66ff66');
                this.hudView.appendLog(`<i>Непросыхаемый алкаш (50%):</i> Пан Вшивец покачнулся, и удар прошел мимо! Входящий урон = <b>0</b>!`);
                return 0;
            }
        }

        if (defender.tempHp && defender.tempHp > 0) {
            const absorbedByTemp = Math.min(defender.tempHp, dmg);
            defender.tempHp -= absorbedByTemp;
            dmg -= absorbedByTemp;
            if (absorbedByTemp > 0 && dmg === 0) {
                this.state.addFloatingText(`-${absorbedByTemp} ЩИТ`, defender.x, defender.y - 18, '#66ccff');
                return absorbedByTemp;
            }
        }

        defender.hp = Math.max(0, defender.hp - dmg);
        defender.flash = 8;
        this.state.addParticles(defender.x, defender.y, '#ff4444', 10);
        this.state.addFloatingText(`-${dmg}`, defender.x, defender.y - 18, '#ff6666');
        return dmg;
    }

    public executeNextCombatTurn(): void {
        const combat = this.state.combat;
        if (!combat.active || this.checkCombatEnd()) return;

        if (combat.psaKrevCd > 0) combat.psaKrevCd--;
        if (combat.psaKrevBuffTurns > 0) {
            combat.psaKrevBuffTurns--;
            if (combat.psaKrevBuffTurns === 0) {
                this.state.party.forEach(h => { h.tempHp = 0; });
                this.hudView.appendLog(`Действие боевого клича <b>«Пся крев!»</b> закончилось.`);
            }
        }

        let loops = 0;
        while (combat.turnOrder[combat.turnIndex].hp <= 0 && loops < combat.turnOrder.length) {
            combat.turnIndex = (combat.turnIndex + 1) % combat.turnOrder.length;
            loops++;
        }
        const unit = combat.turnOrder[combat.turnIndex];
        combat.turnIndex = (combat.turnIndex + 1) % combat.turnOrder.length;

        const tadeusz = this.state.party.find(h => h.id === 'tadeusz' && h.status === 'ready' && h.hp > 0);
        if (tadeusz && Math.random() < 0.10) {
            this.state.herbs++;
            this.state.addFloatingText("+1 ТРАВА", tadeusz.x, tadeusz.y - 22, '#66ff66');
            this.hudView.appendLog(`<span class="hl-green">Знаток трав (10%):</span> Брат Тадеуш заметил целебную траву (${this.state.herbs}/5)!`);
            if (this.state.herbs >= 5) {
                this.state.herbs -= 5;
                const brewed = this.roll(4);
                this.state.beer += brewed;
                this.state.addFloatingText(`+${brewed} ПИВА!`, tadeusz.x, tadeusz.y - 34, '#ffd700');
                this.hudView.appendLog(`<span class="hl-gold">ПИВОВАРНЯ СВЯТОШИ!</span> Из 5 трав Брат Тадеуш сварил <b>${brewed} бут. пива</b> (1d4)!`);
            }
            this.topBarView.renderStats(this.state);
        }

        unit.lunge = 10;
        const psaDmgBonus = combat.psaKrevBuffTurns > 0 ? 2 : 0;

        if (!unit.isEnemy) {
            const hero = unit as HeroModel;
            if (hero.cd1 > 0) hero.cd1--;
            if (hero.cd2 > 0) hero.cd2--;

            const bonus = (hero.atkBonus || 0) + psaDmgBonus;

            if (hero.id === 'szymon' && Math.random() < 0.20) {
                const randEnemy = combat.enemies[Math.floor(Math.random() * combat.enemies.length)];
                const pDmg = this.roll(10) + bonus;
                if (randEnemy.hp <= 0) {
                    this.state.addParticles(randEnemy.x, randEnemy.y, '#aaa', 12);
                    this.state.addFloatingText(`В ТРУП! -${pDmg}`, randEnemy.x, randEnemy.y - 15, '#ccc');
                    this.hudView.appendLog(`<span class="hl-blue">Внезапный Пистоль (20%):</span> Шимон стреляет из пистоля на ${pDmg} ур. прямо в труп (${randEnemy.name})!`);
                } else {
                    randEnemy.hp = Math.max(0, randEnemy.hp - pDmg);
                    randEnemy.flash = 8;
                    this.state.addParticles(randEnemy.x, randEnemy.y, '#ffcc00', 14);
                    this.state.addFloatingText(`ПИСТОЛЬ -${pDmg}!`, randEnemy.x, randEnemy.y - 18, '#ffd700');
                    this.hudView.appendLog(`<span class="hl-blue">Внезапный Пистоль (20%):</span> Шимон палит из пистоля в ${randEnemy.name} на <b>${pDmg} урона</b>!`);
                }
                if (this.checkCombatEnd()) return;
            }

            const targetInfo = this.pickEnemyTargetForHero(hero);
            if (!targetInfo) return;
            const target = targetInfo.target;
            const tIdx = targetInfo.index;

            if (hero.cls === 'Шляхта') {
                if (hero.shouldUsePrimarySkill(hero.cd1 <= 0)) {
                    hero.cd1 = hero.maxCd1; hero.lastUsedSkill = 1;
                    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
                    const totalRoll = this.roll(10) + bonus;
                    if (hero.id === 'pan' && Math.random() < 0.5) {
                        this.state.addFloatingText("ИК! МИМО!", hero.x, hero.y - 20, '#ffd700');
                        this.hudView.appendLog(`<b>${hero.name}</b> размахнулся <i>Атакой плашмя</i>, но спьяну промахнулся (0 урона)!`);
                    } else {
                        const perEnemy = Math.max(1, Math.floor(totalRoll / aliveEnemies.length));
                        this.hudView.appendLog(`<b>${hero.name}</b> бьет <span class="hl-gold">«Атакой плашмя»</span> (${totalRoll} ур. в сумме) — по ${perEnemy} урона всем врагам!`);
                        aliveEnemies.forEach(e => {
                            e.hp = Math.max(0, e.hp - perEnemy);
                            e.flash = 8;
                            this.state.addFloatingText(`-${perEnemy}`, e.x, e.y - 15, '#ff8866');
                        });
                    }
                } else {
                    hero.lastUsedSkill = 2;
                    const d = this.roll(4) + bonus;
                    this.hudView.appendLog(`<b>${hero.name}</b> рубит <i>оружием</i> по ${target.name} (${d} ур.).`);
                    this.applyDamageToUnit(hero, target, d);
                }
            } else if (hero.cls === 'Святоша') {
                const woundedAllies = this.state.party.filter(h => h.status === 'ready' && h.hp > 0 && h.hp < h.maxHp);
                if (hero.shouldUsePrimarySkill(hero.cd2 <= 0 && woundedAllies.length > 0)) {
                    hero.cd2 = hero.maxCd2; hero.lastUsedSkill = 1;
                    woundedAllies.sort((a, b) => a.hp - b.hp);
                    const ally = woundedAllies[0];
                    const heal = this.roll(4);
                    ally.hp = Math.min(ally.maxHp, ally.hp + heal);
                    this.state.addFloatingText(`+${heal} HP`, ally.x, ally.y - 18, '#66ff66');
                    this.hudView.appendLog(`<b>${hero.name}</b> использует <span class="hl-green">«Запить грехи»</span> и лечит ${ally.name} на <b>${heal} HP</b>!`);
                } else {
                    hero.lastUsedSkill = 2;
                    const d = this.roll(4) + bonus;
                    this.hudView.appendLog(`<b>${hero.name}</b> бьет <i>дубиной</i> ${target.name} на <b>${d} урона</b>.`);
                    this.applyDamageToUnit(hero, target, d);
                }
            } else if (hero.cls === 'Мушкетер') {
                if (hero.shouldUsePrimarySkill(hero.cd1 <= 0)) {
                    hero.cd1 = hero.maxCd1; hero.lastUsedSkill = 1;
                    const totalDmg = this.roll(10) + bonus;
                    let neighbor: EnemyModel | null = null;
                    if (tIdx + 1 < combat.enemies.length && combat.enemies[tIdx + 1].hp > 0) neighbor = combat.enemies[tIdx + 1];
                    else if (tIdx - 1 >= 0 && combat.enemies[tIdx - 1].hp > 0) neighbor = combat.enemies[tIdx - 1];

                    if (!neighbor) {
                        this.applyDamageToUnit(hero, target, totalDmg);
                        this.hudView.appendLog(`<b>${hero.name}</b> стреляет из <span class="hl-blue">Аркебузы</span> в ${target.name} на <b>${totalDmg} урона</b>!`);
                    } else {
                        const half1 = Math.ceil(totalDmg / 2);
                        const half2 = Math.floor(totalDmg / 2);
                        const overflow1 = Math.max(0, half1 - target.hp);
                        this.applyDamageToUnit(hero, target, half1);
                        const totalSecond = half2 + overflow1;
                        const overflow2 = Math.max(0, totalSecond - neighbor.hp);
                        this.applyDamageToUnit(hero, neighbor, totalSecond);
                        if (overflow2 > 0 && target.hp > 0) this.applyDamageToUnit(hero, target, overflow2);
                        this.hudView.appendLog(`<b>${hero.name}</b> стреляет из <span class="hl-blue">Аркебузы</span> (${totalDmg} ур.) по ${target.name} и ${neighbor.name}!`);
                    }
                } else {
                    hero.lastUsedSkill = 2;
                    const d = this.roll(4) + bonus;
                    this.hudView.appendLog(`<b>${hero.name}</b> пыряет <i>кортиком</i> ${target.name} на <b>${d} урона</b>.`);
                    this.applyDamageToUnit(hero, target, d);
                }
            }
        } else {
            const enemy = unit as EnemyModel;
            const aliveHeroes = this.state.party.filter(h => h.status === 'ready' && h.hp > 0);
            if (!aliveHeroes.length) return;
            const targetHero = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];

            enemy.superCharge++;
            if (enemy.superCharge >= 3) {
                enemy.superCharge = 0;
                const rawSuper = this.roll(6) + 5;
                this.state.shake = 8;
                if (Math.random() * 100 < targetHero.blockChance) {
                    this.state.addFloatingText("БЛОК СУПЕР-УДАРА!", targetHero.x, targetHero.y - 22, '#66ccff');
                    this.hudView.appendLog(`<span class="hl-blue">БЛОК!</span> ${enemy.name} наносит <b>СУПЕР-УДАР</b>, но ${targetHero.name} блокирует его (${targetHero.blockChance}%)!`);
                } else {
                    const finalDmg = Math.max(1, rawSuper - targetHero.armor);
                    this.hudView.appendLog(`<span class="hl-red">СУПЕР-УДАР!</span> ${enemy.name} бьет цепом по ${targetHero.name} (${rawSuper} ур., поглощено броней: ${targetHero.armor})!`);
                    this.applyDamageToUnit(enemy, targetHero, finalDmg);
                }
            } else {
                const rawDmg = this.roll(enemy.atkSides);
                const finalDmg = Math.max(1, rawDmg - Math.floor(targetHero.armor / 2));
                this.hudView.appendLog(`${enemy.name} атакует ${targetHero.name} (${finalDmg} ур.).`);
                this.applyDamageToUnit(enemy, targetHero, finalDmg);
            }
        }

        this.hudView.renderCombatControls(this.state);
        this.checkCombatEnd();
    }

    public checkCombatEnd(): boolean {
        const combat = this.state.combat;
        const enemiesAlive = combat.enemies.some(e => e.hp > 0);
        const heroesAlive = this.state.party.some(h => h.status === 'ready' && h.hp > 0);

        if (!enemiesAlive) {
            combat.active = false;
            const rewardGold = combat.isAmbush ? (20 + this.roll(10)) : (45 + this.roll(15));
            this.state.gold += rewardGold;
            if (!combat.isAmbush) this.state.questsDone++;

            this.state.party.filter(h => h.status === 'ready' && h.hp > 0).forEach(h => {
                h.tempHp = 0;
                h.exp += 10;
                if (h.exp >= 20) {
                    h.exp -= 20; h.lvl++; h.talentPts++; h.maxHp += 3; h.hp += 3;
                    this.hudView.appendLog(`<span class="hl-green">НОВЫЙ УРОВЕНЬ!</span> ${h.name} достиг ${h.lvl} ур. и получил +1 очко талантов!`);
                }
            });

            let lootMsg = '';
            if (Math.random() < 0.7) {
                this.state.spareEquip.push(new EquipmentItem('Трофейный клевец', 'weapon', 2, 0, 5));
                lootMsg = ` Также добыт <b>Трофейный клевец (+2 Ур)</b> — загляните в меню ОТРЯД!`;
            }
            this.hudView.appendLog(`<span class="hl-gold">ПОБЕДА!</span> Чашники разбиты! Награда: <b>${rewardGold} грошей</b>.${lootMsg}`);
            this.topBarView.renderStats(this.state);
            this.hudView.renderVictoryControls();
            return true;
        }

        if (!heroesAlive) {
            combat.active = false;
            this.hudView.appendLog(`<span class="hl-red">ПОРАЖЕНИЕ!</span> Отряд разбит и с новыми шишками отступает в таверну...`);
            this.state.party.forEach(h => {
                if (h.status === 'ready') {
                    h.hp = Math.max(6, Math.floor(h.maxHp * 0.4));
                    h.tempHp = 0;
                    h.injuries.push('Побит цепом');
                }
            });
            this.hudView.renderDefeatControls();
            return true;
        }
        return false;
    }

    public returnFromCombat(): void {
        this.state.scene = 'map';
        if (!this.state.combat.isAmbush) {
            this.state.mapState.dir = 'to_guild';
            this.state.mapState.progress = 0;
            this.state.mapState.ambushTriggered = false;
        }
        this.topBarView.updateSceneLayout(this.state);
    }
}
