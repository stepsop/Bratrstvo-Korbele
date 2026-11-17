import { GameStateModel, MetalType } from '../models/GameStateModel';
import { GameDataCatalog } from '../models/GameDataCatalog';
import { EquipmentItem } from '../models/EquipmentItem';
import { CanvasRendererView } from './CanvasRendererView';
import { uiIcon } from './UiIconHelper';

/**
 * View-компонент диалоговых окон всех НПС Таверны (Хозяин, Палаты, Наемники, Вербовщик, Задания)
 */
export class GuildNpcModalView {
    private modalOverlay = document.getElementById('modal-overlay')!;
    private modalContent = document.getElementById('modal-content')!;

    private openOverlay(): void {
        this.modalOverlay.style.display = 'block';
    }

    public renderHostDialog(state: GameStateModel, speech: string): void {
        this.openOverlay();
        if (speech) {
            state.hostMenuState.speech = speech;
        }
        const activeSpeech = state.hostMenuState.speech || state.tavernTales[0];
        const tab = state.hostMenuState.activeTab;

        const navRowHtml = tab === 'hub'
            ? `
                <div class="host-treasury-row">
                    <span>${uiIcon('coins_stack', 'ui-icon-sm')} Казна гильдии: <b class="hl-gold">${state.gold} грошей</b></span>
                </div>
            `
            : `
                <div class="host-treasury-row">
                    <span>${uiIcon('coins_stack', 'ui-icon-sm')} Казна гильдии: <b class="hl-gold">${state.gold} грошей</b></span>
                    <div class="host-subnav-btns">
                        <button class="host-tab-btn ${tab === 'upgrades' ? 'active' : ''}" onclick="switchHostTab('upgrades')">${uiIcon('tavern', 'ui-icon-xs')} Улучшения для гильдии</button>
                        <button class="host-tab-btn ${tab === 'consumables' ? 'active' : ''}" onclick="switchHostTab('consumables')">${uiIcon('beer', 'ui-icon-xs')} Расходники</button>
                        <button class="host-tab-btn ${tab === 'armor' ? 'active' : ''}" onclick="switchHostTab('armor')">${uiIcon('shield_cross', 'ui-icon-xs')} Броня</button>
                        <button class="host-tab-btn back" onclick="switchHostTab('hub')">${uiIcon('arrow', 'ui-icon-xs')} В меню</button>
                    </div>
                </div>
            `;

        let bodyHtml = '';
        if (tab === 'hub') {
            bodyHtml = this.buildHostHubBody();
        } else if (tab === 'armor') {
            bodyHtml = this.buildHostArmorBody(state);
        } else if (tab === 'upgrades') {
            bodyHtml = this.buildHostUpgradesBody(state);
        } else {
            bodyHtml = this.buildHostConsumablesBody(state);
        }

        this.modalContent.innerHTML = `
            <div class="npc-dialog-box host-modal-wrapper">
                <div class="npc-header-flex">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>Хозяин таверны (с золотым зубом)</h3>
                        <div class="npc-quote-speech" onclick="openHostDialog()" title="Нажмите, чтобы услышать другую байку корчмаря" style="cursor:pointer;">${activeSpeech}</div>
                    </div>
                    <button class="quest-close-btn" onclick="closeSquadModal()">${uiIcon('close', 'ui-icon-xs')}</button>
                </div>
                ${navRowHtml}
                ${bodyHtml}
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('host');
    }

    private buildHostHubBody(): string {
        return `
            <div class="host-hub-center">
                <div class="host-hub-buttons-row">
                    <button class="host-hub-big-btn" onclick="switchHostTab('upgrades')">
                        <span class="host-hub-btn-icon">${uiIcon('tavern', 'ui-icon-2xl')}</span>
                        <span class="host-hub-btn-title">Улучшения для гильдии</span>
                        <span class="host-hub-btn-sub">Ветка прокачки таверны, казарм и палат</span>
                    </button>
                    <button class="host-hub-big-btn" onclick="switchHostTab('consumables')">
                        <span class="host-hub-btn-icon">${uiIcon('beer', 'ui-icon-2xl')}</span>
                        <span class="host-hub-btn-title">Расходники</span>
                        <span class="host-hub-btn-sub">Пенное пиво, аптечки и штурмовые бомбы</span>
                    </button>
                    <button class="host-hub-big-btn" onclick="switchHostTab('armor')">
                        <span class="host-hub-btn-icon">${uiIcon('shield_cross', 'ui-icon-2xl')}</span>
                        <span class="host-hub-btn-title">Броня</span>
                        <span class="host-hub-btn-sub">Доспехи, клинки и реликвии Богемии</span>
                    </button>
                </div>
            </div>
        `;
    }

    private buildHostArmorBody(state: GameStateModel): string {
        const items = state.hostArmorShop;
        const selected = items.find(x => x.id === state.hostMenuState.selectedArmorId) || items[0];

        const rarityLabels: Record<string, string> = {
            grey: 'Обычное (I)',
            green: 'Добротное (II)',
            blue: 'Редкое (III)',
            purple: 'Эпическое (IV)',
            gold: 'Легендарное (V)'
        };
        const slotLabels: Record<string, string> = {
            armor: 'Доспех',
            weapon: 'Оружие',
            trinket: 'Талисман'
        };
        const rating = 100 + selected.atk * 140 + selected.armor * 135 + selected.block * 25;
        const canBuy = !selected.purchased && state.gold >= selected.price;

        const gridCellsHtml = items.map(item => {
            const isSel = item.id === selected.id;
            return `
                <div class="host-armor-cell mastery-${item.rarity} ${isSel ? 'selected-cell' : ''} ${item.purchased ? 'purchased-cell' : ''}"
                     onclick="selectHostArmorItem('${item.id}')">
                    <div class="host-cell-top">
                        <span class="host-cell-icon">${uiIcon(item.icon, 'ui-icon-sm')}</span>
                        <span class="host-cell-price">${item.purchased ? `${uiIcon('check', 'ui-icon-xs')} В сумке` : `${item.price} гр.`}</span>
                    </div>
                    <div class="host-cell-name">${item.name}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="host-shop-frame">
                <div class="host-left-col">
                    <div class="host-image-box mastery-${selected.rarity}">
                        <div class="host-showcase-badge">${rarityLabels[selected.rarity] || 'Обычное'}</div>
                        <div class="host-showcase-center">
                            <div class="host-showcase-icon">${uiIcon(selected.icon, 'ui-icon-xl')}</div>
                            <div class="host-showcase-title">${selected.name}</div>
                        </div>
                        <div class="host-showcase-footer">
                            <button class="btn-rpg-gear host-buy-action-btn"
                                    onclick="buyHostArmorItem('${selected.id}')"
                                    ${!canBuy ? 'disabled' : ''}>
                                ${selected.purchased ? `${uiIcon('check', 'ui-icon-xs')} КУПЛЕНО В АРСЕНАЛ` : `${uiIcon('coins', 'ui-icon-xs')} КУПИТЬ В АРСЕНАЛ`}
                            </button>
                            <div class="host-price-corner">Цена: <span class="hl-gold">${selected.price} гр.</span></div>
                        </div>
                    </div>

                    <div class="host-stats-box">
                        <div class="host-stats-upper">
                            <div class="rpg-card-section-title">Характеристики и бонусы (как в осмотре героя)</div>
                            <div class="rpg-card-meta" style="margin-bottom:5px;">
                                <div>Качество: <span class="meta-val">${rarityLabels[selected.rarity]}</span> &nbsp;|&nbsp; Слот: <span class="meta-val">${slotLabels[selected.slot]}</span></div>
                                <div>Рейтинг снаряжения: <span class="meta-green">${rating}</span></div>
                            </div>
                            <div class="rpg-card-stats">
                                <div class="rpg-stat-line">Урон к атаке: <span class="${selected.atk > 0 ? 'stat-green' : 'stat-muted'}">+${selected.atk} ед.</span></div>
                                <div class="rpg-stat-line">Защита брони: <span class="${selected.armor > 0 ? 'stat-green' : 'stat-muted'}">+${selected.armor} ед.</span></div>
                                <div class="rpg-stat-line">Шанс блока: <span class="${selected.block > 0 ? 'stat-green' : 'stat-muted'}">+${selected.block}%</span></div>
                            </div>
                        </div>

                        <div class="host-lore-inner-box">
                            <div class="host-lore-desc">${selected.desc}</div>
                            <div class="host-lore-quote">${selected.loreQuote}</div>
                        </div>
                    </div>
                </div>

                <div class="host-right-col">
                    <div class="host-armor-grid">
                        ${gridCellsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    private buildHostUpgradesBody(state: GameStateModel): string {
        const upgrades = state.tavernUpgrades;
        const selected = upgrades.find(u => u.id === state.hostMenuState.selectedUpgradeId) || upgrades[0];

        const isPrevTierUnlocked = selected.tier === 1 || upgrades.some(
            u => u.branch === selected.branch && u.tier === selected.tier - 1 && u.unlocked
        );
        const canUnlock = !selected.unlocked && isPrevTierUnlocked && state.gold >= selected.price;

        let btnText = `${uiIcon('smith_hammer', 'ui-icon-xs')} УЛУЧШИТЬ ТАВЕРНУ`;
        if (selected.unlocked) btnText = `${uiIcon('check', 'ui-icon-xs')} УЖЕ ПОСТРОЕНО`;
        else if (!isPrevTierUnlocked) btnText = `${uiIcon('lock', 'ui-icon-xs')} НУЖНА СТУПЕНЬ ${selected.tier - 1}`;

        const statRowsHtml = selected.statLines.map(line => `
            <div class="rpg-stat-line"><span class="stat-green">✦ ${line}</span></div>
        `).join('');

        // Строим сетку дерева таверны (5 веток по 4 ступени)
        const tiers = [1, 2, 3, 4] as const;
        const branches = [1, 2, 3, 4, 5] as const;
        const treeRowsHtml = tiers.map(tier => {
            const colsHtml = branches.map(branch => {
                const node = upgrades.find(u => u.branch === branch && u.tier === tier)!;
                const prevOk = tier === 1 || upgrades.some(u => u.branch === branch && u.tier === tier - 1 && u.unlocked);
                const isSel = node.id === selected.id;
                const stateCls = node.unlocked ? 'upg-unlocked' : (prevOk ? 'upg-available' : 'upg-locked');
                const branchCls = branch === 4 ? 'upg-branch-forge' : (branch === 5 ? 'upg-branch-dark' : '');

                return `
                    <div class="host-upgrade-node ${stateCls} ${branchCls} ${isSel ? 'selected-node' : ''}"
                         onclick="selectHostUpgrade('${node.id}')">
                        <div class="host-upg-node-icon">${uiIcon(node.icon, 'ui-icon-md')}</div>
                        <div class="host-upg-node-info">
                            <div class="host-upg-node-title">${node.name}</div>
                            <div class="host-upg-node-meta">${node.unlocked ? `${uiIcon('check', 'ui-icon-xs')} Открыто` : `${node.price} гр.`}</div>
                        </div>
                        <div class="host-upg-node-tier">T${node.tier}</div>
                    </div>
                `;
            }).join('');

            const connectorHtml = tier < 4 ? `
                <div class="host-upg-connectors">
                    <div>▼</div><div>▼</div><div>▼</div><div>▼</div><div>▼</div>
                </div>
            ` : '';

            return `
                <div class="host-upg-tier-row">${colsHtml}</div>
                ${connectorHtml}
            `;
        }).join('');

        return `
            <div class="host-shop-frame host-upgrades-frame">
                <div class="host-left-col">
                    <div class="host-image-box host-upgrade-showcase">
                        <div class="host-showcase-badge">${selected.branchTitle} • Ступень ${selected.tier}</div>
                        <div class="host-showcase-center">
                            <div class="host-showcase-icon">${uiIcon(selected.icon, 'ui-icon-xl')}</div>
                            <div class="host-showcase-title">${selected.name}</div>
                        </div>
                        <div class="host-showcase-footer">
                            <button class="btn-rpg-gear host-buy-action-btn"
                                    onclick="buyTavernUpgrade('${selected.id}')"
                                    ${!canUnlock ? 'disabled' : ''}>
                                ${btnText}
                            </button>
                            <div class="host-price-corner">Цена: <span class="hl-gold">${selected.price} гр.</span></div>
                        </div>
                    </div>

                    <div class="host-stats-box">
                        <div class="host-stats-upper">
                            <div class="rpg-card-section-title">Что дает улучшение гильдии</div>
                            <div class="rpg-card-stats">
                                ${statRowsHtml}
                            </div>
                        </div>

                        <div class="host-lore-inner-box">
                            <div class="host-lore-desc">${selected.desc}</div>
                            <div class="host-lore-quote">${selected.loreQuote}</div>
                        </div>
                    </div>
                </div>

                <div class="host-right-col host-upgrades-right-col">
                    <div class="host-upg-tree-scroll">
                        <div class="host-upg-branch-headers">
                            <span>I. Казармы</span>
                            <span>II. Погреба</span>
                            <span>III. Лазарет</span>
                            <span class="hdr-forge">IV. Кузница</span>
                            <span class="hdr-dark">V. Тёмное братство</span>
                        </div>
                        <div class="host-upg-tree-wrap">
                            ${treeRowsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private buildHostConsumablesBody(state: GameStateModel): string {
        const list = state.hostConsumables;
        const selected = list.find(c => c.id === state.hostMenuState.selectedConsumableId) || list[0];

        const getEffectivePrice = (id: 'beer' | 'medkit' | 'pot', base: number): number => {
            if (id === 'beer' && state.tavernUpgrades.some(u => u.id === 'upg_b2_t1' && u.unlocked)) return Math.max(5, base - 2);
            if (id === 'medkit' && state.tavernUpgrades.some(u => u.id === 'upg_b3_t1' && u.unlocked)) return Math.max(10, base - 3);
            if (id === 'pot' && state.tavernUpgrades.some(u => u.id === 'upg_b2_t3' && u.unlocked)) return Math.max(15, base - 5);
            return base;
        };

        const getStockCount = (id: 'beer' | 'medkit' | 'pot'): number => {
            if (id === 'beer') return state.beer;
            if (id === 'medkit') return state.medkits;
            return state.pots;
        };

        const selPrice = getEffectivePrice(selected.id, selected.price);
        const selStock = getStockCount(selected.id);
        const canBuy = state.gold >= selPrice;

        const statRowsHtml = selected.statLines.map(line => `
            <div class="rpg-stat-line"><span class="stat-green">• ${line}</span></div>
        `).join('');

        const cardsHtml = list.map(c => {
            const isSel = c.id === selected.id;
            const curPrice = getEffectivePrice(c.id, c.price);
            const curStock = getStockCount(c.id);
            return `
                <div class="host-consumable-row-card ${isSel ? 'selected-node' : ''}"
                     onclick="selectHostConsumable('${c.id}')">
                    <div class="host-cons-icon">${uiIcon(c.icon, 'ui-icon-lg')}</div>
                    <div class="host-cons-main">
                        <div class="host-cons-name">${c.name}</div>
                        <div class="host-cons-effect">${c.effectTitle}</div>
                    </div>
                    <div class="host-cons-right">
                        <div class="host-cons-price">${curPrice} гр.</div>
                        <div class="host-cons-stock">В сумке: <b>${curStock}</b></div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="host-shop-frame">
                <div class="host-left-col">
                    <div class="host-image-box host-upgrade-showcase">
                        <div class="host-showcase-badge">В запасе отряда: ${selStock} шт.</div>
                        <div class="host-showcase-center">
                            <div class="host-showcase-icon">${uiIcon(selected.icon, 'ui-icon-xl')}</div>
                            <div class="host-showcase-title">${selected.name}</div>
                        </div>
                        <div class="host-showcase-footer">
                            <button class="btn-rpg-gear host-buy-action-btn"
                                    onclick="buyShopItem('${selected.id}')"
                                    ${!canBuy ? 'disabled' : ''}>
                                ${uiIcon('coins', 'ui-icon-xs')} КУПИТЬ РАСХОДНИК (+1)
                            </button>
                            <div class="host-price-corner">Цена: <span class="hl-gold">${selPrice} гр.</span></div>
                        </div>
                    </div>

                    <div class="host-stats-box">
                        <div class="host-stats-upper">
                            <div class="rpg-card-section-title">${selected.effectTitle}</div>
                            <div class="rpg-card-stats">
                                ${statRowsHtml}
                            </div>
                        </div>

                        <div class="host-lore-inner-box">
                            <div class="host-lore-desc">${selected.desc}</div>
                            <div class="host-lore-quote">${selected.loreQuote}</div>
                        </div>
                    </div>
                </div>

                <div class="host-right-col host-consumables-right">
                    <div class="rpg-card-section-title" style="margin-bottom:6px;">Припасы в дорогу</div>
                    <div class="host-consumables-list">
                        ${cardsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    public renderClinicDialog(state: GameStateModel): void {
        this.openOverlay();
        const alive = state.party.filter(h => h.status !== 'dead');
        const useGrid = alive.length > 4 ? 'hero-grid' : '';

        const heroCards = state.party.map((h, idx) => {
            if (h.status === 'dead') return '';
            const hpDeficit = h.maxHp - h.hp;
            const injCount = h.injuries.length;
            const isAtClinic = h.status === 'clinic';

            const statusText = isAtClinic
                ? `<span class="hl-gold">${uiIcon('heal_cross', 'ui-icon-xs')} В палатах (${h.timer} ц.)</span>`
                : (hpDeficit === 0 && injCount === 0
                    ? `<span class="hl-green">${uiIcon('check', 'ui-icon-xs')} Здоров</span>`
                    : `${hpDeficit > 0 ? `Ранен (-${hpDeficit} HP) ` : ''}${injCount > 0 ? `<span class="hl-red">${h.injuries.join(', ')}</span>` : ''}`);

            const healHpBtn = (!isAtClinic && hpDeficit > 0)
                ? `<button style="font-size:10px; padding:4px 6px; max-width:130px;" onclick="treatHeroInClinic(${idx}, 'hp')" ${state.gold < 10 || h.status !== 'ready' ? 'disabled' : ''}>${uiIcon('heart_heal', 'ui-icon-xs')} HP [10гр | 1ц]</button>`
                : '';

            const healInjBtn = (!isAtClinic && injCount > 0)
                ? `<button style="font-size:10px; padding:4px 6px; max-width:155px;" onclick="treatHeroInClinic(${idx}, 'injuries')" ${state.gold < 15 * injCount || h.status !== 'ready' ? 'disabled' : ''}>${uiIcon('potion_green', 'ui-icon-xs')} Травмы [${15 * injCount}гр | ${1 + injCount}ц]</button>`
                : '';

            return `
                <div class="hero-card-row" style="margin-bottom:${useGrid ? '0' : '4px'};">
                    <div style="flex:1;">
                        <b class="hl-gold">${h.name}</b> (${h.cls}) | HP: <b>${h.hp}/${h.maxHp}</b><br>
                        ${statusText}
                    </div>
                    <div style="display:flex; gap:4px;">
                        ${healHpBtn}
                        ${healInjBtn}
                    </div>
                </div>
            `;
        }).join('');

        this.modalContent.innerHTML = `
            <div class="npc-dialog-box">
                <div class="npc-header-flex">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>Палаты врачебные — Сестра Берта (Казна: ${state.gold} гр.)</h3>
                        <div class="npc-quote-speech">«Перевязка HP — 10 гр. (1 цикл). Снятие травм — 15 гр. за травму (1 + травмы циклов).»</div>
                    </div>
                    <button class="quest-close-btn" onclick="closeSquadModal()">${uiIcon('close', 'ui-icon-xs')}</button>
                </div>
                <div class="${useGrid}">${heroCards}</div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('clinic');
    }

    public renderMercsDialog(state: GameStateModel): void {
        this.openOverlay();
        const totalAlive = state.party.filter(h => h.status !== 'dead').length;
        const maxTotal = state.squadMax + state.reserveMax;
        const defaultColors = ['grey', 'green', 'blue', 'purple'];

        const columnsHtml: string[] = [];
        for (let i = 0; i < 4; i++) {
            const m = state.mercsForHire[i];
            if (m) {
                const mastery = m.getMasteryTier();
                const canHire = state.gold >= m.price && totalAlive < maxTotal;

                // Состояние показываем только если есть травмы или неполное ХП
                const hasWounds = m.injuries.length > 0;
                const isLowHp = m.hp < m.maxHp;
                const stateParts: string[] = [];
                if (hasWounds) stateParts.push(m.injuries.join(', '));
                if (isLowHp) stateParts.push(`ХП ${m.hp}/${m.maxHp}`);
                const stateLineHtml = stateParts.length > 0
                    ? `<div class="mercs-info-line">Состояние: ${stateParts.join(' | ')}</div>`
                    : '';

                // Своя амуниция
                const gearItems: string[] = [];
                (['weapon', 'armor', 'trinket'] as const).forEach(slot => {
                    const eq = m.equipObj[slot];
                    if (eq && (eq.atk + eq.armor + eq.block > 0)) {
                        const statParts: string[] = [];
                        if (eq.atk > 0) statParts.push(`+${eq.atk} Ур`);
                        if (eq.armor > 0) statParts.push(`+${eq.armor} Бр`);
                        if (eq.block > 0) statParts.push(`+${eq.block}% Блок`);
                        gearItems.push(`${eq.name} (${statParts.join(', ')})`);
                    }
                });
                const gearHtml = gearItems.length > 0
                    ? `<div class="mercs-info-line">Амуниция своя: ${gearItems.join(', ')}</div>`
                    : '';

                // Особенности (пассивка + открытые таланты)
                const unlockedTalents = m.talents.filter(t => t.unlocked).map(t => t.name);
                const passiveInfo = m.getPassiveInfo();
                const featParts: string[] = [];
                if (passiveInfo && passiveInfo.title) featParts.push(`${uiIcon(passiveInfo.icon, 'ui-icon-xs')} ${passiveInfo.title}`);
                if (unlockedTalents.length > 0) featParts.push(`Таланты: ${unlockedTalents.join(', ')}`);

                columnsHtml.push(`
                    <div class="mercs-column-card mastery-${mastery.key}">
                        <div class="mercs-info-block">
                            <div class="mercs-info-title">${m.name} / ${m.cls} (Ур.${m.lvl})</div>
                            ${stateLineHtml}
                            ${gearHtml}
                            <div class="mercs-info-line">Особенности: ${featParts.join(' • ')}</div>
                        </div>

                        <div class="mercs-price-block">
                            Цена: ${m.price} гр.
                        </div>

                        <button class="mercs-hire-btn" onclick="hireMercenary(${i})" ${!canHire ? 'disabled' : ''}>
                            <span>Нанять</span>
                        </button>
                    </div>
                `);
            } else {
                const fallbackColor = defaultColors[i] || 'grey';
                columnsHtml.push(`
                    <div class="mercs-column-card mastery-${fallbackColor} mercs-column-empty">
                        <div class="mercs-info-block">
                            <div class="mercs-info-title">Место пустует</div>
                            <div class="mercs-info-line">Наемник уже в вашем отряде</div>
                        </div>
                        <div class="mercs-price-block">—</div>
                        <button class="mercs-hire-btn" disabled>
                            <span>Нанят</span>
                        </button>
                    </div>
                `);
            }
        }

        const jokeText = state.currentMercJoke || '«За кружкой пива и гусит не страшен, пока гроши звенят в кошеле!»';

        this.modalContent.innerHTML = `
            <div class="mercs-board-wrapper">
                <div class="mercs-top-header">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="mercs-header-center">
                        <div class="mercs-header-title">Стол наемников (Казна: ${state.gold} гр.)</div>
                        <div class="mercs-header-joke">«${jokeText}»</div>
                    </div>
                    <button class="quest-close-btn" onclick="closeSquadModal()">${uiIcon('close', 'ui-icon-xs')}</button>
                </div>

                <div class="mercs-columns-grid">
                    ${columnsHtml.join('')}
                </div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('mercs');
    }

    public renderVerbirzDialog(state: GameStateModel): void {
        this.openOverlay();

        // Очищаем невалидные ID из слотов кампаний
        const allAssignedIds = new Set<string>();
        state.warCampaigns.forEach(c => {
            if (!c.assignedHeroIds) c.assignedHeroIds = [];
            c.assignedHeroIds = c.assignedHeroIds.filter(id => {
                const h = state.party.find(x => x.id === id);
                return h && h.status === 'ready' && h.hp > 0;
            });
            c.assignedHeroIds.forEach(id => allAssignedIds.add(id));
        });

        const campaignsHtml = state.warCampaigns.slice(0, 4).map((c, campIdx) => {
            const colColor = c.colorKey || 'grey';
            const assignedIds = c.assignedHeroIds || [];
            const activeWarHeroes = state.party.filter(h => h.status === 'war' && h.warContract?.name === c.name);

            const slotsHtml: string[] = [];
            for (let sIdx = 0; sIdx < c.needHeroes; sIdx++) {
                const heroId = assignedIds[sIdx];
                const assignedHero = heroId ? state.party.find(h => h.id === heroId) : undefined;
                if (assignedHero) {
                    const hTier = assignedHero.getMasteryTier();
                    const hasWounds = assignedHero.injuries.length > 0;
                    const isLowHp = assignedHero.hp < assignedHero.maxHp;
                    const subParts: string[] = [];
                    if (hasWounds) subParts.push(`${uiIcon('blood', 'ui-icon-xs')} ${assignedHero.injuries.join(', ')}`);
                    if (isLowHp) subParts.push(`ХП ${assignedHero.hp}/${assignedHero.maxHp}`);
                    const line2Html = subParts.length > 0
                        ? `<div class="concept-reserve-line2">\\ ${subParts.join(' • ')}</div>`
                        : '';

                    slotsHtml.push(`
                        <div class="verbirz-slot-rect occupied mastery-${hTier.key}"
                             draggable="true"
                             data-hero-id="${assignedHero.id}"
                             data-camp-idx="${campIdx}"
                             data-slot-idx="${sIdx}"
                             onclick="removeHeroFromWarSlot('${assignedHero.id}')"
                             title="Нажмите или перетащите обратно в резерв">
                            <div class="concept-reserve-text">
                                <div class="concept-reserve-line1">${assignedHero.name} \\ ${assignedHero.cls} (Ур.${assignedHero.lvl})</div>
                                ${line2Html}
                            </div>
                        </div>
                    `);
                } else {
                    slotsHtml.push(`
                        <div class="verbirz-slot-rect empty-reserve-slot"
                             data-camp-idx="${campIdx}"
                             data-slot-idx="${sIdx}"></div>
                    `);
                }
            }

            const canDispatch = assignedIds.length === c.needHeroes;
            const dispatchBtnHtml = canDispatch
                ? `<button class="verbirz-dispatch-btn" onclick="dispatchHeroesToWar(${campIdx})">${uiIcon('flag', 'ui-icon-xs')} Отправить (${assignedIds.length}/${c.needHeroes})</button>`
                : '';

            const activeWarHtml = activeWarHeroes.length > 0
                ? `<div class="verbirz-active-war">${uiIcon('crossed_swords', 'ui-icon-xs')} В походе: ${activeWarHeroes.map(h => `${h.name} (${h.timer} ц.)`).join(', ')}</div>`
                : '';

            return `
                <div class="verbirz-column-card mastery-${colColor}">
                    <div class="verbirz-circle-badge mastery-${colColor}">
                        <div class="verbirz-circle-title">${c.name}</div>
                        <div class="verbirz-circle-sub">${uiIcon('hourglass', 'ui-icon-xs')} ${c.cycles} ц.</div>
                    </div>

                    <div class="verbirz-info-frame">
                        <div class="verbirz-info-box">
                            <div>Заработают: ${c.goldMin}–${c.goldMax} гр.</div>
                            <div>Смерть: ${c.deathChance}% / Травма: ${c.injuryChance}%</div>
                            <div>Доп. награды: ${c.extraRewardText || 'Нет'}</div>
                            <div>Класс: ${c.reqClass || 'Любой класс'}</div>
                        </div>
                    </div>

                    <div class="verbirz-black-box">
                        <div class="verbirz-slots-row ${c.needHeroes > 1 ? 'multi-slots' : 'single-slot'}">
                            ${slotsHtml.join('')}
                        </div>
                        ${dispatchBtnHtml}
                        ${activeWarHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Нижняя сетка 6x2 (12 слотов) как в меню Отряда
        const poolHeroes = state.party.filter(h => h.status !== 'dead' && !allAssignedIds.has(h.id));
        const poolSlotsHtml: string[] = [];
        const totalPoolSlots = 12;

        for (let i = 0; i < totalPoolSlots; i++) {
            const h = poolHeroes[i];
            if (h) {
                const mastery = h.getMasteryTier();
                const isReady = h.status === 'ready' && h.hp > 0;
                const hasWounds = h.injuries.length > 0;
                const isLowHp = h.hp < h.maxHp;

                const parts: string[] = [];
                if (hasWounds) parts.push(`${uiIcon('blood', 'ui-icon-xs')} ${h.injuries.join(', ')}`);
                if (h.status !== 'ready') {
                    parts.push(h.status === 'war' ? `Война (${h.timer}ц)` : `Палаты (${h.timer}ц)`);
                }
                if (isLowHp || h.status !== 'ready') {
                    parts.push(`ХП ${h.hp}/${h.maxHp}`);
                }
                const line2Html = parts.length > 0
                    ? `<div class="concept-reserve-line2">\\ ${parts.join(' • ')}</div>`
                    : '';

                poolSlotsHtml.push(`
                    <div class="verbirz-pool-card concept-reserve-card mastery-${mastery.key} ${!isReady ? 'verbirz-pool-busy' : ''}"
                         ${isReady ? `draggable="true" data-hero-id="${h.id}"` : ''}
                         title="${isReady ? 'Перетащите бойца в слот кампании выше' : 'Боец сейчас недоступен для похода'}">
                        <div class="concept-reserve-text">
                            <div class="concept-reserve-line1">${h.name} \\ ${h.cls} (Ур.${h.lvl})</div>
                            ${line2Html}
                        </div>
                    </div>
                `);
            } else {
                poolSlotsHtml.push(`
                    <div class="verbirz-pool-card concept-reserve-card empty-reserve-slot"></div>
                `);
            }
        }

        this.modalContent.innerHTML = `
            <div class="verbirz-board-wrapper">
                <div class="npc-header-flex verbirz-top-header">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>Королевский Вербовщик (Вербирж)</h3>
                        <div class="npc-quote-speech">«Выбирай кампанию, оценивай риск и отправляй бойцов за королевским серебром!»</div>
                    </div>
                    <button class="quest-close-btn" onclick="closeSquadModal()">${uiIcon('close', 'ui-icon-xs')}</button>
                </div>

                <div class="verbirz-campaigns-grid">
                    ${campaignsHtml}
                </div>

                <div class="verbirz-pool-container">
                    <div class="verbirz-pool-grid">
                        ${poolSlotsHtml.join('')}
                    </div>
                </div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('verbirz');
        this.bindVerbirzDragAndDrop();
    }

    private bindVerbirzDragAndDrop(): void {
        const w = window as unknown as Record<string, (a?: unknown, b?: unknown, c?: unknown) => void>;
        const draggables = this.modalContent.querySelectorAll<HTMLElement>('.verbirz-pool-card[data-hero-id], .verbirz-slot-rect[data-hero-id]');
        const dropSlots = this.modalContent.querySelectorAll<HTMLElement>('.verbirz-slot-rect');
        const poolContainer = this.modalContent.querySelector<HTMLElement>('.verbirz-pool-container');

        let draggedHeroId: string | null = null;
        let touchGhost: HTMLElement | null = null;

        const clearHighlights = () => {
            dropSlots.forEach(s => s.classList.remove('drop-target-hover'));
            poolContainer?.classList.remove('drop-target-hover');
            draggables.forEach(d => d.classList.remove('dragging-card'));
        };

        const removeGhost = () => {
            if (touchGhost && touchGhost.parentNode) {
                touchGhost.parentNode.removeChild(touchGhost);
            }
            touchGhost = null;
        };

        draggables.forEach(card => {
            const heroId = card.getAttribute('data-hero-id');
            if (!heroId) return;

            card.addEventListener('dragstart', (e: DragEvent) => {
                draggedHeroId = heroId;
                card.classList.add('dragging-card');
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', heroId);
                }
            });

            card.addEventListener('dragend', () => {
                draggedHeroId = null;
                clearHighlights();
            });

            // Mobile Touch Drag & Drop
            card.addEventListener('touchstart', (e: TouchEvent) => {
                if (e.touches.length !== 1) return;
                const touch = e.touches[0];
                draggedHeroId = heroId;
                card.classList.add('dragging-card');

                removeGhost();
                touchGhost = document.createElement('div');
                touchGhost.className = 'touch-drag-ghost';
                touchGhost.textContent = card.textContent?.trim().slice(0, 26) || 'Боец';
                touchGhost.style.left = `${touch.clientX}px`;
                touchGhost.style.top = `${touch.clientY}px`;
                document.body.appendChild(touchGhost);
            }, { passive: true });

            card.addEventListener('touchmove', (e: TouchEvent) => {
                if (!draggedHeroId || !touchGhost) return;
                e.preventDefault();
                const touch = e.touches[0];
                touchGhost.style.left = `${touch.clientX}px`;
                touchGhost.style.top = `${touch.clientY}px`;

                dropSlots.forEach(s => s.classList.remove('drop-target-hover'));
                poolContainer?.classList.remove('drop-target-hover');

                const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                const slotBelow = elemBelow?.closest<HTMLElement>('.verbirz-slot-rect');
                if (slotBelow) {
                    slotBelow.classList.add('drop-target-hover');
                } else if (elemBelow?.closest('.verbirz-pool-container')) {
                    poolContainer?.classList.add('drop-target-hover');
                }
            }, { passive: false });

            card.addEventListener('touchend', (e: TouchEvent) => {
                if (!draggedHeroId) return;
                const activeHeroId = draggedHeroId;
                draggedHeroId = null;
                removeGhost();

                const touch = e.changedTouches[0];
                const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                const slotBelow = elemBelow?.closest<HTMLElement>('.verbirz-slot-rect');
                const poolBelow = elemBelow?.closest<HTMLElement>('.verbirz-pool-container');

                clearHighlights();

                if (slotBelow) {
                    const campIdx = Number(slotBelow.getAttribute('data-camp-idx'));
                    const slotIdx = Number(slotBelow.getAttribute('data-slot-idx'));
                    if (!Number.isNaN(campIdx) && !Number.isNaN(slotIdx) && typeof w.assignHeroToWarSlot === 'function') {
                        w.assignHeroToWarSlot(activeHeroId, campIdx, slotIdx);
                    }
                } else if (poolBelow && card.classList.contains('verbirz-slot-rect')) {
                    if (typeof w.removeHeroFromWarSlot === 'function') {
                        w.removeHeroFromWarSlot(activeHeroId);
                    }
                }
            });
        });

        dropSlots.forEach(slot => {
            slot.addEventListener('dragover', (e: DragEvent) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                slot.classList.add('drop-target-hover');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drop-target-hover');
            });

            slot.addEventListener('drop', (e: DragEvent) => {
                e.preventDefault();
                slot.classList.remove('drop-target-hover');
                const heroId = draggedHeroId || e.dataTransfer?.getData('text/plain');
                if (!heroId) return;
                const campIdx = Number(slot.getAttribute('data-camp-idx'));
                const slotIdx = Number(slot.getAttribute('data-slot-idx'));
                if (!Number.isNaN(campIdx) && !Number.isNaN(slotIdx) && typeof w.assignHeroToWarSlot === 'function') {
                    w.assignHeroToWarSlot(heroId, campIdx, slotIdx);
                }
            });
        });

        if (poolContainer) {
            poolContainer.addEventListener('dragover', (e: DragEvent) => {
                e.preventDefault();
                poolContainer.classList.add('drop-target-hover');
            });
            poolContainer.addEventListener('dragleave', () => {
                poolContainer.classList.remove('drop-target-hover');
            });
            poolContainer.addEventListener('drop', (e: DragEvent) => {
                e.preventDefault();
                poolContainer.classList.remove('drop-target-hover');
                const heroId = draggedHeroId || e.dataTransfer?.getData('text/plain');
                if (heroId && typeof w.removeHeroFromWarSlot === 'function') {
                    w.removeHeroFromWarSlot(heroId);
                }
            });
        }
    }

    public renderQuestsDialog(state: GameStateModel): void {
        this.openOverlay();
        if (!state.dailyQuests || state.dailyQuests.length === 0) {
            state.generateDailyQuests();
        }

        const readySquadHeroes = state.party.filter(h => h.inSquad && h.status === 'ready' && h.hp > 0);
        const squadNames = readySquadHeroes.map(h => h.name).join(', ') || 'Никого нет в строю (соберите отряд в меню ОТРЯД)';

        const questColumnsHtml = state.dailyQuests.map(q => {
            const riskInfo = state.calculateQuestSuccessChance(q);

            return `
                <div class="quest-column-card">
                    <div class="quest-circle-badge quest-diff-${q.difficulty}">
                        <div class="quest-circle-title">${q.title}</div>
                        <div class="quest-circle-img">${uiIcon(q.icon, 'ui-icon-xl')}</div>
                    </div>

                    <div class="quest-bullet-list">
                        <div class="quest-bullet-item">
                            <b>- Награда по деньгам:</b> <span class="hl-gold">${q.goldReward} грошей</span>
                        </div>
                        <div class="quest-bullet-item">
                            <b>- Опыт за выполнение:</b> <span class="hl-green">+${q.expReward} опыта каждому</span>
                        </div>
                        <div class="quest-bullet-item">
                            <b>- Риски для отряда:</b> <span class="${riskInfo.riskClass}">${riskInfo.riskLabel}</span>
                        </div>
                        <div class="quest-bullet-item">
                            <b>- Доп. условие:</b> <span>${q.condition}</span>
                        </div>
                        <div class="quest-bullet-item">
                            <b>- Описание задания:</b> <span>${q.desc}</span>
                        </div>
                        <div class="quest-bullet-item">
                            <b>- Где находится:</b> <span class="hl-gold">${q.location}</span>
                        </div>
                    </div>

                    <button class="quest-take-btn" onclick="closeSquadModal(); startQuest('${q.id}');" ${readySquadHeroes.length === 0 ? 'disabled' : ''}>
                        ${uiIcon('crossed_swords', 'ui-icon-xs')} ВЫБРАТЬ ЗАДАНИЕ
                    </button>
                </div>
            `;
        }).join('');

        this.modalContent.innerHTML = `
            <div class="quest-board-wrapper">
                <div class="quest-board-top-bar">
                    <div class="quest-board-img-box">
                        <canvas id="npc-avatar" width="48" height="48"></canvas>
                    </div>
                    <div class="quest-board-title-area">
                        <div class="quest-board-main-title">Доска объявлений (День ${state.cycle})</div>
                        <div class="quest-board-sub-squad">Текущий отряд (${readySquadHeroes.length}/${state.squadMax}): <b>${squadNames}</b></div>
                    </div>
                    <div class="quest-board-actions">
                        <button class="quest-squad-btn" onclick="openSquadModal()">${uiIcon('shield_cross', 'ui-icon-xs')} Меню отряда</button>
                        <button class="quest-close-btn" onclick="closeSquadModal()">${uiIcon('close', 'ui-icon-xs')}</button>
                    </div>
                </div>

                <div class="quest-board-grid">
                    ${questColumnsHtml}
                </div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('quests');
    }

    public renderBattleSummaryModal(state: GameStateModel): void {
        this.openOverlay();
        const rep = state.expeditionReport;
        const isVictory = rep.outcome === 'victory';

        const squadIds = Object.keys(rep.heroStartStates);
        const participants = squadIds.length > 0
            ? state.party.filter(h => squadIds.includes(h.id))
            : state.party.filter(h => h.inSquad && h.status !== 'dead');

        const woundedHeroes = participants.filter(h => h.injuries.length > 0);

        const useGrid = participants.length > 3 ? 'hero-grid' : '';
        const participantRows = participants.map(h => {
            const startState = rep.heroStartStates[h.id];
            const newInjuries = startState
                ? h.injuries.filter(inj => !startState.startInjuries.includes(inj))
                : h.injuries;
            const hasInjuries = h.injuries.length > 0;

            const woundStatusHtml = hasInjuries
                ? `<span class="hl-red">${uiIcon('alert', 'ui-icon-xs')} Травма: ${h.injuries.join(', ')}${newInjuries.length > 0 ? ' (новая!)' : ''}</span>`
                : `<span class="hl-green">${uiIcon('check', 'ui-icon-xs')} Здоров (HP восполнено)</span>`;

            return `
                <div class="hero-card-row" style="margin-bottom:${useGrid ? '0' : '3px'}; border-color:${hasInjuries ? '#a63a3a' : '#6b4c30'};">
                    <div style="flex:1;">
                        <b class="hl-gold">${h.name}</b> (${h.cls}, Ур.${h.lvl}) | HP: <b class="hl-green">${h.hp}/${h.maxHp}</b>
                    </div>
                    <div style="text-align:right; font-size:10px;">
                        ${woundStatusHtml}
                    </div>
                </div>
            `;
        }).join('');

        const resolvedLootObjects: EquipmentItem[] = rep.lootItems.map((rawLabel, idx) => {
            if (rep.lootObjects && rep.lootObjects[idx]) {
                return rep.lootObjects[idx];
            }
            const parsed = EquipmentItem.fromLegacyString(rawLabel, 'weapon');
            if (parsed) {
                if (parsed.atk > 0 && parsed.block === 0 && parsed.name.includes('клевец')) {
                    parsed.block = 5;
                    parsed.desc = 'Тяжелый боевой клевец чашников. Пробивает доспехи: даёт +2 к урону и +5% к шансу блока.';
                }
                return parsed;
            }
            return new EquipmentItem(rawLabel, 'weapon', 2, 0, 5);
        });

        const extras: string[] = [];
        if (rep.lootItems.length > 0) {
            const lootChips = rep.lootItems.map((itemLabel, idx) => {
                const isSelected = rep.selectedLootIndex === idx;
                return `<b class="hl-gold loot-trophy-item ${isSelected ? 'active' : ''}" onclick="inspectBattleLoot(${idx})" title="Нажмите, чтобы посмотреть характеристики трофея">${uiIcon('search', 'ui-icon-xs')} ${itemLabel}</b>`;
            }).join(' ');
            extras.push(`${uiIcon('pouch', 'ui-icon-xs')} Трофеи (нажми для осмотра): ${lootChips}`);
        }
        if (rep.levelUps.length > 0) {
            extras.push(`${uiIcon('arrow', 'ui-icon-xs')} Очки талантов: <b class="hl-green">${rep.levelUps.join(', ')}</b>`);
        }

        const inspectedItem = (rep.selectedLootIndex !== null && resolvedLootObjects[rep.selectedLootIndex])
            ? resolvedLootObjects[rep.selectedLootIndex]
            : null;

        const lootInspectHtml = inspectedItem ? `
            <div style="margin-top:8px;">
                <div class="rpg-cards-grid single-card">
                    <div class="rpg-item-card ${inspectedItem.getRarityClass()}">
                        <div class="rpg-card-header">
                            <span class="rpg-card-title">${inspectedItem.name}</span>
                            <span class="rpg-card-ribbon bag">Трофей</span>
                        </div>
                        <div class="rpg-card-body">
                            <div class="rpg-card-top">
                                <div class="rpg-card-icon-box">
                                    <span class="rpg-card-tier">T${inspectedItem.getTier()}</span>
                                    <span class="rpg-card-emoji">${uiIcon(inspectedItem.getIcon(), 'ui-icon-lg')}</span>
                                    <span class="rpg-card-stars">${'★'.repeat(inspectedItem.getTier())}</span>
                                </div>
                                <div class="rpg-card-meta">
                                    <div>Качество: <span class="meta-val">${inspectedItem.getRarityLabel()}</span></div>
                                    <div>Рейтинг снаряжения: <span class="meta-green">${inspectedItem.getRating()}</span></div>
                                    <div>Слот экипировки: <span class="meta-val">${inspectedItem.getSlotCleanName()}</span></div>
                                </div>
                            </div>
                            <div class="rpg-card-section-title">Основные характеристики</div>
                            <div class="rpg-card-stats">
                                <div class="rpg-stat-line">Урон к атаке: <span class="${inspectedItem.atk > 0 ? 'stat-green' : 'stat-muted'}">+${inspectedItem.atk} ед.</span></div>
                                <div class="rpg-stat-line">Защита брони: <span class="${inspectedItem.armor > 0 ? 'stat-green' : 'stat-muted'}">+${inspectedItem.armor} ед.</span></div>
                                <div class="rpg-stat-line">Шанс блока: <span class="${inspectedItem.block > 0 ? 'stat-green' : 'stat-muted'}">+${inspectedItem.block}%</span></div>
                            </div>
                            <div class="rpg-card-section-title">Описание предмета</div>
                            <div class="rpg-card-desc">${inspectedItem.desc}</div>
                            <div class="rpg-card-actions">
                                <button class="btn-rpg-gear" onclick="openSquadModal()">Перейти в ОТРЯД (Надеть)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ` : '';

        const headerTitle = isVictory
            ? `${uiIcon('laurel', 'ui-icon-sm')} Итоги похода — Возвращение в таверну`
            : `${uiIcon('skull', 'ui-icon-sm')} Отступление в таверну — Итоги боя`;
        const headerSpeech = isVictory
            ? '«С возвращением, панове! Несите пенного — подсчитаем златые, сраженных врагов и перевяжем раненых!»'
            : '«Живы — и то слава Богу! Садитесь к очагу, подсчитаем потери и отправим раненых к сестре Берте...»';

        this.modalContent.innerHTML = `
            <div class="npc-dialog-box">
                <div class="npc-header-flex">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>${headerTitle}</h3>
                        <div class="npc-quote-speech">${headerSpeech}</div>
                    </div>
                    <button class="quest-close-btn" onclick="closeSquadModal()">${uiIcon('close', 'ui-icon-xs')}</button>
                </div>

                <div class="campaign-card selected" style="margin-bottom:5px;">
                    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:6px; font-size:11px;">
                        <span>${uiIcon('coins_stack', 'ui-icon-xs')} Заработано златых: <b class="hl-gold">+${rep.goldEarned} гр.</b> (Казна: ${state.gold})</span>
                        <span>${uiIcon('crossed_swords', 'ui-icon-xs')} Сражено противников: <b class="hl-green">${rep.enemiesKilled}</b></span>
                        <span>${uiIcon('heart_heal', 'ui-icon-xs')} Ранено: <b class="${woundedHeroes.length > 0 ? 'hl-red' : 'hl-green'}">${woundedHeroes.length} из ${participants.length}</b></span>
                    </div>
                    ${extras.length > 0 ? `<div style="font-size:11px; margin-top:5px; padding-top:5px; border-top:1px dashed #5c4028; color:#dec8ad;">${extras.join(' &nbsp;|&nbsp; ')}</div>` : ''}
                    ${lootInspectHtml}
                </div>

                <div class="squad-section-title">
                    <span>${uiIcon('shield_cross', 'ui-icon-xs')} СОСТОЯНИЕ ОТРЯДА (КТО РАНЕН):</span>
                </div>
                <div class="${useGrid}" style="margin-bottom:6px;">
                    ${participantRows}
                </div>

                <div class="btn-row" style="margin-top:auto;">
                    ${woundedHeroes.length > 0 ? `<button class="btn-sec" onclick="openClinicDialog()">${uiIcon('heal_cross', 'ui-icon-xs')} В Палаты врачебные (Лечить раненых)</button>` : ''}
                    <button onclick="closeSquadModal()">${uiIcon('beer', 'ui-icon-xs')} За стол в таверну (Закрыть)</button>
                </div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('host');
    }

    public renderSmithDialog(state: GameStateModel): void {
        this.openOverlay();
        const forgeTier = GameDataCatalog.getForgeTier(state.tavernUpgrades);
        const craftBonus = GameDataCatalog.getForgeCraftBonus(state.tavernUpgrades);
        const activeFilter = state.smithMenuState.filter || 'all';
        const metalKeys: MetalType[] = ['iron', 'bronze', 'steel', 'damask'];

        const metalStockHtml = metalKeys.map(m => {
            const meta = GameDataCatalog.METAL_META[m];
            const amt = state.metals[m] || 0;
            return `
                <div class="smith-metal-pill metal-${m}" title="${meta.desc}">
                    <span class="smith-metal-icon">${uiIcon(meta.icon, 'ui-icon-xs')}</span>
                    <span class="smith-metal-name">${meta.name}:</span>
                    <b class="smith-metal-val">${amt}</b>
                </div>
            `;
        }).join('');

        const smeltListHtml = state.spareEquip.length === 0
            ? `
                <div class="smith-empty-state">
                    ${uiIcon('pouch', 'ui-icon-lg')}
                    <div>На складе отряда нет лишней амуниции для переплавки.</div>
                    <div class="smith-empty-sub">Принесите трофеи из походов или снимите старое снаряжение с бойца в меню ОТРЯД.</div>
                </div>
            `
            : state.spareEquip.map((item, idx) => {
                const yieldMap = GameDataCatalog.getSmeltYield(item, forgeTier);
                const statsParts: string[] = [];
                if (item.atk > 0) statsParts.push(`+${item.atk} Ур`);
                if (item.armor > 0) statsParts.push(`+${item.armor} Бр`);
                if (item.block > 0) statsParts.push(`+${item.block}% Блок`);

                const yieldHtml = metalKeys
                    .filter(m => (yieldMap[m] || 0) > 0)
                    .map(m => {
                        const meta = GameDataCatalog.METAL_META[m];
                        return `<span class="smith-yield-tag metal-${m}">${uiIcon(meta.icon, 'ui-icon-xs')} +${yieldMap[m]} ${meta.short}</span>`;
                    }).join('');

                return `
                    <div class="smith-item-card ${item.getRarityClass()}">
                        <div class="smith-item-main">
                            <div class="smith-item-icon">${uiIcon(item.getIcon(), 'ui-icon-md')}</div>
                            <div class="smith-item-info">
                                <div class="smith-item-title">${item.name}</div>
                                <div class="smith-item-sub">${item.getSlotCleanName()} • ${statsParts.join(', ') || 'Без бонусов'}</div>
                                <div class="smith-yield-row">${yieldHtml}</div>
                            </div>
                        </div>
                        <button class="smith-action-btn smelt-btn" onclick="smeltSpareItem(${idx})">
                            ${uiIcon('fire', 'ui-icon-xs')} Расплавить
                        </button>
                    </div>
                `;
            }).join('');

        const recipes = GameDataCatalog.createSmithingRecipes().filter(r =>
            activeFilter === 'all' ? true : r.slot === activeFilter
        );

        const slotLabels: Record<'weapon' | 'armor' | 'trinket', string> = {
            weapon: 'Оружие',
            armor: 'Броня',
            trinket: 'Талисман'
        };

        const recipesHtml = recipes.map(rec => {
            const bonusAtk = rec.slot === 'weapon' ? craftBonus.atk : 0;
            const bonusArmor = rec.slot === 'armor' ? craftBonus.armor : 0;
            const bonusBlock = rec.slot === 'trinket' ? craftBonus.block : 0;

            const totalAtk = rec.atk + bonusAtk;
            const totalArmor = rec.armor + bonusArmor;
            const totalBlock = rec.block + bonusBlock;

            const statChips: string[] = [];
            if (totalAtk > 0) statChips.push(`+${totalAtk} Ур${bonusAtk > 0 ? ` (+${bonusAtk})` : ''}`);
            if (totalArmor > 0) statChips.push(`+${totalArmor} Бр${bonusArmor > 0 ? ` (+${bonusArmor})` : ''}`);
            if (totalBlock > 0) statChips.push(`+${totalBlock}% Блок${bonusBlock > 0 ? ` (+${bonusBlock}%)` : ''}`);

            let canCraft = true;
            const costTagsHtml = metalKeys
                .filter(m => (rec.cost[m] || 0) > 0)
                .map(m => {
                    const need = rec.cost[m] || 0;
                    const have = state.metals[m] || 0;
                    const ok = have >= need;
                    if (!ok) canCraft = false;
                    const meta = GameDataCatalog.METAL_META[m];
                    return `<span class="smith-cost-tag ${ok ? 'cost-ok' : 'cost-low'}">${uiIcon(meta.icon, 'ui-icon-xs')} ${meta.name}: ${have}/${need}</span>`;
                }).join('');

            return `
                <div class="smith-recipe-card">
                    <div class="smith-recipe-top">
                        <div class="smith-item-icon">${uiIcon(rec.icon, 'ui-icon-md')}</div>
                        <div class="smith-recipe-info">
                            <div class="smith-item-title">${rec.name} <span class="smith-slot-label">• ${slotLabels[rec.slot]}</span></div>
                            <div class="smith-recipe-stats">${statChips.join(' &nbsp;|&nbsp; ')}</div>
                            <div class="smith-recipe-desc">${rec.desc}</div>
                        </div>
                        <button class="smith-action-btn craft-btn" onclick="craftSmithRecipe('${rec.id}')" ${!canCraft ? 'disabled' : ''}>
                            ${uiIcon('smith_hammer', 'ui-icon-xs')} Выковать
                        </button>
                    </div>
                    <div class="smith-cost-row">
                        <span class="smith-cost-label">Металл:</span> ${costTagsHtml}
                    </div>
                </div>
            `;
        }).join('');

        const upgradeBadgeHtml = forgeTier > 0
            ? `<div class="smith-status-badge active">${uiIcon('check', 'ui-icon-xs')} Кузница (Ступ. ${forgeTier}): +${craftBonus.atk} к ковке${forgeTier >= 2 ? ', +плавка' : ''}</div>`
            : `<div class="smith-status-badge test">${uiIcon('forge', 'ui-icon-xs')} Полевой горн (Ветка «IV. Кузница» у Хозяина даст бонусы)</div>`;

        this.modalContent.innerHTML = `
            <div class="npc-dialog-box smith-modal-wrapper">
                <div class="npc-header-flex">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>Кузнец Матей — Кузница гильдии</h3>
                        <div class="npc-quote-speech">${state.smithMenuState.speech}</div>
                    </div>
                    <button class="quest-close-btn" onclick="closeSquadModal()">${uiIcon('close', 'ui-icon-xs')}</button>
                </div>

                <div class="smith-top-bar">
                    <div class="smith-metals-row">${metalStockHtml}</div>
                    ${upgradeBadgeHtml}
                </div>

                <div class="smith-grid">
                    <div class="smith-col">
                        <div class="smith-col-header">
                            <span>${uiIcon('fire', 'ui-icon-sm')} ПЛАВКА СНАРЯЖЕНИЯ</span>
                            <span class="smith-col-count">На складе: ${state.spareEquip.length}</span>
                        </div>
                        <div class="smith-scroll-list">
                            ${smeltListHtml}
                        </div>
                    </div>

                    <div class="smith-col">
                        <div class="smith-col-header">
                            <span>${uiIcon('anvil', 'ui-icon-sm')} КОВКА ПО РЕЦЕПТАМ</span>
                            <div class="smith-filter-row">
                                <button class="smith-filter-btn ${activeFilter === 'all' ? 'active' : ''}" onclick="setSmithRecipeFilter('all')">Все</button>
                                <button class="smith-filter-btn ${activeFilter === 'weapon' ? 'active' : ''}" onclick="setSmithRecipeFilter('weapon')">Оружие</button>
                                <button class="smith-filter-btn ${activeFilter === 'armor' ? 'active' : ''}" onclick="setSmithRecipeFilter('armor')">Броня</button>
                                <button class="smith-filter-btn ${activeFilter === 'trinket' ? 'active' : ''}" onclick="setSmithRecipeFilter('trinket')">Талисман</button>
                            </div>
                        </div>
                        <div class="smith-scroll-list">
                            ${recipesHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('smith');
    }
}
