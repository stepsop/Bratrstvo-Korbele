import { EquipmentItem } from './EquipmentItem';
import { HeroModel, WarContractData } from './HeroModel';
import { GuildHotspot, MetalType, TavernBgPreset, TavernBgPresetKey } from './GameStateModel';

/**
 * Каталог статических данных и стартовых пресетов игры (SRP: отделяет конфигурацию данных от логики состояния)
 */
export class GameDataCatalog {
    public static readonly TAVERN_BG_PRESETS: Record<TavernBgPresetKey, TavernBgPreset> = {
        '16x9': {
            key: '16x9',
            url: 'backgrounds/tavern_bg_16x9.png',
            width: 1600,
            height: 900,
            placements: {
                clinic:  { srcX: 112,  srcY: 160, srcW: 110, srcH: 268 },
                quests:  { srcX: 472,  srcY: 94,  srcW: 404, srcH: 214 },
                verbirz: { srcX: 868,  srcY: 152, srcW: 204, srcH: 276 },
                host:    { srcX: 1262, srcY: 164, srcW: 162, srcH: 146 },
                mercs:   { srcX: 56,   srcY: 412, srcW: 586, srcH: 460 },
                smith:   { srcX: 1095, srcY: 435, srcW: 196, srcH: 309 }
            }
        },
        '4x3': {
            key: '4x3',
            url: 'backgrounds/tavern_bg_4x3.png',
            width: 1200,
            height: 896,
            placements: {
                clinic:  { srcX: 108, srcY: 164, srcW: 106, srcH: 258 },
                quests:  { srcX: 304, srcY: 96,  srcW: 354, srcH: 188 },
                verbirz: { srcX: 648, srcY: 162, srcW: 185, srcH: 252 },
                host:    { srcX: 932, srcY: 178, srcW: 148, srcH: 132 },
                mercs:   { srcX: 42,  srcY: 416, srcW: 548, srcH: 430 },
                smith:   { srcX: 840, srcY: 432, srcW: 185, srcH: 291 }
            }
        },
        '3x4': {
            key: '3x4',
            url: 'backgrounds/tavern_bg_3x4.png',
            width: 900,
            height: 1200,
            placements: {
                clinic:  { srcX: 138, srcY: 228, srcW: 106, srcH: 258 },
                quests:  { srcX: 258, srcY: 168, srcW: 260, srcH: 138 },
                verbirz: { srcX: 478, srcY: 226, srcW: 170, srcH: 232 },
                host:    { srcX: 696, srcY: 248, srcW: 124, srcH: 110 },
                mercs:   { srcX: 32,  srcY: 486, srcW: 484, srcH: 380 },
                smith:   { srcX: 615, srcY: 505, srcW: 175, srcH: 276 }
            }
        },
        '9x16': {
            key: '9x16',
            url: 'backgrounds/tavern_bg_9x16.png',
            width: 900,
            height: 1600,
            placements: {
                clinic:  { srcX: 145, srcY: 298, srcW: 106, srcH: 258 },
                quests:  { srcX: 268, srcY: 238, srcW: 250, srcH: 132 },
                verbirz: { srcX: 478, srcY: 296, srcW: 170, srcH: 232 },
                host:    { srcX: 696, srcY: 292, srcW: 124, srcH: 110 },
                mercs:   { srcX: 32,  srcY: 556, srcW: 484, srcH: 380 },
                smith:   { srcX: 615, srcY: 575, srcW: 175, srcH: 276 }
            }
        }
    };

    public static readonly GUILD_HOTSPOTS: GuildHotspot[] = [
        {
            id: 'clinic',
            srcX: 108, srcY: 164, srcW: 106, srcH: 258,
            x: Math.round(108 * 520 / 1200), y: Math.round(164 * 290 / 896),
            w: Math.round(106 * 520 / 1200), h: Math.round(258 * 290 / 896),
            spriteUrl: 'sprites/npc_clinic.png',
            title: 'Палаты врачебные — Сестра Берта', labelX: 88, labelY: 48
        },
        {
            id: 'quests',
            srcX: 304, srcY: 96, srcW: 354, srcH: 188,
            x: Math.round(304 * 520 / 1200), y: Math.round(96 * 290 / 896),
            w: Math.round(354 * 520 / 1200), h: Math.round(188 * 290 / 896),
            spriteUrl: 'sprites/npc_quests.png',
            title: 'Доска заданий', labelX: 242, labelY: 22
        },
        {
            id: 'verbirz',
            srcX: 648, srcY: 162, srcW: 185, srcH: 252,
            x: Math.round(648 * 520 / 1200), y: Math.round(162 * 290 / 896),
            w: Math.round(185 * 520 / 1200), h: Math.round(252 * 290 / 896),
            spriteUrl: 'sprites/npc_verbirz.png',
            title: 'Королевский Вербовщик', labelX: 342, labelY: 48
        },
        {
            id: 'host',
            srcX: 932, srcY: 178, srcW: 148, srcH: 132,
            x: Math.round(932 * 520 / 1200), y: Math.round(178 * 290 / 896),
            w: Math.round(148 * 520 / 1200), h: Math.round(132 * 290 / 896),
            spriteUrl: 'sprites/npc_host.png',
            title: 'Хозяин таверны / Магазин', labelX: 438, labelY: 52
        },
        {
            id: 'mercs',
            srcX: 42, srcY: 416, srcW: 548, srcH: 430,
            x: Math.round(42 * 520 / 1200), y: Math.round(416 * 290 / 896),
            w: Math.round(548 * 520 / 1200), h: Math.round(430 * 290 / 896),
            spriteUrl: 'sprites/npc_mercs.png',
            title: 'Стол наемников', labelX: 128, labelY: 132
        },
        {
            id: 'smith',
            srcX: 840, srcY: 432, srcW: 185, srcH: 291,
            x: Math.round(840 * 520 / 1200), y: Math.round(432 * 290 / 896),
            w: Math.round(185 * 520 / 1200), h: Math.round(291 * 290 / 896),
            spriteUrl: 'sprites/npc_smith.png',
            title: 'Кузнец Матей — Кузница гильдии', labelX: 400, labelY: 165
        }
    ];

    public static readonly TAVERN_TALES: string[] = [
        "«Видишь мой золотой зуб, пане? Это я у гуситского сотника выменял — посмертно, хе-хе! Тот тоже думал, что чаша крепче сабли!»",
        "«Слыхал новость? Пан Вшивец вчера в подвале бочку пива на спор выпил, а потом с гуситским знаменем польку плясал!»",
        "«Бери пиво в дорогу да штурмовой горшок с порохом! Без них на богемском тракте даже до первого моста не дойдешь!»",
        "«Пан Януш из Праги сказывал, что король Вацлав опять поругался с архиепископом. Значит, скоро наемникам будет много работы!»"
    ];

