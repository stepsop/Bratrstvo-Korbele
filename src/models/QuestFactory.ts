import { HeroModel } from './HeroModel';
import { DailyQuestData, DailyQuestDifficulty } from './GameStateModel';

/**
 * Фабрика и калькулятор ежедневных заданий (SRP: отвечает только за генерацию и расчёт шансов заданий)
 */
export class QuestFactory {
    public static generateDailyQuests(daySeed: number): DailyQuestData[] {
        const greyPool = [
            { title: 'Разгон мародёров', icon: 'dagger', location: 'Околица Ратай', condition: 'Без засад на тракте', desc: 'Мелкая шайка дезертиров грабит крестьянские подводы у мельницы.' },
            { title: 'Патруль у моста', icon: 'shield_cross', location: 'Брод через Сазаву', condition: 'Бонус +10 грошей без потерь', desc: 'Очистить старый каменный мост от сборщиков незаконной подати.' }
        ];
        const greenPool = [
            { title: 'Разъезд Чашников', icon: 'crossed_swords', location: 'Тракт на Кутна-Гору', condition: 'Шанс добыть трофей 75%', desc: 'Передовой дозор таборитов перекрыл торговую дорогу у перелеска.' },
            { title: 'Охрана рудокопов', icon: 'pickaxe', location: 'Шахты Скалицы', condition: 'Враги атакуют первыми', desc: 'Отбить нападение гуситских фуражиров на серебряные штольни.' }
        ];
        const bluePurplePool = [
            { title: 'Засада у вагенбурга', icon: 'bow', diff: 'blue' as DailyQuestDifficulty, label: 'Сложное (Синее)', location: 'Холмы под Табором', condition: 'У врагов стрелки и цепы', desc: 'Укрепленная стоянка чашников с арбалетчиками и ветеранами.' },
            { title: 'Охота на сотника', icon: 'skull_plain', diff: 'purple' as DailyQuestDifficulty, label: 'Эпическое (Фиол.)', location: 'Ущелье у Троски', condition: 'Вожак с заряженным Супер-ударом', desc: 'Элитный отряд гуситского сотника укрылся в скалах у Троски.' }
        ];
        const redGoldPool = [
            { title: 'Кровавая сеча под Брно', icon: 'skull_bones', diff: 'red' as DailyQuestDifficulty, label: 'Смертельное (Красн.)', location: 'Окраины Брно (Моравия)', condition: '4 моравских бойца (+14 HP, урон 1d6)', desc: 'Самый жестокий отряд моравских фанатиков перекрыл дорогу под Брно.' },
            { title: 'Золотой обоз Моравии', icon: 'crown', diff: 'gold' as DailyQuestDifficulty, label: 'Легендарное (Жёлт.)', location: 'Крепость Брно (Моравия)', condition: '4 панцирных гвардейца Брно • Трофей', desc: 'Элитная гвардия таборитов ведёт сундуки с серебром через Моравию в Брно.' }
        ];

        const g1 = greyPool[daySeed % greyPool.length];
        const g2 = greenPool[daySeed % greenPool.length];
        const g3 = bluePurplePool[daySeed % bluePurplePool.length];
        const g4 = redGoldPool[daySeed % redGoldPool.length];

        const gold1 = 35 + (daySeed % 2) * 5;
        const gold2 = 60 + (daySeed % 2) * 5;
        const gold3 = g3.diff === 'purple' ? 105 : 90;
        const gold4 = g4.diff === 'gold' ? 165 : 145;

        return [
            {
                id: `q_grey_${daySeed}`,
                title: g1.title,
                icon: g1.icon,
                difficulty: 'grey',
                diffLabel: 'Лёгкое (Серое)',
                powerReq: 30,
                goldReward: gold1,
                expReward: 10,
                goldMin: gold1,
                goldMax: gold1,
                condition: g1.condition,
                desc: g1.desc,
                location: g1.location,
                enemyCount: 2,
                enemyHpBonus: 0,
                enemyAtkSides: 4
            },
            {
                id: `q_green_${daySeed}`,
                title: g2.title,
                icon: g2.icon,
                difficulty: 'green',
                diffLabel: 'Обычное (Зелёное)',
                powerReq: 48,
                goldReward: gold2,
                expReward: 15,
                goldMin: gold2,
                goldMax: gold2,
                condition: g2.condition,
                desc: g2.desc,
                location: g2.location,
                enemyCount: 3,
                enemyHpBonus: 2,
                enemyAtkSides: 4
            },
            {
                id: `q_mid_${daySeed}`,
                title: g3.title,
                icon: g3.icon,
                difficulty: g3.diff,
                diffLabel: g3.label,
                powerReq: 72,
                goldReward: gold3,
                expReward: 20,
                goldMin: gold3,
                goldMax: gold3,
                condition: g3.condition,
                desc: g3.desc,
                location: g3.location,
                enemyCount: 3,
                enemyHpBonus: 7,
                enemyAtkSides: 5
            },
            {
                id: `q_hard_${daySeed}`,
                title: g4.title,
                icon: g4.icon,
                difficulty: g4.diff,
                diffLabel: g4.label,
                powerReq: 108,
                goldReward: gold4,
                expReward: 30,
                goldMin: gold4,
                goldMax: gold4,
                condition: g4.condition,
                desc: g4.desc,
                location: g4.location,
                enemyCount: 4,
                enemyHpBonus: 14,
                enemyAtkSides: 6
            }
        ];
    }

