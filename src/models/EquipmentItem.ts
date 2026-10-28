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
        this.desc = desc || `Слот: ${this.getSlotTitle()}. Бонусы: +${atk} Ур, +${armor} Бр, +${block}% Блок.`;
    }

    public getSlotTitle(): string {
        if (this.slot === 'weapon') return '🗡️ Оружие';
        if (this.slot === 'armor') return '🛡️ Доспех';
        return '💍 Талисман';
    }

    public getIcon(): string {
        if (this.slot === 'weapon') return '🗡️';
        if (this.slot === 'armor') return '🛡️';
        return '💍';
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