    public static readonly MERC_JOKES: string[] = [
        "«Заходит как-то гусит в корчму, а корчмарь ему: — Пане, у вас цеп за спиной! — Это не цеп, это моя аргументация в богословских спорах!»",
        "«— Почему наш мушкетер всегда целится левым глазом? — Потому что правый он еще в прошлом цикле в кости проиграл!»",
        "«Наемник без пива — как аркебуза без пороха: шуму много, грохоту ноль, а толку никакого!»",
        "«Спрашивают шляхтича: — Пане, отчего у вас жупан в дырах? — Это не дыры, невежда, это вентиляция для дворянской доблести!»",
        "«Брат Тадеуш говорит, что пиво лечит душу. Судя по нашему счету у корчмаря, души у нас уже святые!»",
        "«Два наемника делят добычу: — Тебе грош, мне два, тебе грош, мне три... — Погоди, а почему так? — Так я же считать умею, а ты — только рубить!»"
    ];

    public static createWarCampaigns(): WarContractData[] {
        return [
            {
                id: 'caravan',
                name: 'Охрана обоза короны',
                colorKey: 'grey',
                riskBadge: '<span class="badge-risk risk-low">НИЗКИЙ РИСК</span>',
                needHeroes: 1,
                cycles: 4,
                deathChance: 5,
                injuryChance: 15,
                goldMin: 40, goldMax: 55,
                rewardDesc: '40-55 гр., +1 талант',
                extraRewardText: '+1 очко таланта (+1 Ур. при изучении)',
                reqClass: 'Любой класс',
                assignedHeroIds: []
            },
            {
                id: 'border',
                name: 'Стычка с Чашниками',
                colorKey: 'green',
                riskBadge: '<span class="badge-risk risk-med">СРЕДНИЙ РИСК</span>',
                needHeroes: 1,
                cycles: 6,
                deathChance: 10,
                injuryChance: 22,
                goldMin: 65, goldMax: 85,
                bonusItem: new EquipmentItem('Трофейный чекан', 'weapon', 2, 0, 6),
                rewardDesc: '65-85 гр., +1 тал., чекан',
                extraRewardText: '+1 очко таланта, Трофейный чекан',
                reqClass: 'Нужен: Шляхта',
                assignedHeroIds: []
            },
            {
                id: 'kutna_raid',
                name: 'Рейд под Кутна-Гору',
                colorKey: 'blue',
                riskBadge: '<span class="badge-risk risk-med">ПОВЫШЕННЫЙ РИСК</span>',
                needHeroes: 1,
                cycles: 8,
                deathChance: 14,
                injuryChance: 28,
                goldMin: 95, goldMax: 125,
                bonusItem: new EquipmentItem('Панцирная кираса', 'armor', 0, 2, 10),
                rewardDesc: '95-125 гр., +1 тал., кираса',
                extraRewardText: '+1 очко таланта, Панцирная кираса',
                reqClass: 'Нужен: Мушкетер',
                assignedHeroIds: []
            },
            {
                id: 'siege',
                name: 'Штурм крепости Табор',
                colorKey: 'purple',
                riskBadge: '<span class="badge-risk risk-high">ВЫСОКИЙ РИСК</span>',
                needHeroes: 3,
                cycles: 12,
                deathChance: 18,
                injuryChance: 32,
                goldMin: 180, goldMax: 240,
                lvlGain: 2,
                bonusItem: new EquipmentItem('Рыцарский панцирь', 'armor', 0, 3, 10),
                rewardDesc: '180-240 гр., +2 тал., панцирь',
                extraRewardText: '+2 очка талантов каждому, Рыцарский панцирь',
                reqClass: 'Отряд из 3 бойцов',
                assignedHeroIds: []
            }
        ];
    }

    public static createInitialSpareEquip(): EquipmentItem[] {
        return [
            new EquipmentItem('Ржавый корд', 'weapon', 2, 0, 0, 'Потрепанный в походах пехотный корд, но клинок всё ещё держит заточку.'),
            new EquipmentItem('Гусарский чекан', 'weapon', 2, 0, 6, 'Боевой клевец конного шляхтича. Легко пробивает щиты и шлемы.'),
            new EquipmentItem('Стеганый жупан', 'armor', 0, 1, 6, 'Плотная куртка, набитая конским волосом и пропитанная воском.'),
            new EquipmentItem('Кольчужная бармица', 'armor', 0, 2, 8, 'Плетеная стальная кольчуга кутна-горской ковки. Отлично держит удар.'),
            new EquipmentItem('Счастливая подкова', 'trinket', 1, 0, 5, 'Старая железная подкова на ремешке. Приносит удачу в бою.')
        ];
    }

