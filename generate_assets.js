import fs from 'fs';
import { createCanvas } from 'canvas';

function generateTiles() {
    const width = 160;
    const height = 128;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Row 1: Dirt (Brown)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, width, 32);
    // Add some noise
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#A0522D' : '#8B4513';
        ctx.fillRect(i * 32 + 4, 4, 24, 24);
    }

    // Row 2: Rock (Grey)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 32, width, 32);
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#A9A9A9' : '#696969';
        ctx.fillRect(i * 32 + 4, 36, 24, 24);
    }

    // Row 3: Bedrock (Dark Grey)
    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(0, 64, width, 32);
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(i * 32 + 8, 72, 16, 16);
    }

    // Row 4: Empty (Black/Dark Brown)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 96, width, 32);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/tiles.png', buffer);
    console.log('Generated tiles.png');
}

function generateDwellers() {
    const width = 32;
    const height = 32;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Blue Jumpsuit
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(8, 8, 16, 24);
    // Yellow Trim
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(14, 8, 4, 24);
    // Head
    ctx.fillStyle = '#FFD700'; // Skin tone-ish
    ctx.fillRect(10, 2, 12, 10);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/dwellers.png', buffer);
    console.log('Generated dwellers.png');
}

function generateUI() {
    const width = 32;
    const height = 32;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Simple UI icon
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, 32, 32);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/ui.png', buffer);
    console.log('Generated ui.png');
}

generateTiles();
generateDwellers();
generateUI();
