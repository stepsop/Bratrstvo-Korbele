import { GameStateModel } from '../models/GameStateModel';
import { HeroModel } from '../models/HeroModel';
import { EquipSlotType } from '../models/EquipmentItem';
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
 * View-компонент списка Отряда и детального окна Героя (Кукла РПГ, Способности, Дерево WoW, Состояние)
 */
export class SquadAndHeroModalView {
    private modalOverlay = document.getElementById('modal-overlay')!;
    private modalContent = document.getElementById('modal-content')!;

    public showModal(): void {
        this.modalOverlay.style.display = 'block';
    }

    public hideModal(): void {
        this.modalOverlay.style.display = 'none';
    }

    public renderSquadList(state: GameStateModel): void {
        this.showModal();
        const aliveHeroes = state.party.filter(h => h.status !== 'dead');
        const useGrid = aliveHeroes.length > 4 ? 'hero-grid' : '';

        const cardsHtml = aliveHeroes.map(h => {
            const injCount = h.injuries.length;
            const injText = injCount > 0 ? `<span class="hl-red">Травмы: ${h.injuries.join(', ')}</span>` : `<span class="hl-green">Травм нет</span>`;
            const stBadge = h.status === 'ready' ? 'В строю' : (h.status === 'war' ? `Война (${h.timer}ц)` : `Палаты (${h.timer}ц)`);

            return `
                <div class="hero-card-row" style="margin-bottom:${useGrid ? '0' : '4px'};">
                    <div style="flex:1;">
                        <b class="hl-gold">${h.name}</b> | <b>${h.cls}</b> (Ур.${h.lvl}) | HP: ${h.hp}/${h.maxHp} | <i>${stBadge}</i><br>
                        ${injText} | Очки талантов: <span class="hl-gold">${h.talentPts}</span>
                    </div>
                    <button style="max-width:125px; font-size:10px; padding:5px;" onclick="renderHeroDetailModal('${h.id}')">ТАЛАНТЫ / ВЕЩИ</button>
                </div>
            `;
        }).join('');

        this.modalContent.innerHTML = `
            <div style="display:flex; justify-content:flex-end; margin-bottom:5px;">
                <button style="max-width:95px; padding:4px 6px; font-size:10px;" onclick="closeSquadModal()">✕ ЗАКРЫТЬ</button>
            </div>
            <div class="${useGrid}">${cardsHtml}</div>
        `;
    }