    public static createInitialParty(): HeroModel[] {
        return [
            new HeroModel({
                id: 'pan',
                name: 'Пан Вшивец',
                cls: 'Шляхта',
                sprite: 'szlachta',
                color: '#e6c280',
                inSquad: true,
                lvl: 1, exp: 0, talentPts: 1,
                hp: 28, maxHp: 28,
                atkBonus: 1,
                initBase: 6,
                blockChance: 25,
                armor: 2,
                maxCd1: 2, skill1Name: 'Атака плашмя (1d10 всем)',
                maxCd2: 0, skill2Name: 'Атака оружием (1d4)',
                equip: { weapon: 'Дедовская сабля (+1 Ур)', armor: 'Кунтуш шляхтича (+2 Бр)', trinket: 'Перстень гербовый (+5% Блок)' }
            }),
            new HeroModel({
                id: 'tadeusz',
                name: 'Брат Тадеуш',
                cls: 'Святоша',
                sprite: 'monk',
                color: '#c2996b',
                inSquad: true,
                lvl: 1, exp: 0, talentPts: 1,
                hp: 25, maxHp: 25,
                atkBonus: 1,
                initBase: 5,
                blockChance: 20,
                armor: 1,
                maxCd1: 0, skill1Name: 'Атака дубиной (1d4)',
                maxCd2: 3, skill2Name: 'Запить грехи (Хил 1d4)',
                equip: { weapon: 'Суковатая дубина (+1 Ур)', armor: 'Монашеская ряса (+1 Бр)', trinket: 'Мешочек для трав' }
            }),
            new HeroModel({
                id: 'szymon',
                name: 'Шимон Бережливый',
                cls: 'Мушкетер',
                sprite: 'musketeer',
                color: '#7aa3cc',
                inSquad: true,
                lvl: 1, exp: 0, talentPts: 1,
                hp: 22, maxHp: 22,
                atkBonus: 1,
                initBase: 8,
                blockChance: 15,
                armor: 1,
                maxCd1: 3, skill1Name: 'Выстрел из Аркебузы (1d10 двоим)',
                maxCd2: 0, skill2Name: 'Пырнуть Кортиком (1d4)',
                targetRule: 'lowest_hp',
                equip: { weapon: 'Аркебуза и Кортик (+1 Ур)', armor: 'Кожаный колет (+1 Бр)', trinket: 'Пороховница' }
            }),
            new HeroModel({
                id: 'vaclav',
                name: 'Вацлав Хмурый',
                cls: 'Шляхта',
                sprite: 'szlachta',
                color: '#c7a473',
                inSquad: false,
                lvl: 1, exp: 0, talentPts: 1,
                hp: 27, maxHp: 27,
                atkBonus: 1,
                initBase: 6,
                blockChance: 25,
                armor: 2,
                maxCd1: 2, skill1Name: 'Атака плашмя (1d10 всем)',
                maxCd2: 0, skill2Name: 'Атака оружием (1d4)',
                equip: { weapon: 'Пехотный тесак (+1 Ур)', armor: 'Стеганый кафтан (+1 Бр)', trinket: 'Ладанка (+5% Блок)' }
            }),
            new HeroModel({
                id: 'jan',
                name: 'Ян Стрелец',
                cls: 'Мушкетер',
                sprite: 'musketeer',
                color: '#88a8c4',
                inSquad: false,
                lvl: 1, exp: 0, talentPts: 1,
                hp: 21, maxHp: 21,
                atkBonus: 1,
                initBase: 8,
                blockChance: 15,
                armor: 1,
                maxCd1: 3, skill1Name: 'Выстрел из Аркебузы (1d10 двоим)',
                maxCd2: 0, skill2Name: 'Пырнуть Кортиком (1d4)',
                equip: { weapon: 'Ручница (+1 Ур)', armor: 'Суконный плащ (+1 Бр)', trinket: 'Пусто' }
            })
        ];
    }

    public static createInitialMercs(): HeroModel[] {
        return [
            new HeroModel({
                id: 'merc_grey',
                name: 'Збышек Косой',
                cls: 'Шляхта',
                sprite: 'szlachta',
                color: '#d9a773',
                inSquad: false,
                lvl: 1, exp: 0, talentPts: 0,
                hp: 26, maxHp: 26,
                atkBonus: 0,
                initBase: 6, blockChance: 25, armor: 2,
                maxCd1: 2, skill1Name: 'Атака плашмя (1d10 всем)',
                maxCd2: 0, skill2Name: 'Атака оружием (1d4)',
                injuries: ['Похмелье (-2 HP)'],
                price: 35,
                equip: { weapon: 'Кривая сабля (+1 Ур)', armor: 'Потертый жупан (+1 Бр)', trinket: 'Кость в кармане' }
            }),
            new HeroModel({
                id: 'merc_green',
                name: 'Отец Богуслав',
                cls: 'Святоша',
                sprite: 'monk',
                color: '#a88b67',
                inSquad: false,
                lvl: 2, exp: 0, talentPts: 0,
                unlockedTalentTiers: 1,
                hp: 30, maxHp: 30,
                atkBonus: 1,
                initBase: 5, blockChance: 25, armor: 2,
                maxCd1: 0, skill1Name: 'Атака дубиной (1d4)',
                maxCd2: 3, skill2Name: 'Запить грехи (Хил 1d4)',
                injuries: [],
                price: 60,
                equip: { weapon: 'Окованный посох (+1 Ур)', armor: 'Плотная ряса (+1 Бр)', trinket: 'Четки (+5% Блок)' }
            }),
            new HeroModel({
                id: 'merc_blue',
                name: 'Кашпар Меткий',
                cls: 'Мушкетер',
                sprite: 'musketeer',
                color: '#6e9cd6',
                inSquad: false,
                lvl: 3, exp: 0, talentPts: 0,
                unlockedTalentTiers: 2,
                hp: 28, maxHp: 28,
                atkBonus: 2,
                initBase: 8, blockChance: 20, armor: 2,
                maxCd1: 3, skill1Name: 'Выстрел из Аркебузы (1d10 двоим)',
                maxCd2: 0, skill2Name: 'Пырнуть Кортиком (1d4)',
                injuries: [],
                price: 95,
                equip: {
                    weapon: new EquipmentItem('Пражский мушкет', 'weapon', 2, 0, 5, 'Отличная аркебуза пражских оружейников.'),
                    armor: new EquipmentItem('Кираса стрелка', 'armor', 0, 2, 5, 'Вороненый нагрудник, не стесняющий стрельбу.'),
                    trinket: new EquipmentItem('Серебряный рог', 'trinket', 1, 1, 5, 'Охотничий пороховой рог с серебряной чеканкой.')
                }
            }),
            new HeroModel({
                id: 'merc_purple',
                name: 'Пан Радзивилл',
                cls: 'Шляхта',
                sprite: 'szlachta',
                color: '#b87cd9',
                inSquad: false,
                lvl: 4, exp: 0, talentPts: 0,
                unlockedTalentTiers: 3,
                hp: 36, maxHp: 36,
                atkBonus: 3,
                initBase: 7, blockChance: 35, armor: 4,
                maxCd1: 2, skill1Name: 'Атака плашмя (1d10 всем)',
                maxCd2: 0, skill2Name: 'Атака оружием (1d4)',
                injuries: [],
                price: 150,
                equip: {
                    weapon: new EquipmentItem('Клинок воеводы', 'weapon', 2, 0, 10, 'Именная дамасская сабля знатного рода.'),
                    armor: new EquipmentItem('Вороненый панцирь', 'armor', 0, 2, 10, 'Тяжелый рыцарский доспех миланской работы.'),
                    trinket: new EquipmentItem('Печать короны', 'trinket', 1, 1, 10, 'Золотой перстень с королевским львом Богемии.')
                }
            })
        ];
    }

