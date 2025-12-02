import fs from 'fs';
import { createCanvas } from 'canvas';
import path from 'path';

// Ensure directory exists
const outDir = 'public/shelter_war/assets';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function generateTiles() {
    const width = 160; // 5 variants * 32
    const height = 128; // 4 types * 32
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Helper for noise
    function addNoise(ctx, x, y, w, h, intensity = 0.1) {
        const imageData = ctx.getImageData(x, y, w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const factor = 1 - intensity + Math.random() * intensity * 2;
            data[i] *= factor;
            data[i + 1] *= factor;
            data[i + 2] *= factor;
        }
        ctx.putImageData(imageData, x, y);
    }

    // Row 0: Dirt
    for (let i = 0; i < 5; i++) {
        const x = i * 32;
        ctx.fillStyle = '#5d4037'; // Base dirt
        ctx.fillRect(x, 0, 32, 32);
        // Add texture
        ctx.fillStyle = '#4e342e';
        for (let k = 0; k < 10; k++) ctx.fillRect(x + Math.random() * 30, Math.random() * 30, 2, 2);
        addNoise(ctx, x, 0, 32, 32, 0.15);
        // Border
        ctx.strokeStyle = '#3e2723';
        ctx.strokeRect(x, 0, 32, 32);
    }

    // Row 1: Rock
    for (let i = 0; i < 5; i++) {
        const x = i * 32;
        ctx.fillStyle = '#757575'; // Base rock
        ctx.fillRect(x, 32, 32, 32);
        // Cracks
        ctx.strokeStyle = '#424242';
        ctx.beginPath();
        ctx.moveTo(x + Math.random() * 32, 32 + Math.random() * 32);
        ctx.lineTo(x + Math.random() * 32, 32 + Math.random() * 32);
        ctx.stroke();
        addNoise(ctx, x, 32, 32, 32, 0.2);
    }

    // Row 2: Bedrock
    for (let i = 0; i < 5; i++) {
        const x = i * 32;
        ctx.fillStyle = '#212121'; // Dark bedrock
        ctx.fillRect(x, 64, 32, 32);
        // Hard pattern
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 4, 64 + 4, 24, 24);
        ctx.fillStyle = '#212121';
        ctx.fillRect(x + 8, 64 + 8, 16, 16);
        addNoise(ctx, x, 64, 32, 32, 0.1);
    }

    // Row 3: Background Wall (Empty)
    for (let i = 0; i < 5; i++) {
        const x = i * 32;
        ctx.fillStyle = '#3e2723'; // Darker dirt wall
        ctx.fillRect(x, 96, 32, 32);
        // Grid pattern for vault wall look
        ctx.strokeStyle = '#281a17';
        ctx.strokeRect(x, 96, 32, 32);
        ctx.fillStyle = '#2d1e1b';
        ctx.fillRect(x + 2, 96 + 2, 28, 28);
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outDir, 'tiles.png'), buffer);
    console.log('Generated tiles.png');
}

function generateDwellers() {
    const width = 128; // 4 frames * 32
    const height = 160; // 5 variants * 32
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const variants = [
        { skin: '#f1c27d', hair: '#4a3b2a', suit: '#0000FF', gender: 'M' }, // Light skin, brown hair, blue suit
        { skin: '#8d5524', hair: '#000000', suit: '#0000FF', gender: 'F' }, // Dark skin, black hair
        { skin: '#e0ac69', hair: '#e6cea8', suit: '#0000FF', gender: 'M' }, // Med skin, blonde hair
        { skin: '#c68642', hair: '#a52a2a', suit: '#0000FF', gender: 'F' }, // Tan skin, red hair
        { skin: '#ffdbac', hair: '#808080', suit: '#0000FF', gender: 'M' }  // Pale skin, grey hair
    ];

    for (let i = 0; i < 5; i++) {
        const y = i * 32;
        const v = variants[i];

        for (let f = 0; f < 4; f++) {
            const x = f * 32;

            // Frame offset for animation
            const bounce = (f === 1 || f === 3) ? -1 : 0;
            const legOffset = (f === 1) ? -2 : (f === 3) ? 2 : 0;

            ctx.save();
            ctx.translate(x + 16, y + 16 + bounce); // Center

            // Body (Jumpsuit)
            ctx.fillStyle = v.suit;
            ctx.fillRect(-6, -4, 12, 14);
            // Yellow stripe
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(-1, -4, 2, 14);

            // Legs
            ctx.fillStyle = '#1a1a1a'; // Dark pants/shoes
            ctx.fillRect(-5 + legOffset, 10, 4, 6);
            ctx.fillRect(1 - legOffset, 10, 4, 6);

            // Head
            ctx.fillStyle = v.skin;
            ctx.beginPath();
            ctx.arc(0, -10, 6, 0, Math.PI * 2);
            ctx.fill();

            // Hair
            ctx.fillStyle = v.hair;
            if (v.gender === 'M') {
                ctx.fillRect(-6, -16, 12, 4); // Short hair
                ctx.fillRect(-7, -14, 2, 6); // Sideburns
            } else {
                ctx.beginPath();
                ctx.arc(0, -10, 7, Math.PI, 0); // Top
                ctx.fillRect(-7, -10, 14, 8); // Long hair sides
                ctx.fill();
            }

            // Face
            ctx.fillStyle = '#000000';
            ctx.fillRect(-2, -11, 1, 1); // Eye
            ctx.fillRect(1, -11, 1, 1); // Eye
            ctx.fillStyle = '#a0522d'; // Mouth
            ctx.fillRect(-1, -8, 2, 1);

            // Arms
            ctx.fillStyle = v.suit;
            ctx.fillRect(-9, -3, 3, 8); // Left arm
            ctx.fillRect(6, -3, 3, 8); // Right arm

            // Hands
            ctx.fillStyle = v.skin;
            ctx.fillRect(-9, 5, 3, 3);
            ctx.fillRect(6, 5, 3, 3);

            ctx.restore();
        }
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
