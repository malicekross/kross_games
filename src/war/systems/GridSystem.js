import { Container, Sprite, Texture, Rectangle, Assets } from 'pixi.js';
import { TILE_SIZE, GRID_COLS, GRID_ROWS, COLORS } from '../constants.js';

export const TILE_TYPES = {
    DIRT: 0,
    ROCK: 1,
    BEDROCK: 2,
    EMPTY: 3,
    ROOM: 4
};

export class GridSystem {
    constructor(app, worldContainer) {
        this.app = app;
        this.container = new Container();
        this.tiles = []; // 2D array of tile data
        this.sprites = []; // 2D array of sprites

        worldContainer.addChild(this.container);

        // Load textures from cache (using alias)
        this.textureBase = Assets.get('tiles');

        // Fallback if not loaded (should be loaded by Game.js)
        if (!this.textureBase) {
            console.error('Tiles texture not found in cache!');
            this.textureBase = Texture.EMPTY;
        }

        this.textures = {
            [TILE_TYPES.DIRT]: [],
            [TILE_TYPES.ROCK]: [],
            [TILE_TYPES.BEDROCK]: [],
            [TILE_TYPES.EMPTY]: [] // Background wall
        };

        this._initTextures();
        this._initGrid();
    }

    _initTextures() {
        // Assuming 32x32 tiles, 5 variants per row
        // Row 0: Dirt, Row 1: Rock, Row 2: Bedrock, Row 3: Wall
        for (let i = 0; i < 5; i++) {
            this.textures[TILE_TYPES.DIRT].push(new Texture({ source: this.textureBase.source, frame: new Rectangle(i * 32, 0, 32, 32) }));
            this.textures[TILE_TYPES.ROCK].push(new Texture({ source: this.textureBase.source, frame: new Rectangle(i * 32, 32, 32, 32) }));
            this.textures[TILE_TYPES.BEDROCK].push(new Texture({ source: this.textureBase.source, frame: new Rectangle(i * 32, 64, 32, 32) }));
            this.textures[TILE_TYPES.EMPTY].push(new Texture({ source: this.textureBase.source, frame: new Rectangle(i * 32, 96, 32, 32) }));
        }
    }

    _initGrid() {
        for (let y = 0; y < GRID_ROWS; y++) {
            this.tiles[y] = [];
            this.sprites[y] = [];
            for (let x = 0; x < GRID_COLS; x++) {
                // Default to dirt, bedrock at bottom, rock scattered
                let type = TILE_TYPES.DIRT;
                if (y === GRID_ROWS - 1) type = TILE_TYPES.BEDROCK;
                else if (Math.random() < 0.1) type = TILE_TYPES.ROCK;

                // Top row is empty (surface)
                if (y === 0) type = TILE_TYPES.EMPTY;

                this.tiles[y][x] = { type, room: null };

                const sprite = new Sprite(this._getRandomTexture(type));
                sprite.x = x * TILE_SIZE;
                sprite.y = y * TILE_SIZE;
                sprite.eventMode = 'static'; // Enable interaction
                sprite.on('pointerdown', () => this.onTileClick(x, y));

                this.container.addChild(sprite);
                this.sprites[y][x] = sprite;
            }
        }
    }

    onTileClick(x, y) {
        // Placeholder, will be overridden by Game.js
        console.log(`Clicked tile ${x}, ${y}`);
    }

    _getRandomTexture(type) {
        const variants = this.textures[type];
        if (!variants || variants.length === 0) return Texture.EMPTY;
        return variants[Math.floor(Math.random() * variants.length)];
    }

    dig(x, y) {
        if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
        const tile = this.tiles[y][x];

        if (tile.type === TILE_TYPES.BEDROCK || tile.type === TILE_TYPES.EMPTY || tile.type === TILE_TYPES.ROOM) {
            return false;
        }

        tile.type = TILE_TYPES.EMPTY;
        this.sprites[y][x].texture = this._getRandomTexture(TILE_TYPES.EMPTY);
        return true;
    }

    getTile(x, y) {
        if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return null;
        return this.tiles[y][x];
    }
}
