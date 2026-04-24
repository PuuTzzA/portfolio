class TimeAverage {
    #buffer;
    #timeBuffer
    #oldestIdx;
    #newestIdx;
    #count;
    #windowDuration;
    #currentTime;

    constructor(windowDuration = 1, maxFps = 256) {
        this.#windowDuration = windowDuration; // Time window in seconds

        this.#buffer = new Float32Array(windowDuration * maxFps);
        this.#timeBuffer = new Float32Array(windowDuration * maxFps);

        this.#oldestIdx = 0;
        this.#newestIdx = 0;
        this.#count = 0;
    }

    update(time, data) {
        // Update buffers
        this.#buffer[this.#newestIdx] = data;
        this.#timeBuffer[this.#newestIdx] = time;
        this.#newestIdx = (this.#newestIdx + 1) % this.#buffer.length;

        // Capacity update
        if (this.#count === this.#buffer.length) {
            // Buffer is full, overwrite oldest
            this.#oldestIdx = (this.#oldestIdx + 1) % this.#buffer.length;
        } else {
            this.#count++;
        }

        // Remove old data
        while (this.#count > 0 && (time - this.#timeBuffer[this.#oldestIdx]) > this.#windowDuration) {
            this.#oldestIdx = (this.#oldestIdx + 1) % this.#buffer.length;
            this.#count--;
        }
    }

    get average() {
        if (this.#count === 0) return 0;

        let sum = 0;
        for (let i = 0; i < this.#count; i++) {
            const idx = (this.#oldestIdx + i) % this.#buffer.length;
            sum += this.#buffer[idx];
        }

        return sum / this.#count;
    }
}

export { TimeAverage }