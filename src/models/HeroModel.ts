import { UnitBase } from './UnitBase';
import { EquipmentItem, EquipSlotType } from './EquipmentItem';
import { TalentNode, TalentTreeFactory } from './TalentNode';

export type HeroSkillOrder = 'skill1_first' | 'basic_only' | 'alternate';
export type HeroTargetRule = 'focus_or_random' | 'lowest_hp' | 'highest_hp';
export type HeroStatusType = 'ready' | 'clinic' | 'war' | 'dead';

export interface HeroSkillInfo {
    key: string;
    icon: string;
    short: string;
    title: string;
    cd: string;
    desc: string;
}

export interface WarContractData {
    id?: string;
    name: string;
    riskBadge?: string;
    needHeroes: number;
    cycles: number;
    deathChance: number;
    injuryChance: number;
    goldMin: number;
    goldMax: number;
    lvlGain?: number;
    bonusItem?: EquipmentItem;
    rewardDesc?: string;
}

/**
 * Класс Героя Гильдии (наследуется от UnitBase, аналог C# класса HeroModel)
 */
export class HeroModel extends UnitBase {
    public cls: string;
    public inSquad: boolean;
    public lvl: number;
    public exp: number;
    public talentPts: number;
    public atkBonus: number;

    public cd1: number = 0;
    public maxCd1: number;
    public skill1Name: string;
    public cd2: number = 0;
    public maxCd2: number;
    public skill2Name: string;

    public skillOrder: HeroSkillOrder;
    public targetRule: HeroTargetRule;
    public lastUsedSkill: number = 2;

    public status: HeroStatusType;
    public timer: number = 0;
    public injuries: string[];
    public price: number = 0;
    public warContract?: WarContractData;

    public equipObj: Record<EquipSlotType, EquipmentItem | null>;
    public talents: TalentNode[];

    constructor(params: {
        id: string;
        name: string;
        cls: string;
        sprite: string;
        color: string;
        inSquad?: boolean;
        lvl?: number;
        exp?: number;
        talentPts?: number;
        hp: number;
        maxHp: number;
        atkBonus?: number;
        initBase: number;
        blockChance: number;
        armor: number;
        maxCd1: number;
        skill1Name: string;
        maxCd2: number;
        skill2Name: string;
        skillOrder?: HeroSkillOrder;
        targetRule?: HeroTargetRule;
        status?: HeroStatusType;
        injuries?: string[];
        price?: number;
        equip: { weapon: string | EquipmentItem | null; armor: string | EquipmentItem | null; trinket: string | EquipmentItem | null };
    }) {
        super({
            id: params.id,
            name: params.name,
            sprite: params.sprite,
            color: params.color,
            hp: params.hp,
            maxHp: params.maxHp,
            armor: params.armor,
            blockChance: params.blockChance,
            initBase: params.initBase,
            isEnemy: false
        });

        this.cls = params.cls;
        this.inSquad = params.inSquad ?? true;
        this.lvl = params.lvl ?? 1;
        this.exp = params.exp ?? 0;
        this.talentPts = params.talentPts ?? 1;
        this.atkBonus = params.atkBonus ?? 0;

        this.maxCd1 = params.maxCd1;
        this.skill1Name = params.skill1Name;
        this.maxCd2 = params.maxCd2;
        this.skill2Name = params.skill2Name;

        this.skillOrder = params.skillOrder ?? 'skill1_first';
        this.targetRule = params.targetRule ?? 'focus_or_random';
        this.status = params.status ?? 'ready';
        this.injuries = params.injuries ? [...params.injuries] : [];
        this.price = params.price ?? 0;

        this.equipObj = {
            weapon: EquipmentItem.fromLegacyString(params.equip.weapon, 'weapon'),
            armor: EquipmentItem.fromLegacyString(params.equip.armor, 'armor'),
            trinket: EquipmentItem.fromLegacyString(params.equip.trinket, 'trinket')
        };

        this.talents = TalentTreeFactory.createForHero(this.id, this.cls);
    }

    public isTalentTierUnlocked(tier: number): boolean {
        if (tier <= 1) return true;
        return this.talents.some(t => t.tier === tier - 1 && t.unlocked);
    }

    public unlockTalent(talentId: string): TalentNode | null {
        if (this.talentPts <= 0) return null;
        const t = this.talents.find(x => x.id === talentId);
        if (!t || t.unlocked || !this.isTalentTierUnlocked(t.tier)) return null;

        this.talentPts--;
        t.unlocked = true;
        t.applyEffect(this);
        return t;
    }