    public static createHostArmorCatalog(): HostShopArmorItem[] {
        return [
            // Ряд 1 (4 предмета: grey, blue, green, gold — точно в ритме концепта)
            {
                id: 'sh_1', name: 'Стеганый гамбезон', slot: 'armor', rarity: 'grey', icon: 'armor', price: 22,
                atk: 0, armor: 1, block: 4,
                desc: 'Плотная льняная куртка, набитая паклей и простеганная суровой нитью.',
                loreQuote: '«Против стрелы спасет, а против алебарды — молись, брат!» — десятник Матей.'
            },
            {
                id: 'sh_2', name: 'Пражская бригантина', slot: 'armor', rarity: 'blue', icon: 'shield_cross', price: 65,
                atk: 0, armor: 2, block: 9,
                desc: 'Суконный панцирь с клепаными стальными пластинами внутри.',
                loreQuote: '«Снята с бургомистра Старого Места после ночной схватки на мосту.»'
            },
            {
                id: 'sh_3', name: 'Клепаный наплечник', slot: 'armor', rarity: 'green', icon: 'gauntlet', price: 38,
                atk: 0, armor: 1, block: 7,
                desc: 'Усиленный воловьей кожей доспех с железными накладками на плечах.',
                loreQuote: '«Держит сабельный удар не хуже миланской стали, зато в корчме сидеть мягко.»'
            },
            {
                id: 'sh_4', name: 'Зерцало Короля Вацлава', slot: 'armor', rarity: 'gold', icon: 'crown', price: 165,
                atk: 1, armor: 4, block: 14,
                desc: 'Парадный турнирный панцирь королевской стражи с золотой насечкой богемского льва.',
                loreQuote: '«Кто носит сей панцирь — не кланяется ни кардиналу, ни гетману.»'
            },

            // Ряд 2 (green, purple, gold, purple)
            {
                id: 'sh_5', name: 'Пехотная капелина', slot: 'armor', rarity: 'green', icon: 'helmet', price: 42,
                atk: 0, armor: 2, block: 5,
                desc: 'Железный шлем с широкими полями, отлично защищающий от ударов сверху.',
                loreQuote: '«Поля широкие — и от камня со стены укроют, и от дождя в обозе.»'
            },
            {
                id: 'sh_6', name: 'Миланский полудоспех', slot: 'armor', rarity: 'purple', icon: 'armor', price: 115,
                atk: 0, armor: 3, block: 11,
                desc: 'Кованый стальной нагрудник с подвижными тассетами работы ломбардских мастеров.',
                loreQuote: '«Итальянский купец просил за него триста грошей, да по дороге встретил гуситов.»'
            },
            {
                id: 'sh_7', name: 'Эгида Святого Георгия', slot: 'trinket', rarity: 'gold', icon: 'fleur', price: 155,
                atk: 2, armor: 2, block: 12,
                desc: 'Древний золотой реликварий на тяжелой цепи, заговоренный пражским затворником.',
                loreQuote: '«Пять стрел отскочили от груди пана Ондржея, пока сей медальон висел у сердца.»'
            },
            {
                id: 'sh_8', name: 'Гусарский карацен', slot: 'armor', rarity: 'purple', icon: 'shield_cross', price: 120,
                atk: 1, armor: 3, block: 9,
                desc: 'Чешуйчатый панцирь польско-литовского образца с медными заклепками.',
                loreQuote: '«Блестит на солнце так, что у вражеских арбалетчиков слезятся глаза!»'
            },

            // Ряд 3 (blue, grey, green, gold)
            {
                id: 'sh_9', name: 'Кутна-горская кольчуга', slot: 'armor', rarity: 'blue', icon: 'armor', price: 70,
                atk: 0, armor: 2, block: 10,
                desc: 'Рубаха двойного плетения из закаленной проволоки горных кузнецов.',
                loreQuote: '«Каждое колечко клепано вручную под песни рудокопов Кутна-Горы.»'
            },
            {
                id: 'sh_10', name: 'Овчинный тулуп', slot: 'armor', rarity: 'grey', icon: 'hood', price: 20,
                atk: 0, armor: 1, block: 3,
                desc: 'Грубый дорожный тулуп, пахнущий дымом костра и пролитым элем.',
                loreQuote: '«Дешево, сердито, а зимой в карауле дороже соболей.»'
            },
            {
                id: 'sh_11', name: 'Кованая кираса', slot: 'armor', rarity: 'green', icon: 'shield_cross', price: 45,
                atk: 0, armor: 2, block: 8,
                desc: 'Надежный пехотный нагрудник с ребром жесткости посреди груди.',
                loreQuote: '«Вмятина слева — от таборитского цепа. Кузнец выправил, держит как новая!»'
            },
            {
                id: 'sh_12', name: 'Доспех Черного Рыцаря', slot: 'armor', rarity: 'gold', icon: 'crown_dark', price: 175,
                atk: 2, armor: 4, block: 12,
                desc: 'Вороненый в масле латный гарнитур силезского барона-разбойника.',
                loreQuote: '«Ночью в лесу его не видно, слышен лишь звон шпор перед ударом.»'
            },

            // Ряд 4 (purple, purple, grey, green)
            {
                id: 'sh_13', name: 'Сабля «Волчок»', slot: 'weapon', rarity: 'purple', icon: 'sword', price: 110,
                atk: 3, armor: 0, block: 10,
                desc: 'Знаменитый пассауский клинок с клеймом бегущего волка на голомени.',
                loreQuote: '«Рубит железный шишак до самого седла без единой зазубрины.»'
            },
            {
                id: 'sh_14', name: 'Нюрнбергский нагрудник', slot: 'armor', rarity: 'purple', icon: 'armor', price: 125,
                atk: 0, armor: 3, block: 12,
                desc: 'Рифленый максимилиановский панцирь, отражающий копейные удары.',
                loreQuote: '«Немецкая работа: ни единой щели для кинжала.»'
            },
            {
                id: 'sh_15', name: 'Кожаные наручи', slot: 'trinket', rarity: 'grey', icon: 'gauntlet', price: 18,
                atk: 0, armor: 1, block: 4,
                desc: 'Толстые краги со стальными полосами для защиты предплечий в фехтовании.',
                loreQuote: '«Без рук в таверне даже кружку не поднимешь — береги запястья!»'
            },
            {
                id: 'sh_16', name: 'Гусарская сабля', slot: 'weapon', rarity: 'green', icon: 'crossed_swords', price: 38,
                atk: 2, armor: 0, block: 5,
                desc: 'Сбалансированная кавалерийская сабля с закрытой стальной гардой.',
                loreQuote: '«Любимое оружие обедневшей шляхты от Кракова до Праги.»'
            },

            // Ряд 5 (green, grey, blue, purple)
            {
                id: 'sh_17', name: 'Щит-павеза стрелка', slot: 'trinket', rarity: 'green', icon: 'shield_cross', price: 40,
                atk: 0, armor: 1, block: 8,
                desc: 'Ростовой деревянный щит, обтянутый сыромятной кожей с расписным крестом.',
                loreQuote: '«Поставил на сошку — и перезаряжай мушкет спокойно, пока стрелы стучат по доскам.»'
            },
            {
                id: 'sh_18', name: 'Солдатский тесак', slot: 'weapon', rarity: 'grey', icon: 'dagger', price: 24,
                atk: 2, armor: 0, block: 2,
                desc: 'Тяжелый falchion для тесной свалки и рубки фашин.',
                loreQuote: '«Грубый, как староста, зато в обозе и хворост нарубит, и врага угостит.»'
            },
            {
                id: 'sh_19', name: 'Шлем-бацинет «Пёсий рыл»', slot: 'armor', rarity: 'blue', icon: 'helmet', price: 78,
                atk: 0, armor: 3, block: 7,
                desc: 'Рыцарский шлем с вытянутым забралом хундсгугель, отводящим удары копий.',
                loreQuote: '«Дышать в нем жарко, зато ни одна стрела в лицо не вопьется.»'
            },
            {
                id: 'sh_20', name: 'Аркебуза мастера Лазаря', slot: 'weapon', rarity: 'purple', icon: 'crossbow', price: 130,
                atk: 4, armor: 0, block: 6,
                desc: 'Длинноствольная фитильная аркебуза с прикладом из мореного ореха.',
                loreQuote: '«Грохочет как гром небесный, а свинцовая пуля шьет кирасу навылет.»'
            },

            // Ряд 6 (blue, purple, green, grey)
            {
                id: 'sh_21', name: 'Перстень бургомистра', slot: 'trinket', rarity: 'blue', icon: 'coins_stack', price: 68,
                atk: 1, armor: 1, block: 7,
                desc: 'Тяжелый серебряный перстень с гранатом из сокровищницы Вышеграда.',
                loreQuote: '«Хозяин таверны клянется, что выиграл его в кости совершенно честно.»'
            },
            {
                id: 'sh_22', name: 'Панцирь Таборитского Гетмана', slot: 'armor', rarity: 'purple', icon: 'chalice', price: 135,
                atk: 1, armor: 3, block: 11,
                desc: 'Закаленный в боях латный нагрудник с выбитой чашей на груди.',
                loreQuote: '«Прошел четыре крестовых похода и ни разу не подвел владельца.»'
            },
            {
                id: 'sh_23', name: 'Боевой моргенштерн', slot: 'weapon', rarity: 'green', icon: 'mace', price: 44,
                atk: 2, armor: 0, block: 6,
                desc: 'Окованная железом булава с гранёными шипами для проламывания шлемов.',
                loreQuote: '«Латы не пробьет, так оглушит до самой пятницы!»'
            },
            {
                id: 'sh_24', name: 'Железный набрюшник', slot: 'armor', rarity: 'grey', icon: 'shield_cross', price: 26,
                atk: 0, armor: 1, block: 5,
                desc: 'Простая кованая пластина на ремнях, прикрывающая живот и поясницу.',
                loreQuote: '«Береги брюхо смолоду, особенно если любишь чешское пиво!»'
            }
        ];
    }

