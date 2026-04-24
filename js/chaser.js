import { TimeAverage } from "./time-average.js";

function clamp(val, min, max) {
    return Math.max(Math.min(val, max), min);
}

function mod(a, b) {
    return (a % b + b) % b;
}

function mapRange(val, inMin, inMax, outMin, outMax) {
    if (val < inMin) {
        return outMin;
    }
    if (val > inMax) {
        return outMax;
    }
    return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

class SpringlikeProperty {
    constructor(options = {}) {
        const {
            // state
            val = 0,
            vel = 0,

            // Properties
            stiffness = 100,
            damping = 10,
            mass = 1,

            // Limits
            vAbsMax = 10000,
            valMin = 0,
            valMax = 1000,
        } = options;

        // Internal state
        this.val = val;
        this.vel = 0;

        // Properties
        this.stiffness = stiffness;
        this.damping = damping;
        this.mass = mass;

        // Limits
        this.vAbsMax = vAbsMax;
        this.valMin = valMin;
        this.valMax = valMax;
    }

    update(target, dt) {
        if (!target || typeof target !== "number" || typeof dt !== "number" || dt <= 0) {
            return;
        }

        const delta = target - this.val;
        this.updateRelative(delta, dt);
    }

    updateRelative(delta, dt) {
        // Hooke's Law
        const f = (delta * this.stiffness) - (this.vel * this.damping);
        const a = f / this.mass;

        this.vel += a * dt;
        this.vel = clamp(this.vel, -this.vAbsMax, this.vAbsMax);

        this.val += this.vel * dt;
        this.val = clamp(this.val, this.valMin, this.valMax);
    }
}

class Chaser {
    #x;
    #y;
    #rotation;
    #shouldRotate;
    #incomingAngle;
    #averageVelocity;

    // ╔══════════════════════════════════════════════════════════╗
    // ║                     Setter & Getter                      ║
    // ╚══════════════════════════════════════════════════════════╝
    get x() {
        return this.#x.val;
    }

    set x(val) {
        this.#x.val = val;
    }

    get y() {
        return this.#y.val;
    }

    set y(val) {
        this.#y.val = val;
    }

    get vx() {
        return this.#x.vel;
    }

    set vx(val) {
        this.#x.vel = val;
    }

    get vy() {
        return this.#y.vel;
    }

    set vy(val) {
        this.#y.vel = val;
    }

    get rotation() {
        return this.#rotation.val;
    }

    set rotation(val) {
        this.#rotation.val = val;
    }

    get angularVelocity() {
        return this.#rotation.vel;
    }

    set angularVelocity(val) {
        this.#rotation.vel = val;
    }

    get stiffness() {
        return this.#x.stiffness;
    }

    set stiffness(val) {
        this.#x.stiffness = val;
        this.#y.stiffness = val;
    }

    get damping() {
        return this.#x.damping;
    }

    set damping(val) {
        this.#x.damping = val;
        this.#y.damping = val;
    }

    get mass() {
        return this.#x.mass;
    }

    set mass(val) {
        this.#x.mass = val;
        this.#y.mass = val;
    }

    get angularStiffness() {
        return this.#rotation.stiffness;
    }

    set angularStiffness(val) {
        this.#rotation.stiffness = val;
    }

    get angularDamping() {
        return this.#rotation.damping;
    }

    set angularDamping(val) {
        this.#rotation.damping = val;
    }

    get inertia() {
        return this.#rotation.mass;
    }

    set inertia(val) {
        this.#rotation.mass = val;
    }

    get vAbsMax() {
        return this.#x.vAbsMax;
    }

    set vAbsMax(val) {
        this.#x.vAbsMax = val;
        this.#y.vAbsMax = val;
    }

    get xMin() {
        return this.#x.valMin;
    }

    set xMin(val) {
        this.#x.valMin = val;
    }

    get xMax() {
        return this.#x.valMax;
    }

    set xMax(val) {
        this.#x.valMax = val;
    }

    get yMin() {
        return this.#y.valMin;
    }

    set yMin(val) {
        this.#y.valMin = val;
    }

    get yMax() {
        return this.#y.valMax;
    }

    set yMax(val) {
        this.#y.valMax = val;
    }

    get angularVelocityAbsMax() {
        return this.#rotation.vAbsMax;
    }

    set angularVelocityAbsMax(val) {
        this.#rotation.vAbsMax = val;
    }

    // ╔══════════════════════════════════════════════════════════╗
    // ║                          Class                           ║
    // ╚══════════════════════════════════════════════════════════╝

    constructor(options = {}) {
        const {
            // internal state
            x = 0,
            y = 0,
            vx = 0,
            vy = 0,
            rotation = 0,
            angularVelocity = 0,

            // Position spring
            stiffness = 100,
            damping = 10,
            mass = 1,

            // Rotation settings
            shouldRotate = true,
            minDistanceThreshold = 1,
            maxDistanceThreshold = 10,
            minThresholdVelocity = 10,
            maxThresholdVelocity = 100,
            thresholdIntervall = 0.1,

            // Rotation spring
            angularStiffness = 100,
            angularDamping = 10,
            inertia = 1,

            // Limits
            vAbsMax = 10000,
            xMin = 0,
            xMax = 1000,
            yMin = 0,
            yMax = 1000,
            angularVelocityAbsMax = 1000,
        } = options;

        // Internal state
        this.#x = new SpringlikeProperty({
            val: x,
            vel: vx,
            stiffness: stiffness,
            damping: damping,
            mass: mass,
            vAbsMax: vAbsMax,
            valMin: xMin,
            valMax: xMax,
        });
        this.#y = new SpringlikeProperty({
            val: y,
            vel: vy,
            stiffness: stiffness,
            damping: damping,
            mass: mass,
            vAbsMax: vAbsMax,
            valMin: yMin,
            valMax: yMax,
        });
        this.#rotation = new SpringlikeProperty({
            val: rotation,
            vel: angularVelocity,
            stiffness: angularStiffness,
            damping: angularDamping,
            mass: inertia,
            vAbsMax: angularVelocityAbsMax,
            valMin: -10000,
            valMax: 10000,
        })

        this.velocity = 0;

        this.#shouldRotate = shouldRotate;
        this.minDistanceThreshold = minDistanceThreshold;
        this.maxDistanceThreshold = maxDistanceThreshold;
        this.minThresholdVelocity = minThresholdVelocity;
        this.maxThresholdVelocity = maxThresholdVelocity;

        if (shouldRotate) {
            this.#averageVelocity = new TimeAverage(thresholdIntervall);
        }

        // Private state
        this.#incomingAngle = this.rotation;
    }

    update(target, dt, time) {
        if (!target || typeof target.x !== "number" || typeof target.y !== "number" || typeof dt !== "number" || dt <= 0) {
            return;
        }

        const dx = target.x - this.#x.val;
        const dy = target.y - this.#y.val;

        this.#x.updateRelative(dx, dt);
        this.#y.updateRelative(dy, dt);

        this.velocity = Math.sqrt(this.#x.vel * this.#x.vel + this.#y.vel * this.#y.vel);

        if (this.#shouldRotate) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            let targetAngle;

            const threshold = mapRange(this.#averageVelocity.average, this.minThresholdVelocity, this.maxThresholdVelocity, this.minDistanceThreshold, this.maxDistanceThreshold);
            if (dist >= threshold) {
                targetAngle = Math.atan2(dy, dx);
                this.#incomingAngle = targetAngle;
            } else {
                targetAngle = this.#incomingAngle;
            }

            let angleDiff = targetAngle - this.#rotation.val;
            angleDiff = mod(angleDiff + Math.PI, Math.PI * 2) - Math.PI; // https://stackoverflow.com/questions/1878907/how-can-i-find-the-smallest-difference-between-two-angles-around-a-point

            this.#rotation.updateRelative(angleDiff, dt);
            this.#rotation.val = mod(this.#rotation.val + Math.PI, Math.PI * 2) - Math.PI;

            this.#averageVelocity.update(time, this.velocity);

            var x = 5;
        }
    }
}


export { SpringlikeProperty, Chaser }