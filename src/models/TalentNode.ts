import type { HeroModel } from './HeroModel';

export interface ClassBranchMeta {
    col: number;
    title: string;
}

/**
 * Узел дерева талантов в стиле Barotrauma (общий ряд + 3 ветки специализации с выбором в тирах)
 */
export class TalentNode {
    public id: string;
    public tier: number;
    public col: number;
    public choice: number;
    public icon: string;
    public short: string;
    public name: string;
    public desc: string;
    public detailedParagraphs: string[];
    public unlocked: boolean;
    public applyEffect: (hero: HeroModel) => void;
    public revertEffect: (hero: HeroModel) => void;

    constructor(params: {
        id: string;
        tier: number;
        col: number;
        choice?: number;
        icon: string;
        short: string;
        name: string;
        desc: string;
        detailedParagraphs?: string[];
        unlocked?: boolean;
        applyEffect: (hero: HeroModel) => void;
        revertEffect: (hero: HeroModel) => void;
    }) {
        this.id = params.id;
        this.tier = params.tier;
        this.col = params.col;
        this.choice = params.choice ?? 1;
        this.icon = params.icon;
        this.short = params.short;
        this.name = params.name;
        this.desc = params.desc;
        this.detailedParagraphs = params.detailedParagraphs ?? [params.desc];
        this.unlocked = Boolean(params.unlocked);
        this.applyEffect = params.applyEffect;
        this.revertEffect = params.revertEffect;
    }
}

/**
 * Фабрика деревьев талантов по классам героев (структура Barotrauma: верхний общий ряд + 3 колонки по 4 тира)
 */
export class TalentTreeFactory {
    public static getBranchesForClass(cls: string): ClassBranchMeta[] {
        if (cls === 'Шляхта') {
            return [
                { col: 1, title: 'МАСТЕР КЛИНКА' },
                { col: 2, title: 'ПАНЦИРНЫЙ ПАН' },
                { col: 3, title: 'ДУЭЛЯНТ КОРЧМЫ' }
            ];
        }
        if (cls === 'Святоша') {
            return [
                { col: 1, title: 'ИНКВИЗИТОР' },
                { col: 2, title: 'ТРАВНИК ОРДЕНА' },
                { col: 3, title: 'БРАТ-ПИВОВАР' }
            ];
        }
        return [
            { col: 1, title: 'КАНОНИР' },
            { col: 2, title: 'СТРЕЛОК ТРАНШЕЙ' },
            { col: 3, title: 'БРЕТЕР' }
        ];
    }

