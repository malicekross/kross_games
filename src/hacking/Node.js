export class Node {
    constructor(x, y, owner = 'neutral') {
        this.x = x;
        this.y = y;
        this.owner = owner; // 'player', 'enemy', 'neutral'
        this.value = 10;
        this.capacity = 60;
        this.radius = 30;

        this.level = 1;
        this.generationRate = 1.1; // Base rate (Level 1)
        this.maxConnections = 1;
        this.timer = 0;

        // Colors
        this.colors = {
            player: '#00ff9d',
            enemy: '#ff3333',
            neutral: '#888888'
        };
    }

    update(deltaTime) {
        // Upgrade Logic
        if (this.value >= 30 && this.level < 3) {
            this.level = 3;
            this.generationRate = 3.3;
        } else if (this.value >= 15 && this.level < 2) {
            this.level = 2;
            this.generationRate = 2.2;
        } else if (this.value < 15) {
            this.level = 1;
            this.generationRate = 1.1;
        }

        // Update max connections based on level
        this.maxConnections = this.level;

        if (this.owner !== 'neutral' && this.value < this.capacity) {
            this.timer += deltaTime;
            if (this.timer >= 1 / this.generationRate) {
                this.value++;
                this.timer = 0;
            }
        }
    }

    draw(ctx, sprites, spritesLoaded, connectionCount = 0) {
        if (spritesLoaded) {
            // Sprite indices:
            // Player: Lvl1=0, Lvl2=1, Lvl3=2
            // Enemy:  Lvl1=3, Lvl2=4, Lvl3=5
            // Neutral: 6
            let spriteIndex = 6;

            if (this.owner === 'player') {
                spriteIndex = this.level - 1;
            } else if (this.owner === 'enemy') {
                spriteIndex = 3 + (this.level - 1);
            }

            const size = this.radius * 2.5; // Slightly larger than hitbox

            // Draw sprite
            ctx.drawImage(
                sprites,
                spriteIndex * 64, 0, 64, 64, // Source
                this.x - size / 2, this.y - size / 2, size, size // Destination
            );

            // Selection Glow (Optimized)
            if (this.owner !== 'neutral') {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = this.colors[this.owner];
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 5 + (this.level * 2), 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        } else {
            // Fallback
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#1a1a1a';
            ctx.fill();

            ctx.lineWidth = 3;
            ctx.strokeStyle = this.colors[this.owner];
            ctx.stroke();
        }

        // Value text (Centered on node)
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow for readability
        // ctx.shadowBlur = 4; // REMOVED FOR PERFORMANCE
        // ctx.shadowColor = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(Math.floor(this.value), this.x, this.y);
        // ctx.shadowBlur = 0; // Reset shadow

        // Fill
        ctx.fillStyle = '#ffffff';
        ctx.fillText(Math.floor(this.value), this.x, this.y);

        // Connection Bubbles
        if (this.owner === 'player') {
            const bubbleRadius = 4;
            const spacing = 12;
            const startX = this.x - ((this.maxConnections - 1) * spacing) / 2;
            const bubbleY = this.y + this.radius + 15;

            for (let i = 0; i < this.maxConnections; i++) {
                ctx.beginPath();
                ctx.arc(startX + (i * spacing), bubbleY, bubbleRadius, 0, Math.PI * 2);

                // Fill if used
                if (i < connectionCount) {
                    ctx.fillStyle = '#00ff9d';
                    ctx.fill();
                }

                // Outline always
                ctx.strokeStyle = '#00ff9d';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    }

    contains(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }
}
