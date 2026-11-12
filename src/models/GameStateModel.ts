import { EquipmentItem } from './EquipmentItem';
import { HeroModel, WarContractData } from './HeroModel';
import { EnemyModel } from './EnemyModel';
import { UnitBase } from './UnitBase';
import { GameDataCatalog } from './GameDataCatalog';
import { QuestFactory } from './QuestFactory';

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
    x: number;
    y: number;
    w: number;
    h: number;
    srcX: number;
    srcY: number;
    srcW: number;
    srcH: number;
    spriteUrl: string;
    title: string;
    labelX: number;
    labelY: number;
}

export interface ExpeditionHeroStartState {
    id: string;
    name: string;
    cls: string;
    startHp: number;
    maxHp: number;
    startInjuries: string[];
}

export interface ExpeditionReportData {
    hasReport: boolean;
    outcome: 'victory' | 'defeat';
    battlesWon: number;
    ambushFought: boolean;
    goldEarned: number;
    enemiesKilled: number;
    killedByType: Record<string, number>;
    killsByHero: Record<string, number>;
    lootItems: string[];
    lootObjects: EquipmentItem[];
    selectedLootIndex: number | null;
    levelUps: string[];
    heroStartStates: Record<string, ExpeditionHeroStartState>;
}

export type DailyQuestDifficulty = 'grey' | 'green' | 'blue' | 'purple' | 'red' | 'gold';

export interface DailyQuestData {
    id: string;
    title: string;
    icon: string;
    difficulty: DailyQuestDifficulty;
    diffLabel: string;
    powerReq: number;
    goldMin: number;
    goldMax: number;
    condition: string;
    desc: string;
    location: string;
    enemyCount: number;
    enemyHpBonus: number;
    enemyAtkSides: number;
}

/**
 * Состояние активного боя (SRP: отвечает только за тактическое состояние текущей схватки)
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
    public hoveredHeroId: string | null = null;
    public hoveredEnemyIndex: number | null = null;
    public isAmbush: boolean = false;
    public psaKrevCd: number = 0;
    public psaKrevBuffTurns: number = 0;
}

/**
 * Глобальная модель состояния игры «Bratrstvo Korbele: Богемия»
 * Соблюдает SRP: хранит оперативное состояние и делегирует генерацию данных фабрикам/каталогам.
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
    public dailyQuests: DailyQuestData[] = [];
    public activeQuest: DailyQuestData | null = null;

    public mapState = { dir: 'to_quest' as 'to_quest' | 'to_guild', progress: 0, ambushTriggered: false };
    public combat = new CombatStateModel();
    public expeditionReport: ExpeditionReportData = {
        hasReport: false,
        outcome: 'victory',
        battlesWon: 0,
        ambushFought: false,
        goldEarned: 0,
        enemiesKilled: 0,
        killedByType: {},
        killsByHero: {},
        lootItems: [],
        lootObjects: [],
        selectedLootIndex: null,
        levelUps: [],
        heroStartStates: {}
    };

    public selectedRecruiterCampaign: number = 0;
    public selectedHeroesForWar: string[] = [];
    public heroUiState = {
        heroId: null as string | null,
        leftInspect: { type: 'equipped' as 'stat' | 'equipped' | 'skill', key: 'weapon' as string },
        compareBagIndex: null as number | null,
        selectedTalentId: null as string | null,
        selectedStatusKey: 'passive' as string,
        activeInspectorSource: 'left' as 'left' | 'status'
    };

    public readonly tavernBgPresets: Record<TavernBgPresetKey, TavernBgPreset> = GameDataCatalog.TAVERN_BG_PRESETS;
    public readonly guildHotspots: GuildHotspot[] = GameDataCatalog.GUILD_HOTSPOTS;
    public readonly warCampaigns: WarContractData[] = GameDataCatalog.createWarCampaigns();
    public readonly tavernTales: string[] = GameDataCatalog.TAVERN_TALES;
    public readonly mercJokes: string[] = GameDataCatalog.MERC_JOKES;
    public currentMercJoke: string = '';

    constructor() {
        this.currentMercJoke = this.mercJokes[0];
        this.spareEquip = GameDataCatalog.createInitialSpareEquip();
        this.party = GameDataCatalog.createInitialParty();
        this.mercsForHire = GameDataCatalog.createInitialMercs();
        this.generateDailyQuests();
    }

    public initExpeditionReport(): void {
        const heroStartStates: Record<string, ExpeditionHeroStartState> = {};
        this.party.filter(h => h.inSquad && h.status === 'ready' && h.hp > 0).forEach(h => {
            heroStartStates[h.id] = {
                id: h.id,
                name: h.name,
                cls: h.cls,
                startHp: h.hp,
                maxHp: h.maxHp,
                startInjuries: [...h.injuries]
            };
        });
        this.expeditionReport = {
            hasReport: true,
            outcome: 'victory',
            battlesWon: 0,
            ambushFought: false,
            goldEarned: 0,
            enemiesKilled: 0,
            killedByType: {},
            killsByHero: {},
            lootItems: [],
            lootObjects: [],
            selectedLootIndex: null,
            levelUps: [],
            heroStartStates
        };
    }

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

    public generateDailyQuests(): void {
        this.dailyQuests = QuestFactory.generateDailyQuests(this.cycle);
        if (!this.activeQuest) {
            this.activeQuest = this.dailyQuests[0];
        }
    }

    public calculateQuestSuccessChance(quest: DailyQuestData): {
        chance: number;
        riskLabel: string;
        riskClass: string;
    } {
        return QuestFactory.calculateQuestSuccessChance(this.party, quest);
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