    public static createTavernUpgrades(): TavernUpgradeNode[] {
        return [
            // Ветка 1: Казармы и Арсенал
            {
                id: 'upg_b1_t1', branch: 1, branchTitle: 'Казармы и Арсенал', tier: 1,
                name: 'Расширенные казармы братства', icon: 'house', price: 35, unlocked: false,
                statLines: [
                    'Вместимость резерва гильдии: +3 места',
                    'Макс. HP всех бойцов: +2 ед.'
                ],
                desc: 'Утеплённые нары на чердаке корчмы с сундуками для личных вещей новобранцев и запасных бойцов.',
                loreQuote: '«Тесно на дворе — тесно и в строю! Расширяем постой для бравых рубак!»'
            },
            {
                id: 'upg_b1_t2', branch: 1, branchTitle: 'Казармы и Арсенал', tier: 2,
                name: 'Точильное колесо во дворе', icon: 'gear', price: 65, unlocked: false,
                statLines: [
                    'Урон к атаке всех бойцов: +1 ед.',
                    'Шанс блока всех бойцов: +3%'
                ],
                desc: 'Собственная кузнечная стойка для правки сабель, кортиков и подгонки ремней перед выходом.',
                loreQuote: '«Тупая сабля — позор для шляхтича и верная смерть в лесной засаде.»'
            },
            {
                id: 'upg_b1_t3', branch: 1, branchTitle: 'Казармы и Арсенал', tier: 3,
                name: 'Оружейная клеть братства', icon: 'shield_cross', price: 105, unlocked: false,
                statLines: [
                    'Защита брони всех бойцов: +1 ед.',
                    'Макс. HP всех бойцов: +4 ед.'
                ],
                desc: 'Сухой каменный чулан с масляными ветошами и запасом кольчужных колец для ремонта брони.',
                loreQuote: '«Ржавчина съела больше латников, чем гуситские пушки!»'
            },
            {
                id: 'upg_b1_t4', branch: 1, branchTitle: 'Казармы и Арсенал', tier: 4,
                name: 'Гвардейский штаб Корбеля', icon: 'castle', price: 160, unlocked: false,
                statLines: [
                    'Урон к атаке всех бойцов: +2 ед.',
                    'Защита брони всех бойцов: +1 ед.',
                    'Шанс блока всех бойцов: +5%'
                ],
                desc: 'Превращает корчму в укрепленную резиденцию элитного наемного братства Богемии.',
                loreQuote: '«Теперь к нам на поклон ездят даже пражские паны!»'
            },

            // Ветка 2: Погреба и Припасы
            {
                id: 'upg_b2_t1', branch: 2, branchTitle: 'Погреба и Припасы', tier: 1,
                name: 'Хмельной погреб со льдом', icon: 'beer', price: 30, unlocked: false,
                statLines: [
                    'Мгновенно в запас: +2 кружки Пива',
                    'Скидка на покупку Пива: -2 гроша'
                ],
                desc: 'Глубокий сводчатый подвал со льдом, где пльзеньское пиво долго остается холодным и крепким.',
                loreQuote: '«Теплое пиво пить — только грех на душу брать!»'
            },
            {
                id: 'upg_b2_t2', branch: 2, branchTitle: 'Погреба и Припасы', tier: 2,
                name: 'Коптильня кабанятины', icon: 'meat', price: 60, unlocked: false,
                statLines: [
                    'Макс. HP всех бойцов: +4 ед.',
                    'Инициатива всех бойцов: +1 ед.'
                ],
                desc: 'Сытный мясной паёк из копченого окорока и чеснока перед каждым боевым походом.',
                loreQuote: '«На голодный желудок и мушкет тяжел, и молитва не идет.»'
            },
            {
                id: 'upg_b2_t3', branch: 2, branchTitle: 'Погреба и Припасы', tier: 3,
                name: 'Пороховая лаборатория', icon: 'fire', price: 95, unlocked: false,
                statLines: [
                    'Мгновенно в запас: +2 Штурмовых горшка',
                    'Скидка на покупку Бомб: -5 грошей'
                ],
                desc: 'Отдельный каменный погребок для смешивания селитры, серы и древесного угля.',
                loreQuote: '«Главное — не заходить туда с трубкой, иначе вся корчма улетит в Моравию!»'
            },
            {
                id: 'upg_b2_t4', branch: 2, branchTitle: 'Погреба и Припасы', tier: 4,
                name: 'Купеческая гильдия тракта', icon: 'coins_stack', price: 145, unlocked: false,
                statLines: [
                    'Доход с боевых походов: +25% грошей',
                    'Единовременный взнос купцов: +50 грошей'
                ],
                desc: 'Доля в торговых обозах, проходящих через наш участок Королевского тракта.',
                loreQuote: '«Звонкая монета сама течет в руки тем, кто держит дорогу в порядке.»'
            },

            // Ветка 3: Лазарет и Связи
            {
                id: 'upg_b3_t1', branch: 3, branchTitle: 'Лазарет и Связи', tier: 1,
                name: 'Сушильня целебных трав', icon: 'herb', price: 35, unlocked: false,
                statLines: [
                    'Мгновенно в запас: +2 Полевые аптечки',
                    'Скидка на Аптечки: -3 гроша'
                ],
                desc: 'Подвесные пучки зверобоя, шалфея и подорожника для сестры Берты.',
                loreQuote: '«Богемские травы затягивают сабельный разрез быстрее шелковой нити.»'
            },
            {
                id: 'upg_b3_t2', branch: 3, branchTitle: 'Лазарет и Связи', tier: 2,
                name: 'Чистые палаты сестры Берты', icon: 'heal_cross', price: 70, unlocked: false,
                statLines: [
                    'Макс. HP всех бойцов: +3 ед.',
                    'Снятие всех текущих травм у отряда'
                ],
                desc: 'Новые кровати, кипяченое вино для промывки ран и хирургический инструмент.',
                loreQuote: '«Сестра Берта строга, зато из ее палат на кладбище еще никто не уезжал.»'
            },
            {
                id: 'upg_b3_t3', branch: 3, branchTitle: 'Лазарет и Связи', tier: 3,
                name: 'Почтовые голуби Вербовщика', icon: 'raven', price: 100, unlocked: false,
                statLines: [
                    'Шанс смерти в походах Вербовщика: -4%',
                    'Награда за заказы Вербовщика: +20 грошей'
                ],
                desc: 'Быстрая связь с королевскими обозами позволяет заранее обходить засады на войне.',
                loreQuote: '«Предупрежден — значит вернется с добычей, а не в деревянном ящике.»'
            },
            {
                id: 'upg_b3_t4', branch: 3, branchTitle: 'Лазарет и Связи', tier: 4,
                name: 'Королевский привилей', icon: 'scroll', price: 155, unlocked: false,
                statLines: [
                    'Макс. HP всех бойцов: +5 ед.',
                    'Награда за заказы Вербовщика: +35 грошей'
                ],
                desc: 'Личная грамота с восковой печатью Пражского Града, дарующая братству особые права.',
                loreQuote: '«С такой бумагой любой воротарь открывает ворота без лишних вопросов.»'
            },

            // Ветка 4: Кузница и Горн
            {
                id: 'upg_b4_t1', branch: 4, branchTitle: 'Кузница и Горн', tier: 1,
                name: 'Кузница братства', icon: 'forge', price: 30, unlocked: false,
                statLines: [
                    'Оборудует полноценную Кузницу в зале гильдии',
                    'Мгновенно в горн: +4 Железа, +2 Бронзы, +1 Сталь',
                    'Бонус ковки: +1 к Урону/Броне (+3% Блок талисманам)'
                ],
                desc: 'Ставит горн, наковальню и мехи прямо в таверне. Позволяет плавить трофейный хлам на металл и ковать оружие и броню с клеймом мастера.',
                loreQuote: '«Хороший кузнец в корчме дороже целой телеги наёмного сброда!»'
            },
            {
                id: 'upg_b4_t2', branch: 4, branchTitle: 'Кузница и Горн', tier: 2,
                name: 'Мехи с двойным поддувом', icon: 'fire', price: 65, unlocked: false,
                statLines: [
                    'Мгновенно в горн: +3 Железа, +2 Бронзы',
                    'Переплавка даёт дополнительно +1 Железо и +1 Бронзу'
                ],
                desc: 'Сдвоенные кожаные мехи раздувают пламя добела, позволяя выплавлять больше чистого металла даже из ржавого трофейного лома.',
                loreQuote: '«Больше жару — меньше шлака! Из старого шлема выйдет славный арбалетный замок.»'
            },
            {
                id: 'upg_b4_t3', branch: 4, branchTitle: 'Кузница и Горн', tier: 3,
                name: 'Тигельная стальная печь', icon: 'anvil', price: 110, unlocked: false,
                statLines: [
                    'Мгновенно в горн: +2 Стали, +1 Булат',
                    'Бонус ковки: +2 к Урону/Броне (+5% Блок талисманам)'
                ],
                desc: 'Закрытая шамотная печь для науглероживания железа и отливки клинковой стали богемской закалки.',
                loreQuote: '«В такой печи железо забывает, что оно когда-то гнулось.»'
            },
            {
                id: 'upg_b4_t4', branch: 4, branchTitle: 'Кузница и Горн', tier: 4,
                name: 'Мастерская королевских оружейников', icon: 'crown', price: 165, unlocked: false,
                statLines: [
                    'Мгновенно в горн: +2 Булата',
                    'Бонус ковки: +3 к Урону/Броне (+7% Блок)',
                    'Подгонка снаряжения: +1 Урон и +1 Броня всем бойцам'
                ],
                desc: 'Элитный цех с калиброванными молотами и гравировкой булата. Каждое изделие выходит достойным рыцарей Праги.',
                loreQuote: '«На таком клинке сам граф не постыдится выгравировать свой герб!»'
            },

            // Ветка 5: Тёмное братство
            {
                id: 'upg_b5_t1', branch: 5, branchTitle: 'Тёмное братство', tier: 1,
                name: 'Теневая ячейка под корчмой', icon: 'hood', price: 45, unlocked: false,
                statLines: [
                    'Инициатива всех бойцов: +1 ед.',
                    'Мгновенно в тайник: +2 травы и +1 Штурмовой горшок'
                ],
                desc: 'Потайной лаз за винными бочками, где молчаливые лазутчики Тёмного братства передают донесения о дорогах Богемии.',
                loreQuote: '«У каждой уважаемой таверны есть дверь, о которой не знают даже городские стражники.»'
            },
            {
                id: 'upg_b5_t2', branch: 5, branchTitle: 'Тёмное братство', tier: 2,
                name: 'Гильдия травников и отравителей', icon: 'poison', price: 85, unlocked: false,
                statLines: [
                    'Урон к атаке всех бойцов: +2 ед.',
                    'Шанс блока всех бойцов: +3%',
                    'Шанс смерти у Вербовщика: -3%'
                ],
                desc: 'Тёмный алхимик варит в подвале едкие настойки для смазки клинков, болтов и противоядия от лесных засад.',
                loreQuote: '«Даже лёгкая царапина становится смертельной, если клинок побывал в нашем погребке.»'
            },
            {
                id: 'upg_b5_t3', branch: 5, branchTitle: 'Тёмное братство', tier: 3,
                name: 'Сеть ночных соглядатаев', icon: 'dagger', price: 130, unlocked: false,
                statLines: [
                    'Макс. HP: +4 ед., Инициатива: +1, Блок: +2%',
                    'Награда за заказы Вербовщика: +20 грошей'
                ],
                desc: 'Соглядатаи братства дежурят на постоялых дворах и заранее наводят отряд на богатые цели и слабые места охраны.',
                loreQuote: '«Мы слышим звон монет ещё до того, как купеческий обоз выехал за ворота.»'
            },
            {
                id: 'upg_b5_t4', branch: 5, branchTitle: 'Тёмное братство', tier: 4,
                name: 'Клятва Ночного клинка', icon: 'skull_bones', price: 185, unlocked: false,
                statLines: [
                    'Урон: +3 ед., Инициатива: +2, Блок: +5% всем бойцам',
                    'Награда за заказы Вербовщика: +40 грошей'
                ],
                desc: 'Высшее покровительство Тёмного братства. Бойцы отряда бьют первыми из тени и выходят живыми из самых гибельных контрактов.',
                loreQuote: '«Тень не знает жалости, а Ночной клинок всегда забирает свою долю золота.»'
            }
        ];
    }

