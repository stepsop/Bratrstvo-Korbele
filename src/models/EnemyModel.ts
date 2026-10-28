import { UnitBase } from './UnitBase';

/**
 * Класс Врага (Чашник / Гусит), наследуется от UnitBase (аналог C# класса EnemyModel)
 */
export class EnemyModel extends UnitBase {
    public atkSides: number;
    public superCharge: number;

    constructor(params: {
        id: string;
        name: string;
        sprite?: string;
        color?: string;
        hp: number;
        maxHp: number;
        atkSides?: number;
        initBase?: number;
        superCharge?: number;
    }) {
        super({
            id: params.id,
            name: params.name,
            sprite: params.sprite ?? 'husita',
            color: params.color ?? '#d9534f',
            hp: params.hp,
            maxHp: params.maxHp,
            armor: 0,
            blockChance: 0,
            initBase: params.initBase ?? 4,
            isEnemy: true
        });
        this.atkSides = params.atkSides ?? 4;
        this.superCharge = params.superCharge ?? 0;
    }

    /**
     * Заряжен ли враг для сокрушительного СУПЕР-УДАРА на следующем ходу
     */
    public get isSuperReadyNextTurn(): boolean {
        return this.superCharge >= 2 && this.isAlive;
    }
}
