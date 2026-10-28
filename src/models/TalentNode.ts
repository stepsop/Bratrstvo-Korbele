import type { HeroModel } from './HeroModel';

/**
 * Узел дерева талантов в стиле старого WoW (аналог C# класса TalentNode)
 */
export class TalentNode {
    public id: string;
    public tier: number;
    public col: number;
    public icon: string;
    public short: string;
    public name: string;
    public desc: string;
    public unlocked: boolean;
    public applyEffect: (hero: HeroModel) => void;

    constructor(params: {
        id: string;
        tier: number;
        col: number;
        icon: string;
        short: string;
        name: string;
        desc: string;
        unlocked?: boolean;
        applyEffect: (hero: HeroModel) => void;
    }) {
        this.id = params.id;
        this.tier = params.tier;
        this.col = params.col;
        this.icon = params.icon;
        this.short = params.short;
        this.name = params.name;
        this.desc = params.desc;
        this.unlocked = Boolean(params.unlocked);
        this.applyEffect = params.applyEffect;
    }
}

/**
 * Фабрика деревьев талантов по классам героев
 */
export class TalentTreeFactory {
    public static createForHero(heroId: string, cls: string): TalentNode[] {
        if (cls === 'Шляхта') {
            return [
                new TalentNode({ id: `${heroId}_t1_l`, tier: 1, col: 1, icon: '🗡️', short: 'Тяжелая сабля', name: 'Тяжелая сабля (+1 Урон, +2 HP)', desc: 'Шляхтич берет саблю потяжелее: +1 к урону всех атак и +2 Макс. HP.', applyEffect: (u) => { u.atkBonus += 1; u.maxHp += 2; u.hp += 2; } }),
                new TalentNode({ id: `${heroId}_t1_r`, tier: 1, col: 2, icon: '🍺', short: 'Крепкая башка', name: 'Крепкая башка (+6 Макс. HP, +5% Блок)', desc: 'Закаленный в кабацких драках череп: +6 Макс. HP и +5% к шансу блока.', applyEffect: (u) => { u.maxHp += 6; u.hp += 6; u.blockChance += 5; } }),
                new TalentNode({ id: `${heroId}_t2_l`, tier: 2, col: 1, icon: '💥', short: 'Широкий размах', name: 'Широкий размах (+2 к урону)', desc: 'Мощный взмах плашмя и клинком: +2 к урону всех способностей.', applyEffect: (u) => { u.atkBonus += 2; } }),
                new TalentNode({ id: `${heroId}_t2_r`, tier: 2, col: 2, icon: '🛡️', short: 'Панский кунтуш', name: 'Панский кунтуш (+1 Броня, +4 HP)', desc: 'Плотный подбитый кунтуш гасит удары: +1 Броня и +4 Макс. HP.', applyEffect: (u) => { u.armor += 1; u.maxHp += 4; u.hp += 4; } }),
                new TalentNode({ id: `${heroId}_t3_l`, tier: 3, col: 1, icon: '🔥', short: 'Шляхетский гонор', name: 'Шляхетский гонор (+3 Урон, +2 Иниц.)', desc: 'Яростный натиск в первых рядах: +3 к урону и +2 к Инициативе.', applyEffect: (u) => { u.atkBonus += 3; u.initBase += 2; } }),
                new TalentNode({ id: `${heroId}_t3_r`, tier: 3, col: 2, icon: '🏰', short: 'Кураж шляхтича', name: 'Кураж шляхтича (+1 Броня, +10% Блок)', desc: 'Непробиваемая стойка фехтовальщика: +1 Броня и +10% к шансу блока.', applyEffect: (u) => { u.armor += 1; u.blockChance += 10; } })
            ];
        }
        if (cls === 'Святоша') {
            return [
                new TalentNode({ id: `${heroId}_t1_l`, tier: 1, col: 1, icon: '🪵', short: 'Карающая длань', name: 'Карающая длань (+1 Урон, +2 Иниц.)', desc: 'Уверенный удар дубиной по еретикам: +1 к урону и +2 к Инициативе.', applyEffect: (u) => { u.atkBonus += 1; u.initBase += 2; } }),
                new TalentNode({ id: `${heroId}_t1_r`, tier: 1, col: 2, icon: '🌿', short: 'Травник ордена', name: 'Травник ордена (+6 Макс. HP)', desc: 'Целебные настои укрепляют тело: +6 к максимальному и текущему HP.', applyEffect: (u) => { u.maxHp += 6; u.hp += 6; } }),
                new TalentNode({ id: `${heroId}_t2_l`, tier: 2, col: 1, icon: '⚒️', short: 'Тяжелое кадило', name: 'Тяжелое кадило (+2 к урону)', desc: 'Окованное железом оружие крушит шлемы: +2 к урону.', applyEffect: (u) => { u.atkBonus += 2; } }),
                new TalentNode({ id: `${heroId}_t2_r`, tier: 2, col: 2, icon: '🍺', short: 'Хмельная молитва', name: 'Хмельная молитва (+5 HP, +5% Блок)', desc: 'Глоток монастырского пива укрепляет дух: +5 Макс. HP и +5% Блок.', applyEffect: (u) => { u.maxHp += 5; u.hp += 5; u.blockChance += 5; } }),
                new TalentNode({ id: `${heroId}_t3_l`, tier: 3, col: 1, icon: '⚡', short: 'Гнев праведника', name: 'Гнев праведника (+3 Урон, +4 HP)', desc: 'Сокрушительные удары во имя братства: +3 к урону и +4 Макс. HP.', applyEffect: (u) => { u.atkBonus += 3; u.maxHp += 4; u.hp += 4; } }),
                new TalentNode({ id: `${heroId}_t3_r`, tier: 3, col: 2, icon: '🛡️', short: 'Благословенный щит', name: 'Благословенный щит (+1 Броня, +10% Блок)', desc: 'Небесная защита от вражеских цепов: +1 Броня и +10% к шансу блока.', applyEffect: (u) => { u.armor += 1; u.blockChance += 10; } })
            ];
        }
        return [
            new TalentNode({ id: `${heroId}_t1_l`, tier: 1, col: 1, icon: '🔫', short: 'Крупная картечь', name: 'Крупная картечь (+2 к урону)', desc: 'Отборный порох и тяжелая дробь: +2 к урону выстрелов и кортика.', applyEffect: (u) => { u.atkBonus += 2; } }),
            new TalentNode({ id: `${heroId}_t1_r`, tier: 1, col: 2, icon: '🧥', short: 'Плотный колет', name: 'Плотный колет (+5 HP, +5% Блок)', desc: 'Проклепанная кожа защищает стрелка: +5 Макс. HP и +5% Блок.', applyEffect: (u) => { u.maxHp += 5; u.hp += 5; u.blockChance += 5; } }),
            new TalentNode({ id: `${heroId}_t2_l`, tier: 2, col: 1, icon: '🎯', short: 'Зоркий глаз', name: 'Зоркий глаз (+3 Иниц., +1 Урон)', desc: 'Мгновенная реакция и прицельный огонь: +3 Инициатива и +1 Урон.', applyEffect: (u) => { u.initBase += 3; u.atkBonus += 1; } }),
            new TalentNode({ id: `${heroId}_t2_r`, tier: 2, col: 2, icon: '🤺', short: 'Гарда кортика', name: 'Гарда кортика (+8% Блок, +4 HP)', desc: 'Искусное парирование кортиком в ближнем бою: +8% Блок и +4 Макс. HP.', applyEffect: (u) => { u.blockChance += 8; u.maxHp += 4; u.hp += 4; } }),
            new TalentNode({ id: `${heroId}_t3_l`, tier: 3, col: 1, icon: '💣', short: 'Двойной заряд', name: 'Двойной заряд (+3 Урон)', desc: 'Усиленный пороховой заряд пробивает любые латы: +3 к урону.', applyEffect: (u) => { u.atkBonus += 3; } }),
            new TalentNode({ id: `${heroId}_t3_r`, tier: 3, col: 2, icon: '🛡️', short: 'Ветеран траншей', name: 'Ветеран траншей (+1 Броня, +10% Блок)', desc: 'Опытный мушкетер умеет укрыться от любого удара: +1 Броня и +10% Блок.', applyEffect: (u) => { u.armor += 1; u.blockChance += 10; } })
        ];
    }
}
