import fs from 'fs';
import { createCanvas } from 'canvas';
import path from 'path';

// Ensure directory exists
const outDir = 'shelter_war/assets';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function generateTiles() {
    const width = 160;
    const height = 128;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Helper to draw a tile with border
    const drawTile = (x, y, color, borderColor, pattern) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 32, 32);

        // Add pattern
        if (pattern === 'noise') {
            for (let i = 0; i < 20; i++) {
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
                ctx.fillRect(x + Math.random() * 30, y + Math.random() * 30, 2, 2);
            }
        } else if (pattern === 'cracks') {
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 5); ctx.lineTo(x + 15, y + 15);
            ctx.stroke();
        }

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, 30, 30);
    };

    // Row 1: Dirt (Brown)
    for (let i = 0; i < 5; i++) {
        drawTile(i * 32, 0, '#5D4037', '#3E2723', 'noise');
    }

    // Row 2: Rock (Grey)
    for (let i = 0; i < 5; i++) {
        drawTile(i * 32, 32, '#757575', '#424242', 'cracks');
    }

    // Row 3: Bedrock (Dark Grey/Black)
    for (let i = 0; i < 5; i++) {
        drawTile(i * 32, 64, '#212121', '#000000', 'noise');
        ctx.fillStyle = '#000000';
        ctx.fillRect(i * 32 + 8, 64 + 8, 16, 16); // Inner square
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
    fs.writeFileSync(path.join(outDir, 'tiles.png'), buffer);
    console.log('Generated tiles.png');
}

function generateDwellers() {
    const width = 160; // 5 frames * 32
    const height = 32;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const colors = ['#1976D2', '#D32F2F', '#388E3C', '#FBC02D', '#7B1FA2']; // Blue, Red, Green, Yellow, Purple jumpsuits

    for (let i = 0; i < 5; i++) {
        const x = i * 32;

        // Body (Jumpsuit)
        ctx.fillStyle = colors[i];
        ctx.fillRect(x + 8, 8, 16, 24);

        // Yellow Trim (Vault Stripe)
        ctx.fillStyle = '#FFEB3B';
        ctx.fillRect(x + 14, 8, 4, 24);

        // Head
        ctx.fillStyle = '#FFCC80'; // Skin tone
        ctx.fillRect(x + 10, 2, 12, 10);

        // Hair (Different for each)
        ctx.fillStyle = ['#5D4037', '#FFC107', '#000000', '#E64A19', '#616161'][i];
        ctx.fillRect(x + 10, 0, 12, 4);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 12, 5, 2, 2);
        ctx.fillRect(x + 18, 5, 2, 2);
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outDir, 'dwellers.png'), buffer);
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
    fs.writeFileSync(path.join(outDir, 'mr_handy.png'), buffer);
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
    fs.writeFileSync(path.join(outDir, 'rooms.png'), buffer);
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
    fs.writeFileSync(path.join(outDir, 'combat_units.png'), buffer);
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
    fs.writeFileSync(path.join(outDir, 'enemies.png'), buffer);
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
    fs.writeFileSync(path.join(outDir, 'ui.png'), buffer);
    console.log('Generated ui.png');
}

generateTiles();
generateDwellers();
generateMrHandy();
generateRooms();
generateCombatUnits();
generateEnemies();
generateUI();
