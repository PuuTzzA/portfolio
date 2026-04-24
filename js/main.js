import { SdfCanvas } from "../sdf-ui/src/scripts/sdf-ui.js";
import { SpringlikeProperty, Chaser } from "./chaser.js";
import { TimeAverage } from "./time-average.js";

const CAMERA_Z = 10;
const REM_PX = parseFloat(getComputedStyle(document.documentElement).fontSize);

SdfCanvas.customElements = [];
const loadStartTime = performance.now();

const backgroundCanvas = new SdfCanvas("background-canvas", {
    renderLayers: [0],
    downscaleFactorX: 1,
    downscaleFactorY: 10,
    topFace: false,
    cameraZ: CAMERA_Z,
    useAA: false,
    twoDMode: true,
    customShadeFunction: "",
    onCompilationComplete: () => {
        const loadTime = performance.now() - loadStartTime;
        console.log("compiled in: " + (loadTime / 60000).toFixed(4) + " minutes, (" + loadTime.toFixed(4) + "ms)")
    }
});

const focusCanvas = new SdfCanvas("focus-canvas", {
    renderLayers: [0],
    downscaleFactorX: 1,
    downscaleFactorY: 1,
    topFace: false,
    cameraZ: CAMERA_Z,
    useAA: false,
    twoDMode: true,
    customShadeFunction: "",
    onCompilationComplete: () => {
        const loadTime = performance.now() - loadStartTime;
        console.log("compiled in: " + (loadTime / 60000).toFixed(4) + " minutes, (" + loadTime.toFixed(4) + "ms)")
    }
})


// backgroundCanvas.initWebgl(SdfCanvas.COMPILE_POLICY_ALSO_BLOCKING);
// focusCanvas.initWebgl(SdfCanvas.COMPILE_POLICY_ALSO_BLOCKING);

const cursor = document.getElementById("cursor");
const cursorWidth = cursor.offsetWidth;
const cursorHeight = cursor.offsetHeight;
const fpsDiv = document.getElementById("fps");
const pointerCircle = document.getElementById("vis");

const clickableChaserDiv = document.getElementById("clickable-chaser");

const fpsCounter = new TimeAverage(1);

const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
};

const chaser = new Chaser({
    // internal state
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    rotation: 0,

    // Position spring
    stiffness: 300,
    damping: 25,
    mass: 1,

    // Rotation settings
    shouldRotate: true,
    minDistanceThreshold: REM_PX * 0.1,
    maxDistanceThreshold: REM_PX * 1,
    minThresholdVelocity: REM_PX * 2,
    maxThresholdVelocity: REM_PX * 10,
    thresholdIntervall: 0.2,

    // Rotation spring
    angularStiffness: 400,
    angularDamping: 20,
    inertia: 1,

    // Limits
    vAbsMax: 10000,
    xMin: 0 - REM_PX,
    xMax: window.innerWidth + REM_PX,
    yMin: 0 - REM_PX,
    yMax: window.innerHeight + REM_PX,
    angularVelocityAbsMax: 1000,
});


let activeElement = cursor;

const clickableChaser = new Chaser({
    // internal state
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    rotation: 0,

    // Position spring
    stiffness: 1000,
    damping: 40,
    mass: 1,

    // Rotation settings
    shouldRotate: false,

    // Limits
    vAbsMax: 10000,
    xMin: 0 - REM_PX,
    xMax: window.innerWidth + REM_PX,
    yMin: 0 - REM_PX,
    yMax: window.innerHeight + REM_PX,
});

const sizeStiffness = 1000;
const sizeDamping = 18;

const clickableChaserX = new SpringlikeProperty({
    val: REM_PX,
    stiffness: sizeStiffness,
    damping: sizeDamping,
    mass: 1,
    vAbsMax: 10000 * REM_PX,
    valMin: 0,
    valMax: 100 * REM_PX,
})

const clickableChaserY = new SpringlikeProperty({
    val: REM_PX,
    stiffness: sizeStiffness,
    damping: sizeDamping,
    mass: 1,
    vAbsMax: 10000 * REM_PX,
    valMin: 0,
    valMax: 100 * REM_PX,
})

