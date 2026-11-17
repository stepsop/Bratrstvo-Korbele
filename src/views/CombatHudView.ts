import { GameStateModel } from '../models/GameStateModel';
import { uiIcon } from './UiIconHelper';

export type LogFaction = 'ally' | 'enemy' | 'system';

/**
 * View боевого лога и тактического пульта в бою (MVP View)
 */
export class CombatHudView {
    private logEl = document.getElementById('log-container')!;
    private controlsEl = document.getElementById('controls')!;

    public appendLog(msg: string, faction: LogFaction = 'system'): void {
        const prev = this.logEl.querySelectorAll('.log-entry');
        prev.forEach(el => {
            el.classList.remove('log-latest');
            el.classList.add('log-old');
        });

        const badgeMap: Record<LogFaction, { label: string; cls: string }> = {
            ally: { label: `${uiIcon('crossed_swords', 'ui-icon-xs')} СОЮЗНИК`, cls: 'log-badge-ally' },
            enemy: { label: `${uiIcon('skull', 'ui-icon-xs')} ВРАГ`, cls: 'log-badge-enemy' },
            system: { label: `${uiIcon('scroll', 'ui-icon-xs')} БОЙ`, cls: 'log-badge-system' }
        };
        const badge = badgeMap[faction] || badgeMap.system;

        const div = document.createElement('div');
        div.className = `log-entry log-${faction} log-latest`;
        div.innerHTML = `<span class="log-badge ${badge.cls}">${badge.label}</span><span class="log-text">${msg}</span>`;
        this.logEl.appendChild(div);
        this.logEl.scrollTop = this.logEl.scrollHeight;
    }

    public clearLog(): void {
        this.logEl.innerHTML = '';
    }

    public renderCombatControls(state: GameStateModel): void {
        const combat = state.combat;
        if (!combat.active) return;

        const psaLabel = combat.psaKrevCd > 0
            ? `${uiIcon('fire', 'ui-icon-sm')} Пся крев! [КД: ${combat.psaKrevCd} х.]`
            : `${uiIcon('fire', 'ui-icon-sm')} ПСЯ КРЕВ! (+10 Врем.HP и +2 Урон на 6 х.)`;

        let selectedHeroPanel = '';
        if (combat.paused && combat.selectedHeroId) {
            const sh = state.party.find(p => p.id === combat.selectedHeroId);
            if (sh) {
                const orderNames: Record<string, string> = {
                    'skill1_first': `Приоритет 1-й («${sh.skill1Name}»), в КД — 2-я`,
                    'basic_only': `Только 2-я базовая («${sh.skill2Name}»)`,
                    'alternate': `Чередовать 1-ю и 2-ю способность`
                };
                const targetNames: Record<string, string> = {
                    'focus_or_random': 'По фокусу Мастера / Случайный враг',
                    'lowest_hp': 'Добивать самого раненого врага',
                    'highest_hp': 'Бить самого здорового врага'
                };
                selectedHeroPanel = `
                    <div class="btn-row combat-center-row" style="background:#261a10; padding:5px 10px; border:1px solid #ffd700; max-width:740px; margin:2px auto 0 auto;">
                        <div style="width:100%; font-size:11px; color:#ffd700; margin-bottom:3px; text-align:center;">
                            ${uiIcon('gear', 'ui-icon-xs')} <b>Распорядок (${sh.name}):</b> 1) ${sh.skill1Name} [КД:${sh.cd1}/${sh.maxCd1}] | 2) ${sh.skill2Name} [КД:${sh.cd2}/${sh.maxCd2}]
                        </div>
                        <button onclick="cycleHeroSkillOrder('${sh.id}')">${uiIcon('swap_h', 'ui-icon-xs')} Порядок атак: ${orderNames[sh.skillOrder]}</button>
                        <button onclick="cycleHeroTargetRule('${sh.id}')">${uiIcon('eye', 'ui-icon-xs')} Выбор цели: ${targetNames[sh.targetRule]}</button>
                    </div>
                `;
            }
        } else {
            const hintText = combat.paused
                ? `${uiIcon('hourglass', 'ui-icon-xs')} <b>ТАКТИЧЕСКАЯ ПАУЗА:</b> кликните курсором по герою на поле боя для настройки его распорядка, или нажмите <b>[ПРОБЕЛ]</b> для продолжения боя.`
                : `${uiIcon('scroll', 'ui-icon-xs')} Нажмите <b>[ПРОБЕЛ]</b> для тактической паузы и выбора бойца курсором | ${uiIcon('beer', 'ui-icon-xs')} Авто-пиво (при ≤30% HP или крит. ударе): <b>${state.beer} шт.</b>`;
            selectedHeroPanel = `
                <div style="text-align:center; font-size:11px; color:#c8b08a; margin-top:2px;">
                    ${hintText}
                </div>
            `;
        }

        this.controlsEl.innerHTML = `
            <div class="btn-row combat-center-row">
                <button class="btn-psakrev combat-spec-btn" onclick="usePsaKrev()" ${combat.psaKrevCd > 0 ? 'disabled' : ''}>${psaLabel}</button>
                <button class="combat-spec-btn" onclick="useMasterPot()" ${state.pots <= 0 ? 'disabled' : ''}>${uiIcon('barrel', 'ui-icon-sm')} ШТУРМОВОЙ ГОРШОК (1d20) [${state.pots}]</button>
            </div>
            ${selectedHeroPanel}
        `;
    }

    public renderVictoryControls(): void {
        this.controlsEl.innerHTML = `
            <div class="btn-row">
                <button onclick="returnFromCombat()">${uiIcon('beer', 'ui-icon-sm')} Забрать добычу и продолжить путь</button>
            </div>
        `;
    }

    public renderDefeatControls(): void {
        this.controlsEl.innerHTML = `
            <div class="btn-row">
                <button onclick="enterGuild(true)">${uiIcon('tavern', 'ui-icon-sm')} Вернуться в таверну Bratrstvo Korbele</button>
            </div>
        `;
    }
}
