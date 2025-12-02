import { Container, Sprite, Texture, Rectangle, Assets } from 'pixi.js';
import { TILE_SIZE, GRID_COLS, GRID_ROWS } from '../constants.js';
import { TILE_TYPES } from './GridSystem.js';

export const JOB_TYPES = {
    IDLE: 'IDLE',
    DIG: 'DIG',
    BUILD: 'BUILD',
    HAUL: 'HAUL'
};

export class WorkerSystem {
    constructor(app, gridSystem, pathfinder) {
        this.app = app;
        this.gridSystem = gridSystem;
        this.pathfinder = pathfinder;
        this.container = new Container();
        this.dwellers = [];
        this.mrHandys = []; // Separate list for robots
        this.jobs = []; // Queue of jobs { type, x, y, priority }

        // Load textures from cache
        this.textureBase = Assets.get('dwellers');
        this.mrHandyTextureBase = Assets.get('mr_handy');

        if (!this.textureBase) this.textureBase = Texture.EMPTY;
        if (!this.mrHandyTextureBase) this.mrHandyTextureBase = Texture.EMPTY;

        // Assuming 32x32 sprites, now with 5 frames
        this.dwellerTextures = [];
        for (let i = 0; i < 5; i++) {
            this.dwellerTextures.push(new Texture({ source: this.textureBase.source, frame: new Rectangle(i * 32, 0, 32, 32) }));
        }

        this.mrHandyIdleTexture = new Texture({ source: this.mrHandyTextureBase.source, frame: new Rectangle(0, 0, 32, 32) });

        this.baseSpeed = 2;
        this.workSpeed = 1;
    }

    setStats(speed, workSpeed) {
        this.baseSpeed = speed;
        this.workSpeed = workSpeed;
        // Update existing dwellers
        for (const dweller of this.dwellers) {
            dweller.speed = this.baseSpeed;
        }
    }

    spawnDweller(x, y) {
        const randomTexture = this.dwellerTextures[Math.floor(Math.random() * this.dwellerTextures.length)];
        const dweller = {
            sprite: new Sprite(randomTexture),
            x: x,
            y: y,
            state: JOB_TYPES.IDLE,
            path: [],
            targetJob: null,
            speed: this.baseSpeed,
            isRobot: false
        };

        dweller.sprite.x = x * TILE_SIZE;
        dweller.sprite.y = y * TILE_SIZE;

        this.container.addChild(dweller.sprite);
        this.dwellers.push(dweller);
    }

    spawnMrHandy(x, y) {
        if (this.mrHandys.length >= 4) return; // Max 4

        const robot = {
            sprite: new Sprite(this.mrHandyIdleTexture),
            x: x,
            y: y,
            state: JOB_TYPES.IDLE,
            path: [],
            targetJob: null,
            speed: 4, // Max speed
            isRobot: true
        };

        robot.sprite.x = x * TILE_SIZE;
        robot.sprite.y = y * TILE_SIZE;

        this.container.addChild(robot.sprite);
        this.mrHandys.push(robot);
    }

    addJob(type, x, y) {
        this.jobs.push({ type, x, y, priority: 1 });
    }

    update(delta) {
        for (const dweller of this.dwellers) {
            this._updateDweller(dweller, delta);
        }
        for (const robot of this.mrHandys) {
            this._updateDweller(robot, delta);
        }
    }

    _updateDweller(dweller, delta) {
        // 1. Assign Job if Idle
        if (dweller.state === JOB_TYPES.IDLE && this.jobs.length > 0) {
            const job = this.jobs.shift(); // Simple FIFO for now
            const startX = Math.floor(dweller.sprite.x / TILE_SIZE);
            const startY = Math.floor(dweller.sprite.y / TILE_SIZE);

            const path = this.pathfinder.findPath(startX, startY, job.x, job.y);

            if (path) {
                dweller.state = job.type;
                dweller.targetJob = job;
                dweller.path = path;
            } else {
                // Job unreachable, put back in queue (maybe at end)
                this.jobs.push(job);
            }
        }

        // 2. Move along path
        if (dweller.path.length > 0) {
            const targetNode = dweller.path[0];
            const targetX = targetNode.x * TILE_SIZE;
            const targetY = targetNode.y * TILE_SIZE;

            const dx = targetX - dweller.sprite.x;
            const dy = targetY - dweller.sprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < dweller.speed * delta) {
                // Reached node
                dweller.sprite.x = targetX;
                dweller.sprite.y = targetY;
                dweller.path.shift();
            } else {
                // Move towards node
                dweller.sprite.x += (dx / dist) * dweller.speed * delta;
                dweller.sprite.y += (dy / dist) * dweller.speed * delta;
            }
        } else if (dweller.targetJob) {
            // 3. Perform Job
            this._performJob(dweller);
        }
    }

    _performJob(dweller) {
        const job = dweller.targetJob;
        if (job.type === JOB_TYPES.DIG) {
            // Instant dig for now, add timer later
            this.gridSystem.dig(job.x, job.y);
            dweller.state = JOB_TYPES.IDLE;
            dweller.targetJob = null;
        }
    }
}
