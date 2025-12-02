import { Container, Sprite, Texture, Rectangle, Assets } from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants.js';

export const UNIT_TYPES = {
    SCOUT: 'SCOUT',
    SOLDIER: 'SOLDIER',
    BRUTE: 'BRUTE',
    POWER_ARMOR: 'POWER_ARMOR'
};

export const ENEMY_TYPES = {
    RADROACH: 'RADROACH',
    MOLE_RAT: 'MOLE_RAT',
    GHOUL: 'GHOUL',
    RAIDER_SCUM: 'RAIDER_SCUM',
    RAIDER_PSYCHO: 'RAIDER_PSYCHO',
    SUPER_MUTANT: 'SUPER_MUTANT',
    DEATHCLAW: 'DEATHCLAW'
};

export class CombatSystem {
    constructor(app) {
        this.app = app;
        this.container = new Container();
        this.units = []; // Player units
        this.enemies = []; // Enemy units
        this.projectiles = [];

        this.isActive = false;

        // Load textures from cache
        this.unitTextureBase = Assets.get('combat_units');
        this.enemyTextureBase = Assets.get('enemies');

        if (!this.unitTextureBase) this.unitTextureBase = Texture.EMPTY;
        if (!this.enemyTextureBase) this.enemyTextureBase = Texture.EMPTY;

        // Placeholders
        this.textures = {
            [UNIT_TYPES.SCOUT]: new Texture({ source: this.unitTextureBase.source, frame: new Rectangle(0, 0, 32, 32) }),

            // Enemies (Mapped to rows in enemies.png)
            [ENEMY_TYPES.RADROACH]: new Texture({ source: this.enemyTextureBase.source, frame: new Rectangle(0, 0, 32, 32) }),
            [ENEMY_TYPES.MOLE_RAT]: new Texture({ source: this.enemyTextureBase.source, frame: new Rectangle(0, 32, 32, 32) }),
            [ENEMY_TYPES.GHOUL]: new Texture({ source: this.enemyTextureBase.source, frame: new Rectangle(0, 64, 32, 32) }),
            [ENEMY_TYPES.RAIDER_SCUM]: new Texture({ source: this.enemyTextureBase.source, frame: new Rectangle(0, 96, 32, 32) }),
            [ENEMY_TYPES.RAIDER_PSYCHO]: new Texture({ source: this.enemyTextureBase.source, frame: new Rectangle(0, 128, 32, 32) }),
            [ENEMY_TYPES.SUPER_MUTANT]: new Texture({ source: this.enemyTextureBase.source, frame: new Rectangle(0, 160, 32, 32) }),
            [ENEMY_TYPES.DEATHCLAW]: new Texture({ source: this.enemyTextureBase.source, frame: new Rectangle(0, 192, 32, 32) })
        };
    }

    startWar() {
        this.isActive = true;
        this.container.visible = true;
        console.log('War Mode Started!');
    }

    endWar() {
        this.isActive = false;
        this.container.visible = false;
        // Cleanup units
        this.units.forEach(u => u.sprite.destroy());
        this.enemies.forEach(e => e.sprite.destroy());
        this.units = [];
        this.enemies = [];
    }

    spawnUnit(type) {
        const unit = {
            type,
            sprite: new Sprite(this.textures[type] || this.textures[UNIT_TYPES.SCOUT]),
            x: 50, // Spawn at left
            y: SCREEN_HEIGHT - 100, // Ground level
            hp: 100,
            damage: 10,
            speed: 2,
            team: 'player'
        };
        unit.sprite.x = unit.x;
        unit.sprite.y = unit.y;
        this.container.addChild(unit.sprite);
        this.units.push(unit);
    }

    spawnEnemy(type) {
        const enemy = {
            type,
            sprite: new Sprite(this.textures[type] || this.textures[ENEMY_TYPES.RADROACH]),
            x: SCREEN_WIDTH - 50, // Spawn at right
            y: SCREEN_HEIGHT - 100,
            hp: 50,
            damage: 5,
            speed: 1.5,
            team: 'enemy'
        };
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        enemy.sprite.scale.x = -1; // Face left
        this.container.addChild(enemy.sprite);
        this.enemies.push(enemy);
    }

    update(delta) {
        if (!this.isActive) return;

        // Move Units
        for (const unit of this.units) {
            // Check for enemies in range
            const target = this.findTarget(unit, this.enemies);
            if (target) {
                // Attack logic (placeholder)
            } else {
                // Move right
                unit.x += unit.speed * delta;
                unit.sprite.x = unit.x;
            }
        }

        // Move Enemies
        for (const enemy of this.enemies) {
            const target = this.findTarget(enemy, this.units);
            if (target) {
                // Attack logic
            } else {
                // Move left
                enemy.x -= enemy.speed * delta;
                enemy.sprite.x = enemy.x;
            }
        }
    }

    findTarget(attacker, targets) {
        // Simple range check
        for (const target of targets) {
            const dist = Math.abs(attacker.x - target.x);
            if (dist < 40) return target;
        }
        return null;
    }
}
