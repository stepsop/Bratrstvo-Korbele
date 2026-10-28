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

        const pauseLabel = combat.paused ? '▶️ ПРОДОЛЖИТЬ БОЙ' : '⏸️ ПАУЗА (ТАКТИКА / ИНВЕНТАРЬ)';
        const pauseClass = combat.paused ? 'btn-pause paused' : 'btn-pause';
        const psaLabel = combat.psaKrevCd > 0
            ? `🔥 Пся крев! [КД: ${combat.psaKrevCd} х.]`
            : `🔥 ПСЯ КРЕВ! (+10 Врем.HP и +2 Урон на 6 х.)`;

        const heroButtons = state.party.filter(h => h.status === 'ready' && h.hp > 0).map(h => {
            const sel = combat.selectedHeroId === h.id ? '⭐ ' : '';
            return `<button class="btn-sec" onclick="selectHeroInCombat('${h.id}')">${sel}${h.name} (Распорядок)</button>`;
        }).join('');

        let selectedHeroPanel = '';
        if (combat.selectedHeroId) {
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
                    <div class="btn-row" style="background:#261a10; padding:5px; border:1px solid #ffd700;">
                        <div style="width:100%; font-size:11px; color:#ffd700; margin-bottom:4px;">
                            ⚙️ <b>${sh.name}:</b> 1) ${sh.skill1Name} [КД:${sh.cd1}/${sh.maxCd1}] | 2) ${sh.skill2Name} [КД:${sh.cd2}/${sh.maxCd2}]
                        </div>
                        <button onclick="cycleHeroSkillOrder('${sh.id}')">🔄 Порядок атак: ${orderNames[sh.skillOrder]}</button>
                        <button onclick="cycleHeroTargetRule('${sh.id}')">🎯 Выбор цели: ${targetNames[sh.targetRule]}</button>
                    </div>
                `;
            }
        }

        this.controlsEl.innerHTML = `
            <div class="btn-row">
                <button class="${pauseClass}" onclick="togglePause()">${pauseLabel}</button>
                <button class="btn-psakrev" onclick="usePsaKrev()" ${combat.psaKrevCd > 0 ? 'disabled' : ''}>${psaLabel}</button>
            </div>
            <div class="btn-row">
                <button onclick="useMasterBeer()" ${state.beer <= 0 ? 'disabled' : ''}>🍺 Пиво раненому (+1d10 HP) [${state.beer}]</button>
                <button onclick="useMasterPot()" ${state.pots <= 0 ? 'disabled' : ''}>💣 Штурмовой горшок (1d20) [${state.pots}]</button>
            </div>
            <div class="btn-row">${heroButtons}</div>
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
