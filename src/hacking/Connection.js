import { Unit } from './Unit.js';

export class Connection {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.timer = 0;
        this.rate = 1.0; // Units per second (base)

        // Growth Animation
        this.growthTimer = 0;
        this.growthDuration = 0.5; // Seconds to fully grow
        this.fullyGrown = false;
    }

    update(deltaTime, game) {
        // Update growth
        if (!this.fullyGrown) {
            this.growthTimer += deltaTime;
            if (this.growthTimer >= this.growthDuration) {
                this.fullyGrown = true;
                this.growthTimer = this.growthDuration;
            }
        }

        // Only stream if source has units AND connection is fully grown
        if (this.fullyGrown && this.from.value >= 1) {
            this.timer += deltaTime;

            // Transfer rate is half the generation rate
            const transferRate = this.from.generationRate / 2;

            if (this.timer >= 1 / transferRate) {
                this.timer = 0;
                this.from.value--;

                // Spawn unit
                game.units.push(new Unit(this.from.x, this.from.y, this.to, this.from.owner, this.from));
            }
        }
    }

    draw(ctx, game) {
        if (game.wireSpriteLoaded) {
            const dx = this.to.x - this.from.x;
            const dy = this.to.y - this.from.y;
            const fullDistance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // Calculate current visible distance based on growth
            const distance = this.fullyGrown ? fullDistance : (this.growthTimer / this.growthDuration) * fullDistance;

            ctx.save();
            ctx.translate(this.from.x, this.from.y);
            ctx.rotate(angle);

            // Animate offset
            const speed = -50; // Pixels per second (Negative for correct flow direction)
            const offset = (performance.now() / 1000 * speed) % 96; // 96 is sprite width
            const spriteWidth = 96;
            const spriteHeight = 32;

            // Draw repeating sprite manually
            // Start from -1 to cover the gap caused by the moving offset
            for (let i = -1; ; i++) {
                let dx = i * spriteWidth - offset;
                let dw = spriteWidth;
                let sx = 0;
                let sw = spriteWidth;

                // Skip if completely before 0
                if (dx + dw < 0) continue;

                // Crop start if partially before 0
                if (dx < 0) {
                    sx = -dx;
                    sw = dw + dx; // dx is negative
                    dx = 0;
                }

                // Crop end if partially after distance
                if (dx + sw > distance) {
                    sw = distance - dx;
                }

                // Stop if we are past distance
                if (dx >= distance) break;

                // Draw segment
                if (sw > 0) {
                    ctx.drawImage(game.wireSprite, sx, 0, sw, spriteHeight, dx, -spriteHeight / 2, sw, spriteHeight);
                }
            }

            ctx.restore();
        } else {
            // Fallback line
            ctx.beginPath();
            ctx.moveTo(this.from.x, this.from.y);
            ctx.lineTo(this.to.x, this.to.y);
            ctx.strokeStyle = '#00ff9d';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}
