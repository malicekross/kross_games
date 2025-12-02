export class TimeSystem {
    constructor(game) {
        this.game = game;
        this.day = 1;
        this.time = 0; // 0 to 1 (Day progress)
        this.dayDuration = 60; // Seconds per day (placeholder)
        this.isWarMode = false;
    }

    update(delta) {
        if (this.isWarMode) return;

        this.time += (delta / 60) / this.dayDuration; // delta is in frames (approx 1/60s)? No, Pixi delta is frame ratio.
        // Actually delta is usually 1.0 for 60fps. So delta/60 is seconds.

        // Let's assume delta is frame count (1.0 at 60fps).
        // So time += (delta / 60) / dayDuration

        if (this.time >= 1) {
            this.endDay();
        }
    }

    endDay() {
        this.time = 0;
        this.day++;
        console.log(`Day ${this.day} Started`);
        this.game.onNewDay(this.day);
    }

    // Called when War Mode ends
    advanceDay() {
        // In the design, Day ends AFTER War Mode.
        // So this might be manual.
        this.endDay();
    }
}
