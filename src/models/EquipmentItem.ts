export type EquipSlotType = 'weapon' | 'armor' | 'trinket';

/**
 * Модель предмета экипировки (прямой аналог C# класса EquipmentItem для Unity)
 */
export class EquipmentItem {
    public name: string;
    public slot: EquipSlotType;
    public atk: number;
    public armor: number;
    public block: number;
    public desc: string;

    constructor(name: string, slot: EquipSlotType, atk = 0, armor = 0, block = 0, desc = '') {
        this.name = name;
        this.slot = slot;
        this.atk = atk;
        this.armor = armor;
        this.block = block;
        this.desc = desc || this.buildDefaultDescription();
    }

    private buildDefaultDescription(): string {
        if (this.slot === 'weapon') {
            return `Боевое оружие для ближнего или дальнего боя. Усиливает атаку героя в схватках с противниками.`;
        }
        if (this.slot === 'armor') {
            return `Добротный защитный доспех. Снижает получаемый урон от ударов врага и повышает выживаемость в строю.`;
        }
        return `Памятный талисман наемника. Приносит удачу в походе и укрепляет боевые качества владельца.`;
    }

    public getSlotTitle(): string {
        if (this.slot === 'weapon') return '🗡️ Оружие';
        if (this.slot === 'armor') return '🛡️ Доспех';
        return '💍 Талисман';
    }

    public getSlotCleanName(): string {
        if (this.slot === 'weapon') return 'Оружие';
        if (this.slot === 'armor') return 'Доспех';
        return 'Талисман';
    }

    public getIcon(): string {
        if (this.slot === 'weapon') return '🗡️';
        if (this.slot === 'armor') return '🛡️';
        return '💍';
    }

    public getTier(): number {
        const score = this.atk + this.armor + Math.floor(this.block / 5);
        return Math.max(1, Math.min(4, score));
    }

    public getRating(): number {
        return 100 + this.atk * 140 + this.armor * 135 + this.block * 25;
    }

    /**
     * Определяет CSS-класс редкости для цвета верхней шторки и рамки иконки:
     * uncommon -> серый, rare -> синий, epic -> фиолетовый, legendary -> красно-золотой
     */
    public getRarityClass(): 'rarity-uncommon' | 'rarity-rare' | 'rarity-epic' | 'rarity-legendary' {
        const score = this.atk * 2 + this.armor * 2 + Math.floor(this.block / 3);
        if (score <= 4) return 'rarity-uncommon';
        if (score <= 6) return 'rarity-rare';
        if (score <= 8) return 'rarity-epic';
        return 'rarity-legendary';
    }

    public getRarityLabel(): string {
        const cls = this.getRarityClass();
        if (cls === 'rarity-uncommon') return 'Необычный (Uncommon)';
        if (cls === 'rarity-rare') return 'Редкий (Rare)';
        if (cls === 'rarity-epic') return 'Эпический (Epic)';
        return 'Легендарный (Legendary)';
    }

    public static fromLegacyString(raw: string | EquipmentItem | null, slot: EquipSlotType): EquipmentItem | null {
        if (!raw) return null;
        if (raw instanceof EquipmentItem) return raw;
        if (typeof raw === 'object') {
            const obj = raw as any;
            return new EquipmentItem(obj.name, obj.slot || slot, obj.atk || 0, obj.armor || 0, obj.block || 0, obj.desc);
        }
        if (raw === 'Пусто') return null;
        let atk = 0, armor = 0, block = 0;
        const mAtk = raw.match(/\+(\d+)\s*Ур/i); if (mAtk) atk = parseInt(mAtk[1], 10);
        const mArm = raw.match(/\+(\d+)\s*Бр/i); if (mArm) armor = parseInt(mArm[1], 10);
        const mBlk = raw.match(/\+(\d+)%\s*Блок/i); if (mBlk) block = parseInt(mBlk[1], 10);
        const cleanName = raw.replace(/\s*\(.*?\)\s*/g, '').trim();
        return new EquipmentItem(cleanName, slot, atk, armor, block);
    }
}
