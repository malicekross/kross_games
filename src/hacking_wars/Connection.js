import { Unit } from './Unit.js';
import { Container, TilingSprite, Graphics } from 'pixi.js';

export class Connection {
    constructor(from, to, wireTexture) {
        this.from = from;
        this.to = to;
        this.timer = 0;
        this.rate = 1.0; // Units per second (base)

        // Growth Animation
        this.growthTimer = 0;
        this.growthDuration = 0.5; // Seconds to fully grow
        this.fullyGrown = false;

        // Pixi
        this.container = new Container();

        // Calculate dimensions
        const dx = this.to.x - this.from.x;
        const dy = this.to.y - this.from.y;
        this.distance = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        this.container.x = this.from.x;
        this.container.y = this.from.y;
        this.container.rotation = this.angle;

        // Tiling Sprite for Wire
        // Wire texture is 96x32
        this.sprite = new TilingSprite({
            texture: wireTexture,
            width: 0, // Start at 0 for growth
            height: 32
        });
        this.sprite.anchor.set(0, 0.5); // Anchor left-middle
        this.sprite.tint = (this.from.owner === 'enemy') ? 0xff4444 : 0x00ff9d; // Red for enemy, Green for player
        this.container.addChild(this.sprite);
    }

    update(deltaTime, game) {
        // Check for reverse connection (Tug of War)
        const reverse = game.connections.find(c => c.from === this.to && c.to === this.from);
        const targetWidth = reverse ? this.distance / 2 : this.distance;

        // Update growth
        if (!this.fullyGrown) {
            this.growthTimer += deltaTime;
            if (this.growthTimer >= this.growthDuration) {
                this.fullyGrown = true;
                this.growthTimer = this.growthDuration;
            }
            // Update width based on growth (capped at targetWidth)
            this.sprite.width = Math.min((this.growthTimer / this.growthDuration) * this.distance, targetWidth);
        } else {
            this.sprite.width = targetWidth;
        }

        // Animate Flow (Move tile position)
        // Speed = 50 pixels per second (Positive for correct direction)
        this.sprite.tilePosition.x += 50 * deltaTime;

        // Only stream if source has units AND connection is fully grown
        if (this.fullyGrown && this.from.value >= 1) {
            this.timer += deltaTime;

            // Transfer rate is half the generation rate
            const transferRate = this.from.generationRate / 2;

            if (this.timer >= 1 / transferRate) {
                this.timer = 0;
                this.from.value--;

                // Spawn unit
                const unit = new Unit(this.from.x, this.from.y, this.to, this.from.owner, this.from, game.spritesTexture);
                game.units.push(unit);
                game.unitLayer.addChild(unit.container);
            }
        }
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
