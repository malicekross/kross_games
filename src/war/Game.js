import { Application, Container, Text, TextStyle, Ticker, Assets } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, GAME_STATES } from './constants.js';
import { GridSystem } from './systems/GridSystem.js';
import { Pathfinder } from './systems/Pathfinder.js';
import { WorkerSystem, JOB_TYPES } from './systems/WorkerSystem.js';
import { TimeSystem } from './systems/TimeSystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { WaveSystem } from './systems/WaveSystem.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { IntroScreen } from './ui/IntroScreen.js';
import { HUD } from './ui/HUD.js';
import { BuildMenu } from './ui/BuildMenu.js';
import { UnitSelector } from './ui/UnitSelector.js';
import { SettingsMenu } from './ui/SettingsMenu.js';
import { CreditsScreen } from './ui/CreditsScreen.js';
import { LoadingScreen } from './ui/LoadingScreen.js';

export class Game {
    constructor() {
        this.app = new Application();
        this.state = GAME_STATES.INTRO;
        this.root = new Container();
        this.world = new Container();
        this.surface = new Container(); // Surface layer for War Mode
        this.ui = new Container(); // UI Layer
    }

    async init(canvasElement) {
        await this.app.init({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            backgroundColor: COLORS.BACKGROUND,
            canvas: canvasElement,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        if (!canvasElement) {
            document.body.appendChild(this.app.canvas);
        }

        this.app.stage.addChild(this.root);

        // Show Loading Screen
        this.loadingScreen = new LoadingScreen();
        this.app.stage.addChild(this.loadingScreen.container);

        // Load Assets
        await this.loadAssets();

        // Remove Loading Screen
        this.app.stage.removeChild(this.loadingScreen.container);

        this.root.addChild(this.world);
        this.root.addChild(this.surface);
        this.root.addChild(this.ui);

        // Initialize Systems
        this.gridSystem = new GridSystem(this.app, this.world);
        this.pathfinder = new Pathfinder(this.gridSystem);
        this.workerSystem = new WorkerSystem(this.app, this.gridSystem, this.pathfinder);
        this.timeSystem = new TimeSystem(this);
        this.combatSystem = new CombatSystem(this.app);
        this.waveSystem = new WaveSystem(this.combatSystem);
        this.saveSystem = new SaveSystem(this);
        this.audioSystem = new AudioSystem();

        this.world.addChild(this.workerSystem.container);
        this.surface.addChild(this.combatSystem.container);
        this.combatSystem.container.visible = false;

        // Initialize UI
        this.introScreen = new IntroScreen(this);
        this.hud = new HUD(this);
        this.buildMenu = new BuildMenu(this);
        this.unitSelector = new UnitSelector(this);
        this.settingsMenu = new SettingsMenu(this);
        this.creditsScreen = new CreditsScreen(this);

        this.ui.addChild(this.introScreen.container);
        this.ui.addChild(this.hud.container);
        this.ui.addChild(this.buildMenu.container);
        this.ui.addChild(this.unitSelector.container);
        this.ui.addChild(this.settingsMenu.container);
        this.ui.addChild(this.creditsScreen.container);

        // Initial UI State
        this.hud.container.visible = false;
        this.buildMenu.container.visible = false;
        this.unitSelector.container.visible = false;

        // Setup Interaction
        this.gridSystem.onTileClick = (x, y) => this.handleTileClick(x, y);

        // Game Loop
        this.app.ticker.add((ticker) => {
            this.update(ticker.deltaTime);
        });

        // Check for auto-save
        if (this.saveSystem.hasSave('auto')) {
            console.log('Auto-save found.');
        }

        console.log('Shelter War Game Initialized');
        this.audioSystem.playMusic('menu');
    }

    async loadAssets() {
        // In production (GitHub Pages), we need the base path
        const basePath = import.meta.env.BASE_URL; // '/kross_games/'
        const v = __APP_VERSION__; // Cache busting

        const assets = [
            { alias: 'tiles', src: `${basePath}war/assets/tiles.png?v=${v}` },
            { alias: 'ui', src: `${basePath}war/assets/ui.png?v=${v}` },
            { alias: 'rooms', src: `${basePath}war/assets/rooms.png?v=${v}` },
            { alias: 'dwellers', src: `${basePath}war/assets/dwellers.png?v=${v}` },
            { alias: 'mr_handy', src: `${basePath}war/assets/mr_handy.png?v=${v}` },
            { alias: 'combat_units', src: `${basePath}war/assets/combat_units.png?v=${v}` },
            { alias: 'enemies', src: `${basePath}war/assets/enemies.png?v=${v}` }
        ];

        // Pre-load assets
        // We must pass the objects to Assets.load so it registers the aliases
        await Assets.load(assets);
        this.loadingScreen.updateProgress(1);
    }

    update(delta) {
        if (this.state === GAME_STATES.INTRO) return;

        this.workerSystem.update(delta);
        this.timeSystem.update(delta);
        this.combatSystem.update(delta);
        this.waveSystem.update(delta);
        this.hud.update();
    }

    startNewGame() {
        this.state = GAME_STATES.VAULT;
        this.introScreen.container.visible = false;
        this.hud.container.visible = true;
        this.buildMenu.container.visible = true;

        // Reset Systems
        this.workerSystem.dwellers.forEach(d => d.sprite.destroy());
        this.workerSystem.dwellers = [];
        this.workerSystem.spawnDweller(2, 2);
        this.workerSystem.spawnDweller(3, 2);

        this.timeSystem.day = 1;
        this.timeSystem.time = 0;
        this.scrap = 10; // Starting scrap

        this.audioSystem.playSFX('click');
        console.log('New Game Started');
    }

    loadGame(slot) {
        if (this.saveSystem.load(slot)) {
            this.state = GAME_STATES.VAULT;
            this.introScreen.container.visible = false;
            this.hud.container.visible = true;
            this.buildMenu.container.visible = true;
            this.audioSystem.playSFX('click');
            console.log('Game Loaded');
        }
    }

    exitToIntro() {
        this.state = GAME_STATES.INTRO;
        this.introScreen.container.visible = true;
        this.hud.container.visible = false;
        this.buildMenu.container.visible = false;
        this.unitSelector.container.visible = false;
        this.settingsMenu.container.visible = false;
        this.creditsScreen.container.visible = false;
        this.world.visible = true; // Reset view
        this.surface.visible = false;
        this.audioSystem.playSFX('click');
    }

    onNewDay(day) {
        if (day > 7) {
            // Victory Condition
            this.showCredits();
            return;
        }

        // Population Growth: +1 Dweller per day, max 10
        if (this.workerSystem.dwellers.length < 10) {
            this.workerSystem.spawnDweller(2, 2);
            console.log('New Dweller arrived!');
        }

        // Auto-Save
        this.saveSystem.save('auto');

        // War Mode is now manual
        console.log('New Day Started. Prepare for war!');
    }

    startWar() {
        this.startWarMode(this.timeSystem.day);
    }

    startWarMode(day) {
        this.state = GAME_STATES.WAR;
        this.world.visible = false; // Hide Vault
        this.surface.visible = true; // Show Surface
        this.combatSystem.container.visible = true;

        this.buildMenu.container.visible = false;
        this.unitSelector.container.visible = true;

        this.waveSystem.startWave(day);
    }

    endWarMode(victory) {
        if (victory) {
            console.log('Victory! Returning to Vault.');
            this.state = GAME_STATES.VAULT;
            this.world.visible = true;
            this.surface.visible = false;
            this.combatSystem.endWar();

            this.buildMenu.container.visible = true;
            this.unitSelector.container.visible = false;

            this.timeSystem.advanceDay(); // Next day
        } else {
            console.log('Defeat! Retrying Wave...');
            this.retryWave();
        }
    }

    retryWave() {
        this.combatSystem.endWar(); // Cleanup
        this.waveSystem.startWave(this.timeSystem.day); // Restart same day
    }

    showCredits() {
        this.state = GAME_STATES.INTRO; // Or similar state
        this.creditsScreen.container.visible = true;
        this.hud.container.visible = false;
        this.buildMenu.container.visible = false;
        this.unitSelector.container.visible = false;
        this.world.visible = false;
        this.surface.visible = false;
    }

    handleTileClick(x, y) {
        if (this.state !== GAME_STATES.VAULT) return;
        console.log(`Order: Dig at ${x}, ${y}`);
        this.workerSystem.addJob(JOB_TYPES.DIG, x, y);
        this.audioSystem.playSFX('dig');
    }
}