    public static createHostConsumables(): HostConsumableItem[] {
        return [
            {
                id: 'beer',
                name: 'Чешское пенное пиво',
                icon: 'beer',
                price: 10,
                effectTitle: 'Исцеление в бою: 1d10 HP',
                statLines: [
                    'Восстанавливает: 1–10 HP раненому бойцу',
                    'Применение: с панели управления прямо в бою',
                    'Перезарядка: без траты хода отряда'
                ],
                desc: 'Густое темное пиво из монастырской пивоварни. Бодрит дух и мгновенно возвращает силы в разгар сечи.',
                loreQuote: '«Пока в жбане плещется пенное — ни один чех не признает себя побежденным!»'
            },
            {
                id: 'medkit',
                name: 'Полевая аптечка (Сбор Берты)',
                icon: 'heart_heal',
                price: 18,
                effectTitle: 'Перевязка ран и снятие травмы',
                statLines: [
                    'Снимает: 1 случайную травму у раненого бойца',
                    'Дополнительно: +3 целебные травы в сумку',
                    'Применение: срабатывает сразу или хранится в запасе'
                ],
                desc: 'Кожаная сума с чистой корпией, склянкой спиртовой настойки и заживляющей мазью сестры Берты.',
                loreQuote: '«Мажь гуще, терпи крепче — до свадьбы всё заживет!» — Сестра Берта.'
            },
            {
                id: 'pot',
                name: 'Гуситский штурмовой горшок (Бомба)',
                icon: 'barrel',
                price: 25,
                effectTitle: 'Взрывной урон в бою: 1d20 ед.',
                statLines: [
                    'Урон по врагу: 1–20 ед. огнем и осколками',
                    'Игнорирует: часть брони цели при попадании',
                    'Применение: с панели управления прямо в бою'
                ],
                desc: 'Обмотанный просмоленной веревкой глиняный горшок с черным порохом, рубленым свинцом и фитилем.',
                loreQuote: '«Кидай дальше, чем видишь, и пригибай голову за телегу!»'
            }
        ];
    }

