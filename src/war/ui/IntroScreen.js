import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS } from '../constants.js';

export class IntroScreen {
    constructor(game) {
        this.game = game;
        this.container = new Container();

        // Background
        const bg = new Graphics();
        bg.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        bg.fill(COLORS.UI_BG);
        this.container.addChild(bg);

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 48,
            fill: COLORS.TEXT,
            fontWeight: 'bold'
        });
        const title = new Text({ text: 'SHELTER WAR', style: titleStyle });
        title.x = SCREEN_WIDTH / 2 - title.width / 2;
        title.y = 100;
        this.container.addChild(title);

        // Version
        const verStyle = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 16,
            fill: COLORS.TEXT
        });
        const version = new Text({ text: 'v1.0.0', style: verStyle });
        version.x = SCREEN_WIDTH - version.width - 10;
        version.y = SCREEN_HEIGHT - version.height - 10;
        this.container.addChild(version);

        // Buttons
        this.createButton('NEW GAME', 250, () => this.game.startNewGame());
        this.createButton('CONTINUE', 320, () => this.game.loadGame('auto'));
        this.createButton('BACK TO KROSS GAMES', 390, () => window.location.href = '../index.html');
    }

    createButton(text, y, callback) {
        const style = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 24,
            fill: COLORS.TEXT
        });
        const btn = new Text({ text: `> ${text}`, style });
        btn.x = SCREEN_WIDTH / 2 - btn.width / 2;
        btn.y = y;
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', callback);
        this.container.addChild(btn);
    }
}
