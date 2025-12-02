import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS } from '../constants.js';

export class LoadingScreen {
    constructor() {
        this.container = new Container();

        // Background
        const bg = new Graphics();
        bg.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        bg.fill(COLORS.BACKGROUND);
        this.container.addChild(bg);

        // Loading Text
        const style = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 32,
            fill: COLORS.TEXT,
            fontWeight: 'bold'
        });
        this.text = new Text({ text: 'LOADING...', style });
        this.text.x = SCREEN_WIDTH / 2 - this.text.width / 2;
        this.text.y = SCREEN_HEIGHT / 2 - 50;
        this.container.addChild(this.text);

        // Progress Bar Container
        const barBg = new Graphics();
        barBg.rect(SCREEN_WIDTH / 2 - 150, SCREEN_HEIGHT / 2 + 20, 300, 20);
        barBg.stroke({ width: 2, color: COLORS.TEXT });
        this.container.addChild(barBg);

        // Progress Bar Fill
        this.barFill = new Graphics();
        this.barFill.rect(SCREEN_WIDTH / 2 - 148, SCREEN_HEIGHT / 2 + 22, 0, 16);
        this.barFill.fill(COLORS.TEXT);
        this.container.addChild(this.barFill);
    }

    updateProgress(progress) {
        this.barFill.clear();
        this.barFill.rect(SCREEN_WIDTH / 2 - 148, SCREEN_HEIGHT / 2 + 22, 296 * progress, 16);
        this.barFill.fill(COLORS.TEXT);
        this.text.text = `LOADING... ${Math.floor(progress * 100)}%`;
    }
}
