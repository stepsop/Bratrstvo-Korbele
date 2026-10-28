import { EquipmentItem } from './EquipmentItem';
import { HeroModel, WarContractData } from './HeroModel';
import { EnemyModel } from './EnemyModel';
import { UnitBase } from './UnitBase';

export type SceneType = 'guild' | 'map' | 'combat';

export interface FloatingTextItem {
    text: string;
    x: number;
    y: number;
    vy: number;
    life: number;
    color: string;
}

export interface ParticleItem {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
}

export interface GuildHotspot {
    id: 'clinic' | 'quests' | 'host' | 'mercs' | 'verbirz';
    x: number;
    y: number;
    w: number;
    h: number;
    title: string;
    labelX: number;
    labelY: number;
}

/**
 * Состояние активного боя (CombatStateModel)
 */
export class CombatStateModel {
    public active: boolean = false;
    public paused: boolean = false;
    public enemies: EnemyModel[] = [];
    public turnOrder: UnitBase[] = [];
    public turnIndex: number = 0;
    public tickTimer: number = 0;
    public focusEnemyIndex: number | null = null;
    public selectedHeroId: string | null = null;
    public isAmbush: boolean = false;
    public psaKrevCd: number = 0;
    public psaKrevBuffTurns: number = 0;
}

/**
 * Глобальная модель игры «Bratrstvo Korbele: Богемия» (аналог C# GameStateModel / Singleton)
 */
export class GameStateModel {
    public scene: SceneType = 'guild';
    public frame: number = 0;
    public shake: number = 0;
    public floatingTexts: FloatingTextItem[] = [];
    public particles: ParticleItem[] = [];
    public hoveredHotspot: GuildHotspot | null = null;

    public gold: number = 60;
    public beer: number = 3;
    public pots: number = 1;
    public herbs: number = 0;
    public cycle: number = 1;
    public squadMax: number = 5;
    public reserveMax: number = 15;
    public questsDone: number = 0;

    public spareEquip: EquipmentItem[] = [];
    public party: HeroModel[] = [];
    public mercsForHire: HeroModel[] = [];

    public mapState = { dir: 'to_quest' as 'to_quest' | 'to_guild', progress: 0, ambushTriggered: false };
    public combat = new CombatStateModel();

    // UI-состояние для окон НПС и детального окна героя
    public selectedRecruiterCampaign: number = 0;
    public selectedHeroesForWar: string[] = [];
    public heroUiState = {
        heroId: null as string | null,
        leftInspect: { type: 'equipped' as 'stat' | 'equipped' | 'skill', key: 'weapon' as string },
        selectedTalentId: null as string | null,
        selectedStatusKey: 'passive' as string
    };

    public readonly guildHotspots: GuildHotspot[] = [
        { id: 'clinic',  x: 24,  y: 20,  w: 122, h: 98,  title: 'Палаты врачебные', labelX: 85,  labelY: 16 },
        { id: 'quests',  x: 190, y: 24,  w: 185, h: 88,  title: 'Задания',          labelX: 282, labelY: 18 },
        { id: 'host',    x: 400, y: 40,  w: 105, h: 82,  title: 'Хозяин таверны / Магазин', labelX: 448, labelY: 32 },
        { id: 'mercs',   x: 25,  y: 145, w: 195, h: 130, title: 'Стол наемников',   labelX: 115, labelY: 142 },
        { id: 'verbirz', x: 315, y: 128, w: 185, h: 148, title: 'Вербовщик',        labelX: 410, labelY: 124 }
    ];

    public readonly warCampaigns: WarContractData[] = [
        {
            id: 'caravan',
            name: 'Охрана обоза короны',
            riskBadge: '<span class="badge-risk risk-low">НИЗКИЙ РИСК</span>',
            needHeroes: 1,
            cycles: 4,
            deathChance: 5,
            injuryChance: 15,
            goldMin: 40, goldMax: 55,
            rewardDesc: '40-55 гр., +1 Ур., +1 талант'
        },
        {
            id: 'border',
            name: 'Стычка с Чашниками',
            riskBadge: '<span class="badge-risk risk-med">СРЕДНИЙ РИСК</span>',
            needHeroes: 1,
            cycles: 8,
            deathChance: 12,
            injuryChance: 25,
            goldMin: 75, goldMax: 100,
            bonusItem: new EquipmentItem('Трофейный чекан', 'weapon', 2, 0, 6),
            rewardDesc: '75-100 гр., +1 Ур., чекан'
        },
        {
            id: 'siege',
            name: 'Штурм крепости',
            riskBadge: '<span class="badge-risk risk-high">ВЫСОКИЙ РИСК</span>',
            needHeroes: 2,
            cycles: 12,
            deathChance: 20,
            injuryChance: 35,
            goldMin: 150, goldMax: 200,
            lvlGain: 2,
            bonusItem: new EquipmentItem('Рыцарский панцирь', 'armor', 0, 3, 10),
            rewardDesc: '150-200 гр., +2 Ур., панцирь'
        }
    ];

