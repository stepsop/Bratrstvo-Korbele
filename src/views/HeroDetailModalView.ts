import { GameStateModel } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';
import { EquipSlotType, EquipmentItem } from '../models/EquipmentItem';
import { CanvasRendererView } from './CanvasRendererView';

const STAT_DESCRIPTIONS: Record<string, (h: HeroModel) => string> = {
    hp: (h) => `❤️ <b>Здоровье (${h.hp}/${h.maxHp}):</b> запас жизни бойца. Если упадет до 0, герой выбывает до конца боя и получает травму.`,
    armor: (h) => `🛡️ <b>Броня (${h.armor}):</b> снижает входящий урон от каждого обычного удара (на ${Math.floor(h.armor / 2)}) и супер-удара врага (на ${h.armor}).`,
    block: (h) => `🔰 <b>Блок (${h.blockChance}%):</b> шанс полностью отразить смертоносный СУПЕР-УДАР противника без потери здоровья.`,
    atk: (h) => `⚔️ <b>Бонус урона (+${h.atkBonus}):</b> прибавляется к каждому броску кубика атаки и боевых навыков героя.`,
    init: (h) => `⚡ <b>Инициатива (${h.initBase} + 1d10):</b> определяет очередность хода в начале каждого боя.`
};

function getInjuryDescription(inj: string): string {
    if (inj.includes('Похмелье')) return `🩸 <b>${inj}:</b> голова гудит после корчмы (-2 Макс. HP). Снимается у Сестры Берты в Палатах врачебных.`;
    if (inj.includes('ранение')) return `🩸 <b>${inj}:</b> старая колотая рана (-2 Макс. HP). Требует лечения в Палатах врачебных.`;
    if (inj.includes('цепом')) return `🩸 <b>${inj}:</b> контузия после гуситского цепа. Снижает боеготовность до визита в Палатах врачебных.`;
    return `🩸 <b>${inj}:</b> боевая травма. Обратитесь в Палаты врачебные для исцеления.`;
}

/**
 * View-компонент детального окна осмотра Героя (SRP: отвечает только за инспектор куклы, талантов и состояния бойца)
 */
