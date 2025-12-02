export class SaveSystem {
    constructor(game) {
        this.game = game;
        this.prefix = 'shelter_war_save_';
    }

    save(slot) {
        const data = {
            day: this.game.timeSystem.day,
            dwellers: this.game.workerSystem.dwellers.map(d => ({
                x: d.sprite.x,
                y: d.sprite.y,
                speed: d.speed
            })),
            rooms: this.game.gridSystem.tiles.map(row => row.map(t => t.type)),
            timestamp: Date.now()
        };
        localStorage.setItem(this.prefix + slot, JSON.stringify(data));
        console.log(`Game Saved to Slot ${slot}`);

        // Auto-save to slot 0 (Auto)
        localStorage.setItem(this.prefix + 'auto', JSON.stringify(data));
    }

    load(slot) {
        const json = localStorage.getItem(this.prefix + slot);
        if (!json) {
            console.log(`No save found in Slot ${slot}`);
            return false;
        }

        const data = JSON.parse(json);
        console.log(`Loading Save from Slot ${slot}...`);

        // Restore State
        this.game.timeSystem.day = data.day;
        // Restore Dwellers (Clear and Re-spawn)
        this.game.workerSystem.dwellers.forEach(d => d.sprite.destroy());
        this.game.workerSystem.dwellers = [];
        data.dwellers.forEach(d => {
            this.game.workerSystem.spawnDweller(d.x / 32, d.y / 32); // Convert px to grid
        });

        // Restore Rooms/Grid (Simplified)
        // In real implementation, we'd need to rebuild the grid sprites

        return true;
    }

    hasSave(slot) {
        return !!localStorage.getItem(this.prefix + slot);
    }
}
