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

export type TavernBgPresetKey = '16x9' | '4x3' | '3x4' | '9x16';

export interface HotspotPlacement {
    srcX: number;
    srcY: number;
    srcW: number;
    srcH: number;
}

export interface TavernBgPreset {
    key: TavernBgPresetKey;
    url: string;
    width: number;
    height: number;
    placements: Record<'clinic' | 'quests' | 'host' | 'mercs' | 'verbirz', HotspotPlacement>;
}

export interface GuildHotspot {
    id: 'clinic' | 'quests' | 'host' | 'mercs' | 'verbirz';
    /** Координаты в пространстве 520x290 Canvas */
    x: number;
    y: number;
    w: number;
    h: number;
    /** Точные координаты спрайта в пространстве 1200x896 исходного арта (по умолчанию 4:3) */
    srcX: number;
    srcY: number;
    srcW: number;
    srcH: number;
    spriteUrl: string;
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
    public activeBgPreset: TavernBgPresetKey = '4x3';

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

    public selectedRecruiterCampaign: number = 0;
    public selectedHeroesForWar: string[] = [];
    public heroUiState = {
        heroId: null as string | null,
        leftInspect: { type: 'equipped' as 'stat' | 'equipped' | 'skill', key: 'weapon' as string },
        selectedTalentId: null as string | null,
        selectedStatusKey: 'passive' as string
    };

    /**
     * Адаптивные пресеты чистого фона таверны под разные экраны и ротации телефонов (16:9, 4:3, 3:4, 9:16)
     */
    public readonly tavernBgPresets: Record<TavernBgPresetKey, TavernBgPreset> = {
        '16x9': {
            key: '16x9',
            url: 'backgrounds/tavern_bg_16x9.png',
            width: 1600,
            height: 900,
            placements: {
                clinic:  { srcX: 60,   srcY: 78,  srcW: 315, srcH: 296 },
                quests:  { srcX: 615,  srcY: 92,  srcW: 412, srcH: 256 },
                host:    { srcX: 1325, srcY: 205, srcW: 165, srcH: 155 },
                mercs:   { srcX: 95,   srcY: 430, srcW: 515, srcH: 375 },
                verbirz: { srcX: 1030, srcY: 465, srcW: 166, srcH: 266 }
            }
        },
        '4x3': {
            key: '4x3',
            url: 'backgrounds/tavern_bg_4x3.png',
            width: 1200,
            height: 896,
            placements: {
                clinic:  { srcX: 45,  srcY: 78,  srcW: 315, srcH: 296 },
                quests:  { srcX: 470, srcY: 92,  srcW: 412, srcH: 256 },
                host:    { srcX: 925, srcY: 205, srcW: 165, srcH: 155 },
                mercs:   { srcX: 38,  srcY: 425, srcW: 515, srcH: 375 },
                verbirz: { srcX: 760, srcY: 460, srcW: 166, srcH: 266 }
            }
        },
        '3x4': {
            key: '3x4',
            url: 'backgrounds/tavern_bg_3x4.png',
            width: 900,
            height: 1200,
            placements: {
                clinic:  { srcX: 34,  srcY: 140, srcW: 236, srcH: 296 },
                quests:  { srcX: 352, srcY: 154, srcW: 309, srcH: 256 },
                host:    { srcX: 694, srcY: 267, srcW: 124, srcH: 155 },
                mercs:   { srcX: 28,  srcY: 487, srcW: 386, srcH: 375 },
                verbirz: { srcX: 570, srcY: 522, srcW: 125, srcH: 266 }
            }
        },
        '9x16': {
            key: '9x16',
            url: 'backgrounds/tavern_bg_9x16.png',
            width: 900,
            height: 1600,
            placements: {
                clinic:  { srcX: 34,  srcY: 210, srcW: 236, srcH: 296 },
                quests:  { srcX: 352, srcY: 224, srcW: 309, srcH: 256 },
                host:    { srcX: 694, srcY: 337, srcW: 124, srcH: 155 },
                mercs:   { srcX: 28,  srcY: 557, srcW: 386, srcH: 375 },
                verbirz: { srcX: 570, srcY: 592, srcW: 125, srcH: 266 }
            }
        }
    };

    public getActiveHotspotPlacement(h: GuildHotspot): HotspotPlacement & { bgW: number; bgH: number } {
        const preset = this.tavernBgPresets[this.activeBgPreset] || this.tavernBgPresets['4x3'];
        const p = preset.placements[h.id];
        return {
            srcX: p.srcX,
            srcY: p.srcY,
            srcW: p.srcW,
            srcH: p.srcH,
            bgW: preset.width,
            bgH: preset.height
        };
    }

    /**
     * Интерактивные НПС-спрайты Таверны (отдельные слои поверх нового фона)
     */
    public readonly guildHotspots: GuildHotspot[] = [
        {
            id: 'clinic',
            srcX: 45, srcY: 78, srcW: 315, srcH: 296,
            x: Math.round(45 * 520 / 1200), y: Math.round(78 * 290 / 896),
            w: Math.round(315 * 520 / 1200), h: Math.round(296 * 290 / 896),
            spriteUrl: 'sprites/npc_clinic.png',
            title: 'Палаты врачебные', labelX: 92, labelY: 22
        },
        {
            id: 'quests',
            srcX: 470, srcY: 92, srcW: 412, srcH: 256,
            x: Math.round(470 * 520 / 1200), y: Math.round(92 * 290 / 896),
            w: Math.round(412 * 520 / 1200), h: Math.round(256 * 290 / 896),
            spriteUrl: 'sprites/npc_quests.png',
            title: 'Доска заданий', labelX: 292, labelY: 22
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
            srcX: 38, srcY: 425, srcW: 515, srcH: 375,
            x: Math.round(38 * 520 / 1200), y: Math.round(425 * 290 / 896),
            w: Math.round(515 * 520 / 1200), h: Math.round(375 * 290 / 896),
            spriteUrl: 'sprites/npc_mercs.png',
            title: 'Стол наемников', labelX: 128, labelY: 132
        },
        {
            id: 'verbirz',
            srcX: 760, srcY: 460, srcW: 166, srcH: 266,
            x: Math.round(760 * 520 / 1200), y: Math.round(460 * 290 / 896),
            w: Math.round(166 * 520 / 1200), h: Math.round(266 * 290 / 896),
            spriteUrl: 'sprites/npc_verbirz.png',
            title: 'Королевский Вербовщик', labelX: 365, labelY: 142
        }
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