    public readonly tavernTales: string[] = [
        "«Видишь мой золотой зуб, пане? Это я у гуситского сотника выменял — посмертно, хе-хе! Тот тоже думал, что чаша крепче сабли!»",
        "«Слыхал новость? Пан Вшивец вчера в подвале бочку пива на спор выпил, а потом с гуситским знаменем польку плясал!»",
        "«Бери пиво в дорогу да штурмовой горшок с порохом! Без них на богемском тракте даже до первого моста не дойдешь!»",
        "«Пан Януш из Праги сказывал, что король Вацлав опять поругался с архиепископом. Значит, скоро наемникам будет много работы!»"
    ];

    constructor() {
        this.spareEquip = [
            new EquipmentItem('Ржавый корд', 'weapon', 2, 0, 0),
            new EquipmentItem('Стеганый жупан', 'armor', 0, 1, 8),
            new EquipmentItem('Счастливая подкова', 'trinket', 1, 0, 5)
        ];

        this.party = [
            new HeroModel({
                id: 'pan',
                name: 'Пан Вшивец',
                cls: 'Шляхта',
                sprite: 'szlachta',
                color: '#e6c280',
                inSquad: true,
                lvl: 1, exp: 0, talentPts: 1,
                hp: 28, maxHp: 28,
                atkBonus: 0,
                initBase: 6,
                blockChance: 25,
                armor: 2,
                maxCd1: 2, skill1Name: 'Атака плашмя (1d10 всем)',
                maxCd2: 0, skill2Name: 'Атака оружием (1d4)',
                equip: { weapon: 'Дедовская сабля (+1 Ур)', armor: 'Кунтуш шляхтича (+2 Бр)', trinket: 'Пустая фляжка' }
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
                atkBonus: 0,
                initBase: 5,
                blockChance: 20,
                armor: 1,
                maxCd1: 0, skill1Name: 'Атака дубиной (1d4)',
                maxCd2: 3, skill2Name: 'Запить грехи (Хил 1d4)',
                equip: { weapon: 'Суковатая дубина', armor: 'Монашеская ряса (+1 Бр)', trinket: 'Мешочек для трав' }
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
                atkBonus: 0,
                initBase: 8,
                blockChance: 15,
                armor: 1,
                maxCd1: 3, skill1Name: 'Выстрел из Аркебузы (1d10 двоим)',
                maxCd2: 0, skill2Name: 'Пырнуть Кортиком (1d4)',
                targetRule: 'lowest_hp',
                equip: { weapon: 'Аркебуза и Кортик', armor: 'Кожаный колет (+1 Бр)', trinket: 'Пороховница' }
            })
        ];

        this.mercsForHire = [
            new HeroModel({
                id: 'merc1',
                name: 'Збышек Косой',
                cls: 'Шляхта',
                sprite: 'szlachta',
                color: '#d9a773',
                lvl: 1, exp: 0, talentPts: 0,
                hp: 26, maxHp: 26,
                atkBonus: 0,
                initBase: 6, blockChance: 25, armor: 2,
                maxCd1: 2, skill1Name: 'Атака плашмя (1d10 всем)',
                maxCd2: 0, skill2Name: 'Атака оружием (1d4)',
                injuries: ['Похмелье (-2 HP)'],
                price: 35,
                equip: { weapon: 'Кривая сабля', armor: 'Потертый жупан', trinket: 'Кость в кармане' }
            }),
            new HeroModel({
                id: 'merc2',
                name: 'Отец Богуслав',
                cls: 'Святоша',
                sprite: 'monk',
                color: '#a88b67',
                lvl: 2, exp: 0, talentPts: 1,
                hp: 30, maxHp: 30,
                atkBonus: 1,
                initBase: 5, blockChance: 25, armor: 2,
                maxCd1: 0, skill1Name: 'Атака дубиной (1d4)',
                maxCd2: 3, skill2Name: 'Запить грехи (Хил 1d4)',
                injuries: [],
                price: 55,
                equip: { weapon: 'Окованный посох', armor: 'Плотная ряса', trinket: 'Четки' }
            })
        ];
    }

    public addFloatingText(text: string, x: number, y: number, color = '#fff'): void {
        this.floatingTexts.push({ text, x, y, vy: -1.0, life: 50, color });
    }

    public addParticles(x: number, y: number, color = '#fff', count = 14): void {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.7) * 5,
                color,
                size: Math.random() < 0.5 ? 3 : 4,
                life: 20 + Math.random() * 15
            });
        }
    }
}
