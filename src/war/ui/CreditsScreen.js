import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS } from '../constants.js';

export class CreditsScreen {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.container.visible = false;

        // Background
        const bg = new Graphics();
        bg.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        bg.fill(COLORS.BACKGROUND);
        this.container.addChild(bg);

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 48,
            fill: COLORS.TEXT,
            fontWeight: 'bold'
        });
        const title = new Text({ text: 'CONGRATULATIONS!', style: titleStyle });
        title.x = SCREEN_WIDTH / 2 - title.width / 2;
        title.y = 100;
        this.container.addChild(title);

        // Credits Text
        const textStyle = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 24,
            fill: COLORS.TEXT,
            align: 'center'
        });

        const credits = `
        You have survived 7 Days of War!
        
        Created by: Kross Games
        
        Design: Malice Kross
        Code: Antigravity AI
        Art: Pixel Studio
        
        Thank you for playing!
        `;

        const text = new Text({ text: credits, style: textStyle });
        text.x = SCREEN_WIDTH / 2 - text.width / 2;
        text.y = 200;
        this.container.addChild(text);

        // Back Button
        const btnStyle = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 24,
            fill: COLORS.TEXT
        });
        const btn = new Text({ text: '> BACK TO MENU', style: btnStyle });
        btn.x = SCREEN_WIDTH / 2 - btn.width / 2;
        btn.y = SCREEN_HEIGHT - 100;
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', () => this.game.exitToIntro());
        this.container.addChild(btn);
    }
}
