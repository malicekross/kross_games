import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS } from '../constants.js';

export class SettingsMenu {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.container.visible = false; // Hidden by default

        // Overlay Background
        const bg = new Graphics();
        bg.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        bg.fill({ color: 0x000000, alpha: 0.8 });
        this.container.addChild(bg);

        // Panel
        const panel = new Graphics();
        panel.rect(SCREEN_WIDTH / 2 - 200, SCREEN_HEIGHT / 2 - 150, 400, 300);
        panel.fill(COLORS.UI_BG);
        panel.stroke({ width: 2, color: COLORS.UI_BORDER });
        this.container.addChild(panel);

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 32,
            fill: COLORS.TEXT,
            fontWeight: 'bold'
        });
        const title = new Text({ text: 'SETTINGS', style: titleStyle });
        title.x = SCREEN_WIDTH / 2 - title.width / 2;
        title.y = SCREEN_HEIGHT / 2 - 130;
        this.container.addChild(title);

        // Buttons
        let y = SCREEN_HEIGHT / 2 - 80;

        // Audio Controls
        this.createButton(`MUTE: ${this.game.audioSystem.isMuted ? 'ON' : 'OFF'}`, y, (btn) => {
            this.game.audioSystem.toggleMute();
            btn.text = `> MUTE: ${this.game.audioSystem.isMuted ? 'ON' : 'OFF'}`;
        });
        y += 40;

        this.createButton('SAVE GAME', y, () => this.game.saveSystem.save(1));
        y += 40;
        this.createButton('OVERSEER MANUAL', y, () => this.showManual());
        y += 40;
        this.createButton('EXIT TO INTRO', y, () => this.game.exitToIntro());
        y += 40;
        this.createButton('RESUME DUTIES', y, () => this.toggle());

        // Version Display
        const verStyle = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 14,
            fill: COLORS.TEXT
        });
        const version = new Text({ text: `v${__APP_VERSION__}`, style: verStyle });
        version.x = SCREEN_WIDTH / 2 - version.width / 2;
        version.y = SCREEN_HEIGHT / 2 + 120;
        this.container.addChild(version);

        // Manual Overlay
        this.manualContainer = new Container();
        this.manualContainer.visible = false;
        this.container.addChild(this.manualContainer);

        const manBg = new Graphics();
        manBg.rect(SCREEN_WIDTH / 2 - 250, SCREEN_HEIGHT / 2 - 200, 500, 400);
        manBg.fill(COLORS.UI_BG);
        manBg.stroke({ width: 2, color: COLORS.UI_BORDER });
        this.manualContainer.addChild(manBg);

        const manText = new Text({
            text: 'VAULT OVERSEER MANUAL\n\n' +
                'OBJECTIVE: EXPAND AND SURVIVE\n\n' +
                '1. EXCAVATION: Dig deeper to uncover resources.\n' +
                '2. CONSTRUCTION: Build rooms to sustain life.\n' +
                '   - POWER: Essential for operations.\n' +
                '   - DINER/WATER: Sustains population.\n' +
                '3. POPULATION: Assign dwellers to rooms matching their skills.\n' +
                '4. DEFENSE: Train units to repel surface threats.\n\n' +
                'REMEMBER: A HAPPY VAULT IS A PRODUCTIVE VAULT.\n\n' +
                '[CLICK TO CLOSE]',
            style: new TextStyle({
                fontFamily: 'Courier New',
                fontSize: 16,
                fill: COLORS.TEXT,
                wordWrap: true,
                wordWrapWidth: 460,
                align: 'center'
            })
        });
        manText.x = SCREEN_WIDTH / 2 - 230;
        manText.y = SCREEN_HEIGHT / 2 - 180;
        this.manualContainer.addChild(manText);

        // Close manual on click
        manBg.eventMode = 'static';
        manBg.cursor = 'pointer';
        manBg.on('pointerdown', () => this.manualContainer.visible = false);
    }

    createButton(text, y, callback) {
        const style = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 20,
            fill: COLORS.TEXT
        });
        const btn = new Text({ text: `> ${text}`, style });
        btn.x = SCREEN_WIDTH / 2 - btn.width / 2;
        btn.y = y;
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', () => callback(btn));
        this.container.addChild(btn);
    }

    toggle() {
        this.container.visible = !this.container.visible;
        this.manualContainer.visible = false; // Reset manual visibility
    }

    showManual() {
        this.manualContainer.visible = true;
    }
}
