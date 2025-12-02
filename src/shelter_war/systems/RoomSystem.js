import { TILE_TYPES } from './GridSystem.js';

export const ROOM_TYPES = {
    LIVING_QUARTERS: 'LIVING_QUARTERS',
    POWER_PLANT: 'POWER_PLANT',
    DINER: 'DINER',
    WATER_TREATMENT: 'WATER_TREATMENT',
    ARMORY: 'ARMORY',
    MEDBAY: 'MEDBAY',
    WORKSHOP: 'WORKSHOP'
};

export const ROOM_COSTS = {
    [ROOM_TYPES.LIVING_QUARTERS]: 100,
    [ROOM_TYPES.POWER_PLANT]: 150,
    [ROOM_TYPES.DINER]: 150,
    [ROOM_TYPES.WATER_TREATMENT]: 150,
    [ROOM_TYPES.ARMORY]: 200,
    [ROOM_TYPES.MEDBAY]: 300,
    [ROOM_TYPES.WORKSHOP]: 500
};

export class RoomSystem {
    constructor(game) {
        this.game = game;
        this.rooms = []; // List of built rooms
    }

    // Called when a room is built
    addRoom(type, x, y) {
        this.rooms.push({ type, x, y });
        this.applyBuffs();
    }

    applyBuffs() {
        // Reset base stats
        let dwellerSpeed = 2;
        let workSpeed = 1;

        // Calculate buffs
        for (const room of this.rooms) {
            switch (room.type) {
                case ROOM_TYPES.WATER_TREATMENT:
                    dwellerSpeed += 0.5; // +0.5 Speed per Water Treatment
                    break;
                case ROOM_TYPES.MEDBAY:
                    workSpeed += 0.2; // +20% Work Speed per Medbay
                    break;
                // Add other buffs here
            }
        }

        // Apply to WorkerSystem
        this.game.workerSystem.setStats(dwellerSpeed, workSpeed);
    }
}
