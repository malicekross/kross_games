import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SCREEN_WIDTH, COLORS } from '../constants.js';

export class HUD {
    constructor(game) {
        this.game = game;
        this.container = new Container();

        // Top Bar Background
        const bg = new Graphics();
        bg.rect(0, 0, SCREEN_WIDTH, 40);
        bg.fill(COLORS.UI_BG);
        bg.stroke({ width: 2, color: COLORS.UI_BORDER });
        this.container.addChild(bg);

        // Stats Text
        const style = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 16,
            fill: COLORS.TEXT
        });

        this.dayText = new Text({ text: 'Day: 1', style });
        this.dayText.x = 10;
        this.dayText.y = 10;
        this.container.addChild(this.dayText);

        this.popText = new Text({ text: 'Pop: 2/10', style });
        this.popText.x = 100;
        this.popText.y = 10;
        this.container.addChild(this.popText);

        this.scrapText = new Text({ text: 'Scrap: 0', style });
        this.scrapText.x = 200;
        this.scrapText.y = 10;
        this.container.addChild(this.scrapText);
    }

    update() {
        this.dayText.text = `Day: ${this.game.timeSystem.day}`;
        this.popText.text = `Pop: ${this.game.workerSystem.dwellers.length}/10`;
        // Scrap not implemented yet in Game, need to add it
    }
}
