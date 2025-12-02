import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SCREEN_HEIGHT, COLORS } from '../constants.js';
import { UNIT_TYPES } from '../systems/CombatSystem.js';

export class UnitSelector {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.container.y = SCREEN_HEIGHT - 60; // Bottom bar

        // Background
        const bg = new Graphics();
        bg.rect(0, 0, 400, 60);
        bg.fill(COLORS.UI_BG);
        bg.stroke({ width: 2, color: COLORS.UI_BORDER });
        this.container.addChild(bg);

        // Unit Buttons
        let x = 10;
        const units = Object.values(UNIT_TYPES);

        for (const unit of units) {
            this.createButton(unit, x, () => this.spawnUnit(unit));
            x += 90;
        }
    }

    createButton(text, x, callback) {
        const style = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 12,
            fill: COLORS.TEXT
        });
        const btn = new Text({ text, style });
        btn.x = x;
        btn.y = 20;
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', callback);
        this.container.addChild(btn);
    }

    spawnUnit(type) {
        console.log(`Spawn Unit: ${type}`);
        this.game.combatSystem.spawnUnit(type);
    }
}
