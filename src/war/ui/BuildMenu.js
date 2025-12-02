import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { SCREEN_HEIGHT, COLORS } from '../constants.js';
import { ROOM_TYPES } from '../systems/RoomSystem.js';

export class BuildMenu {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.container.y = SCREEN_HEIGHT - 60; // Bottom bar

        // Background
        const bg = new Graphics();
        bg.rect(0, 0, 600, 60);
        bg.fill(COLORS.UI_BG);
        bg.stroke({ width: 2, color: COLORS.UI_BORDER });
        this.container.addChild(bg);

        // Room Buttons
        let x = 10;
        // Abbreviated names for display
        const roomLabels = {
            'LIVING_QUARTERS': 'LIVING',
            'POWER_PLANT': 'POWER',
            'DINER': 'DINER',
            'WATER_TREATMENT': 'WATER',
            'MEDBAY': 'MEDBAY',
            'WORKSHOP': 'SHOP'
        };
        const rooms = Object.values(ROOM_TYPES);

        for (const room of rooms) {
            this.createButton(roomLabels[room] || room, x, () => this.selectRoom(room));
            x += 90; // Increased spacing
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

    selectRoom(type) {
        console.log(`Selected Room: ${type}`);
        // In real impl, set placement mode in GridSystem
    }
}
