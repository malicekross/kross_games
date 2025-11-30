export class Unit {
    constructor(x, y, target, owner, source) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.owner = owner;
        this.source = source; // Track origin for wire cutting logic
        this.speed = 100; // Pixels per second
        this.active = true;
        this.radius = 4;

        this.colors = {
            player: '#00ff9d',
            enemy: '#ff3333'
        };
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
    }

    draw(ctx, sprites, spritesLoaded) {
        if (spritesLoaded) {
            // Sprite indices: Player Unit=7, Enemy Unit=8
            let spriteIndex = 7;
            if (this.owner === 'enemy') spriteIndex = 8;

            const size = this.radius * 4; // Larger than hitbox for visibility

            ctx.drawImage(
                sprites,
                spriteIndex * 64, 0, 64, 64,
                this.x - size / 2, this.y - size / 2, size, size
            );
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.colors[this.owner];
            ctx.fill();

            // Trail effect (Optimized - removed shadowBlur)
            ctx.fill();
        }
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
                        // Use this.constructor to create a new instance of the same class
                        game.units.push(new this.constructor(this.target.x, this.target.y, randomConn.to, this.owner, this.target));
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
}