    public static readonly METAL_META: Record<MetalType, { name: string; short: string; icon: string; desc: string }> = {
        iron:   { name: 'Железо', short: 'Жел.', icon: 'pickaxe', desc: 'Ковкое болотное железо — основа для клинков, наконечников и заклёпок.' },
        bronze: { name: 'Бронза', short: 'Брз.', icon: 'coins',   desc: 'Плавкий медно-оловянный сплав для арбалетных замков, блях и щитков.' },
        steel:  { name: 'Сталь',  short: 'Стл.', icon: 'sword',   desc: 'Закалённая в древесном угле высокоуглеродистая сталь для лат и сабель.' },
        damask: { name: 'Булат',  short: 'Бул.', icon: 'crown',   desc: 'Редкий узорчатый булат высшей закалки для элитного оружия и панцирей.' }
    };

    public static getForgeTier(upgrades: TavernUpgradeNode[]): number {
        let tier = 0;
        if (upgrades.some(u => u.id === 'upg_b4_t1' && u.unlocked)) tier = 1;
        if (upgrades.some(u => u.id === 'upg_b4_t2' && u.unlocked)) tier = 2;
        if (upgrades.some(u => u.id === 'upg_b4_t3' && u.unlocked)) tier = 3;
        if (upgrades.some(u => u.id === 'upg_b4_t4' && u.unlocked)) tier = 4;
        return tier;
    }

    public static getForgeCraftBonus(upgrades: TavernUpgradeNode[]): { atk: number; armor: number; block: number } {
        const tier = GameDataCatalog.getForgeTier(upgrades);
        if (tier >= 4) return { atk: 3, armor: 3, block: 7 };
        if (tier === 3) return { atk: 2, armor: 2, block: 5 };
        if (tier >= 1) return { atk: 1, armor: 1, block: 3 };
        return { atk: 0, armor: 0, block: 0 };
    }

