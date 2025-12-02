import { Container, Graphics, Sprite, Text, Texture, Rectangle } from 'pixi.js';

export class Node {
    constructor(x, y, owner = 'neutral', spritesTexture) {
        this.x = x;
        this.y = y;
        this.owner = owner; // 'player', 'enemy', 'neutral'
        this.lastOwner = owner; // Track previous owner for change detection
        this.value = 10;
        this.capacity = 60;
        this.radius = 30;

        this.level = 1;
        this.generationRate = 1.1; // Base rate (Level 1)
        this.maxConnections = 1;
        this.timer = 0;

        // Colors
        this.colors = {
            player: 0x00ff9d,
            enemy: 0xff3333,
            neutral: 0x888888
        };

        // Pixi Container
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;

        // 1. Glow/Background Graphics
        this.graphics = new Graphics();
        this.container.addChild(this.graphics);

        // 2. Sprite
        // Create frame from spritesheet
        this.spritesTexture = spritesTexture;
        this.sprite = new Sprite(this.getTextureFrame());
        this.sprite.anchor.set(0.5);
        this.sprite.width = 64;
        this.sprite.height = 64;
        this.container.addChild(this.sprite);

        // 3. Text
        this.text = new Text({
            text: Math.floor(this.value),
            style: {
                fontFamily: 'Courier New',
                fontSize: 24,
                fontWeight: 'bold',
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 4 }
            }
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

        this.updateVisuals();
    }

    getTextureFrame() {
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

        // Create a new texture object that shares the base texture but has a different frame
        return new Texture({
            source: this.spritesTexture.source,
            frame: new Rectangle(spriteIndex * 64, 0, 64, 64)
        });
    }

    update(deltaTime, outgoingCount = 0) {
        // Upgrade Logic
        let prevLevel = this.level;
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

        // Update texture if level or owner changed
        // (For simplicity we check if we need to update texture in updateVisuals)

        if (this.owner !== 'neutral' && this.value < this.capacity) {
            this.timer += deltaTime;

            // Apply 10% boost for player
            let currentRate = this.generationRate;
            if (this.owner === 'player') {
                currentRate *= 1.1;
            }

            if (this.timer >= 1 / currentRate) {
                this.value++;
                this.timer = 0;
            }
        }

        this.updateVisuals(prevLevel, outgoingCount);
    }

    updateVisuals(prevLevel, outgoingCount) {
        // Update Text
        this.text.text = Math.floor(this.value);

        // Update Graphics (Glow)
        this.graphics.clear();
        if (this.owner !== 'neutral') {
            this.graphics.circle(0, 0, this.radius + 5 + (this.level * 2));
            this.graphics.fill({ color: this.colors[this.owner], alpha: 0.3 });
        } else {
            this.graphics.circle(0, 0, this.radius);
            this.graphics.fill({ color: 0x1a1a1a });
            this.graphics.stroke({ width: 3, color: this.colors[this.owner] });
        }

        // Update Sprite Frame if needed
        this.sprite.texture = this.getTextureFrame();

        // 4. Wire Indicators (Bubbles)
        const indicatorRadius = 4;
        const indicatorGap = 10;
        const startY = this.radius + 15;

        let startX = -((this.maxConnections - 1) * indicatorGap) / 2;

        for (let i = 0; i < this.maxConnections; i++) {
            this.graphics.circle(startX + (i * indicatorGap), startY, indicatorRadius);

            // Fill if index is less than outgoingCount (active wires)
            if (i < outgoingCount) {
                this.graphics.fill({ color: this.colors[this.owner] || 0xffffff }); // Filled
            } else {
                this.graphics.fill({ color: 0x000000 }); // Empty background
                this.graphics.stroke({ width: 1, color: this.colors[this.owner] || 0xffffff }); // Stroke
            }
        }
    }

    contains(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