    public static calculateQuestSuccessChance(party: HeroModel[], quest: DailyQuestData): {
        chance: number;
        riskLabel: string;
        riskClass: string;
    } {
        const activeSquad = party.filter(h => h.inSquad && h.status === 'ready' && h.hp > 0);
        if (activeSquad.length === 0) {
            return { chance: 0, riskLabel: 'Отряд не собран (0%)', riskClass: 'hl-red' };
        }

        let squadPower = 0;
        activeSquad.forEach(h => {
            const unlockedTalents = h.talents.filter(t => t.unlocked).length;
            const masteryBonus = h.getMasteryTier().key === 'grey' ? 0 : 5;
            const injuryPenalty = h.injuries.length * 4;
            const heroPower = 11 + h.lvl * 3 + h.atkBonus * 3 + h.armor * 2 + Math.floor(h.blockChance / 8) + unlockedTalents * 4 + masteryBonus - injuryPenalty;
            squadPower += Math.max(5, heroPower);
        });

        const ratio = squadPower / Math.max(1, quest.powerReq);
        const rawChance = Math.round(Math.min(98, Math.max(8, ratio * 78)));

        if (rawChance >= 75) {
            return { chance: rawChance, riskLabel: `Низкий риск (${rawChance}% успех)`, riskClass: 'hl-green' };
        }
        if (rawChance >= 48) {
            return { chance: rawChance, riskLabel: `Средний риск (${rawChance}% успех)`, riskClass: 'hl-gold' };
        }
        return { chance: rawChance, riskLabel: `Высокий риск (${rawChance}% успех)`, riskClass: 'hl-red' };
    }

    public static getQuestMapRoute(quest: DailyQuestData | null): { x: number; y: number }[] {
        const praha = { x: 742, y: 412 };
        const brnoRoute = [
            praha,
            { x: 878, y: 520 },
            { x: 1025, y: 635 },
            { x: 1185, y: 725 },
            { x: 1345, y: 795 }
        ];
        const loc = quest?.location || '';
        const routesByLocation: Record<string, { x: number; y: number }[]> = {
            'Околица Ратай': [praha, { x: 808, y: 462 }, { x: 878, y: 505 }],
            'Брод через Сазаву': [praha, { x: 778, y: 472 }, { x: 816, y: 528 }],
            'Тракт на Кутна-Гору': [praha, { x: 856, y: 416 }, { x: 965, y: 422 }],
            'Шахты Скалицы': [praha, { x: 836, y: 444 }, { x: 922, y: 474 }],
            'Холмы под Табором': [praha, { x: 765, y: 508 }, { x: 785, y: 598 }],
            'Руины монастыря': [praha, { x: 560, y: 448 }, { x: 382, y: 482 }],
            'Ущелье у Троски': [praha, { x: 878, y: 344 }, { x: 1018, y: 292 }],
            'Королевский тракт': [praha, { x: 688, y: 318 }, { x: 634, y: 244 }],
            'Окраины Брно (Моравия)': brnoRoute,
            'Крепость Брно (Моравия)': brnoRoute
        };
        return routesByLocation[loc] || [praha, { x: 765, y: 508 }, { x: 785, y: 598 }];
    }
}
