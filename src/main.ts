import './styles/game.css';
import { GameStateModel } from './models/GameStateModel';
import { CanvasRendererView } from './views/CanvasRendererView';
import { TopStatsBarView } from './views/TopStatsBarView';
import { SquadAndHeroModalView } from './views/SquadAndHeroModalView';
import { GuildNpcModalView } from './views/GuildNpcModalView';
import { CombatHudView } from './views/CombatHudView';
import { SquadPresenter } from './presenters/SquadPresenter';
import { GuildPresenter } from './presenters/GuildPresenter';
import { CombatPresenter } from './presenters/CombatPresenter';
import { GameLoopPresenter } from './presenters/GameLoopPresenter';

/**
 * Точка входа (Bootstrap / Dependency Injection в стиле MVP под будущий перенос в Unity C#)
 */
function bootstrapGame(): void {
    // 1. Инициализация Модели (Models)
    const state = new GameStateModel();

    // 2. Инициализация Представлений (Views)
    const canvasView = new CanvasRendererView('view', state.guildHotspots);
    const topBarView = new TopStatsBarView();
    const squadModalView = new SquadAndHeroModalView();
    const npcModalView = new GuildNpcModalView();
    const combatHudView = new CombatHudView();

    // 3. Инициализация Презентеров (Presenters)
    const squadPresenter = new SquadPresenter(state, squadModalView, topBarView, combatHudView);
    const guildPresenter = new GuildPresenter(state, npcModalView, topBarView, combatHudView, squadPresenter);
    const combatPresenter = new CombatPresenter(state, topBarView, combatHudView, guildPresenter);
    const gameLoopPresenter = new GameLoopPresenter(
        state,
        canvasView,
        combatHudView,
        squadPresenter,
        guildPresenter,
        combatPresenter
    );

    // 4. Запуск игры
    gameLoopPresenter.start();
}

bootstrapGame();
