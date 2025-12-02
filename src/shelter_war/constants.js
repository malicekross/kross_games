export const TILE_SIZE = 32;
export const GRID_COLS = 24;
export const GRID_ROWS = 16;
export const SCREEN_WIDTH = TILE_SIZE * GRID_COLS; // 768
export const SCREEN_HEIGHT = TILE_SIZE * GRID_ROWS; // 512

export const COLORS = {
    BACKGROUND: 0x1a1a1a,
    DIRT: 0x5d4037,
    SKY: 0x87CEEB,
    UI_BG: 0x000000,
    UI_BORDER: 0x00FF00, // Fallout Green
    TEXT: 0x00FF00,
};

export const GAME_STATES = {
    INTRO: 'INTRO',
    VAULT: 'VAULT',
    WAR: 'WAR',
    VICTORY: 'VICTORY',
    GAME_OVER: 'GAME_OVER'
};
