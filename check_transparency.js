import fs from 'fs';
import path from 'path';
import { loadImage, createCanvas } from 'canvas';

const outDir = 'public/shelter_war/assets';

async function checkTransparency() {
    const sourcePath = path.join(outDir, 'source.png');
    if (!fs.existsSync(sourcePath)) {
        console.log('Source not found');
        return;
    }

    const image = await loadImage(sourcePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Check top-left 10x10 pixels
    console.log('--- Pixel Analysis (0,0 to 2,2) ---');
    const data = ctx.getImageData(0, 0, 10, 10).data;

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            const i = (y * 10 + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            console.log(`Pixel [${x},${y}]: R=${r} G=${g} B=${b} A=${a}`);
        }
    }
}

checkTransparency();
