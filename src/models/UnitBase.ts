/**
 * Базовый класс боевой единицы (аналог абстрактного класса UnitBase в C# / Unity)
 * От него наследуются HeroModel и EnemyModel
 */
export abstract class UnitBase {
    public id: string;
    public name: string;
    public sprite: string;
    public color: string;
    public hp: number;
    public maxHp: number;
    public tempHp: number = 0;
    public armor: number = 0;
    public blockChance: number = 0;
    public initBase: number = 5;
    public initRoll: number = 0;
    public isEnemy: boolean = false;

    // Визуальные координаты и таймеры анимаций на Canvas
    public x: number = 0;
    public y: number = 0;
    public lunge: number = 0;
    public flash: number = 0;

    constructor(params: {
        id: string;
        name: string;
        sprite: string;
        color: string;
        hp: number;
        maxHp: number;
        armor?: number;
        blockChance?: number;
        initBase?: number;
        isEnemy?: boolean;
    }) {
        this.id = params.id;
        this.name = params.name;
        this.sprite = params.sprite;
        this.color = params.color;
        this.hp = params.hp;
        this.maxHp = params.maxHp;
        this.armor = params.armor ?? 0;
        this.blockChance = params.blockChance ?? 0;
        this.initBase = params.initBase ?? 5;
        this.isEnemy = params.isEnemy ?? false;
    }

    public get isAlive(): boolean {
        return this.hp > 0;
    }

    public rollInitiative(): number {
        this.initRoll = this.initBase + (Math.floor(Math.random() * 10) + 1);
        return this.initRoll;
    }
}