    public static createForHero(heroId: string, cls: string): TalentNode[] {
        if (cls === 'Шляхта') {
            return [
                // Верхний общий ряд (col: 0, tier: 0, choice: 1..4)
                new TalentNode({
                    id: `${heroId}_g1`, tier: 0, col: 0, choice: 1, icon: 'scroll',
                    short: 'Дворянская грамота',
                    name: 'Дворянская грамота (+4 Макс. HP, +1 Иниц.)',
                    desc: 'Старинная привилегия короны укрепляет боевой дух шляхтича: +4 Макс. HP и +1 к Инициативе.',
                    detailedParagraphs: [
                        'Вы используете старинную королевскую грамоту, подтверждающую ваш шляхетский род.',
                        'Повышает максимальный запас здоровья на 4 ед. и ускоряет реакцию в начале боя на +1 к Инициативе.',
                        'Эффект действует постоянно во всех стычках и походах короны.'
                    ],
                    applyEffect: (u) => { u.maxHp += 4; u.hp += 4; u.initBase += 1; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); u.initBase = Math.max(0, u.initBase - 1); }
                }),
                new TalentNode({
                    id: `${heroId}_g2`, tier: 0, col: 0, choice: 2, icon: 'horse',
                    short: 'Выучка в седле',
                    name: 'Выучка в седле (+2 Иниц., +3% Блок)',
                    desc: 'Кавалерийская посадка позволяет перехватывать инициативу: +2 к Инициативе и +3% к Блоку.',
                    detailedParagraphs: [
                        'Годы конных разъездов вдоль границ Богемии отточили ваше чувство дистанции.',
                        'Повышает базовую Инициативу на +2 ед. и увеличивает шанс отразить супер-удар на 3%.',
                        'Позволяет раньше вступать в схватку и занимать лучшую позицию.'
                    ],
                    applyEffect: (u) => { u.initBase += 2; u.blockChance += 3; },
                    revertEffect: (u) => { u.initBase = Math.max(0, u.initBase - 2); u.blockChance = Math.max(0, u.blockChance - 3); }
                }),
                new TalentNode({
                    id: `${heroId}_g3`, tier: 0, col: 0, choice: 3, icon: 'bottle',
                    short: 'Венгерское вино',
                    name: 'Венгерское вино (+5 Макс. HP)',
                    desc: 'Крепленое вино из погребов корчмы бодрит кровь: +5 к максимальному и текущему здоровью.',
                    detailedParagraphs: [
                        'Фляга выдержанного венгерского вина согревает кровь перед выходом на тракт.',
                        'Увеличивает максимальный и текущий запас здоровья бойца на +5 ед.',
                        'Дополнительно сочетается с пассивной способностью «Непросыхаемый алкаш».'
                    ],
                    applyEffect: (u) => { u.maxHp += 5; u.hp += 5; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 5); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_g4`, tier: 0, col: 0, choice: 4, icon: 'eagle',
                    short: 'Гербовый гонор',
                    name: 'Гербовый гонор (+1 Урон, +3% Блок)',
                    desc: 'Гордость древнего герба не позволяет отступать: +1 к урону всех атак и +3% к шансу блока.',
                    detailedParagraphs: [
                        'Вы бьетесь под родовым знаменем, не допуская слабости перед чернью и еретиками.',
                        'Увеличивает урон каждого удара саблей на +1 ед. и повышает шанс блока на 3%.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 1; u.blockChance += 3; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.blockChance = Math.max(0, u.blockChance - 3); }
                }),

                // Ветка 1: МАСТЕР КЛИНКА (col: 1)
                new TalentNode({
                    id: `${heroId}_t1_c1`, tier: 1, col: 1, choice: 1, icon: 'sword',
                    short: 'Тяжелая сабля',
                    name: 'Тяжелая сабля (+1 Урон, +2 HP)',
                    desc: 'Шляхтич берет саблю потяжелее: +1 к урону всех атак и +2 Макс. HP.',
                    detailedParagraphs: [
                        'Вы переходите на утяжеленный венгерский клинок с широкой елманью.',
                        'Повышает бонус к урону всех атак на +1 ед. и укрепляет хватку, давая +2 ед. к максимальному HP.',
                        'Открывает доступ ко второму рангу ветки «Мастер клинка».'
                    ],
                    applyEffect: (u) => { u.atkBonus += 1; u.maxHp += 2; u.hp += 2; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.maxHp = Math.max(1, u.maxHp - 2); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c1_a`, tier: 2, col: 1, choice: 1, icon: 'crossed_swords',
                    short: 'Широкий размах',
                    name: 'Широкий размах (+2 к урону)',
                    desc: 'Мощный взмах плашмя и клинком: +2 к урону всех способностей.',
                    detailedParagraphs: [
                        'Вы вкладываете весь вес корпуса в круговой замах саблей.',
                        'Увеличивает урон как обычных рубящих ударов, так и «Атаки плашмя» по всем врагам на +2 ед.',
                        'Выбор этого таланта блокирует альтернативный стиль фехтования во 2-м тире.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 2; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c1_b`, tier: 2, col: 1, choice: 2, icon: 'lightning',
                    short: 'Молниеносный выпад',
                    name: 'Молниеносный выпад (+1 Урон, +3 Иниц.)',
                    desc: 'Стремительный укол с шага: +1 к урону и +3 к Инициативе в бою.',
                    detailedParagraphs: [
                        'Вместо тяжелого замаха вы делаете резкий дуэльный выпад на опережение.',
                        'Дает +1 ед. к урону всех атак и повышает Инициативу на +3 ед., позволяя ходить первым.',
                        'Выбор этого таланта блокирует альтернативный талант во 2-м тире.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 1; u.initBase += 3; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.initBase = Math.max(0, u.initBase - 3); }
                }),
                new TalentNode({
                    id: `${heroId}_t3_c1`, tier: 3, col: 1, choice: 1, icon: 'blood',
                    short: 'Секущий удар',
                    name: 'Секущий удар (+2 Урон, +3 HP)',
                    desc: 'Глубокие рубящие раны пробивают кольчугу: +2 к урону и +3 Макс. HP.',
                    detailedParagraphs: [
                        'Отточенная техника рубки позволяет находить сочленения в доспехах противника.',
                        'Повышает урон на +2 ед. и увеличивает запас здоровья на +3 ед.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 2; u.maxHp += 3; u.hp += 3; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); u.maxHp = Math.max(1, u.maxHp - 3); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t4_c1`, tier: 4, col: 1, choice: 1, icon: 'fire',
                    short: 'Шляхетский гонор',
                    name: 'Шляхетский гонор (+3 Урон, +2 Иниц.)',
                    desc: 'Яростный натиск в первых рядах: +3 к урону и +2 к Инициативе.',
                    detailedParagraphs: [
                        'Вершина мастерства сабельного боя. В бою вы впадаете в благородную ярость.',
                        'Увеличивает урон всех ударов на +3 ед. и дает +2 ед. к Инициативе.',
                        'Ваш клинок сокрушает даже тяжелобронированных рыцарей и сотников.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 3; u.initBase += 2; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 3); u.initBase = Math.max(0, u.initBase - 2); }
                }),

                // Ветка 2: ПАНЦИРНЫЙ ПАН (col: 2)
                new TalentNode({
                    id: `${heroId}_t1_c2`, tier: 1, col: 2, choice: 1, icon: 'shield_cross',
                    short: 'Панский кунтуш',
                    name: 'Панский кунтуш (+1 Броня, +4 HP)',
                    desc: 'Плотный подбитый кунтуш гасит удары: +1 Броня и +4 Макс. HP.',
                    detailedParagraphs: [
                        'Ваш кафтан простеган конским волосом и усилен скрытыми стальными пластинами.',
                        'Дает +1 ед. к Защите брони и увеличивает максимальное здоровье на +4 ед.',
                        'Снижает входящий урон как от обычных, так и от супер-ударов.'
                    ],
                    applyEffect: (u) => { u.armor += 1; u.maxHp += 4; u.hp += 4; },
                    revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c2_a`, tier: 2, col: 2, choice: 1, icon: 'armor',
                    short: 'Кольчужная подкладка',
                    name: 'Кольчужная подкладка (+1 Броня, +5 HP)',
                    desc: 'Двойное плетение колец под жупаном: +1 Броня и +5 Макс. HP.',
                    detailedParagraphs: [
                        'Вы надеваете плотную панцирную сетку кутна-горской работы под верхнюю одежду.',
                        'Повышает Броню еще на +1 ед. и добавляет +5 ед. к максимальному запасу HP.',
                        'Отлично держит рубящие и колющие удары пехоты.'
                    ],
                    applyEffect: (u) => { u.armor += 1; u.maxHp += 5; u.hp += 5; },
                    revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.maxHp = Math.max(1, u.maxHp - 5); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c2_b`, tier: 2, col: 2, choice: 2, icon: 'gauntlet',
                    short: 'Стальной наруч',
                    name: 'Стальной наруч (+8% Блок, +3 HP)',
                    desc: 'Кованый наруч для отбивания клинков: +8% к Блоку и +3 Макс. HP.',
                    detailedParagraphs: [
                        'Усиленный стальной наруч позволяет принимать сокрушительные удары на предплечье.',
                        'Увеличивает шанс полностью отразить супер-удар на 8% и дает +3 ед. к HP.'
                    ],
                    applyEffect: (u) => { u.blockChance += 8; u.maxHp += 3; u.hp += 3; },
                    revertEffect: (u) => { u.blockChance = Math.max(0, u.blockChance - 8); u.maxHp = Math.max(1, u.maxHp - 3); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t3_c2`, tier: 3, col: 2, choice: 1, icon: 'helmet',
                    short: 'Кованый шишак',
                    name: 'Кованый шишак (+1 Броня, +6% Блок)',
                    desc: 'Шлем с наносником и бармицей: +1 Броня и +6% к шансу блока.',
                    detailedParagraphs: [
                        'Тяжелый стальной шишак защищает голову от оглушающих ударов цепами и булавами.',
                        'Дает +1 ед. Брони и повышает вероятность блока на 6%.'
                    ],
                    applyEffect: (u) => { u.armor += 1; u.blockChance += 6; },
                    revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.blockChance = Math.max(0, u.blockChance - 6); }
                }),
                new TalentNode({
                    id: `${heroId}_t4_c2`, tier: 4, col: 2, choice: 1, icon: 'castle',
                    short: 'Кураж шляхтича',
                    name: 'Кураж шляхтича (+1 Броня, +10% Блок)',
                    desc: 'Непробиваемая стойка фехтовальщика: +1 Броня и +10% к шансу блока.',
                    detailedParagraphs: [
                        'Вы превращаетесь в несокрушимый бастион в первой линии отряда.',
                        'Повышает защиту Брони на +1 ед. и увеличивает шанс блока супер-ударов на 10%.',
                        'Даже самые свирепые атаки вражеских главарей разбиваются о вашу защиту.'
                    ],
                    applyEffect: (u) => { u.armor += 1; u.blockChance += 10; },
                    revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.blockChance = Math.max(0, u.blockChance - 10); }
                }),

                // Ветка 3: ДУЭЛЯНТ КОРЧМЫ (col: 3)
                new TalentNode({
                    id: `${heroId}_t1_c3`, tier: 1, col: 3, choice: 1, icon: 'beer',
                    short: 'Крепкая башка',
                    name: 'Крепкая башка (+6 Макс. HP, +5% Блок)',
                    desc: 'Закаленный в кабацких драках череп: +6 Макс. HP и +5% к шансу блока.',
                    detailedParagraphs: [
                        'После десятков потасовок в пражских корчмах вас уже ничем не удивишь.',
                        'Увеличивает максимальный запас здоровья на +6 ед. и дает +5% к шансу блока.',
                        'Отличная основа для живучего бойца ближнего боя.'
                    ],
                    applyEffect: (u) => { u.maxHp += 6; u.hp += 6; u.blockChance += 5; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 6); u.hp = Math.min(u.hp, u.maxHp); u.blockChance = Math.max(0, u.blockChance - 5); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c3_a`, tier: 2, col: 3, choice: 1, icon: 'dagger',
                    short: 'Гарда корда',
                    name: 'Гарда корда (+7% Блок, +1 Урон)',
                    desc: 'Ловкий захват чужого клинка гардой: +7% к Блоку и +1 к Урону.',
                    detailedParagraphs: [
                        'Развитая дужка вашей сабли позволяет ловить вражеское оружие в клинч и сразу контратаковать.',
                        'Повышает шанс блока на 7% и добавляет +1 ед. к урону всех атак.'
                    ],
                    applyEffect: (u) => { u.blockChance += 7; u.atkBonus += 1; },
                    revertEffect: (u) => { u.blockChance = Math.max(0, u.blockChance - 7); u.atkBonus = Math.max(0, u.atkBonus - 1); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c3_b`, tier: 2, col: 3, choice: 2, icon: 'boots',
                    short: 'Подлый пинок',
                    name: 'Подлый пинок (+1 Урон, +4 HP, +1 Иниц.)',
                    desc: 'Грязный кабацкий прием: +1 Урон, +4 Макс. HP и +1 Инициатива.',
                    detailedParagraphs: [
                        'В честной дуэли побеждает тот, кто вовремя бьет кованым сапогом под колено.',
                        'Дает +1 ед. к Урону, +4 ед. к максимальному HP и +1 к Инициативе.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 1; u.maxHp += 4; u.hp += 4; u.initBase += 1; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); u.initBase = Math.max(0, u.initBase - 1); }
                }),
                new TalentNode({
                    id: `${heroId}_t3_c3`, tier: 3, col: 3, choice: 1, icon: 'chalice',
                    short: 'Пьяный шаг',
                    name: 'Пьяный шаг (+8% Блок, +2 Иниц.)',
                    desc: 'Непредсказуемая траектория движения: +8% к Блоку и +2 к Инициативе.',
                    detailedParagraphs: [
                        'Враги не могут предугадать ваш следующий шаг — то ли вы пошатнулись, то ли ушли от удара.',
                        'Повышает шанс блока на 8% и увеличивает Инициативу на +2 ед.'
                    ],
                    applyEffect: (u) => { u.blockChance += 8; u.initBase += 2; },
                    revertEffect: (u) => { u.blockChance = Math.max(0, u.blockChance - 8); u.initBase = Math.max(0, u.initBase - 2); }
                }),
                new TalentNode({
                    id: `${heroId}_t4_c3`, tier: 4, col: 3, choice: 1, icon: 'crown',
                    short: 'Король трактиров',
                    name: 'Король трактиров (+8 HP, +2 Урон, +5% Блок)',
                    desc: 'Легендарный бретер всех богемских корчм: +8 HP, +2 Урон и +5% Блок.',
                    detailedParagraphs: [
                        'О ваших подвигах в тавернах и на полях сражений слагают песни от Праги до Кутна-Горы.',
                        'Увеличивает максимальное здоровье на +8 ед., урон на +2 ед. и шанс блока на 5%.'
                    ],
                    applyEffect: (u) => { u.maxHp += 8; u.hp += 8; u.atkBonus += 2; u.blockChance += 5; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 8); u.hp = Math.min(u.hp, u.maxHp); u.atkBonus = Math.max(0, u.atkBonus - 2); u.blockChance = Math.max(0, u.blockChance - 5); }
                })
            ];
        }

        if (cls === 'Святоша') {
            return [
                // Верхний общий ряд (col: 0, tier: 0)
                new TalentNode({
                    id: `${heroId}_g1`, tier: 0, col: 0, choice: 1, icon: 'crucifix',
                    short: 'Четки покаяния',
                    name: 'Четки покаяния (+4 Макс. HP, +3% Блок)',
                    desc: 'Молитвенные четки укрепляют дух монаха: +4 Макс. HP и +3% к шансу блока.',
                    detailedParagraphs: [
                        'Костяные четки на поясе напоминают о данных обетах и хранят от вражеской стали.',
                        'Повышает максимальное здоровье на +4 ед. и увеличивает шанс блока на 3%.'
                    ],
                    applyEffect: (u) => { u.maxHp += 4; u.hp += 4; u.blockChance += 3; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); u.blockChance = Math.max(0, u.blockChance - 3); }
                }),
                new TalentNode({
                    id: `${heroId}_g2`, tier: 0, col: 0, choice: 2, icon: 'church',
                    short: 'Бдение в келье',
                    name: 'Бдение в келье (+2 Иниц., +3 HP)',
                    desc: 'Ночные молитвы приучили к бдительности: +2 к Инициативе и +3 Макс. HP.',
                    detailedParagraphs: [
                        'Привычка не смыкать глаз до рассвета позволяет вам мгновенно реагировать на засады.',
                        'Дает +2 ед. к Инициативе и +3 ед. к максимальному запасу HP.'
                    ],
                    applyEffect: (u) => { u.initBase += 2; u.maxHp += 3; u.hp += 3; },
                    revertEffect: (u) => { u.initBase = Math.max(0, u.initBase - 2); u.maxHp = Math.max(1, u.maxHp - 3); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_g3`, tier: 0, col: 0, choice: 3, icon: 'holy_book',
                    short: 'Латинский требник',
                    name: 'Латинский требник (+1 Урон, +4 HP)',
                    desc: 'Тяжелый фолиант в кожаном переплете: +1 к урону и +4 Макс. HP.',
                    detailedParagraphs: [
                        'Увесистый требник с медными застежками одинаково хорош для проповеди и для рукопашной.',
                        'Повышает урон на +1 ед. и увеличивает здоровье на +4 ед.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 1; u.maxHp += 4; u.hp += 4; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_g4`, tier: 0, col: 0, choice: 4, icon: 'cross',
                    short: 'Глас колокола',
                    name: 'Глас колокола (+1 Броня, +2 HP)',
                    desc: 'Непоколебимая стойкость перед лицом опасности: +1 Броня и +2 Макс. HP.',
                    detailedParagraphs: [
                        'Громовой голос брата-проповедника вселяет ужас в сердца отступников.',
                        'Дает +1 ед. к Защите брони и +2 ед. к максимальному HP.'
                    ],
                    applyEffect: (u) => { u.armor += 1; u.maxHp += 2; u.hp += 2; },
                    revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.maxHp = Math.max(1, u.maxHp - 2); u.hp = Math.min(u.hp, u.maxHp); }
                }),

                // Ветка 1: ИНКВИЗИТОР (col: 1)
                new TalentNode({
                    id: `${heroId}_t1_c1`, tier: 1, col: 1, choice: 1, icon: 'mace',
                    short: 'Карающая длань',
                    name: 'Карающая длань (+1 Урон, +2 Иниц.)',
                    desc: 'Уверенный удар дубиной по еретикам: +1 к урону и +2 к Инициативе.',
                    detailedParagraphs: [
                        'Вы наставляете заблудших на путь истинный при помощи окованного дубового посоха.',
                        'Повышает урон всех атак на +1 ед. и увеличивает Инициативу на +2 ед.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 1; u.initBase += 2; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.initBase = Math.max(0, u.initBase - 2); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c1_a`, tier: 2, col: 1, choice: 1, icon: 'smith_hammer',
                    short: 'Тяжелое кадило',
                    name: 'Тяжелое кадило (+2 к урону)',
                    desc: 'Окованное железом оружие крушит шлемы: +2 к урону.',
                    detailedParagraphs: [
                        'Тяжелое бронзовое кадило на цепи пробивает даже стальные шишаки.',
                        'Увеличивает бонус урона всех боевых умений на +2 ед.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 2; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c1_b`, tier: 2, col: 1, choice: 2, icon: 'fire',
                    short: 'Пламя проповеди',
                    name: 'Пламя проповеди (+1 Урон, +3 Иниц.)',
                    desc: 'Пылкая речь ускоряет натиск: +1 к урону и +3 к Инициативе.',
                    detailedParagraphs: [
                        'Пламенная проповедь перед схваткой заставляет вас бросаться в бой быстрее любого всадника.',
                        'Дает +1 ед. к Урону и +3 ед. к Инициативе.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 1; u.initBase += 3; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.initBase = Math.max(0, u.initBase - 3); }
                }),
                new TalentNode({
                    id: `${heroId}_t3_c1`, tier: 3, col: 1, choice: 1, icon: 'scales',
                    short: 'Приговор трибунала',
                    name: 'Приговор трибунала (+2 Урон, +4 HP)',
                    desc: 'Безжалостный удар по врагам веры: +2 к урону и +4 Макс. HP.',
                    detailedParagraphs: [
                        'Каждый ваш удар выносит окончательный приговор противнику.',
                        'Повышает урон на +2 ед. и укрепляет здоровье на +4 ед.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 2; u.maxHp += 4; u.hp += 4; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t4_c1`, tier: 4, col: 1, choice: 1, icon: 'lightning',
                    short: 'Гнев праведника',
                    name: 'Гнев праведника (+3 Урон, +4 HP)',
                    desc: 'Сокрушительные удары во имя братства: +3 к урону и +4 Макс. HP.',
                    detailedParagraphs: [
                        'Вы становитесь живым орудием праведного гнева на поле боя.',
                        'Увеличивает урон всех ударов на +3 ед. и добавляет +4 ед. к максимальному HP.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 3; u.maxHp += 4; u.hp += 4; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 3); u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); }
                }),

                // Ветка 2: ТРАВНИК ОРДЕНА (col: 2)
                new TalentNode({
                    id: `${heroId}_t1_c2`, tier: 1, col: 2, choice: 1, icon: 'herb',
                    short: 'Травник ордена',
                    name: 'Травник ордена (+6 Макс. HP)',
                    desc: 'Целебные настои укрепляют тело: +6 к максимальному и текущему HP.',
                    detailedParagraphs: [
                        'Знание монастырских трав и кореньев позволяет поддерживать здоровье в самых тяжелых походах.',
                        'Увеличивает максимальный и текущий запас здоровья на +6 ед.'
                    ],
                    applyEffect: (u) => { u.maxHp += 6; u.hp += 6; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 6); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c2_a`, tier: 2, col: 2, choice: 1, icon: 'potion_green',
                    short: 'Настой зверобоя',
                    name: 'Настой зверобоя (+6 HP, +1 Броня)',
                    desc: 'Густой бальзам затягивает раны: +6 Макс. HP и +1 к Броне.',
                    detailedParagraphs: [
                        'Вы натираете кожу целебным маслом со зверобоем и полынью перед каждым боем.',
                        'Повышает запас здоровья на +6 ед. и дает +1 ед. к Защите брони.'
                    ],
                    applyEffect: (u) => { u.maxHp += 6; u.hp += 6; u.armor += 1; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 6); u.hp = Math.min(u.hp, u.maxHp); u.armor = Math.max(0, u.armor - 1); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c2_b`, tier: 2, col: 2, choice: 2, icon: 'shield_cross',
                    short: 'Покров святых',
                    name: 'Покров святых (+8% Блок, +4 HP)',
                    desc: 'Защитная молитва отводит стрелы: +8% к Блоку и +4 Макс. HP.',
                    detailedParagraphs: [
                        'Краткая молитва перед ударом врага помогает вовремя подставить древко оружия.',
                        'Увеличивает шанс блока на 8% и дает +4 ед. к максимальному HP.'
                    ],
                    applyEffect: (u) => { u.blockChance += 8; u.maxHp += 4; u.hp += 4; },
                    revertEffect: (u) => { u.blockChance = Math.max(0, u.blockChance - 8); u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t3_c2`, tier: 3, col: 2, choice: 1, icon: 'heal_cross',
                    short: 'Тайна лазарета',
                    name: 'Тайна лазарета (+7 HP, +5% Блок)',
                    desc: 'Секреты сестры Берты: +7 Макс. HP и +5% к шансу блока.',
                    detailedParagraphs: [
                        'Вы переняли лучшие врачебные приемы госпитальеров и сестры Берты.',
                        'Дает +7 ед. к максимальному здоровью и +5% к шансу блока.'
                    ],
                    applyEffect: (u) => { u.maxHp += 7; u.hp += 7; u.blockChance += 5; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 7); u.hp = Math.min(u.hp, u.maxHp); u.blockChance = Math.max(0, u.blockChance - 5); }
                }),
                new TalentNode({
                    id: `${heroId}_t4_c2`, tier: 4, col: 2, choice: 1, icon: 'heart_heal',
                    short: 'Благословенный щит',
                    name: 'Благословенный щит (+1 Броня, +10% Блок)',
                    desc: 'Небесная защита от вражеских цепов: +1 Броня и +10% к шансу блока.',
                    detailedParagraphs: [
                        'Высшее благословение ордена окружает вас незримым щитом.',
                        'Повышает Броню на +1 ед. и увеличивает шанс отразить супер-удар на 10%.'
                    ],
                    applyEffect: (u) => { u.armor += 1; u.blockChance += 10; },
                    revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.blockChance = Math.max(0, u.blockChance - 10); }
                }),

                // Ветка 3: БРАТ-ПИВОВАР (col: 3)
                new TalentNode({
                    id: `${heroId}_t1_c3`, tier: 1, col: 3, choice: 1, icon: 'beer',
                    short: 'Хмельная молитва',
                    name: 'Хмельная молитва (+5 HP, +5% Блок)',
                    desc: 'Глоток монастырского пива укрепляет дух: +5 Макс. HP и +5% Блок.',
                    detailedParagraphs: [
                        'Монастырский эль собственного варения придает сил и притупляет боль от ушибов.',
                        'Дает +5 ед. к максимальному HP и +5% к шансу блока.'
                    ],
                    applyEffect: (u) => { u.maxHp += 5; u.hp += 5; u.blockChance += 5; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 5); u.hp = Math.min(u.hp, u.maxHp); u.blockChance = Math.max(0, u.blockChance - 5); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c3_a`, tier: 2, col: 3, choice: 1, icon: 'barrel',
                    short: 'Дубовый бочонок',
                    name: 'Дубовый бочонок (+1 Броня, +5 HP)',
                    desc: 'Бочонок за спиной защищает от ударов: +1 Броня и +5 Макс. HP.',
                    detailedParagraphs: [
                        'Крепкий дубовый бочонок с железными обручами служит отличным дополнительным панцирем.',
                        'Повышает Защиту брони на +1 ед. и здоровье на +5 ед.'
                    ],
                    applyEffect: (u) => { u.armor += 1; u.maxHp += 5; u.hp += 5; },
                    revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.maxHp = Math.max(1, u.maxHp - 5); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t2_c3_b`, tier: 2, col: 3, choice: 2, icon: 'vial_amber',
                    short: 'Монастырский мед',
                    name: 'Монастырский мед (+1 Урон, +5 HP)',
                    desc: 'Крепкий ставленный мед разжигает отвагу: +1 Урон и +5 Макс. HP.',
                    detailedParagraphs: [
                        'Густой пряный мед из аббатских погребов наполняет мышцы силой.',
                        'Увеличивает урон всех атак на +1 ед. и запас здоровья на +5 ед.'
                    ],
                    applyEffect: (u) => { u.atkBonus += 1; u.maxHp += 5; u.hp += 5; },
                    revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.maxHp = Math.max(1, u.maxHp - 5); u.hp = Math.min(u.hp, u.maxHp); }
                }),
                new TalentNode({
                    id: `${heroId}_t3_c3`, tier: 3, col: 3, choice: 1, icon: 'bread',
                    short: 'Келейный паек',
                    name: 'Келейный паек (+6 HP, +6% Блок)',
                    desc: 'Сытная трапеза перед вылазкой: +6 Макс. HP и +6% к шансу блока.',
                    detailedParagraphs: [
                        'Кто хорошо ест и пьет во славу ордена — тот крепко стоит на ногах в сече.',
                        'Добавляет +6 ед. к максимальному HP и +6% к шансу блока.'
                    ],
                    applyEffect: (u) => { u.maxHp += 6; u.hp += 6; u.blockChance += 6; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 6); u.hp = Math.min(u.hp, u.maxHp); u.blockChance = Math.max(0, u.blockChance - 6); }
                }),
                new TalentNode({
                    id: `${heroId}_t4_c3`, tier: 4, col: 3, choice: 1, icon: 'laurel',
                    short: 'Хранитель погребов',
                    name: 'Хранитель погребов (+8 HP, +2 Урон, +1 Броня)',
                    desc: 'Высший чин братства пивоваров: +8 HP, +2 Урон и +1 Броня.',
                    detailedParagraphs: [
                        'Вы удостоены ключей от главного монастырского погреба и почета всей братии.',
                        'Дает +8 ед. к максимальному HP, +2 ед. к урону и +1 ед. к Защите брони.'
                    ],
                    applyEffect: (u) => { u.maxHp += 8; u.hp += 8; u.atkBonus += 2; u.armor += 1; },
                    revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 8); u.hp = Math.min(u.hp, u.maxHp); u.atkBonus = Math.max(0, u.atkBonus - 2); u.armor = Math.max(0, u.armor - 1); }
                })
            ];
        }

        // Мушкетер
        return [
            // Верхний общий ряд (col: 0, tier: 0)
            new TalentNode({
                id: `${heroId}_g1`, tier: 0, col: 0, choice: 1, icon: 'vial_amber',
                short: 'Сухой порох',
                name: 'Сухой порох (+1 Урон, +1 Иниц.)',
                desc: 'Вощеная пороховница бережет заряд от сырости: +1 Урон и +1 Инициатива.',
                detailedParagraphs: [
                    'Тщательно просушенный зерненый порох воспламеняется без единой осечки.',
                    'Повышает урон выстрелов и кортика на +1 ед. и дает +1 к Инициативе.'
                ],
                applyEffect: (u) => { u.atkBonus += 1; u.initBase += 1; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.initBase = Math.max(0, u.initBase - 1); }
            }),
            new TalentNode({
                id: `${heroId}_g2`, tier: 0, col: 0, choice: 2, icon: 'boots',
                short: 'Маршевый шаг',
                name: 'Маршевый шаг (+4 Макс. HP, +1 Иниц.)',
                desc: 'Пехотная выносливость наемника: +4 Макс. HP и +1 к Инициативе.',
                detailedParagraphs: [
                    'Длительные переходы с тяжелой аркебузой на плече закалили ваше тело.',
                    'Увеличивает максимальное здоровье на +4 ед. и Инициативу на +1 ед.'
                ],
                applyEffect: (u) => { u.maxHp += 4; u.hp += 4; u.initBase += 1; },
                revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); u.initBase = Math.max(0, u.initBase - 1); }
            }),
            new TalentNode({
                id: `${heroId}_g3`, tier: 0, col: 0, choice: 3, icon: 'pouch',
                short: 'Патронташ',
                name: 'Патронташ (+2 Иниц., +3% Блок)',
                desc: 'Заряды всегда под рукой: +2 к Инициативе и +3% к шансу блока.',
                detailedParagraphs: [
                    'Удобный кожаный берендейка с отмеренными зарядами ускоряет перезарядку в бою.',
                    'Повышает базовую Инициативу на +2 ед. и шанс блока на 3%.'
                ],
                applyEffect: (u) => { u.initBase += 2; u.blockChance += 3; },
                revertEffect: (u) => { u.initBase = Math.max(0, u.initBase - 2); u.blockChance = Math.max(0, u.blockChance - 3); }
            }),
            new TalentNode({
                id: `${heroId}_g4`, tier: 0, col: 0, choice: 4, icon: 'coins_stack',
                short: 'Расчетливость',
                name: 'Расчетливость (+4 Макс. HP, +3% Блок)',
                desc: 'Холодный ум наемного стрелка: +4 Макс. HP и +3% к Блоку.',
                detailedParagraphs: [
                    'Вы никогда не лезете на рожон без выгоды и всегда держите укрытие на примете.',
                    'Дает +4 ед. к максимальному здоровью и +3% к шансу блока.'
                ],
                applyEffect: (u) => { u.maxHp += 4; u.hp += 4; u.blockChance += 3; },
                revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); u.blockChance = Math.max(0, u.blockChance - 3); }
            }),

            // Ветка 1: КАНОНИР (col: 1)
            new TalentNode({
                id: `${heroId}_t1_c1`, tier: 1, col: 1, choice: 1, icon: 'crossbow',
                short: 'Крупная картечь',
                name: 'Крупная картечь (+2 к урону)',
                desc: 'Отборный порох и тяжелая дробь: +2 к урону выстрелов и кортика.',
                detailedParagraphs: [
                    'Вы заряжаете ствол рубленым свинцом поверх основной пули.',
                    'Повышает урон всех ваших атак и залпов из аркебузы на +2 ед.'
                ],
                applyEffect: (u) => { u.atkBonus += 2; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); }
            }),
            new TalentNode({
                id: `${heroId}_t2_c1_a`, tier: 2, col: 1, choice: 1, icon: 'vortex',
                short: 'Литая пуля',
                name: 'Литая пуля (+2 Урон, +2 HP)',
                desc: 'Тяжелая свинцовая пуля калибра гаковницы: +2 Урон и +2 Макс. HP.',
                detailedParagraphs: [
                    'Свинцовые пули собственного литья сминают кирасы и щиты.',
                    'Увеличивает бонус к урону на +2 ед. и максимальное здоровье на +2 ед.'
                ],
                applyEffect: (u) => { u.atkBonus += 2; u.maxHp += 2; u.hp += 2; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); u.maxHp = Math.max(1, u.maxHp - 2); u.hp = Math.min(u.hp, u.maxHp); }
            }),
            new TalentNode({
                id: `${heroId}_t2_c1_b`, tier: 2, col: 1, choice: 2, icon: 'fire',
                short: 'Фитильный замок',
                name: 'Фитильный замок (+1 Урон, +3 Иниц.)',
                desc: 'Отлаженный спуск без задержки: +1 к урону и +3 к Инициативе.',
                detailedParagraphs: [
                    'Доработанный кузнецом серпентин мгновенно опускает тлеющий фитиль на полку.',
                    'Дает +1 ед. к Урону и +3 ед. к Инициативе в начале боя.'
                ],
                applyEffect: (u) => { u.atkBonus += 1; u.initBase += 3; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.initBase = Math.max(0, u.initBase - 3); }
            }),
            new TalentNode({
                id: `${heroId}_t3_c1`, tier: 3, col: 1, choice: 1, icon: 'gears',
                short: 'Кованый ствол',
                name: 'Кованый ствол (+2 Урон, +1 Броня)',
                desc: 'Утолщенный ствол выдерживает усиленный заряд: +2 Урон и +1 Броня.',
                detailedParagraphs: [
                    'Ствол кутна-горской стали позволяет засыпать полуторную мерку пороха без риска разрыва.',
                    'Повышает урон на +2 ед. и дает +1 ед. к Защите брони.'
                ],
                applyEffect: (u) => { u.atkBonus += 2; u.armor += 1; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); u.armor = Math.max(0, u.armor - 1); }
            }),
            new TalentNode({
                id: `${heroId}_t4_c1`, tier: 4, col: 1, choice: 1, icon: 'barrel',
                short: 'Двойной заряд',
                name: 'Двойной заряд (+3 Урон)',
                desc: 'Усиленный пороховой заряд пробивает любые латы: +3 к урону.',
                detailedParagraphs: [
                    'Грохот вашего выстрела оглушает всю улицу, а пуля прошивает двоих врагов навылет.',
                    'Увеличивает бонус урона всех способностей на +3 ед.'
                ],
                applyEffect: (u) => { u.atkBonus += 3; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 3); }
            }),

            // Ветка 2: СТРЕЛОК ТРАНШЕЙ (col: 2)
            new TalentNode({
                id: `${heroId}_t1_c2`, tier: 1, col: 2, choice: 1, icon: 'armor',
                short: 'Плотный колет',
                name: 'Плотный колет (+5 HP, +5% Блок)',
                desc: 'Проклепанная кожа защищает стрелка: +5 Макс. HP и +5% Блок.',
                detailedParagraphs: [
                        'Толстый буйволиный колет со стальными заклепками гасит скользящие удары.',
                        'Дает +5 ед. к максимальному здоровью и +5% к шансу блока.'
                ],
                applyEffect: (u) => { u.maxHp += 5; u.hp += 5; u.blockChance += 5; },
                revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 5); u.hp = Math.min(u.hp, u.maxHp); u.blockChance = Math.max(0, u.blockChance - 5); }
            }),
            new TalentNode({
                id: `${heroId}_t2_c2_a`, tier: 2, col: 2, choice: 1, icon: 'eye',
                short: 'Зоркий глаз',
                name: 'Зоркий глаз (+3 Иниц., +1 Урон)',
                desc: 'Мгновенная реакция и прицельный огонь: +3 Инициатива и +1 Урон.',
                detailedParagraphs: [
                    'Вы выцеливаете уязвимые места в броне противника еще до того, как он поднимет щит.',
                    'Повышает Инициативу на +3 ед. и урон на +1 ед.'
                ],
                applyEffect: (u) => { u.initBase += 3; u.atkBonus += 1; },
                revertEffect: (u) => { u.initBase = Math.max(0, u.initBase - 3); u.atkBonus = Math.max(0, u.atkBonus - 1); }
            }),
            new TalentNode({
                id: `${heroId}_t2_c2_b`, tier: 2, col: 2, choice: 2, icon: 'helmet',
                short: 'Морион стрелка',
                name: 'Морион стрелка (+1 Броня, +4 HP)',
                desc: 'Пехотный шлем с полями: +1 к Броне и +4 Макс. HP.',
                detailedParagraphs: [
                    'Высокий гребень стального мориона надежно защищает от сабельных ударов сверху.',
                    'Повышает Броню на +1 ед. и максимальное здоровье на +4 ед.'
                ],
                applyEffect: (u) => { u.armor += 1; u.maxHp += 4; u.hp += 4; },
                revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); }
            }),
            new TalentNode({
                id: `${heroId}_t3_c2`, tier: 3, col: 2, choice: 1, icon: 'tower',
                short: 'Окопная выучка',
                name: 'Окопная выучка (+5 HP, +7% Блок)',
                desc: 'Умение вести бой из-за вагенбурга: +5 Макс. HP и +7% к Блоку.',
                detailedParagraphs: [
                    'Вы мастерски используете повозки, бочки и каменные выступы для защиты.',
                    'Увеличивает максимальное здоровье на +5 ед. и шанс блока на 7%.'
                ],
                applyEffect: (u) => { u.maxHp += 5; u.hp += 5; u.blockChance += 7; },
                revertEffect: (u) => { u.maxHp = Math.max(1, u.maxHp - 5); u.hp = Math.min(u.hp, u.maxHp); u.blockChance = Math.max(0, u.blockChance - 7); }
            }),
            new TalentNode({
                id: `${heroId}_t4_c2`, tier: 4, col: 2, choice: 1, icon: 'shield_cross',
                short: 'Ветеран траншей',
                name: 'Ветеран траншей (+1 Броня, +10% Блок)',
                desc: 'Опытный мушкетер умеет укрыться от любого удара: +1 Броня и +10% Блок.',
                detailedParagraphs: [
                    'Прошедший десятки осад стрелок, способный выстоять даже под натиском тяжелой пехоты.',
                    'Дает +1 ед. к Защите брони и +10% к шансу блока.'
                ],
                applyEffect: (u) => { u.armor += 1; u.blockChance += 10; },
                revertEffect: (u) => { u.armor = Math.max(0, u.armor - 1); u.blockChance = Math.max(0, u.blockChance - 10); }
            }),

            // Ветка 3: БРЕТЕР (col: 3)
            new TalentNode({
                id: `${heroId}_t1_c3`, tier: 1, col: 3, choice: 1, icon: 'dagger',
                short: 'Заточенный кортик',
                name: 'Заточенный кортик (+1 Урон, +4% Блок)',
                desc: 'Острый клинок для ближнего боя: +1 к урону и +4% к шансу блока.',
                detailedParagraphs: [
                    'Когда нет времени перезаряжать аркебузу, в ход идет длинный пехотный кортик.',
                    'Повышает урон на +1 ед. и шанс блока на 4%.'
                ],
                applyEffect: (u) => { u.atkBonus += 1; u.blockChance += 4; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.blockChance = Math.max(0, u.blockChance - 4); }
            }),
            new TalentNode({
                id: `${heroId}_t2_c3_a`, tier: 2, col: 3, choice: 1, icon: 'crossed_swords',
                short: 'Гарда кортика',
                name: 'Гарда кортика (+8% Блок, +4 HP)',
                desc: 'Искусное парирование кортиком в ближнем бою: +8% Блок и +4 Макс. HP.',
                detailedParagraphs: [
                    'Витая стальная гарда позволяет уверенно отводить вражеские выпады.',
                    'Увеличивает шанс блока на 8% и дает +4 ед. к максимальному HP.'
                ],
                applyEffect: (u) => { u.blockChance += 8; u.maxHp += 4; u.hp += 4; },
                revertEffect: (u) => { u.blockChance = Math.max(0, u.blockChance - 8); u.maxHp = Math.max(1, u.maxHp - 4); u.hp = Math.min(u.hp, u.maxHp); }
            }),
            new TalentNode({
                id: `${heroId}_t2_c3_b`, tier: 2, col: 3, choice: 2, icon: 'blood',
                short: 'Удар под ребра',
                name: 'Удар под ребра (+2 Урон, +1 Иниц.)',
                desc: 'Коварный укол в стык доспеха: +2 к урону и +1 к Инициативе.',
                detailedParagraphs: [
                    'Точный выпад узким лезвием находит щель даже в латном нагруднике.',
                    'Дает +2 ед. к Урону и +1 ед. к Инициативе.'
                ],
                applyEffect: (u) => { u.atkBonus += 2; u.initBase += 1; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); u.initBase = Math.max(0, u.initBase - 1); }
            }),
            new TalentNode({
                id: `${heroId}_t3_c3`, tier: 3, col: 3, choice: 1, icon: 'lightning',
                short: 'Контратака',
                name: 'Контратака (+1 Урон, +6% Блок, +2 Иниц.)',
                desc: 'Мгновенный ответ после отбитого удара: +1 Урон, +6% Блок и +2 Иниц.',
                detailedParagraphs: [
                    'Отразив атаку противника, вы тут же проводите ответный укол кортиком.',
                    'Повышает Урон на +1 ед., шанс блока на 6% и Инициативу на +2 ед.'
                ],
                applyEffect: (u) => { u.atkBonus += 1; u.blockChance += 6; u.initBase += 2; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 1); u.blockChance = Math.max(0, u.blockChance - 6); u.initBase = Math.max(0, u.initBase - 2); }
            }),
            new TalentNode({
                id: `${heroId}_t4_c3`, tier: 4, col: 3, choice: 1, icon: 'eagle',
                short: 'Мастер плаща и шпаги',
                name: 'Мастер плаща и шпаги (+2 Урон, +8% Блок, +5 HP)',
                desc: 'Неуловимый дуэлянт: +2 Урон, +8% Блок и +5 Макс. HP.',
                detailedParagraphs: [
                    'Вы одинаково смертоносны как с огнестрельным оружием на дистанции, так и с клинком вплотную.',
                    'Дает +2 ед. к Урону, +8% к шансу блока и +5 ед. к максимальному HP.'
                ],
                applyEffect: (u) => { u.atkBonus += 2; u.blockChance += 8; u.maxHp += 5; u.hp += 5; },
                revertEffect: (u) => { u.atkBonus = Math.max(0, u.atkBonus - 2); u.blockChance = Math.max(0, u.blockChance - 8); u.maxHp = Math.max(1, u.maxHp - 5); u.hp = Math.min(u.hp, u.maxHp); }
            })
        ];
    }
}