export class HeroDetailModalView {
    public static renderHeroDetails(modalContent: HTMLElement, state: GameStateModel, h: HeroModel): void {
        const ui = state.heroUiState;

        const statList = [
            { key: 'hp', label: `❤️ HP: ${h.hp}/${h.maxHp}` },
            { key: 'armor', label: `🛡️ Бр: ${h.armor}` },
            { key: 'block', label: `🔰 Блок: ${h.blockChance}%` },
            { key: 'atk', label: `⚔️ Урон: +${h.atkBonus}` },
            { key: 'init', label: `⚡ Иниц: ${h.initBase}` }
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
                    <b style="color:#ffd700;">${sk.icon} ${sk.short}</b>
                    <span style="font-size:9px; color:#9c8265;">${sk.cd}</span>
                </div>
            `;
        }).join('');

        let leftInspectorHtml = '';
        if (ui.leftInspect.type === 'stat') {
            const fn = STAT_DESCRIPTIONS[ui.leftInspect.key] || STAT_DESCRIPTIONS.armor;
            const statTitles: Record<string, { title: string; icon: string; val: string }> = {
                hp:    { title: 'Запас Здоровья (HP)', icon: '❤️', val: `${h.hp} / ${h.maxHp}` },
                armor: { title: 'Защита Брони',        icon: '🛡️', val: `${h.armor} ед.` },
                block: { title: 'Шанс Блока щитом',    icon: '🔰', val: `${h.blockChance}%` },
                atk:   { title: 'Бонус к Урону',       icon: '⚔️', val: `+${h.atkBonus} ед.` },
                init:  { title: 'Инициатива в бою',    icon: '⚡', val: `${h.initBase} + 1d10` }
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
                                    <span class="rpg-card-emoji">${stInfo.icon}</span>
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
                                    <span class="rpg-card-emoji">${sk.icon}</span>
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
            const slotIcon = slot === 'weapon' ? '🗡️' : (slot === 'armor' ? '🛡️' : '💍');

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
                                    <span class="rpg-card-emoji">${eq.getIcon ? eq.getIcon() : slotIcon}</span>
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
                                    <span class="rpg-card-emoji">${slotIcon}</span>
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
                                <span>${eq.getIcon()}</span>
                            </div>
                            <div class="rpg-bag-row-info">
                                <div class="rpg-bag-row-title">${eq.name}</div>
                                <div class="rpg-bag-row-sub">${rShort} • <span class="stat-green">${statsSummary}</span></div>
                            </div>
                            <button class="btn-rpg-compare" onclick="event.stopPropagation(); selectCompareBagItem('${h.id}', ${idx})">⚖️ Сравнить</button>
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

        let wowTreeHtml = '';
        for (let tier = 1; tier <= 3; tier++) {
            const tierNodes = h.talents.filter(t => t.tier === tier).sort((a, b) => a.col - b.col);

            const nodesHtml = tierNodes.map(t => {
                const nodeOpen = h.isTalentNodeAvailable(t);
                const stateCls = t.unlocked ? 'unlocked' : (nodeOpen ? 'available' : 'locked');
                const selCls = (ui.activeInspectorSource === 'status' && ui.selectedTalentId === t.id && !ui.selectedStatusKey) ? 'selected' : '';
                const rankTxt = t.unlocked ? '1/1' : '0/1';
                return `
                    <div class="wow-node ${stateCls} ${selCls}" onclick="selectHeroTalentNode('${h.id}', '${t.id}')">
                        <div class="wow-node-icon">${t.icon}</div>
                        <div style="line-height:1.2; padding-right:22px;">
                            <b style="color:${t.unlocked ? '#ffd700' : '#f0e6d2'};">${t.short}</b>
                        </div>
                        <span class="wow-node-rank">${rankTxt}</span>
                    </div>
                `;
            }).join('');

            wowTreeHtml += `
                <div class="wow-tier-row">
                    ${nodesHtml}
                </div>
            `;
            if (tier < 3) {
                const leftNextOpen = h.isTalentTierUnlocked(tier + 1, 1);
                const rightNextOpen = h.isTalentTierUnlocked(tier + 1, 2);
                const leftCol = leftNextOpen ? '#ffd700' : '#5c4028';
                const rightCol = rightNextOpen ? '#ffd700' : '#5c4028';
                wowTreeHtml += `
                    <div class="wow-connector-row">
                        <div style="color:${leftCol};">▼</div>
                        <div style="color:${rightCol};">▼</div>
                    </div>
                `;
            }
        }

        const selTalent = h.talents.find(t => t.id === ui.selectedTalentId) || h.talents[0];
        const canLearnSel = selTalent && !selTalent.unlocked && h.talentPts > 0 && h.isTalentNodeAvailable(selTalent);
        const branchTitle = selTalent && selTalent.col === 1 ? '⚔️ Ветка Натиска' : '🛡️ Ветка Защиты';
        const talentRarityCls = !selTalent
            ? 'rarity-uncommon'
            : (selTalent.tier === 1 ? 'rarity-uncommon' : (selTalent.tier === 2 ? 'rarity-rare' : 'rarity-epic'));
        const talentRankLabel = !selTalent
            ? 'Обычный'
            : (selTalent.tier === 1 ? 'Необычный (I ранг)' : (selTalent.tier === 2 ? 'Редкий (II ранг)' : 'Эпический (III ранг)'));

        let lockReason = '';
        if (selTalent && !selTalent.unlocked) {
            const branchName = selTalent.col === 1 ? 'Натиска' : 'Защиты';
            const prevTalent = h.talents.find(t => t.tier === selTalent.tier - 1 && t.col === selTalent.col);
            if (!h.isTalentNodeAvailable(selTalent)) {
                lockReason = `<span class="hl-red">Требуется талант: «${prevTalent ? prevTalent.short : branchName}»</span>`;
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
                ${passiveInfo.title}
            </div>
        `;

        h.talents.filter(t => t.unlocked).forEach(t => {
            const isTalBadgeSel = ui.activeInspectorSource === 'status' && ui.selectedStatusKey === `talent_${t.id}`;
            statusBadgesHtml += `
                <div class="status-badge passive ${isTalBadgeSel ? 'selected' : ''}" onclick="selectHeroStatusBadge('${h.id}', 'talent_${t.id}')">
                    ${t.icon} Талант: ${t.short}
                </div>
            `;
        });

        if (h.injuries.length === 0) {
            const isHealthySel = ui.activeInspectorSource === 'status' && ui.selectedStatusKey === 'healthy';
            statusBadgesHtml += `
                <div class="status-badge healthy ${isHealthySel ? 'selected' : ''}" onclick="selectHeroStatusBadge('${h.id}', 'healthy')">
                    ✓ Здоров (Травм и дебаффов нет)
                </div>
            `;
        } else {
            h.injuries.forEach((inj, idx) => {
                const isInjSel = ui.activeInspectorSource === 'status' && ui.selectedStatusKey === `inj_${idx}`;
                statusBadgesHtml += `
                    <div class="status-badge debuff ${isInjSel ? 'selected' : ''}" onclick="selectHeroStatusBadge('${h.id}', 'inj_${idx}')">
                        🩸 Травма: ${inj}
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
                            <span class="rpg-card-title">${passiveInfo.title}</span>
                            <span class="rpg-card-ribbon equipped">Пассивный дар</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-tier">III</span>
                                    <span class="rpg-card-emoji">✨</span>
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
                                    <span class="rpg-card-emoji">💚</span>
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
                            <span class="rpg-card-title">🩸 Травма: ${inj}</span>
                            <span class="rpg-card-ribbon bag">Дебафф</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-emoji">🩸</span>
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
                                    <span class="rpg-card-emoji">${selTalent.icon}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Редкость: <span class="meta-val">${talentRankLabel}</span> | Направление: <span class="meta-val">${branchTitle}</span></div>
                                    <div>Статус: ${lockReason}</div>
                                </div>
                                <div style="margin-left:auto;">
                                    ${selTalent.unlocked
                                        ? `<button class="btn-rpg-gear" style="width:auto; padding:5px 12px !important;" disabled>✓ Изучен</button>`
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

        modalContent.innerHTML = `
            <div class="modal-header" style="margin-bottom:4px;">
                <span>⚔️ ${h.name} — ${h.cls} (Ур.${h.lvl})</span>
                <button style="max-width:95px; padding:3px 6px; font-size:10px;" onclick="renderSquadListModal()">← Назад</button>
            </div>

            <div class="grid-2col">
                <div class="panel-sec" style="display:flex; flex-direction:column; justify-content:flex-start;">
                    <div>
                        <h4>
                            <span>🎽 ЭКИПИРОВКА, СТАТЫ И НАВЫКИ</span>
                            <span style="font-size:9px; color:#b58c5e; font-weight:normal;">(Осмотр в окне состояния ↓)</span>
                        </h4>
                        <div class="stat-pills-row">${statPillsHtml}</div>

                        <div class="doll-wrap">
                            <div class="rpg-slot ${isSlotSel('weapon') ? 'selected' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'equipped', 'weapon')">
                                <span class="rpg-slot-label">🗡️ Оружие</span>
                                <span class="rpg-slot-item">${wItem ? wItem.name : 'Пусто'}</span>
                            </div>

                            <div class="doll-figure-box">
                                <canvas id="doll-canvas" width="108" height="112"></canvas>
                            </div>

                            <div style="display:flex; flex-direction:column; gap:6px;">
                                <div class="rpg-slot ${isSlotSel('armor') ? 'selected' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'equipped', 'armor')">
                                    <span class="rpg-slot-label">🛡️ Доспех</span>
                                    <span class="rpg-slot-item">${aItem ? aItem.name : 'Пусто'}</span>
                                </div>
                                <div class="rpg-slot ${isSlotSel('trinket') ? 'selected' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'equipped', 'trinket')">
                                    <span class="rpg-slot-label">💍 Талисман</span>
                                    <span class="rpg-slot-item">${tItem ? tItem.name : 'Пусто'}</span>
                                </div>
                            </div>
                        </div>

                        <div style="font-size:10px; color:#ffd700; margin-bottom:3px; font-weight:bold;">⚡ СПОСОБНОСТИ ГЕРОЯ (Нажми для осмотра ↓):</div>
                        <div class="skill-grid" style="margin-bottom:0;">${skillCellsHtml}</div>
                    </div>
                </div>

                <div class="panel-sec" style="display:flex; flex-direction:column; justify-content:flex-start;">
                    <div>
                        <h4>
                            <span>🌟 ДЕРЕВО ТАЛАНТОВ</span>
                            <span>Очков: <b class="hl-gold">${h.talentPts}</b></span>
                        </h4>
                        <div class="wow-branch-headers">
                            <div>⚔️ Ветка Натиска</div>
                            <div>🛡️ Ветка Защиты</div>
                        </div>
                        <div class="wow-tree">${wowTreeHtml}</div>
                        <div style="font-size:10px; color:#9c8265; text-align:center; margin-top:2px;">
                            Нажмите на любой талант выше — его описание и кнопка изучения откроются в окне состояния ↓
                        </div>
                    </div>
                </div>
            </div>

            <div class="status-bottom-panel enlarged-status-panel">
                <div class="status-panel-top">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <b style="color:#ffd700;">🩺 СОСТОЯНИЕ БОЙЦА И ОКНО ОСМОТРА (ЭКИПИРОВКА, НАВЫКИ, ПАССИВКИ, ТАЛАНТЫ):</b>
                        <span style="color:#9c8265; font-size:10px;">Нажмите на слот, навык, талант или состояние</span>
                    </div>
                    <div class="status-badges-row">${statusBadgesHtml}</div>
                </div>
                <div class="status-inspector-area">
                    ${unifiedBottomInspectorHtml}
                </div>
            </div>
        `;

        CanvasRendererView.drawPaperDollFigure(h);
    }
}
