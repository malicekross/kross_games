import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

// Ensure directory exists
const outDir = 'public/shelter_war/assets';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function processSpriteSheet() {
    const sourcePath = path.join(outDir, 'source.png');
    if (!fs.existsSync(sourcePath)) {
        console.error('Source sprite sheet not found at ' + sourcePath);
        return;
    }

    console.log('Loading source image...');
    const image = await loadImage(sourcePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Helper to extract and save
    const extract = (name, x, y, w, h) => {
        const c = createCanvas(w, h);
        const cx = c.getContext('2d');
        cx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

        const buffer = c.toBuffer('image/png');
        fs.writeFileSync(path.join(outDir, name), buffer);
        console.log(`Generated ${name}`);
    };

    // Layout Analysis based on visual inspection of the uploaded image:
    // The image likely contains:
    // Top-Left: Dwellers (12 cols x 5 rows) -> 384x160
    // Top-Right: Tiles (5 cols x 4 rows) -> 160x128. Starts at x=384.
    // Bottom-Left: Duplicate Tiles? Or maybe nothing.
    // Bottom-Right: Enemies (9 cols? x 3 rows). Starts at x=384, y=128.
    // Row 13 (Mr Handy/UI): Starts at x=384, y=224 (below enemies).

    // 1. Dwellers
    extract('dwellers.png', 0, 0, 384, 160);

    // 2. Tiles
    extract('tiles.png', 384, 0, 160, 128);

    // 3. Enemies
    // The prompt asked for 3 rows of enemies.
    // Row 10: Radroach
    // Row 11: Mole Rat
    // Row 12: Power Armor
    // Let's extract this block. 
    // Width: Prompt asked for 12 cols (384px), but image might be smaller if animations are missing.
    // Let's grab 384px width to be safe; empty space is fine.
    extract('enemies.png', 384, 128, 384, 96);

    // 4. Mr Handy
    // Row 13, Cols 1-4 (0-128px relative to start)
    // Start Y = 128 (end of tiles) + 96 (enemies) = 224?
    // Wait, Tiles are 128px high. Enemies start at y=128?
    // Yes. Enemies are 96px high (3 rows).
    // So Mr Handy starts at y = 128 + 96 = 224.
    // X = 384.
    extract('mr_handy.png', 384, 224, 128, 32);

    // 5. UI / Rooms
    // Row 13, Cols 5-8 (128-256px relative to start)
    extract('ui.png', 384 + 128, 224, 128, 32);

    // Use UI slice for rooms too for now
    extract('rooms.png', 384 + 128, 224, 128, 32);

    // 6. Combat Units (Power Armor)
    // This is Row 12 (3rd row of enemies).
    // Y = 128 + 64 = 192.
    extract('combat_units.png', 384, 192, 384, 32);
}

processSpriteSheet();
