import { Container, Sprite, Texture, Rectangle } from 'pixi.js';

export class Unit {
    constructor(x, y, target, owner, source, spritesTexture) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.owner = owner;
        this.source = source; // Track origin for wire cutting logic
        this.speed = 150; // Pixels per second (1.5x faster)
        this.active = true;
        this.radius = 4;

        // Pixi
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;

        // Sprite
        // Random generic code sprite (indices 9-18)
        let spriteIndex = Math.floor(Math.random() * 10) + 9;

        this.sprite = new Sprite(new Texture({
            source: spritesTexture.source,
            frame: new Rectangle(spriteIndex * 64, 0, 64, 64)
        }));
        this.sprite.anchor.set(0.5);
        this.sprite.width = 24; // 1.5x bigger
        this.sprite.height = 24;

        // Tint based on owner
        if (this.owner === 'player') {
            this.sprite.tint = 0x00ffff; // Cyan
        } else {
            this.sprite.tint = 0xff00ff; // Magenta
        }

        // Shadow Sprite
        this.shadow = new Sprite(new Texture({
            source: spritesTexture.source,
            frame: new Rectangle(spriteIndex * 64, 0, 64, 64)
        }));
        this.shadow.anchor.set(0.5);
        this.shadow.width = 24;
        this.shadow.height = 24;
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 0.6; // Semi-transparent shadow
        this.shadow.position.set(3, 3); // Offset
        this.container.addChild(this.shadow);

        this.container.addChild(this.sprite);
    }

    update(deltaTime, game) {
        if (!this.active) return;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            this.hitTarget(game);
            return;
        }

        const moveDist = this.speed * deltaTime;
        this.x += (dx / dist) * moveDist;
        this.y += (dy / dist) * moveDist;

        // Update visual position
        this.container.x = this.x;
        this.container.y = this.y;
    }

    hitTarget(game) {
        this.active = false;
        if (this.target.owner === this.owner) {
            if (this.target.value < this.target.capacity) {
                this.target.value++;
            } else {
                // Overflow: Forward packet to random outgoing connection
                if (game) {
                    const outgoing = game.connections.filter(c => c.from === this.target);
                    if (outgoing.length > 0) {
                        const randomConn = outgoing[Math.floor(Math.random() * outgoing.length)];
                        // Spawn new unit from target to randomConn.to
                        const unit = new Unit(this.target.x, this.target.y, randomConn.to, this.owner, this.target, game.spritesTexture);
                        game.units.push(unit);
                        game.unitLayer.addChild(unit.container);
                    }
                }
            }
        } else {
            this.target.value--;
            if (this.target.value <= 0) {
                this.target.owner = this.owner;
                this.target.value = Math.abs(this.target.value);
            }
        }
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
