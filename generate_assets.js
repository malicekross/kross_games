import fs from 'fs';
import { createCanvas } from 'canvas';

function generateTiles() {
    const width = 160;
    const height = 128;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Helper to draw a tile with border
    const drawTile = (x, y, color, borderColor) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 32, 32);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, 30, 30);
    };

    // Row 1: Dirt (Brown)
    for (let i = 0; i < 5; i++) {
        drawTile(i * 32, 0, '#5D4037', '#3E2723'); // Darker brown
        // Add speckles
        ctx.fillStyle = '#795548';
        ctx.fillRect(i * 32 + 8, 8, 4, 4);
        ctx.fillRect(i * 32 + 20, 20, 4, 4);
    }

    // Row 2: Rock (Grey)
    for (let i = 0; i < 5; i++) {
        drawTile(i * 32, 32, '#757575', '#424242');
        // Add cracks
        ctx.strokeStyle = '#424242';
        ctx.beginPath();
        ctx.moveTo(i * 32 + 5, 32 + 5);
        ctx.lineTo(i * 32 + 25, 32 + 25);
        ctx.stroke();
    }

    // Row 3: Bedrock (Dark Grey/Black)
    for (let i = 0; i < 5; i++) {
        drawTile(i * 32, 64, '#212121', '#000000');
        ctx.fillStyle = '#000000';
        ctx.fillRect(i * 32 + 4, 64 + 4, 24, 24); // Inner square
    }

    // Row 4: Empty (Background Wall)
    for (let i = 0; i < 5; i++) {
        drawTile(i * 32, 96, '#1a1a1a', '#000000');
        // Vertical pipes/lines
        ctx.fillStyle = '#000000';
        ctx.fillRect(i * 32 + 10, 96, 4, 32);
        ctx.fillRect(i * 32 + 22, 96, 4, 32);
    }

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
    ctx.fillStyle = '#1976D2';
    ctx.fillRect(8, 8, 16, 24);
    // Yellow Trim
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(14, 8, 4, 24);
    // Head
    ctx.fillStyle = '#FFCC80';
    ctx.fillRect(10, 2, 12, 10);
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(12, 5, 2, 2);
    ctx.fillRect(18, 5, 2, 2);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/dwellers.png', buffer);
    console.log('Generated dwellers.png');
}

function generateMrHandy() {
    const width = 32;
    const height = 32;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Silver Body
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.fill();
    // Arms
    ctx.strokeStyle = '#78909C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 26);
    ctx.lineTo(10, 32);
    ctx.moveTo(16, 26);
    ctx.lineTo(22, 32);
    ctx.moveTo(16, 26);
    ctx.lineTo(16, 32);
    ctx.stroke();
    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(16, 16, 3, 0, Math.PI * 2);
    ctx.fill();

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/mr_handy.png', buffer);
    console.log('Generated mr_handy.png');
}

function generateRooms() {
    const width = 32;
    const height = 32;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Generic Room Icon (Box with door)
    ctx.fillStyle = '#4CAF50'; // Greenish
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = '#81C784';
    ctx.fillRect(10, 10, 12, 22); // Door

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/rooms.png', buffer);
    console.log('Generated rooms.png');
}

function generateCombatUnits() {
    const width = 32;
    const height = 32;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Soldier (Green)
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(8, 8, 16, 24);
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(10, 2, 12, 10); // Helmet

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/combat_units.png', buffer);
    console.log('Generated combat_units.png');
}

function generateEnemies() {
    const width = 32;
    const height = 32;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Radroach (Brown bug)
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.ellipse(16, 24, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs
    ctx.strokeStyle = '#3E2723';
    ctx.beginPath();
    ctx.moveTo(6, 24); ctx.lineTo(26, 24);
    ctx.stroke();

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/enemies.png', buffer);
    console.log('Generated enemies.png');
}

function generateUI() {
    const width = 32;
    const height = 32;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Simple UI icon (Gear)
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(16, 16, 6, 0, Math.PI * 2);
    ctx.fill();

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/war/assets/ui.png', buffer);
    console.log('Generated ui.png');
}

generateTiles();
generateDwellers();
generateMrHandy();
generateRooms();
generateCombatUnits();
generateEnemies();
generateUI();