    public static getSmeltYield(item: EquipmentItem, forgeTierOrBonus: boolean | number): Partial<Record<MetalType, number>> {
        const forgeTier = typeof forgeTierOrBonus === 'number' ? forgeTierOrBonus : (forgeTierOrBonus ? 1 : 0);
        const hasForgeBonus = forgeTier >= 1;
        const hasBellowsBonus = forgeTier >= 2;
        const rarity = item.getRarityClass();
        const yieldMap: Partial<Record<MetalType, number>> = {};

        if (rarity === 'rarity-uncommon') {
            yieldMap.iron = 2 + (hasForgeBonus ? 1 : 0);
            if (item.armor > 0 || item.block >= 5) {
                yieldMap.bronze = 1;
            }
        } else if (rarity === 'rarity-rare') {
            yieldMap.iron = 2;
            yieldMap.bronze = 2;
            if (hasForgeBonus || item.atk + item.armor >= 3) {
                yieldMap.steel = 1;
            }
        } else if (rarity === 'rarity-epic') {
            yieldMap.bronze = 2;
            yieldMap.steel = 2;
            if (hasForgeBonus) {
                yieldMap.damask = 1;
            }
        } else {
            yieldMap.steel = 2;
            yieldMap.damask = 2 + (hasForgeBonus ? 1 : 0);
        }

        if (hasBellowsBonus) {
            yieldMap.iron = (yieldMap.iron || 0) + 1;
            yieldMap.bronze = (yieldMap.bronze || 0) + 1;
        }
        return yieldMap;
    }

    public static createSmithingRecipes(): SmithingRecipe[] {
        return [
            {
                id: 'rec_sword_iron',
                name: 'Богемский полуторный меч',
                slot: 'weapon',
                icon: 'sword',
                atk: 2, armor: 0, block: 4,
                cost: { iron: 3 },
                desc: 'Надёжный прямой меч с широким долом, откованный на гильдейской наковальне.'
            },
            {
                id: 'rec_crossbow_light',
                name: 'Пеший лёгкий арбалет',
                slot: 'weapon',
                icon: 'crossbow',
                atk: 3, armor: 0, block: 0,
                cost: { iron: 2, bronze: 2 },
                desc: 'Точный арбалет со стальной дугой и бронзовым спусковым орехом. Пробивает кожаные куртки.'
            },
            {
                id: 'rec_flail_steel',
                name: 'Чешский стальной цеп',
                slot: 'weapon',
                icon: 'crossed_swords',
                atk: 4, armor: 0, block: 6,
                cost: { iron: 2, steel: 2 },
                desc: 'Грозное оружие таборитов с шипованным стальным билом на прочной цепи.'
            },
            {
                id: 'rec_arbalest_heavy',
                name: 'Тяжёлый крепостной арбалет',
                slot: 'weapon',
                icon: 'crossbow',
                atk: 5, armor: 0, block: 2,
                cost: { bronze: 2, steel: 3 },
                desc: 'Мощный самострел с воротом, способный прошить рыцарскую кирасу навылет.'
            },
            {
                id: 'rec_sword_damask',
                name: 'Булатный меч святого Вацлава',
                slot: 'weapon',
                icon: 'crown',
                atk: 6, armor: 1, block: 8,
                cost: { steel: 3, damask: 2 },
                desc: 'Узорчатый клинок мастера с позолоченной гардой — шедевр кузнечного искусства Богемии.'
            },
            {
                id: 'rec_brigandine',
                name: 'Клёпаная бригантина',
                slot: 'armor',
                icon: 'armor',
                atk: 0, armor: 2, block: 5,
                cost: { iron: 3, bronze: 1 },
                desc: 'Гибкий доспех из стальных пластин, приклёпанных бронзовыми заклёпками к плотной коже.'
            },
            {
                id: 'rec_sallet_helmet',
                name: 'Кованый салад с забралом',
                slot: 'armor',
                icon: 'helmet',
                atk: 0, armor: 3, block: 8,
                cost: { iron: 2, steel: 2 },
                desc: 'Вытянутый шлем с откидным забралом, отлично отводящий рубящие удары и стрелы.'
            },
            {
                id: 'rec_plate_bohemia',
                name: 'Королевский богемский латный доспех',
                slot: 'armor',
                icon: 'armor',
                atk: 0, armor: 4, block: 12,
                cost: { bronze: 2, steel: 3, damask: 1 },
                desc: 'Парадно-боевые латы высшей закалки с булатными наплечниками.'
            },
            {
                id: 'rec_buckler_trinket',
                name: 'Бронзовый кулачный щиток',
                slot: 'trinket',
                icon: 'shield_cross',
                atk: 0, armor: 1, block: 10,
                cost: { bronze: 3 },
                desc: 'Лёгкий и звонкий баклер для парирования вражеских сабель в ближнем бою.'
            },
            {
                id: 'rec_seal_trinket',
                name: 'Булатная перевязь оружейника',
                slot: 'trinket',
                icon: 'fleur',
                atk: 2, armor: 1, block: 10,
                cost: { steel: 2, damask: 1 },
                desc: 'Наборная перевязь с закалёнными пряжками и балансирным противовесом для клинка.'
            }
        ];
    }
}

export interface SmithingRecipe {
    id: string;
    name: string;
    slot: 'weapon' | 'armor' | 'trinket';
    icon: string;
    atk: number;
    armor: number;
    block: number;
    cost: Partial<Record<MetalType, number>>;
    desc: string;
}

export interface HostShopArmorItem {
    id: string;
    name: string;
    slot: 'weapon' | 'armor' | 'trinket';
    rarity: 'grey' | 'green' | 'blue' | 'purple' | 'gold';
    icon: string;
    price: number;
    atk: number;
    armor: number;
    block: number;
    desc: string;
    loreQuote: string;
    purchased?: boolean;
}

export interface TavernUpgradeNode {
    id: string;
    branch: 1 | 2 | 3 | 4 | 5;
    branchTitle: string;
    tier: 1 | 2 | 3 | 4;
    name: string;
    icon: string;
    price: number;
    statLines: string[];
    desc: string;
    loreQuote: string;
    unlocked: boolean;
}

export interface HostConsumableItem {
    id: 'beer' | 'medkit' | 'pot';
    name: string;
    icon: string;
    price: number;
    effectTitle: string;
    statLines: string[];
    desc: string;
    loreQuote: string;
}