    public renderHeroDetails(state: GameStateModel, h: HeroModel): void {
        this.showModal();
        const ui = state.heroUiState;

        // 1. БЛОК СТАТОВ, УВЕЛИЧЕННОЙ КУКЛЫ И СПОСОБНОСТЕЙ ГЕРОЯ (СЛЕВА)
        const statList = [
            { key: 'hp', label: `❤️ HP: ${h.hp}/${h.maxHp}` },
            { key: 'armor', label: `🛡️ Бр: ${h.armor}` },
            { key: 'block', label: `🔰 Блок: ${h.blockChance}%` },
            { key: 'atk', label: `⚔️ Урон: +${h.atkBonus}` },
            { key: 'init', label: `⚡ Иниц: ${h.initBase}` }
        ];
        const statPillsHtml = statList.map(st => {
            const isAct = ui.leftInspect.type === 'stat' && ui.leftInspect.key === st.key;
            return `<div class="stat-pill ${isAct ? 'active' : ''}" onclick="selectHeroLeftInspect('${h.id}', 'stat', '${st.key}')"><b>${st.label}</b></div>`;
        }).join('');

        const wItem = h.equipObj.weapon;
        const aItem = h.equipObj.armor;
        const tItem = h.equipObj.trinket;
        const isSlotSel = (slot: EquipSlotType) => ui.leftInspect.type === 'equipped' && ui.leftInspect.key === slot;

        const skills = h.getSkillDetails();
        const skillCellsHtml = skills.map(sk => {
            const isSkSel = ui.leftInspect.type === 'skill' && ui.leftInspect.key === sk.key;
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
            leftInspectorHtml = `<div>${fn(h)}</div>`;
        } else if (ui.leftInspect.type === 'skill') {
            const sk = skills.find(s => s.key === ui.leftInspect.key) || skills[0];
            leftInspectorHtml = `
                <div>
                    <b class="hl-gold">${sk.icon} ${sk.title}</b> <span style="color:#9c8265;">[${sk.cd}]</span><br>
                    <span>${sk.desc}</span>
                </div>
            `;
        } else if (ui.leftInspect.type === 'equipped') {
            const slot = ui.leftInspect.key as EquipSlotType;
            const item = h.equipObj[slot];
            const slotTitle = slot === 'weapon' ? '🗡️ Оружие' : (slot === 'armor' ? '🛡️ Доспех' : '💍 Талисман');

            const matchingItems = state.spareEquip
                .map((eq, idx) => ({ eq, idx }))
                .filter(x => x.eq.slot === slot);

            const curItemHtml = item
                ? `<div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                       <div><b class="hl-gold">${item.name}</b> <span style="color:#9c8265;">(${slotTitle})</span> — <b>+${item.atk || 0} Ур, +${item.armor || 0} Бр, +${item.block || 0}% Блок</b></div>
                       <button style="max-width:70px; padding:2px 5px; font-size:9px;" onclick="unequipHeroSlot('${h.id}', '${slot}')">Снять</button>
                   </div>`
                : `<div><b>${slotTitle}:</b> <span style="color:#888;">Слот пуст</span></div>`;

            const availBtns = matchingItems.map(({ eq, idx }) => {
                return `<button class="btn-sec" style="padding:3px 6px; font-size:9px; border-color:#ffd700;" onclick="equipItemOnHero('${h.id}', ${idx})">Надеть: ${eq.name} (+${eq.atk || 0}Ур/+${eq.armor || 0}Бр/+${eq.block || 0}%Бл)</button>`;
            }).join('');

            const availRow = availBtns
                ? `<div class="btn-row" style="margin-top:2px;">${availBtns}</div>`
                : `<div style="color:#756554; font-size:9px;">В арсенале нет других предметов для слота «${slotTitle}».</div>`;

            leftInspectorHtml = `${curItemHtml}${availRow}`;
        }

        // 2. ВЕТКА ТАЛАНТОВ В СТИЛЕ СТАРОГО WOW (СПРАВА)
        let wowTreeHtml = '';
        for (let tier = 1; tier <= 3; tier++) {
            const tierNodes = h.talents.filter(t => t.tier === tier);
            const tierOpen = h.isTalentTierUnlocked(tier);

            const nodesHtml = tierNodes.map(t => {
                const stateCls = t.unlocked ? 'unlocked' : (tierOpen ? 'available' : 'locked');
                const selCls = (ui.selectedTalentId === t.id) ? 'selected' : '';
                const rankTxt = t.unlocked ? '1/1' : '0/1';
                return `
                    <div class="wow-node ${stateCls} ${selCls}" onclick="selectHeroTalentNode('${h.id}', '${t.id}')">
                        <div class="wow-node-icon">${t.icon}</div>
                        <div style="line-height:1.15; padding-right:16px;">
                            <b style="color:${t.unlocked ? '#ffd700' : '#f0e6d2'};">${t.short}</b>
                        </div>
                        <span class="wow-node-rank">${rankTxt}</span>
                    </div>
                `;
            }).join('');

            wowTreeHtml += `
                <div class="wow-tier-row">
                    <div class="wow-tier-label">Тир ${tier}</div>
                    ${nodesHtml}
                </div>
            `;
            if (tier < 3) {
                const nextOpen = h.isTalentTierUnlocked(tier + 1);
                const arrowCol = nextOpen ? '#ffd700' : '#5c4028';
                wowTreeHtml += `
                    <div class="wow-connector-row" style="color:${arrowCol};">
                        <div></div><div>│<br>▼</div><div>│<br>▼</div>
                    </div>
                `;
            }
        }

        const selTalent = h.talents.find(t => t.id === ui.selectedTalentId) || h.talents[0];
        const canLearnSel = selTalent && !selTalent.unlocked && h.talentPts > 0 && h.isTalentTierUnlocked(selTalent.tier);
        let lockReason = '';
        if (selTalent && !selTalent.unlocked) {
            if (!h.isTalentTierUnlocked(selTalent.tier)) lockReason = `<span class="hl-red">(Нужен талант Тира ${selTalent.tier - 1})</span>`;
            else if (h.talentPts <= 0) lockReason = `<span style="color:#888;">(Нет очков талантов)</span>`;
        }

        const talentInspectorHtml = selTalent ? `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; width:100%;">
                <div style="flex:1;">
                    <b class="hl-gold">${selTalent.icon} ${selTalent.name}</b> ${lockReason}<br>
                    <span>${selTalent.desc}</span>
                </div>
                ${selTalent.unlocked
                    ? `<span class="hl-green" style="font-size:10px; white-space:nowrap;">✓ ИЗУЧЕНО</span>`
                    : `<button style="max-width:90px; padding:4px; font-size:10px;" onclick="unlockTalent('${h.id}', '${selTalent.id}')" ${!canLearnSel ? 'disabled' : ''}>Изучить</button>`
                }
            </div>
        ` : '';

        // 3. НИЖНЯЯ ПАНЕЛЬ СОСТОЯНИЯ: ТРАВМЫ, ДЕБАФФЫ И ПАССИВКИ
        const passiveInfo = h.getPassiveInfo();
        let statusBadgesHtml = `
            <div class="status-badge passive" onclick="selectHeroStatusBadge('${h.id}', 'passive')">
                ${passiveInfo.title}
            </div>
        `;

        if (h.injuries.length === 0) {
            statusBadgesHtml += `
                <div class="status-badge healthy" onclick="selectHeroStatusBadge('${h.id}', 'healthy')">
                    ✓ Здоров (Травм и дебаффов нет)
                </div>
            `;
        } else {
            h.injuries.forEach((inj, idx) => {
                statusBadgesHtml += `
                    <div class="status-badge debuff" onclick="selectHeroStatusBadge('${h.id}', 'inj_${idx}')">
                        🩸 Травма: ${inj}
                    </div>
                `;
            });
        }

        let statusDescHtml = '';
        if (ui.selectedStatusKey === 'passive') {
            statusDescHtml = `<span class="hl-gold">${passiveInfo.title}:</span> ${passiveInfo.desc}`;
        } else if (ui.selectedStatusKey === 'healthy') {
            statusDescHtml = `<span class="hl-green">Боец полностью здоров:</span> штрафов к характеристикам нет, готов к походу.`;
        } else if (ui.selectedStatusKey && ui.selectedStatusKey.startsWith('inj_')) {
            const iIdx = parseInt(ui.selectedStatusKey.split('_')[1], 10);
            const inj = h.injuries[iIdx] || h.injuries[0];
            statusDescHtml = getInjuryDescription(inj || 'Боевая травма');
        }

        this.modalContent.innerHTML = `
            <div class="modal-header" style="margin-bottom:4px;">
                <span>⚔️ ${h.name} — ${h.cls} (Ур.${h.lvl})</span>
                <button style="max-width:95px; padding:3px 6px; font-size:10px;" onclick="renderSquadListModal()">← Назад</button>
            </div>

            <div class="grid-2col">
                <div class="panel-sec">
                    <h4>
                        <span>🎽 ЭКИПИРОВКА, СТАТЫ И НАВЫКИ</span>
                        <span style="font-size:9px; color:#b58c5e; font-weight:normal;">(Выбери ячейку или навык)</span>
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

                    <div style="font-size:10px; color:#ffd700; margin-bottom:3px; font-weight:bold;">⚡ СПОСОБНОСТИ ГЕРОЯ (Нажми для описания):</div>
                    <div class="skill-grid">${skillCellsHtml}</div>

                    <div class="inspector-box">${leftInspectorHtml}</div>
                </div>

                <div class="panel-sec" style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <h4>
                            <span>🌟 ДЕРЕВО ТАЛАНТОВ</span>
                            <span>Очков: <b class="hl-gold">${h.talentPts}</b></span>
                        </h4>
                        <div style="display:grid; grid-template-columns:38px 1fr 1fr; gap:8px; font-size:9px; color:#b58c5e; text-align:center; margin-bottom:3px;">
                            <div></div><div>⚔️ Ветка Натиска</div><div>🛡️ Ветка Защиты</div>
                        </div>
                        <div class="wow-tree">${wowTreeHtml}</div>
                    </div>
                    <div class="inspector-box" style="min-height:48px;">${talentInspectorHtml}</div>
                </div>
            </div>

            <div class="status-bottom-panel">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="color:#ffd700;">🩺 СОСТОЯНИЕ БОЙЦА (Травмы, Дебаффы и Пассивка):</b>
                    <span style="color:#9c8265; font-size:9px;">Нажмите на иконку эффекта для описания</span>
                </div>
                <div class="status-badges-row">${statusBadgesHtml}</div>
                <div style="margin-top:4px; padding-top:3px; border-top:1px dashed #4a3520; color:#dec8ad;">
                    ${statusDescHtml}
                </div>
            </div>
        `;

        CanvasRendererView.drawPaperDollFigure(h);
    }
}