// ╔══════════════════════════════════════════════════════════╗
// ║                        Callbacks                         ║
// ╚══════════════════════════════════════════════════════════╝
function update(time, dt) {
    fpsCounter.update(time, 1 / dt);
    fpsDiv.innerHTML = fpsCounter.average.toFixed(1);  // show FPS with 1 decimal

    //console.log(delta)
    chaser.update(mouse, dt, time);
    //console.log(chaser.rotation)
    // Example: Apply to a DOM element
    //cursor.style.left = chaser.x + "px";// (chaser.x - 4 * REM_PX) + "px";
    //cursor.style.top = chaser.y + "px";// (chaser.y - 1.5 * REM_PX) + "px";

    const velocity = Math.min(Math.max(chaser.velocity * 0.05, 10), 100);

    pointerCircle.style.setProperty("--r", velocity + "px")
    pointerCircle.style.top = mouse.y + "px";
    pointerCircle.style.left = mouse.x + "px";

    cursor.style.transform = `translate(${(chaser.x - cursorWidth)}px, ${(chaser.y - cursorHeight / 2)}px) rotate(${chaser.rotation}rad)`;



    const rect = activeElement.getBoundingClientRect();
    const offsetX = (rect.left + rect.width * 0.5);
    const offsetY = (rect.top + rect.height * 0.5);
    // const offsetZ = this.twoDMode ? 0 : parseFloat(computedStyle.getPropertyValue("--z")) * oneOverX;

    const width = activeElement.offsetWidth;
    const height = activeElement.offsetHeight;

    clickableChaserX.update(width, dt);
    clickableChaserY.update(height, dt);

    clickableChaser.update({ x: offsetX, y: offsetY }, dt);

    //clickableChaserDiv.style.transform = `translate(${(mouse.x - clickableChaserX.val / 2)}px, ${(mouse.y - clickableChaserY.val / 2)}px)`; // rotate(${chaser.rotation}rad)`;
    //clickableChaserDiv.style.transform = `translate(${(offsetX - clickableChaserX.val / 2)}px, ${(offsetY - clickableChaserY.val / 2)}px)`; // rotate(${chaser.rotation}rad)`;
    clickableChaserDiv.style.transform = `translate(${(clickableChaser.x - clickableChaserX.val / 2)}px, ${(clickableChaser.y - clickableChaserY.val / 2)}px)`; // rotate(${chaser.rotation}rad)`;
    clickableChaserDiv.style.width = clickableChaserX.val + "px";
    clickableChaserDiv.style.height = clickableChaserY.val + "px";

    //console.log(getComputedStyle(cursor).transform)
    //cursor.style.transform = `rotate(${(chaser.rotation)}rad) translateX(-50%)`;

    //cursor.style.transform = `rotate(${(Math.PI / 2 + chaser.rotation)}rad)`;
    //cursor.style.transform = `translate(${chaser.x}px, ${chaser.y}px) rotate(${chaser.rotation}rad)`;
}

function onResize(e) {
    chaser.xMin = 0 - REM_PX;
    chaser.xMax = window.innerWidth + REM_PX;
    chaser.yMin = 0 - REM_PX;
    chaser.yMax = window.innerHeight + REM_PX;
}

function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function onActiveEnter(e) {
    activeElement = e.target;
    console.log(e.target)
}

function onActiveLeave(e) {
    // activeElement = pointerCircle;
}

// ╔══════════════════════════════════════════════════════════╗
// ║                     Attach Callbacks                     ║
// ╚══════════════════════════════════════════════════════════╝
window.addEventListener('mousemove', onMouseMove);
window.addEventListener("resize", onResize)
onResize();
const clickables = document.getElementsByClassName("clickable");
for (let i = 0; i < clickables.length; i++) {
    const clickable = clickables[i];
    clickable.addEventListener("mouseover", onActiveEnter);
    clickable.addEventListener("mouseout", onActiveLeave);
}


let lastTime = performance.now();
function gameLoop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    update(now / 1000, dt);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);