    public equipItem(newItem: EquipmentItem): EquipmentItem | null {
        const slot = newItem.slot;
        const prev = this.equipObj[slot];
        if (prev) {
            this.atkBonus = Math.max(0, this.atkBonus - prev.atk);
            this.armor = Math.max(0, this.armor - prev.armor);
            this.blockChance = Math.max(0, this.blockChance - prev.block);
        }

        this.atkBonus += newItem.atk;
        this.armor += newItem.armor;
        this.blockChance += newItem.block;
        this.equipObj[slot] = newItem;
        return prev;
    }

    public unequipSlot(slot: EquipSlotType): EquipmentItem | null {
        const cur = this.equipObj[slot];
        if (!cur) return null;

        this.atkBonus = Math.max(0, this.atkBonus - cur.atk);
        this.armor = Math.max(0, this.armor - cur.armor);
        this.blockChance = Math.max(0, this.blockChance - cur.block);
        this.equipObj[slot] = null;
        return cur;
    }

    public shouldUsePrimarySkill(cooldownReady: boolean): boolean {
        if (!cooldownReady) return false;
        if (this.skillOrder === 'basic_only') return false;
        if (this.skillOrder === 'alternate' && this.lastUsedSkill === 1) return false;
        return true;
    }

    public getPassiveInfo(): { title: string; desc: string } {
        if (this.cls === 'Шляхта') {
            return {
                title: '🍺 Пассивка: Непросыхаемый алкаш',
                desc: '50% шанс спьяну промахнуться (0 урона врагу), но и 50% шанс случайно увернуться от любого удара врага (0 урона герою).'
            };
        }
        if (this.cls === 'Святоша') {
            return {
                title: '🌿 Пассивка: Знаток трав',
                desc: '10% шанс в начале любого хода в бою найти целебную траву. Из 5 трав прямо в бою варит 1d4 бутылок пива (1d10 HP).'
            };
        }
        return {
            title: '🔫 Пассивка: Внезапный Пистоль',
            desc: '20% шанс в начале своего хода дополнительно выстрелить из пистоля (1d10 урона) в случайного врага.'
        };
    }

    public getSkillDetails(): HeroSkillInfo[] {
        if (this.cls === 'Шляхта') {
            return [
                { key: 's1', icon: '💥', short: 'Атака плашмя', title: this.skill1Name, cd: `КД: ${this.maxCd1} х.`, desc: `Мощный круговой удар плашмя: бросает 1d10 (+${this.atkBonus} Ур) и равномерно распределяет урон по всем живым врагам.` },
                { key: 's2', icon: '🗡️', short: 'Удар саблей', title: this.skill2Name, cd: 'Без КД', desc: `Базовый рубящий удар клинком по выбранной цели: наносит 1d4 (+${this.atkBonus} Ур) урона.` },
                { key: 'pas', icon: '🍺', short: 'Алкаш (Пасс.)', title: 'Непросыхаемый алкаш (Пассивка)', cd: 'Пассивно', desc: '50% шанс спьяну промахнуться (0 урона врагу), но и 50% шанс случайно увернуться от любого удара врага (0 урона герою).' }
            ];
        }
        if (this.cls === 'Святоша') {
            return [
                { key: 's1', icon: '🪵', short: 'Удар дубиной', title: this.skill1Name, cd: 'Без КД', desc: `Уверенный удар суковатой дубиной по еретику: наносит 1d4 (+${this.atkBonus} Ур) урона.` },
                { key: 's2', icon: '🍺', short: 'Запить грехи', title: this.skill2Name, cd: `КД: ${this.maxCd2} х.`, desc: 'Исцеляет самого раненого союзника в отряде на 1d4 HP святым пенным напитком.' },
                { key: 'pas', icon: '🌿', short: 'Травник (Пасс.)', title: 'Знаток трав (Пассивка)', cd: 'Пассивно', desc: '10% шанс в начале хода любого существа найти траву. Из 5 трав прямо в бою варит 1d4 бутылок пива (1d10 HP).' }
            ];
        }
        return [
            { key: 's1', icon: '🔫', short: 'Аркебуза', title: this.skill1Name, cd: `КД: ${this.maxCd1} х.`, desc: `Залп картечью на 1d10 (+${this.atkBonus} Ур) урона, который делится между основной целью и соседним врагом (с переносом избытка урона).` },
            { key: 's2', icon: '🗡️', short: 'Кортик', title: this.skill2Name, cd: 'Без КД', desc: `Быстрый укол кортиком в ближнем бою: наносит 1d4 (+${this.atkBonus} Ур) урона по цели.` },
            { key: 'pas', icon: '🎯', short: 'Пистоль (Пасс.)', title: 'Внезапный Пистоль (Пассивка)', cd: 'Пассивно', desc: `20% шанс в начале своего хода дополнительно выстрелить из пистоля на 1d10 (+${this.atkBonus} Ур) в случайного врага.` }
        ];
    }
}
