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
