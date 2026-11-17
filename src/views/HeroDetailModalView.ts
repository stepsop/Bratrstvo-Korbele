import { GameStateModel } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';
import { EquipSlotType, EquipmentItem } from '../models/EquipmentItem';
import { TalentTreeFactory } from '../models/TalentNode';
import { CanvasRendererView } from './CanvasRendererView';
import { uiIcon } from './UiIconHelper';

const STAT_DESCRIPTIONS: Record<string, (h: HeroModel) => string> = {
    hp: (h) => `${uiIcon('heart', 'ui-icon-xs')} <b>Здоровье (${h.hp}/${h.maxHp}):</b> запас жизни бойца. Если упадет до 0, герой выбывает до конца боя и получает травму.`,
    armor: (h) => `${uiIcon('shield_cross', 'ui-icon-xs')} <b>Броня (${h.armor}):</b> снижает входящий урон от каждого обычного удара (на ${Math.floor(h.armor / 2)}) и супер-удара врага (на ${h.armor}).`,
    block: (h) => `${uiIcon('gauntlet', 'ui-icon-xs')} <b>Блок (${h.blockChance}%):</b> шанс полностью отразить смертоносный СУПЕР-УДАР противника без потери здоровья.`,
    atk: (h) => `${uiIcon('crossed_swords', 'ui-icon-xs')} <b>Бонус урона (+${h.atkBonus}):</b> прибавляется к каждому броску кубика атаки и боевых навыков героя.`,
    init: (h) => `${uiIcon('lightning', 'ui-icon-xs')} <b>Инициатива (${h.initBase} + 1d10):</b> определяет очередность хода в начале каждого боя.`
};

function getInjuryDescription(inj: string): string {
    if (inj.includes('Похмелье')) return `${uiIcon('blood', 'ui-icon-xs')} <b>${inj}:</b> голова гудит после корчмы (-2 Макс. HP). Снимается у Сестры Берты в Палатах врачебных.`;
    if (inj.includes('ранение')) return `${uiIcon('blood', 'ui-icon-xs')} <b>${inj}:</b> старая колотая рана (-2 Макс. HP). Требует лечения в Палатах врачебных.`;
    if (inj.includes('цепом')) return `${uiIcon('blood', 'ui-icon-xs')} <b>${inj}:</b> контузия после гуситского цепа. Снижает боеготовность до визита в Палатах врачебных.`;
    return `${uiIcon('blood', 'ui-icon-xs')} <b>${inj}:</b> боевая травма. Обратитесь в Палаты врачебные для исцеления.`;
}

/**
 * View-компонент детального окна осмотра Героя (SRP: отвечает только за инспектор куклы, талантов и состояния бойца)
 */
