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
    const extraPath = path.join(outDir, 'source_extra.png');

    if (!fs.existsSync(sourcePath)) {
        console.error('Source sprite sheet not found at ' + sourcePath);
        return;
    }

    console.log('Loading source images...');
    const image1 = await loadImage(sourcePath);
    const canvas1 = createCanvas(image1.width, image1.height);
    const ctx1 = canvas1.getContext('2d');
    ctx1.drawImage(image1, 0, 0);

    let canvas2, ctx2;
    if (fs.existsSync(extraPath)) {
        console.log('Loading extra source image...');
        const image2 = await loadImage(extraPath);
        canvas2 = createCanvas(image2.width, image2.height);
        ctx2 = canvas2.getContext('2d');
        ctx2.drawImage(image2, 0, 0);
    }

    // Helper to remove background (Chroma Key)
    const removeBackground = (ctx, width, height) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Sample top-left pixel as background color 1
        const bg1 = { r: data[0], g: data[1], b: data[2] };

        // Sample a pixel that is likely the other checkerboard color (e.g., 16px right, 16px down)
        // If it's a 32x32 grid, the checkerboard might be smaller. Let's assume standard 8x8 or 16x16 checks.
        // Let's sample a few points to find common background colors.
        // Or simpler: Just assume anything close to grey/white is background?
        // No, that might kill the robot's silver body.

        // Better approach: The background is likely the checkerboard.
        // Let's define the two checkerboard colors based on the top-left area.
        // Usually it's a light grey and a dark grey.
        // Pixel 0,0 was 149,149,149.

        // Let's use a tolerance.
        const tolerance = 30; // For JPEG artifacts

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Check against BG1 (Grey ~149)
            // Also check against White/Lighter Grey if present.
            // Looking at the user's image, it seems to be a standard checkerboard.
            // Let's check if it's "greyish" and not "colorful".

            // Heuristic: Low saturation (R~=G~=B) and high brightness?
            // But the robot is also grey.

            // Let's stick to keying out the specific sampled background colors.
            // We'll sample 0,0.
            const dist1 = Math.sqrt(Math.pow(r - bg1.r, 2) + Math.pow(g - bg1.g, 2) + Math.pow(b - bg1.b, 2));

            // Sample another point for the second checker color?
            // Let's assume the checkerboard squares are maybe 8x8 or 16x16.
            // Let's check pixel at 10,0.
            // If the user image is 32x32 grid, the checkerboard is likely smaller.

            // Let's try to detect the second color dynamically.
            // If we encounter a pixel that is "grey" but different from bg1, maybe it's bg2?

            // For now, let's just key out the color at 0,0 with tolerance.
            // If the checkerboard has two colors, we might miss one.
            // Let's assume the user's "transparent" background is the grey checkerboard.
            // Often these tools export a grid.

            // Let's hardcode the check for the grey we found (149) and maybe a lighter one (204 or 255).
            // 149 is #959595.
            // The other square is often #CCCCCC (204) or #FFFFFF (255).

            const isGrey1 = dist1 < tolerance;

            // Check for a second common grey (e.g. 204, 204, 204)
            const dist2 = Math.sqrt(Math.pow(r - 204, 2) + Math.pow(g - 204, 2) + Math.pow(b - 204, 2));
            const isGrey2 = dist2 < tolerance;

            if (isGrey1 || isGrey2) {
                data[i + 3] = 0; // Transparent
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    // Helper to extract from a specific canvas
    const extract = (canvas, name, x, y, w, h) => {
        const c = createCanvas(w, h);
        const cx = c.getContext('2d');
        cx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

        // Apply background removal
        removeBackground(cx, w, h);

        const buffer = c.toBuffer('image/png');
        fs.writeFileSync(path.join(outDir, name), buffer);
        console.log(`Generated ${name}`);
    };

    // --- FROM SOURCE 1 ---
    // 1. Dwellers (Top-Left)
    extract(canvas1, 'dwellers.png', 0, 0, 384, 160);

    // 2. Tiles (Top-Right)
    extract(canvas1, 'tiles.png', 384, 0, 160, 128);

    // 3. Mr Handy (Row 13)
    extract(canvas1, 'mr_handy.png', 384, 224, 128, 32);

    // 4. UI / Rooms (Row 13)
    extract(canvas1, 'ui.png', 384 + 128, 224, 128, 32);
    extract(canvas1, 'rooms.png', 384 + 128, 224, 128, 32);

    // 5. Combat Units (Power Armor - Row 12 of Source 1)
    extract(canvas1, 'combat_units.png', 384, 192, 384, 32);

    // --- COMBINED ENEMIES ---
    // We need to combine:
    // Source 1: Radroach (Row 10), Mole Rat (Row 11) -> y=128, h=64
    // Source 2: Ghoul (Row 1), Raider Scum (Row 2), Raider Psycho (Row 3), Super Mutant (Row 4), Deathclaw (Row 5) -> y=0, h=160

    // Total Height: 64 + 160 = 224px.
    const enemiesCanvas = createCanvas(384, 224);
    const eCtx = enemiesCanvas.getContext('2d');

    // Draw Radroach & Mole Rat from Source 1 (Rows 10, 11)
    // Source 1 Row 10 starts at y=128. Height 64px (2 rows).
    eCtx.drawImage(canvas1, 384, 128, 384, 64, 0, 0, 384, 64);

    if (canvas2) {
        // Draw New Enemies from Source 2 (Rows 1-5)
        // Source 2 starts at 0,0. 5 rows = 160px height.
        // Draw them starting at y=64 in the new canvas.
        eCtx.drawImage(canvas2, 0, 0, 384, 160, 0, 64, 384, 160);

        // Extract Pets (Dogmeat) from Source 2
        // Row 6 is separator, Row 7 is Dogmeat. y = 192.
        extract(canvas2, 'pets.png', 0, 192, 384, 32);
    } else {
        console.warn('Source extra image not found, skipping new enemies.');
    }

    const enemiesBuffer = enemiesCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outDir, 'enemies.png'), enemiesBuffer);
    console.log('Generated enemies.png (Combined)');
}

processSpriteSheet();
