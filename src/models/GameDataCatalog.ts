import { EquipmentItem } from './EquipmentItem';
import { HeroModel, WarContractData } from './HeroModel';
import { GuildHotspot, TavernBgPreset, TavernBgPresetKey } from './GameStateModel';

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
                clinic:  { srcX: 42,   srcY: 16,  srcW: 158, srcH: 382 },
                quests:  { srcX: 350,  srcY: 78,  srcW: 412, srcH: 240 },
                verbirz: { srcX: 905,  srcY: 158, srcW: 166, srcH: 266 },
                host:    { srcX: 1233, srcY: 206, srcW: 220, srcH: 156 },
                mercs:   { srcX: 56,   srcY: 412, srcW: 586, srcH: 460 }
            }
        },
        '4x3': {
            key: '4x3',
            url: 'backgrounds/tavern_bg_4x3.png',
            width: 1200,
            height: 896,
            placements: {
                clinic:  { srcX: 42,  srcY: 16,  srcW: 158, srcH: 382 },
                quests:  { srcX: 290, srcY: 84,  srcW: 360, srcH: 215 },
                verbirz: { srcX: 705, srcY: 164, srcW: 158, srcH: 254 },
                host:    { srcX: 925, srcY: 205, srcW: 165, srcH: 155 },
                mercs:   { srcX: 42,  srcY: 416, srcW: 548, srcH: 430 }
            }
        },
        '3x4': {
            key: '3x4',
            url: 'backgrounds/tavern_bg_3x4.png',
            width: 900,
            height: 1200,
            placements: {
                clinic:  { srcX: 49,  srcY: 18,  srcW: 183, srcH: 442 },
                quests:  { srcX: 252, srcY: 148, srcW: 260, srcH: 215 },
                verbirz: { srcX: 530, srcY: 228, srcW: 119, srcH: 254 },
                host:    { srcX: 694, srcY: 267, srcW: 124, srcH: 155 },
                mercs:   { srcX: 32,  srcY: 486, srcW: 484, srcH: 380 }
            }
        },
        '9x16': {
            key: '9x16',
            url: 'backgrounds/tavern_bg_9x16.png',
            width: 900,
            height: 1600,
            placements: {
                clinic:  { srcX: 56,  srcY: 21,  srcW: 210, srcH: 509 },
                quests:  { srcX: 268, srcY: 218, srcW: 250, srcH: 205 },
                verbirz: { srcX: 532, srcY: 298, srcW: 119, srcH: 254 },
                host:    { srcX: 694, srcY: 337, srcW: 124, srcH: 155 },
                mercs:   { srcX: 32,  srcY: 556, srcW: 484, srcH: 380 }
            }
        }
    };

    public static readonly GUILD_HOTSPOTS: GuildHotspot[] = [
        {
            id: 'clinic',
            srcX: 42, srcY: 16, srcW: 158, srcH: 382,
            x: Math.round(42 * 520 / 1200), y: Math.round(16 * 290 / 896),
            w: Math.round(158 * 520 / 1200), h: Math.round(382 * 290 / 896),
            spriteUrl: 'sprites/npc_clinic.png',
            title: 'Палаты врачебные', labelX: 88, labelY: 22
        },
        {
            id: 'quests',
            srcX: 290, srcY: 84, srcW: 360, srcH: 215,
            x: Math.round(290 * 520 / 1200), y: Math.round(84 * 290 / 896),
            w: Math.round(360 * 520 / 1200), h: Math.round(215 * 290 / 896),
            spriteUrl: 'sprites/npc_quests.png',
            title: 'Доска заданий', labelX: 238, labelY: 22
        },
        {
            id: 'verbirz',
            srcX: 705, srcY: 164, srcW: 158, srcH: 254,
            x: Math.round(705 * 520 / 1200), y: Math.round(164 * 290 / 896),
            w: Math.round(158 * 520 / 1200), h: Math.round(254 * 290 / 896),
            spriteUrl: 'sprites/npc_verbirz.png',
            title: 'Королевский Вербовщик', labelX: 352, labelY: 48
        },
        {
            id: 'host',
            srcX: 925, srcY: 205, srcW: 165, srcH: 155,
            x: Math.round(925 * 520 / 1200), y: Math.round(205 * 290 / 896),
            w: Math.round(165 * 520 / 1200), h: Math.round(155 * 290 / 896),
            spriteUrl: 'sprites/npc_host.png',
            title: 'Хозяин таверны / Магазин', labelX: 436, labelY: 56
        },
        {
            id: 'mercs',
            srcX: 42, srcY: 416, srcW: 548, srcH: 430,
            x: Math.round(42 * 520 / 1200), y: Math.round(416 * 290 / 896),
            w: Math.round(548 * 520 / 1200), h: Math.round(430 * 290 / 896),
            spriteUrl: 'sprites/npc_mercs.png',
            title: 'Стол наемников', labelX: 128, labelY: 132
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
                rewardDesc: '40-55 гр., +1 Ур., +1 талант',
                extraRewardText: '+1 Ур. и +1 очко таланта',
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
                rewardDesc: '65-85 гр., +1 Ур., чекан',
                extraRewardText: '+1 Ур., Трофейный чекан',
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
                rewardDesc: '95-125 гр., +1 Ур., кираса',
                extraRewardText: '+1 Ур., Панцирная кираса',
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
                rewardDesc: '180-240 гр., +2 Ур., панцирь',
                extraRewardText: '+2 Ур. каждому, Рыцарский панцирь',
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
}
