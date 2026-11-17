/**
 * Хелпер для рендеринга пиксельных UI-иконок из нарезанного атласа (/public/icons/*.png)
 */
const AVAILABLE_UI_ICONS = new Set<string>([
    'alert', 'anchor', 'anvil', 'armor', 'arrow', 'axe', 'barrel', 'bear', 'beer',
    'blood', 'boar', 'boots', 'bottle', 'bow', 'bread', 'cart_gold', 'cart_ore',
    'castle', 'chalice', 'chat', 'check', 'cheese', 'church', 'close', 'coins',
    'coins_stack', 'contract', 'crate', 'cross', 'crossbow', 'crossed_swords',
    'crown', 'crown_dark', 'crucifix', 'dagger', 'devil', 'eagle', 'eye', 'eye_off',
    'eye_pyramid', 'feather', 'fire', 'fish', 'flag', 'fleur', 'footprint', 'forge',
    'fox', 'frost', 'garlic', 'gauntlet', 'gear', 'gears', 'grapes', 'halberd',
    'hammer', 'hatchet', 'heal_cross', 'heart', 'heart_alt', 'heart_broken',
    'heart_heal', 'helmet', 'herb', 'herb_pouch', 'holy_book', 'hood', 'hook',
    'horse', 'horseshoe', 'hourglass', 'house', 'keys', 'ladder', 'laurel',
    'laurel_green', 'letter', 'lightning', 'lock', 'mace', 'meat', 'moon', 'mortar',
    'mountain', 'mountain_snow', 'mushroom', 'paw', 'pentagram', 'person', 'pickaxe',
    'poison', 'potion_green', 'pouch', 'question', 'raven', 'rope', 'sack', 'scales',
    'scroll', 'search', 'shield_cross', 'ship', 'skull', 'skull_bones', 'skull_plain',
    'smith_hammer', 'snake', 'snake_gold', 'stag', 'sun', 'sun_moon', 'swap_h',
    'swap_v', 'sword', 'tavern', 'tower', 'tree', 'vial_amber', 'vial_green',
    'vial_red', 'vortex', 'wagon', 'wheel', 'wheel_iron', 'wheel_wood', 'wind',
    'windmill', 'wolf'
]);

const EMOJI_FALLBACK_MAP: Record<string, string> = {
    '📜': 'scroll',
    '🐎': 'horse',
    '🍷': 'bottle',
    '🦅': 'eagle',
    '🗡️': 'sword',
    '💥': 'crossed_swords',
    '⚡': 'lightning',
    '🩸': 'blood',
    '🔥': 'fire',
    '🛡️': 'shield_cross',
    '⛓️': 'armor',
    '🔰': 'gauntlet',
    '🪖': 'helmet',
    '🏰': 'castle',
    '🍺': 'beer',
    '🤺': 'dagger',
    '🥾': 'boots',
    '🎲': 'chalice',
    '👑': 'crown',
    '📿': 'crucifix',
    '🕯️': 'church',
    '📖': 'holy_book',
    '🔔': 'cross',
    '🪵': 'mace',
    '⚒️': 'smith_hammer',
    '⚖️': 'scales',
    '🌿': 'herb',
    '🧪': 'potion_green',
    '💚': 'heart_heal',
    '✨': 'laurel',
    '🛢️': 'barrel',
    '🍯': 'vial_amber',
    '🍞': 'bread',
    '🏆': 'laurel',
    '🎒': 'pouch',
    '🪙': 'coins_stack',
    '🔫': 'crossbow',
    '⚙️': 'gears',
    '💣': 'barrel',
    '🧥': 'armor',
    '🎯': 'eye',
    '🧱': 'tower',
    '⚔️': 'crossed_swords',
    '💍': 'fleur',
    '🥋': 'gauntlet',
    '⛑️': 'helmet',
    '⚜️': 'fleur',
    '🦇': 'crown_dark',
    '🧤': 'gauntlet',
    '🔪': 'dagger',
    '🔨': 'mace',
    '🛏️': 'house',
    '🍖': 'meat',
    '🏥': 'heal_cross',
    '🩹': 'heart_heal',
    '⛏️': 'pickaxe',
    '🏹': 'bow',
    '🔮': 'skull_plain',
    '💀': 'skull_bones',
    '🏛️': 'tavern',
    '❤️': 'heart',
    '🩺': 'heal_cross',
    '🌟': 'laurel',
    '🎽': 'armor',
    '💊': 'potion_green',
    '🚩': 'flag',
    '⏳': 'hourglass',
    '🔍': 'search',
    '🎁': 'pouch',
    '⬆️': 'arrow',
    '⚠️': 'alert',
    '📍': 'flag',
    '🔒': 'lock',
    '✓': 'check',
    '✕': 'close',
    '🔄': 'swap_h',
    '⏸️': 'hourglass',
    '⌨️': 'scroll',
    '🛒': 'coins',
    '⬅': 'arrow'
};

export function resolveUiIconKey(iconOrEmoji: string): string | null {
    const trimmed = (iconOrEmoji || '').trim();
    if (AVAILABLE_UI_ICONS.has(trimmed)) return trimmed;
    if (EMOJI_FALLBACK_MAP[trimmed]) return EMOJI_FALLBACK_MAP[trimmed];
    return null;
}

export function uiIcon(
    iconOrEmoji: string,
    sizeClass: 'ui-icon-xs' | 'ui-icon-sm' | 'ui-icon-md' | 'ui-icon-lg' | 'ui-icon-xl' | 'ui-icon-2xl' | 'ui-icon-talent' = 'ui-icon-sm',
    extraClass: string = ''
): string {
    const key = resolveUiIconKey(iconOrEmoji);
    if (key) {
        const cls = extraClass ? `ui-icon ${sizeClass} ${extraClass}` : `ui-icon ${sizeClass}`;
        return `<img class="${cls}" src="icons/${key}.png" alt="" draggable="false" />`;
    }
    return `<span>${iconOrEmoji}</span>`;
}
