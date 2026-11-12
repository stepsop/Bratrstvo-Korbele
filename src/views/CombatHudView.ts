import { GameStateModel } from '../models/GameStateModel';

/**
 * View боевого лога и тактического пульта в бою (MVP View)
 */
export class CombatHudView {
    private logEl = document.getElementById('log-container')!;
    private controlsEl = document.getElementById('controls')!;

    public appendLog(msg: string): void {
        const old = this.logEl.querySelectorAll('.log-entry');
        old.forEach(el => el.classList.add('log-old'));
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `> ${msg}`;
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
            ? `🔥 Пся крев! [КД: ${combat.psaKrevCd} х.]`
            : `🔥 ПСЯ КРЕВ! (+10 Врем.HP и +2 Урон на 6 х.)`;

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
                            ⚙️ <b>Распорядок (${sh.name}):</b> 1) ${sh.skill1Name} [КД:${sh.cd1}/${sh.maxCd1}] | 2) ${sh.skill2Name} [КД:${sh.cd2}/${sh.maxCd2}]
                        </div>
                        <button onclick="cycleHeroSkillOrder('${sh.id}')">🔄 Порядок атак: ${orderNames[sh.skillOrder]}</button>
                        <button onclick="cycleHeroTargetRule('${sh.id}')">🎯 Выбор цели: ${targetNames[sh.targetRule]}</button>
                    </div>
                `;
            }
        } else {
            const hintText = combat.paused
                ? `⏸️ <b>ТАКТИЧЕСКАЯ ПАУЗА:</b> кликните курсором по герою на поле боя для настройки его распорядка, или нажмите <b>[ПРОБЕЛ]</b> для продолжения боя.`
                : `⌨️ Нажмите <b>[ПРОБЕЛ]</b> для тактической паузы и выбора бойца курсором | 🍺 Авто-пиво (при ≤30% HP или крит. ударе): <b>${state.beer} шт.</b>`;
            selectedHeroPanel = `
                <div style="text-align:center; font-size:11px; color:#c8b08a; margin-top:2px;">
                    ${hintText}
                </div>
            `;
        }

        this.controlsEl.innerHTML = `
            <div class="btn-row combat-center-row">
                <button class="btn-psakrev combat-spec-btn" onclick="usePsaKrev()" ${combat.psaKrevCd > 0 ? 'disabled' : ''}>${psaLabel}</button>
                <button class="combat-spec-btn" onclick="useMasterPot()" ${state.pots <= 0 ? 'disabled' : ''}>💣 ШТУРМОВОЙ ГОРШОК (1d20) [${state.pots}]</button>
            </div>
            ${selectedHeroPanel}
        `;
    }

    public renderVictoryControls(): void {
        this.controlsEl.innerHTML = `
            <div class="btn-row">
                <button onclick="returnFromCombat()">🍺 Забрать добычу и продолжить путь</button>
            </div>
        `;
    }

    public renderDefeatControls(): void {
        this.controlsEl.innerHTML = `
            <div class="btn-row">
                <button onclick="enterGuild(true)">Вернуться в таверну Bratrstvo Korbele</button>
            </div>
        `;
    }
}