export class HeroDetailModalView {
    public static renderHeroDetails(modalContent: HTMLElement, state: GameStateModel, h: HeroModel): void {
        const ui = state.heroUiState;

        const statList = [
            { key: 'hp', label: `${uiIcon('heart', 'ui-icon-xs')} HP: ${h.hp}/${h.maxHp}` },
            { key: 'armor', label: `${uiIcon('shield_cross', 'ui-icon-xs')} Бр: ${h.armor}` },
            { key: 'block', label: `${uiIcon('gauntlet', 'ui-icon-xs')} Блок: ${h.blockChance}%` },
            { key: 'atk', label: `${uiIcon('crossed_swords', 'ui-icon-xs')} Урон: +${h.atkBonus}` },
            { key: 'init', label: `${uiIcon('lightning', 'ui-icon-xs')} Иниц: ${h.initBase}` }
        ];
        const statPillsHtml = statList.map(st => {
            const isAct = ui.activeInspectorSource === 'left' && ui.leftInspect.type === 'stat' && ui.leftInspect.key === st.key;
            return `<div class="stat-pill ${isAct ? 'active' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'stat', '${st.key}')"><b>${st.label}</b></div>`;
        }).join('');

        const wItem = h.equipObj.weapon;
        const aItem = h.equipObj.armor;
        const tItem = h.equipObj.trinket;
        const isSlotSel = (slot: EquipSlotType) => ui.activeInspectorSource === 'left' && ui.leftInspect.type === 'equipped' && ui.leftInspect.key === slot;

        const skills = h.getSkillDetails();
        const skillCellsHtml = skills.map(sk => {
            const isSkSel = sk.key === 's3'
                ? (ui.activeInspectorSource === 'status' && ui.selectedStatusKey === 'passive')
                : (ui.activeInspectorSource === 'left' && ui.leftInspect.type === 'skill' && ui.leftInspect.key === sk.key);
            return `
                <div class="skill-cell ${isSkSel ? 'selected' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'skill', '${sk.key}')">
                    <b class="skill-cell-title">${uiIcon(sk.icon, 'ui-icon-xs')} ${sk.short}</b>
                    <span style="font-size:9px; color:#9c8265;">${sk.cd}</span>
                </div>
            `;
        }).join('');

        let leftInspectorHtml = '';
        if (ui.leftInspect.type === 'stat') {
            const fn = STAT_DESCRIPTIONS[ui.leftInspect.key] || STAT_DESCRIPTIONS.armor;
            const statTitles: Record<string, { title: string; icon: string; val: string }> = {
                hp:    { title: 'Запас Здоровья (HP)', icon: 'heart', val: `${h.hp} / ${h.maxHp}` },
                armor: { title: 'Защита Брони',        icon: 'shield_cross', val: `${h.armor} ед.` },
                block: { title: 'Шанс Блока щитом',    icon: 'gauntlet', val: `${h.blockChance}%` },
                atk:   { title: 'Бонус к Урону',       icon: 'crossed_swords', val: `+${h.atkBonus} ед.` },
                init:  { title: 'Инициатива в бою',    icon: 'lightning', val: `${h.initBase} + 1d10` }
            };
            const stInfo = statTitles[ui.leftInspect.key] || statTitles.armor;
            leftInspectorHtml = `
                <div class="rpg-cards-grid single-card">
                    <div class="rpg-item-card rarity-uncommon compact-card">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">${stInfo.title}</span>
                            <span class="rpg-card-ribbon equipped">Параметр</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-emoji">${uiIcon(stInfo.icon, 'ui-icon-lg')}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Текущее значение: <span class="meta-green">${stInfo.val}</span></div>
                                    <div>Боец: <span class="meta-val">${h.name}</span> | Класс: <span class="meta-green">${h.cls} (Ур. ${h.lvl})</span></div>
                                </div>
                            </div>
                            <div class="rpg-card-desc">${fn(h)}</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (ui.leftInspect.type === 'skill') {
            const sk = skills.find(s => s.key === ui.leftInspect.key) || skills[0];
            const skillRarity = sk.cd === 'Без КД' ? 'rarity-uncommon' : (sk.cd === 'Пассивно' ? 'rarity-epic' : 'rarity-rare');
            const skillTypeLabel = sk.cd === 'Без КД' ? 'Базовый навык' : (sk.cd === 'Пассивно' ? 'Пассивный дар' : 'Особый приём');
            leftInspectorHtml = `
                <div class="rpg-cards-grid single-card">
                    <div class="rpg-item-card ${skillRarity} compact-card">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">${sk.title}</span>
                            <span class="rpg-card-ribbon bag">${sk.cd}</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-tier">Ур.${h.lvl}</span>
                                    <span class="rpg-card-emoji">${uiIcon(sk.icon, 'ui-icon-lg')}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Категория: <span class="meta-val">${skillTypeLabel}</span> | Перезарядка: <span class="meta-green">${sk.cd}</span></div>
                                    <div>Бонус урона героя: <span class="meta-green">+${h.atkBonus} ед.</span></div>
                                </div>
                            </div>
                            <div class="rpg-card-desc">${sk.desc}</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (ui.leftInspect.type === 'equipped') {
            const slot = ui.leftInspect.key as EquipSlotType;
            const item = h.equipObj[slot];
            const slotTitle = slot === 'weapon' ? 'Оружие' : (slot === 'armor' ? 'Доспех' : 'Талисман');
            const slotIcon = slot === 'weapon' ? 'sword' : (slot === 'armor' ? 'armor' : 'fleur');

            const matchingItems = state.spareEquip
                .map((eq, idx) => ({ eq, idx }))
                .filter(x => x.eq.slot === slot);

            const formatDelta = (candVal: number, baseVal: number, suffix = '') => {
                const diff = candVal - baseVal;
                if (diff > 0) return ` <span class="stat-green">(+${diff}${suffix} ▲)</span>`;
                if (diff < 0) return ` <span class="hl-red">(${diff}${suffix} ▼)</span>`;
                return ` <span class="stat-muted">(=)</span>`;
            };

            const renderEquipCard = (eq: EquipmentItem, isEquipped: boolean, bagIdx?: number, compareBase?: EquipmentItem | null) => {
                const tier = eq.getTier ? eq.getTier() : 1;
                const stars = '★'.repeat(Math.max(1, tier));
                const rating = eq.getRating ? eq.getRating() : 120;
                const rarityCls = eq.getRarityClass ? eq.getRarityClass() : 'rarity-uncommon';
                const rarityLabel = eq.getRarityLabel ? eq.getRarityLabel() : 'Необычный';

                const baseAtk = compareBase ? (compareBase.atk || 0) : 0;
                const baseArm = compareBase ? (compareBase.armor || 0) : 0;
                const baseBlk = compareBase ? (compareBase.block || 0) : 0;

                const atkDelta = !isEquipped ? formatDelta(eq.atk || 0, baseAtk) : '';
                const armDelta = !isEquipped ? formatDelta(eq.armor || 0, baseArm) : '';
                const blkDelta = !isEquipped ? formatDelta(eq.block || 0, baseBlk, '%') : '';

                return `
                    <div class="rpg-item-card ${rarityCls}">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">${eq.name}</span>
                            <span class="rpg-card-ribbon ${isEquipped ? 'equipped' : 'bag'}">${isEquipped ? 'Надето' : 'Сравнение'}</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-tier">T${tier}</span>
                                    <span class="rpg-card-emoji">${uiIcon(eq.getIcon ? eq.getIcon() : slotIcon, 'ui-icon-lg')}</span>
                                    <span class="rpg-card-stars">${stars}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Качество: <span class="meta-val">${rarityLabel}</span></div>
                                    <div>Рейтинг вещи: <span class="meta-green">${rating}</span></div>
                                    <div>Слот: <span class="meta-val">${slotTitle}</span></div>
                                </div>
                            </div>
                            <div class="rpg-card-section-title">Основные характеристики</div>
                            <div class="rpg-card-stats">
                                <div class="rpg-stat-line"><span>Урон к атаке:</span> <span><b class="${(eq.atk || 0) > 0 ? 'stat-green' : 'stat-muted'}">+${eq.atk || 0} ед.</b>${atkDelta}</span></div>
                                <div class="rpg-stat-line"><span>Защита брони:</span> <span><b class="${(eq.armor || 0) > 0 ? 'stat-green' : 'stat-muted'}">+${eq.armor || 0} ед.</b>${armDelta}</span></div>
                                <div class="rpg-stat-line"><span>Шанс блока:</span> <span><b class="${(eq.block || 0) > 0 ? 'stat-green' : 'stat-muted'}">+${eq.block || 0}%</b>${blkDelta}</span></div>
                            </div>
                            <div class="rpg-card-section-title">Описание предмета</div>
                            <div class="rpg-card-desc">${eq.desc}</div>
                            <div class="rpg-card-actions">
                                ${isEquipped
                                    ? `<button class="btn-rpg-gear btn-unequip" onclick="unequipHeroSlot('${h.id}', '${slot}')">Снять предмет</button>`
                                    : `<div style="display:flex; gap:6px; width:100%;">
                                           <button class="btn-rpg-gear btn-unequip" style="flex:0.85;" onclick="selectCompareBagItem('${h.id}', null)">← К списку (${matchingItems.length})</button>
                                           <button class="btn-rpg-gear" style="flex:1.15;" onclick="equipItemOnHero('${h.id}', ${bagIdx})">Надеть</button>
                                       </div>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            };

            const curItemHtml = item
                ? renderEquipCard(item, true)
                : `
                    <div class="rpg-item-card rarity-empty">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">${slotTitle}: Слот пуст</span>
                            <span class="rpg-card-ribbon bag">Пусто</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-emoji">${uiIcon(slotIcon, 'ui-icon-lg')}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Слот экипировки: <span class="meta-val">${slotTitle}</span></div>
                                    <div>Статус: <span class="stat-muted">Не экипировано</span></div>
                                </div>
                            </div>
                            <div class="rpg-card-section-title">Описание предмета</div>
                            <div class="rpg-card-desc">Выберите предмет из списка справа для сравнения и экипировки.</div>
                        </div>
                    </div>
                `;

            const selectedEntry = (ui.compareBagIndex !== null)
                ? matchingItems.find(x => x.idx === ui.compareBagIndex) || null
                : null;

            let rightColumnHtml = '';
            if (selectedEntry) {
                rightColumnHtml = renderEquipCard(selectedEntry.eq, false, selectedEntry.idx, item);
            } else {
                const listRowsHtml = matchingItems.map(({ eq, idx }) => {
                    const rCls = eq.getRarityClass();
                    const rShort = rCls === 'rarity-uncommon' ? 'Необычный' : (rCls === 'rarity-rare' ? 'Редкий' : (rCls === 'rarity-epic' ? 'Эпический' : 'Легендарный'));
                    const statParts: string[] = [];
                    if (eq.atk > 0) statParts.push(`+${eq.atk} Ур`);
                    if (eq.armor > 0) statParts.push(`+${eq.armor} Бр`);
                    if (eq.block > 0) statParts.push(`+${eq.block}% Блок`);
                    const statsSummary = statParts.length > 0 ? statParts.join(' • ') : 'Без бонусов';

                    return `
                        <div class="rpg-bag-item-row ${rCls}" onclick="selectCompareBagItem('${h.id}', ${idx})">
                            <div class="rpg-bag-row-icon">
                                ${uiIcon(eq.getIcon(), 'ui-icon-md')}
                            </div>
                            <div class="rpg-bag-row-info">
                                <div class="rpg-bag-row-title">${eq.name}</div>
                                <div class="rpg-bag-row-sub">${rShort} • <span class="stat-green">${statsSummary}</span></div>
                            </div>
                            <button class="btn-rpg-compare" onclick="event.stopPropagation(); selectCompareBagItem('${h.id}', ${idx})">${uiIcon('scales', 'ui-icon-xs')} Сравнить</button>
                        </div>
                    `;
                }).join('');

                rightColumnHtml = `
                    <div class="rpg-item-card rarity-uncommon">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">В наличии: ${slotTitle} (${matchingItems.length})</span>
                            <span class="rpg-card-ribbon bag">Склад</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-section-title" style="margin-top:0;">Выберите предмет для сравнения</div>
                            <div class="rpg-bag-list">
                                ${listRowsHtml || `<div class="stat-muted" style="padding:12px 4px; text-align:center;">На складе гильдии нет свободных предметов для слота «${slotTitle}».</div>`}
                            </div>
                        </div>
                    </div>
                `;
            }

            leftInspectorHtml = `
                <div class="rpg-cards-grid">
                    ${curItemHtml}
                    ${rightColumnHtml}
                </div>
            `;
        }

        const highlightNumbers = (text: string): string => {
            return text.replace(/([+-]?\d+%?)/g, '<span class="baro-hl-num">$1</span>');
        };

        const renderBaroNodeBtn = (t: typeof h.talents[0], posVertical: 'down' | 'up', posHoriz: 'left' | 'center' | 'right') => {
            const nodeOpen = h.isTalentNodeAvailable(t);
            const siblingPicked = h.isTalentSiblingUnlocked(t);
            const stateCls = t.unlocked
                ? 'unlocked'
                : (nodeOpen ? 'available' : (siblingPicked ? 'sibling-locked' : 'locked'));
            const selCls = (ui.selectedTalentId === t.id) ? 'selected' : '';

            const paragraphsHtml = (t.detailedParagraphs || [t.desc])
                .map(p => `<p>${highlightNumbers(p)}</p>`)
                .join('');

            let statusLine = '';
            if (t.unlocked) {
                statusLine = `<div class="baro-tip-status unlocked">${uiIcon('check', 'ui-icon-xs')} Талант изучен</div>`;
            } else if (siblingPicked) {
                statusLine = `<div class="baro-tip-status locked">${uiIcon('close', 'ui-icon-xs')} Выбран другой талант этого ранга</div>`;
            } else if (!nodeOpen) {
                statusLine = `<div class="baro-tip-status locked">${uiIcon('lock', 'ui-icon-xs')} Требуется предыдущий ранг ветки</div>`;
            } else if (h.talentPts > 0) {
                statusLine = `<div class="baro-tip-status available">${uiIcon('laurel', 'ui-icon-xs')} Доступно (Клик — выбрать • 2×Клик — изучить)</div>`;
            } else {
                statusLine = `<div class="baro-tip-status muted">Недостаточно очков талантов (0)</div>`;
            }

            return `
                <div class="baro-icon-btn ${stateCls} ${selCls}"
                     onclick="selectHeroTalentNode('${h.id}', '${t.id}')"
                     ondblclick="unlockTalent('${h.id}', '${t.id}')">
                    <span class="baro-icon-glyph">${uiIcon(t.icon, 'ui-icon-talent')}</span>
                    <div class="baro-floating-tooltip tip-${posVertical} tip-${posHoriz}">
                        <div class="baro-tip-title">${t.short}</div>
                        <div class="baro-tip-body">${paragraphsHtml}</div>
                        ${statusLine}
                    </div>
                </div>
            `;
        };

        // Верхний общий ряд (tier === 0, col === 0)
        const generalNodes = h.talents.filter(t => t.col === 0 && t.tier === 0).sort((a, b) => a.choice - b.choice);
        const generalAnyUnlocked = generalNodes.some(t => t.unlocked);
        const generalIconsHtml = generalNodes.map((t, idx) => {
            const hPos: 'left' | 'center' | 'right' = idx === 0 ? 'left' : (idx === generalNodes.length - 1 ? 'right' : 'center');
            return renderBaroNodeBtn(t, 'down', hPos);
        }).join('');

        // 3 ветки специализации по классу
        const branchesMeta = TalentTreeFactory.getBranchesForClass(h.cls);
        const branchHeadersHtml = branchesMeta.map(b => `
            <div class="baro-branch-header-box">${b.title}</div>
        `).join('');

        const branchesColumnsHtml = branchesMeta.map((b, bIdx) => {
            const hPos: 'left' | 'center' | 'right' = bIdx === 0 ? 'left' : (bIdx === 1 ? 'center' : 'right');
            let tiersHtml = '';
            for (let tier = 1; tier <= 4; tier++) {
                const cellNodes = h.talents
                    .filter(t => t.col === b.col && t.tier === tier)
                    .sort((a, bNode) => a.choice - bNode.choice);
                const cellUnlocked = cellNodes.some(t => t.unlocked);
                const vPos: 'down' | 'up' = tier >= 3 ? 'up' : 'down';
                const btnsHtml = cellNodes.map(t => renderBaroNodeBtn(t, vPos, hPos)).join('');
                tiersHtml += `
                    <div class="baro-tier-cell ${cellUnlocked ? 'cell-unlocked' : ''}">
                        <div class="baro-tier-icons-pair">${btnsHtml}</div>
                        ${cellUnlocked ? `<span class="baro-cell-check" title="Ранг изучен">✓</span>` : `<span class="baro-cell-check empty"></span>`}
                    </div>
                `;
            }
            return `<div class="baro-branch-col">${tiersHtml}</div>`;
        }).join('');

        const selTalent = h.talents.find(t => t.id === ui.selectedTalentId) || h.talents[0];
        const canLearnSel = selTalent && !selTalent.unlocked && h.talentPts > 0 && h.isTalentNodeAvailable(selTalent);
        const selBranchMeta = selTalent && selTalent.col > 0
            ? branchesMeta.find(b => b.col === selTalent.col)?.title || 'Ветка класса'
            : 'Общие таланты класса';
        const branchTitle = `${uiIcon('fleur', 'ui-icon-xs')} ${selBranchMeta}`;
        const talentRarityCls = !selTalent
            ? 'rarity-uncommon'
            : (selTalent.tier <= 1 ? 'rarity-uncommon' : (selTalent.tier === 2 ? 'rarity-rare' : (selTalent.tier === 3 ? 'rarity-epic' : 'rarity-legendary')));
        const talentRankLabel = !selTalent
            ? 'Обычный'
            : (selTalent.tier === 0 ? 'Общий дар' : `Ранг ${selTalent.tier} (${selBranchMeta})`);

        let lockReason = '';
        if (selTalent && !selTalent.unlocked) {
            if (h.isTalentSiblingUnlocked(selTalent)) {
                lockReason = `<span class="hl-red">В этом тире уже выбран другой талант</span>`;
            } else if (!h.isTalentNodeAvailable(selTalent)) {
                const prevTalent = h.talents.find(t => t.tier === selTalent.tier - 1 && t.col === selTalent.col);
                lockReason = `<span class="hl-red">Требуется изучить предыдущий ранг (${prevTalent ? prevTalent.short : `Тир ${selTalent.tier - 1}`})</span>`;
            } else if (h.talentPts <= 0) {
                lockReason = `<span class="stat-muted">Недостаточно очков талантов (0)</span>`;
            } else {
                lockReason = `<span class="meta-green">Доступно для изучения (1 очко)</span>`;
            }
        } else if (selTalent && selTalent.unlocked) {
            lockReason = `<span class="meta-green">Талант уже изучен</span>`;
        }

        const passiveInfo = h.getPassiveInfo();
        const isPassSel = ui.activeInspectorSource === 'status' && ui.selectedStatusKey === 'passive';
        let statusBadgesHtml = `
            <div class="status-badge passive ${isPassSel ? 'selected' : ''}" onclick="selectHeroStatusBadge('${h.id}', 'passive')">
                ${uiIcon(passiveInfo.icon, 'ui-icon-xs')} ${passiveInfo.title}
            </div>
        `;

        h.talents.filter(t => t.unlocked).forEach(t => {
            const isTalBadgeSel = ui.activeInspectorSource === 'status' && ui.selectedStatusKey === `talent_${t.id}`;
            statusBadgesHtml += `
                <div class="status-badge passive ${isTalBadgeSel ? 'selected' : ''}" onclick="selectHeroStatusBadge('${h.id}', 'talent_${t.id}')">
                    ${uiIcon(t.icon, 'ui-icon-xs')} Талант: ${t.short}
                </div>
            `;
        });

        if (h.injuries.length === 0) {
            const isHealthySel = ui.activeInspectorSource === 'status' && ui.selectedStatusKey === 'healthy';
            statusBadgesHtml += `
                <div class="status-badge healthy ${isHealthySel ? 'selected' : ''}" onclick="selectHeroStatusBadge('${h.id}', 'healthy')">
                    ${uiIcon('check', 'ui-icon-xs')} Здоров (Травм и дебаффов нет)
                </div>
            `;
        } else {
            h.injuries.forEach((inj, idx) => {
                const isInjSel = ui.activeInspectorSource === 'status' && ui.selectedStatusKey === `inj_${idx}`;
                statusBadgesHtml += `
                    <div class="status-badge debuff ${isInjSel ? 'selected' : ''}" onclick="selectHeroStatusBadge('${h.id}', 'inj_${idx}')">
                        ${uiIcon('blood', 'ui-icon-xs')} Травма: ${inj}
                    </div>
                `;
            });
        }

        let statusInspectorCardHtml = '';
        if (ui.selectedStatusKey === 'passive') {
            statusInspectorCardHtml = `
                <div class="rpg-cards-grid single-card">
                    <div class="rpg-item-card rarity-epic compact-card">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">${uiIcon(passiveInfo.icon, 'ui-icon-xs')} ${passiveInfo.title}</span>
                            <span class="rpg-card-ribbon equipped">Пассивный дар</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-tier">III</span>
                                    <span class="rpg-card-emoji">${uiIcon(passiveInfo.icon, 'ui-icon-lg')}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Тип эффекта: <span class="meta-val">Постоянная пассивная способность</span></div>
                                    <div>Класс бойца: <span class="meta-green">${h.cls} (Ур. ${h.lvl})</span></div>
                                </div>
                            </div>
                            <div class="rpg-card-desc">${passiveInfo.desc}</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (ui.selectedStatusKey === 'healthy') {
            statusInspectorCardHtml = `
                <div class="rpg-cards-grid single-card">
                    <div class="rpg-item-card rarity-uncommon compact-card">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">Боец полностью здоров</span>
                            <span class="rpg-card-ribbon equipped">Состояние</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-emoji">${uiIcon('heart_heal', 'ui-icon-lg')}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Здоровье: <span class="meta-green">${h.hp} / ${h.maxHp} HP</span></div>
                                    <div>Травмы и дебаффы: <span class="meta-green">Отсутствуют</span></div>
                                </div>
                            </div>
                            <div class="rpg-card-desc">Боец полон сил, штрафов к характеристикам нет и он полностью готов к вылазке.</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (ui.selectedStatusKey && ui.selectedStatusKey.startsWith('inj_')) {
            const iIdx = parseInt(ui.selectedStatusKey.split('_')[1], 10);
            const inj = h.injuries[iIdx] || h.injuries[0] || 'Боевая травма';
            statusInspectorCardHtml = `
                <div class="rpg-cards-grid single-card">
                    <div class="rpg-item-card rarity-legendary compact-card">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">${uiIcon('blood', 'ui-icon-xs')} Травма: ${inj}</span>
                            <span class="rpg-card-ribbon bag">Дебафф</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-emoji">${uiIcon('blood', 'ui-icon-lg')}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Статус: <span class="stat-red">Требуется лечение у сестры Берты</span></div>
                                    <div>Снятие в таверне: <span class="meta-val">Палаты врачебные (15 грошей)</span></div>
                                </div>
                            </div>
                            <div class="rpg-card-desc">${getInjuryDescription(inj)}</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (selTalent) {
            statusInspectorCardHtml = `
                <div class="rpg-cards-grid single-card">
                    <div class="rpg-item-card ${talentRarityCls} compact-card">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">${selTalent.name}</span>
                            <span class="rpg-card-ribbon ${selTalent.unlocked ? 'equipped' : 'bag'}">${selTalent.unlocked ? 'Изучено' : `Талант T${selTalent.tier}`}</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-tier">T${selTalent.tier}</span>
                                    <span class="rpg-card-emoji">${uiIcon(selTalent.icon, 'ui-icon-lg')}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Редкость: <span class="meta-val">${talentRankLabel}</span> | Направление: <span class="meta-val">${branchTitle}</span></div>
                                    <div>Статус: ${lockReason}</div>
                                </div>
                                <div style="margin-left:auto;">
                                    ${selTalent.unlocked
                                        ? `<button class="btn-rpg-gear" style="width:auto; padding:5px 12px !important;" disabled>${uiIcon('check', 'ui-icon-xs')} Изучен</button>`
                                        : `<button class="btn-rpg-gear" style="width:auto; padding:5px 14px !important;" onclick="unlockTalent('${h.id}', '${selTalent.id}')" ${!canLearnSel ? 'disabled' : ''}>Изучить талант</button>`
                                    }
                                </div>
                            </div>
                            <div class="rpg-card-desc">${selTalent.desc}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        const unifiedBottomInspectorHtml = ui.activeInspectorSource === 'left'
            ? leftInspectorHtml
            : statusInspectorCardHtml;

        const aliveHeroes = state.party.filter(p => p.status !== 'dead');
        const squadHeroes = aliveHeroes.filter(p => p.inSquad).slice(0, state.squadMax);
        const reserveHeroes = aliveHeroes.filter(p => !p.inSquad);
        const navList = squadHeroes.some(p => p.id === h.id)
            ? squadHeroes
            : (reserveHeroes.some(p => p.id === h.id) ? reserveHeroes : aliveHeroes);
        const curIdx = Math.max(0, navList.findIndex(p => p.id === h.id));
        const prevHero = navList[(curIdx - 1 + navList.length) % navList.length] || h;
        const nextHero = navList[(curIdx + 1) % navList.length] || h;
        const canSwitch = navList.length > 1;

        modalContent.innerHTML = `
            <div class="modal-header hero-detail-header" style="margin-bottom:4px;">
                <span class="hero-detail-header-title">${uiIcon('crossed_swords', 'ui-icon-sm')} ${h.name} — ${h.cls} (Ур.${h.lvl})</span>
                <div class="hero-detail-nav-actions">
                    <button class="hero-nav-btn" onclick="renderHeroDetailModal('${prevHero.id}')" ${!canSwitch ? 'disabled' : ''} title="Предыдущий боец">◀ Предыдущий</button>
                    <button class="hero-nav-btn" onclick="renderHeroDetailModal('${nextHero.id}')" ${!canSwitch ? 'disabled' : ''} title="Следующий боец">Следующий ▶</button>
                    <button class="hero-back-btn" onclick="renderSquadListModal()">← Назад</button>
                </div>
            </div>

            <div class="grid-2col hero-detail-top-grid">
                <div class="hero-detail-left-col">
                    <div class="panel-sec" style="display:flex; flex-direction:column; justify-content:flex-start;">
                        <div>
                            <h4>
                                <span>${uiIcon('armor', 'ui-icon-xs')} ЭКИПИРОВКА, СТАТЫ И НАВЫКИ</span>
                                <span style="font-size:9px; color:#b58c5e; font-weight:normal;">(Осмотр внизу ↓)</span>
                            </h4>
                            <div class="stat-pills-row">${statPillsHtml}</div>

                            <div class="doll-wrap">
                                <div class="rpg-slot ${isSlotSel('weapon') ? 'selected' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'equipped', 'weapon')">
                                    <span class="rpg-slot-label">${uiIcon('sword', 'ui-icon-xs')} Оружие</span>
                                    <span class="rpg-slot-item">${wItem ? wItem.name : 'Пусто'}</span>
                                </div>

                                <div class="doll-figure-box">
                                    <canvas id="doll-canvas" width="108" height="112"></canvas>
                                </div>

                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <div class="rpg-slot ${isSlotSel('armor') ? 'selected' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'equipped', 'armor')">
                                        <span class="rpg-slot-label">${uiIcon('shield_cross', 'ui-icon-xs')} Доспех</span>
                                        <span class="rpg-slot-item">${aItem ? aItem.name : 'Пусто'}</span>
                                    </div>
                                    <div class="rpg-slot ${isSlotSel('trinket') ? 'selected' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'equipped', 'trinket')">
                                        <span class="rpg-slot-label">${uiIcon('fleur', 'ui-icon-xs')} Талисман</span>
                                        <span class="rpg-slot-item">${tItem ? tItem.name : 'Пусто'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style="font-size:10px; color:#ffd700; margin-bottom:3px; font-weight:bold; display:flex; align-items:center; gap:4px;">${uiIcon('lightning', 'ui-icon-xs')} СПОСОБНОСТИ ГЕРОЯ (Нажми для осмотра ↓):</div>
                            <div class="skill-grid" style="margin-bottom:0;">${skillCellsHtml}</div>
                        </div>
                    </div>

                    <div class="panel-sec hero-status-sec">
                        <h4>
                            <span>${uiIcon('heal_cross', 'ui-icon-xs')} СОСТОЯНИЕ БОЙЦА (ПАССИВКИ, ТАЛАНТЫ, ТРАВМЫ)</span>
                            <span style="font-size:9px; color:#b58c5e; font-weight:normal;">(Нажми для осмотра ↓)</span>
                        </h4>
                        <div class="status-badges-row">${statusBadgesHtml}</div>
                        <div class="hero-status-summary-box">
                            <div><span class="stat-muted">Боевая готовность:</span> <b class="${h.injuries.length === 0 ? 'meta-green' : 'stat-red'}">${h.injuries.length === 0 ? 'Полная боеготовность (штрафов нет)' : `Ранений: ${h.injuries.length} (требуется лазарет)`}</b></div>
                            <div><span class="stat-muted">Изучено талантов:</span> <b class="hl-gold">${h.talents.filter(t => t.unlocked).length} / ${h.talents.length}</b> • <span class="stat-muted">Свободных очков:</span> <b class="hl-gold">${h.talentPts}</b></div>
                            <div style="color:#c9b69c; font-style:italic; margin-top:2px;">${passiveInfo.desc}</div>
                        </div>
                    </div>
                </div>

                <div class="panel-sec hero-talent-sec">
                    <h4>
                        <span>${uiIcon('laurel', 'ui-icon-xs')} ДЕРЕВО ТАЛАНТОВ (${h.cls.toUpperCase()})</span>
                        <span>Очков талантов: <b class="hl-gold">${h.talentPts}</b></span>
                    </h4>
                    <div class="baro-tree-board">
                        <div class="baro-general-row ${generalAnyUnlocked ? 'cell-unlocked' : ''}">
                            <div class="baro-tier-icons-pair general-icons">${generalIconsHtml}</div>
                            ${generalAnyUnlocked ? `<span class="baro-cell-check" title="Общий талант изучен">✓</span>` : `<span class="baro-cell-check empty"></span>`}
                        </div>

                        <div class="baro-branch-headers">
                            ${branchHeadersHtml}
                        </div>

                        <div class="baro-branches-grid">
                            ${branchesColumnsHtml}
                        </div>
                    </div>

                    <div class="baro-bottom-bar">
                        <div class="baro-actions-wrap" style="margin-left:auto;">
                            <button class="baro-action-btn apply-btn"
                                    onclick="unlockTalent('${h.id}', '${selTalent ? selTalent.id : ''}')"
                                    ${!canLearnSel ? 'disabled' : ''}>ИЗУЧИТЬ</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="status-bottom-panel enlarged-status-panel">
                <div class="status-inspector-area">
                    ${unifiedBottomInspectorHtml}
                </div>
            </div>
        `;

        CanvasRendererView.drawPaperDollFigure(h);
    }
}
