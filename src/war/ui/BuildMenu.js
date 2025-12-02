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
        this.buttons = [];

        for (const room of rooms) {
            const btn = this.createButton(roomLabels[room] || room, x, () => this.selectRoom(room));
            btn.roomType = room;
            this.buttons.push(btn);
            x += 90;
        }

        // Add update loop to check unlocks
        this.game.app.ticker.add(() => this.update());
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
        return btn;
    }

    selectRoom(type) {
        // Check unlock again just in case
        if (this.isRoomLocked(type)) {
            console.log('Room Locked!');
            return;
        }
        console.log(`Selected Room: ${type}`);
        // In real impl, set placement mode in GridSystem
    }

    isRoomLocked(type) {
        const day = this.game.timeSystem.day;
        if (type === 'MEDBAY' && day < 2) return true;
        if (type === 'WORKSHOP' && day < 3) return true;
        return false;
    }

    update() {
        if (!this.container.visible) return;

        this.buttons.forEach(btn => {
            const locked = this.isRoomLocked(btn.roomType);
            btn.alpha = locked ? 0.5 : 1;
            btn.eventMode = locked ? 'none' : 'static';
        });
    }
}
