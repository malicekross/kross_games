import { ENEMY_TYPES } from './CombatSystem.js';

export class WaveSystem {
    constructor(combatSystem) {
        this.combatSystem = combatSystem;
        this.day = 1;
        this.waveActive = false;
        this.enemiesToSpawn = [];
        this.spawnTimer = 0;
    }

    startWave(day) {
        this.day = day;
        this.waveActive = true;
        this.enemiesToSpawn = this.generateWave(day);
        this.combatSystem.startWar();
        console.log(`Wave for Day ${day} Started! Enemies: ${this.enemiesToSpawn.length}`);
    }

    generateWave(day) {
        const enemies = [];
        // Cumulative scaling
        // Day 1: Radroach
        if (day >= 1) {
            for (let i = 0; i < 5 + day; i++) enemies.push(ENEMY_TYPES.RADROACH);
        }
        // Day 2: Mole Rat
        if (day >= 2) {
            for (let i = 0; i < 3 + day; i++) enemies.push(ENEMY_TYPES.MOLE_RAT);
        }
        // Day 3: Ghoul
        if (day >= 3) {
            for (let i = 0; i < 3 + day; i++) enemies.push(ENEMY_TYPES.GHOUL);
        }
        // Day 4: Raider Scum
        if (day >= 4) {
            for (let i = 0; i < 2 + day; i++) enemies.push(ENEMY_TYPES.RAIDER_SCUM);
        }
        // Day 5: Raider Psycho
        if (day >= 5) {
            for (let i = 0; i < 2 + day; i++) enemies.push(ENEMY_TYPES.RAIDER_PSYCHO);
        }
        // Day 6: Super Mutant
        if (day >= 6) {
            for (let i = 0; i < 1 + day; i++) enemies.push(ENEMY_TYPES.SUPER_MUTANT);
        }
        // Day 7: Deathclaw
        if (day >= 7) {
            enemies.push(ENEMY_TYPES.DEATHCLAW);
        }

        // Shuffle
        return enemies.sort(() => Math.random() - 0.5);
    }

    update(delta) {
        if (!this.waveActive) return;

        if (this.enemiesToSpawn.length > 0) {
            this.spawnTimer += delta;
            if (this.spawnTimer > 100) { // Spawn every ~1.5s
                const type = this.enemiesToSpawn.pop();
                this.combatSystem.spawnEnemy(type);
                this.spawnTimer = 0;
            }
        } else if (this.combatSystem.enemies.length === 0) {
            // Wave Cleared
            this.waveActive = false;
            this.combatSystem.endWar();
            console.log('Wave Cleared!');
        }
    }
}
