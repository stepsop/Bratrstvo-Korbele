import { GameStateModel } from '../models/GameStateModel';
import { CanvasRendererView } from './CanvasRendererView';

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
        this.modalContent.innerHTML = `
            <div class="npc-dialog-box">
                <div class="npc-header-flex">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>Хозяин таверны (с золотым зубом)</h3>
                        <div class="npc-quote-speech">${speech}</div>
                    </div>
                    <button style="max-width:40px; padding:4px;" onclick="closeSquadModal()">✕</button>
                </div>
                <div style="font-size:12px; margin-bottom:8px; display:flex; justify-content:space-between;">
                    <span>🪙 Казна гильдии: <b class="hl-gold">${state.gold} грошей</b></span>
                    <span>🍺 Пиво: <b>${state.beer}</b> | 💣 Горшки: <b>${state.pots}</b></span>
                </div>
                <div class="btn-row" style="margin-bottom:10px;">
                    <button class="btn-sec" onclick="openHostDialog()">💬 Травить байку / Слухи Богемии</button>
                </div>
                <div class="squad-section-title"><span>🛒 ЛАВКА ХОЗЯИНА: ПРИПАСЫ И ОРУЖИЕ</span></div>
                <div class="btn-row" style="margin-bottom:6px;">
                    <button onclick="buyShopItem('beer')" ${state.gold < 10 ? 'disabled' : ''}>🍺 Купить Пиво 1d10 (10 гр.)</button>
                    <button onclick="buyShopItem('pot')" ${state.gold < 25 ? 'disabled' : ''}>💣 Штурмовой горшок 1d20 (25 гр.)</button>
                </div>
                <div class="btn-row">
                    <button onclick="buyShopItem('sword')" ${state.gold < 35 ? 'disabled' : ''}>🗡️ Гусарская сабля +2 Ур (35 гр.)</button>
                    <button onclick="buyShopItem('plate')" ${state.gold < 40 ? 'disabled' : ''}>🛡️ Кованая кираса +2 Бр / +8% Блок (40 гр.)</button>
                </div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('host');
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
                ? `<span class="hl-gold">🏥 В палатах (${h.timer} ц.)</span>`
                : (hpDeficit === 0 && injCount === 0
                    ? `<span class="hl-green">✓ Здоров</span>`
                    : `${hpDeficit > 0 ? `Ранен (-${hpDeficit} HP) ` : ''}${injCount > 0 ? `<span class="hl-red">${h.injuries.join(', ')}</span>` : ''}`);

            const healHpBtn = (!isAtClinic && hpDeficit > 0)
                ? `<button style="font-size:10px; padding:4px 6px; max-width:130px;" onclick="treatHeroInClinic(${idx}, 'hp')" ${state.gold < 10 || h.status !== 'ready' ? 'disabled' : ''}>🩹 HP [10гр | 1ц]</button>`
                : '';

            const healInjBtn = (!isAtClinic && injCount > 0)
                ? `<button style="font-size:10px; padding:4px 6px; max-width:155px;" onclick="treatHeroInClinic(${idx}, 'injuries')" ${state.gold < 15 * injCount || h.status !== 'ready' ? 'disabled' : ''}>💊 Травмы [${15 * injCount}гр | ${1 + injCount}ц]</button>`
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
                    <button style="max-width:36px; padding:4px;" onclick="closeSquadModal()">✕</button>
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

        let mercRows = state.mercsForHire.map((m, idx) => {
            const inj = m.injuries.length ? `<span class="hl-red">${m.injuries.join(', ')}</span>` : '<span class="hl-green">Без травм</span>';
            const canHire = state.gold >= m.price && totalAlive < maxTotal;
            const wName = m.equipObj.weapon ? m.equipObj.weapon.name : 'Оружие';

            return `
                <div class="hero-card-row">
                    <div style="flex:1;">
                        <b class="hl-gold">${m.name}</b> | <b>${m.cls}</b> (Ур.${m.lvl}) | HP: ${m.hp}/${m.maxHp} | Бр: ${m.armor} | Блок: ${m.blockChance}%<br>
                        Травмы: ${inj} | Оружие: ${wName}
                    </div>
                    <button style="font-size:10px; max-width:135px; padding:6px;" onclick="hireMercenary(${idx})" ${!canHire ? 'disabled' : ''}>
                        НАНЯТЬ (${m.price} гр.)
                    </button>
                </div>
            `;
        }).join('');

        if (!mercRows) {
            mercRows = `<div style="color:#888; font-size:11px; padding:8px; text-align:center;">Все наемники в корчме уже наняты!</div>`;
        }

        this.modalContent.innerHTML = `
            <div class="npc-dialog-box">
                <div class="npc-header-flex">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>Стол наемников — Бывалый рубака (Казна: ${state.gold} гр.)</h3>
                        <div class="npc-quote-speech">«Парни за столом рубили гуситов и знают цену звонкой монете! Кого берешь в гильдию?»</div>
                    </div>
                    <button style="max-width:36px; padding:4px;" onclick="closeSquadModal()">✕</button>
                </div>
                ${mercRows}
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('mercs');
    }

    public renderVerbirzDialog(state: GameStateModel): void {
        this.openOverlay();
        const camp = state.warCampaigns[state.selectedRecruiterCampaign];
        const readyHeroes = state.party.filter(h => h.status === 'ready' && h.hp > 0);

        const campaignTabs = state.warCampaigns.map((c, i) => {
            const isSel = (i === state.selectedRecruiterCampaign);
            return `
                <button class="${isSel ? '' : 'btn-sec'}" style="flex:1; font-size:10px; padding:4px;" onclick="selectRecruiterCampaign(${i})">
                    ${c.riskBadge} <b>${c.name}</b>
                </button>
            `;
        }).join('');

        const heroPickBtns = readyHeroes.map(h => {
            const isPicked = state.selectedHeroesForWar.includes(h.id);
            return `
                <button style="max-width:140px; font-size:10px; padding:4px 6px; border-color:${isPicked ? '#66ff66' : '#7a5230'}; background:${isPicked ? '#16381a' : '#1e140d'};" onclick="toggleHeroWarPick('${h.id}')">
                    ${isPicked ? '✓ ' : ''}${h.name} (Ур.${h.lvl})
                </button>
            `;
        }).join('');

        const canSend = (state.selectedHeroesForWar.length === camp.needHeroes);

        this.modalContent.innerHTML = `
            <div class="npc-dialog-box">
                <div class="npc-header-flex">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>Королевский Вербовщик (Вербирж)</h3>
                        <div class="npc-quote-speech">«Выбирай кампанию, оценивай риск и отправляй бойцов за королевским серебром!»</div>
                    </div>
                    <button style="max-width:36px; padding:4px;" onclick="closeSquadModal()">✕</button>
                </div>

                <div class="btn-row" style="margin-bottom:6px;">${campaignTabs}</div>

                <div class="campaign-card selected">
                    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; gap:6px; font-size:11px;">
                        <span>👥 Людей: <b class="hl-gold">${camp.needHeroes}</b></span>
                        <span>⏳ Срок: <b class="hl-gold">${camp.cycles} ц.</b></span>
                        <span>💀 Гибель: <b class="hl-red">${camp.deathChance}%</b></span>
                        <span>🩹 Травма: <b class="hl-red">${camp.injuryChance}%</b></span>
                        <span>💰 Награда: <b class="hl-green">${camp.rewardDesc}</b></span>
                    </div>
                </div>

                <div class="squad-section-title">
                    <span>ВЫБЕРИТЕ БОЙЦОВ (${state.selectedHeroesForWar.length} / ${camp.needHeroes}):</span>
                </div>
                <div class="btn-row" style="margin-bottom:6px;">
                    ${heroPickBtns || '<div style="color:#888; font-size:11px;">Нет свободных бойцов в строю!</div>'}
                </div>

                <div class="btn-row">
                    <button style="padding:6px;" onclick="dispatchHeroesToWar()" ${!canSend ? 'disabled' : ''}>
                        🚩 ОТПРАВИТЬ НА ВОЙНУ (${state.selectedHeroesForWar.length}/${camp.needHeroes}) НА ${camp.cycles} ЦИКЛОВ
                    </button>
                </div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('verbirz');
    }

    public renderQuestsDialog(state: GameStateModel): void {
        this.openOverlay();
        const readyHeroes = state.party.filter(h => h.status === 'ready' && h.hp > 0);
        const selectedMissionHeroes = readyHeroes.filter(h => h.inSquad);

        const heroPickBtns = readyHeroes.map(h => {
            const isPicked = h.inSquad;
            return `
                <button style="max-width:165px; font-size:10px; padding:5px 6px; border-color:${isPicked ? '#66ff66' : '#7a5230'}; background:${isPicked ? '#16381a' : '#1e140d'};" onclick="toggleHeroMissionPick('${h.id}')">
                    ${isPicked ? '✓ ' : ''}${h.name} (Ур.${h.lvl}) [${h.hp}/${h.maxHp}]
                </button>
            `;
        }).join('');

        this.modalContent.innerHTML = `
            <div class="npc-dialog-box">
                <div class="npc-header-flex">
                    <canvas class="npc-avatar-canvas" id="npc-avatar" width="72" height="72"></canvas>
                    <div class="npc-quote-block">
                        <h3>Доска заданий — Контракты Богемии</h3>
                        <div class="npc-quote-speech">«Отряд Чашников перекрыл дорогу на Кутна-Гору. Выберите до 5 бойцов для похода!»</div>
                    </div>
                    <button style="max-width:36px; padding:4px;" onclick="closeSquadModal()">✕</button>
                </div>
                <div class="campaign-card selected">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
                        <b class="hl-gold">📜 Контракт: «Уничтожить отряд Чашников»</b>
                        <span>Сложность: <b>Легкая</b> | Награда: <b class="hl-green">45-60 грошей + трофеи</b></span>
                    </div>
                </div>
                <div class="squad-section-title">
                    <span>⚔️ ВЫБЕРИТЕ БОЙЦОВ НА МИССИЮ (Выбрано: ${selectedMissionHeroes.length} / ${state.squadMax}):</span>
                </div>
                <div class="btn-row" style="margin-bottom:6px;">
                    ${heroPickBtns || '<div style="color:#888; font-size:11px;">Нет готовых бойцов в строю!</div>'}
                </div>
                <div class="btn-row">
                    <button style="padding:6px;" onclick="closeSquadModal(); startQuest();" ${selectedMissionHeroes.length === 0 ? 'disabled' : ''}>
                        ⚔️ ВЫСТУПИТЬ В ПОХОД (Бойцов: ${selectedMissionHeroes.length} / ${state.squadMax})
                    </button>
                </div>
            </div>
        `;
        CanvasRendererView.drawNpcAvatar('quests');
    }
}
