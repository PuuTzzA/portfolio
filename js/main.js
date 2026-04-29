import { SdfCanvas, SdfLayer, SdfCommands } from "../sdf-ui/src/scripts/sdf-ui.js";
import { SpringlikeProperty, Chaser } from "./chaser.js";
import { TimeAverage } from "./time-average.js";

const CAMERA_Z = 10;
const REM_PX = parseFloat(getComputedStyle(document.documentElement).fontSize);
const FOCUSABLE_CLASSNAME = "focusable";
const COMPILING_CLASSNAME = "compiling";
const NO_SDF_CLASSNAME = "no-sdf";

SdfCanvas.layers = [new SdfLayer(SdfCommands.SMOOTH_UNION, 10)];
SdfCanvas.customElements = [];
const loadStartTime = performance.now();

console.log(window.innerWidth)
console.log(window.devicePixelRatio || 1)

const finalWidth = 0;
const renderedPixelSize = 3;
const backgroundCanvas = new SdfCanvas("background-canvas", {
    renderLayers: [0],
    downscaleFactorX: renderedPixelSize,
    downscaleFactorY: renderedPixelSize,
    topFace: false,
    cameraZ: CAMERA_Z,
    useAA: false,
    twoDMode: true,
    customShadeFunction: `
        vec4 shade(Surface surface) {
            // return vec4(vec3((surface.distance + 0.0005) * 100.0f), 1.0);
            float sdfValue = (surface.distance + 0.0) * 100.0f;

            ColorStop[] colors = ColorStop[](
            //ColorStop(surface.colorDiffuse, 0.000000), ColorStop(vec3(0.0f), 1.0f));
            ColorStop(vec3(0.0f), 0.000000), ColorStop(vec3(1.0f), 0.5), ColorStop(vec3(0.0f), 1.0f));
            //ColorStop(vec3(0.000000f, 0.000000f, 0.015996f), 0.000000f), ColorStop(vec3(0.008023f, 0.002428f, 0.162029f), 0.300000f), ColorStop(vec3(0.590619f, 0.964686f, 0.428690f), 0.400000f), ColorStop(vec3(0.991102f, 0.031896f, 0.814847f), 0.600000f), ColorStop(vec3(1.000000f, 0.000000f, 0.001821f), 0.800000f), ColorStop(vec3(0.008023f, 0.002428f, 0.162029f), 0.900000f), ColorStop(vec3(0.000000f, 0.000000f, 0.015996f), 1.000000f));

            vec3 finalColor;
            COLOR_RAMP(colors, sdfValue, finalColor);
            return vec4(finalColor, 1.0f);
        }
    `,
    onCompilationComplete: () => {
        const loadTime = performance.now() - loadStartTime;
        console.log("compiled in: " + (loadTime / 60000).toFixed(4) + " minutes, (" + loadTime.toFixed(4) + "ms)");
        SdfCanvas.performForEachElement((e) => {
            e.classList.remove(COMPILING_CLASSNAME);
            e.classList.remove(NO_SDF_CLASSNAME);
        })
    }
});

const focusCanvas = new SdfCanvas("focus-canvas", {
    renderLayers: [0, 1],
    downscaleFactorX: renderedPixelSize,
    downscaleFactorY: renderedPixelSize,
    topFace: false,
    cameraZ: CAMERA_Z,
    useAA: false,
    twoDMode: false,
    customShadeFunction: ``,
    onCompilationComplete: () => {
        const loadTime = performance.now() - loadStartTime;
        console.log("compiled in: " + (loadTime / 60000).toFixed(4) + " minutes, (" + loadTime.toFixed(4) + "ms)")
        SdfCanvas.performForEachElement((e) => {
            e.classList.remove(COMPILING_CLASSNAME);
            e.classList.remove(NO_SDF_CLASSNAME);
        })
    }
})

SdfCanvas.performForEachElement((e) => {
    e.classList.add(COMPILING_CLASSNAME);
})

backgroundCanvas.initWebgl(SdfCanvas.COMPILE_POLICY_ALSO_BLOCKING);
// focusCanvas.initWebgl(SdfCanvas.COMPILE_POLICY_ALSO_BLOCKING);

const cursor = document.getElementById("cursor");
const cursorWidth = cursor.offsetWidth;
const cursorHeight = cursor.offsetHeight;
const fpsDiv = document.getElementById("fps");
const pointerCircle = document.getElementById("vis");

const focusedArea = document.getElementById("focused-area");

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
    stiffness: 210,
    damping: 22,
    mass: 1,

    // Rotation settings
    shouldRotate: true,
    minDistanceThreshold: REM_PX * 0.1,
    maxDistanceThreshold: REM_PX * 3,
    minThresholdVelocity: REM_PX * 2,
    maxThresholdVelocity: REM_PX * 50,
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

const focusAreaChaserPos = new Chaser({
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
    xMin: 0 - 100 * REM_PX,
    xMax: window.innerWidth + 100 * REM_PX,
    yMin: 0 - 100 * REM_PX,
    yMax: window.innerHeight + 100 * REM_PX,
});

const sizeStiffness = 1000;
const sizeDamping = 18;

const focusAreaChaserWidth = new SpringlikeProperty({
    val: REM_PX,
    stiffness: sizeStiffness,
    damping: sizeDamping * 1.1,
    mass: 1,
    vAbsMax: 10000 * REM_PX,
    valMin: 0,
    valMax: 500 * REM_PX,
})

const focusAreaChaserHeight = new SpringlikeProperty({
    val: REM_PX,
    stiffness: sizeStiffness,
    damping: sizeDamping,
    mass: 1,
    vAbsMax: 10000 * REM_PX,
    valMin: 0,
    valMax: 500 * REM_PX,
})

// ╔══════════════════════════════════════════════════════════╗
// ║                        Callbacks                         ║
// ╚══════════════════════════════════════════════════════════╝
function update(time, dt) {
    fpsCounter.update(time, 1 / dt);
    fpsDiv.innerHTML = fpsCounter.average.toFixed(0) + " fps";  // show FPS with 1 decimal

    //console.log(delta)
    chaser.update(mouse, dt, time);
    //console.log(chaser.rotation)
    // Example: Apply to a DOM element
    //cursor.style.left = chaser.x + "px";// (chaser.x - 4 * REM_PX) + "px";
    //cursor.style.top = chaser.y + "px";// (chaser.y - 1.5 * REM_PX) + "px";

    const velocity = Math.min(Math.max(chaser.velocity * 0.05, 10), 100);

    /* pointerCircle.style.setProperty("--r", velocity + "px")
    pointerCircle.style.top = mouse.y + "px";
    pointerCircle.style.left = mouse.x + "px"; */

    cursor.style.transform = `translate(${(chaser.x - cursorWidth)}px, ${(chaser.y - cursorHeight / 2)}px) rotate(${chaser.rotation}rad)`;



    const rect = activeElement.getBoundingClientRect();
    const offsetX = (rect.left + rect.width * 0.5);
    const offsetY = (rect.top + rect.height * 0.5);
    // const offsetZ = this.twoDMode ? 0 : parseFloat(computedStyle.getPropertyValue("--z")) * oneOverX;

    const width = rect.width; // + 5 * REM_PX;
    const height = rect.height; //+ 1 * REM_PX;

    focusAreaChaserWidth.update(width, dt);
    focusAreaChaserHeight.update(height, dt);
    focusAreaChaserPos.update({ x: offsetX, y: offsetY }, dt);

    /*     //clickableChaserDiv.style.transform = `translate(${(mouse.x - clickableChaserX.val / 2)}px, ${(mouse.y - clickableChaserY.val / 2)}px)`; // rotate(${chaser.rotation}rad)`;
        //clickableChaserDiv.style.transform = `translate(${(offsetX - clickableChaserX.val / 2)}px, ${(offsetY - clickableChaserY.val / 2)}px)`; // rotate(${chaser.rotation}rad)`;
        focusedArea.style.transform = `translate(${(focusAreaChaserPos.x - focusAreaChaserWidth.val / 2)}px, ${(focusAreaChaserPos.y - focusAreaChaserHeight.val / 2)}px)`; // rotate(${chaser.rotation}rad)`;
        focusedArea.style.width = focusAreaChaserWidth.val + "px";
        focusedArea.style.height = focusAreaChaserHeight.val + "px";
    
        //console.log(getComputedStyle(cursor).transform)
        //cursor.style.transform = `rotate(${(chaser.rotation)}rad) translateX(-50%)`;
    
        //cursor.style.transform = `rotate(${(Math.PI / 2 + chaser.rotation)}rad)`;
        //cursor.style.transform = `translate(${chaser.x}px, ${chaser.y}px) rotate(${chaser.rotation}rad)`;
     */


    backgroundCanvas.draw();

    /*     fcc.style.width = focusAreaChaserWidth.val + "px";
        fcc.style.height = focusAreaChaserHeight.val + "px";
        //fcc.style.top = focusAreaChaserPos.x - focusAreaChaserWidth.val / 2 + "px";
        //fcc.style.left = focusAreaChaserPos.y - focusAreaChaserHeight.val / 2 + "px";
        fcc.style.transform = `translate(${(focusAreaChaserPos.x - focusAreaChaserWidth.val / 2)}px, ${(focusAreaChaserPos.y - focusAreaChaserHeight.val / 2)}px)`; // rotate(${chaser.rotation}rad)`;
     */



    const focusX = focusAreaChaserPos.x - focusAreaChaserWidth.val / 2;
    const focusY = focusAreaChaserPos.y - focusAreaChaserHeight.val / 2;
    const focusW = focusAreaChaserWidth.val;
    const focusH = focusAreaChaserHeight.val;

    // 2. Move the div wrapper (Optional, if you use it for CSS borders/effects)
    focusedArea.style.transform = `translate(${focusX}px, ${focusY}px)`;
    focusedArea.style.width = focusW + "px";
    focusedArea.style.height = focusH + "px";

    // 3. Tell the focusCanvas to draw ONLY inside the moving rectangle
    // REMOVE focusCanvas.alskdfja() entirely!
    focusCanvas.draw({
        x: focusX,//offsetX - width / 2,
        y: focusY,//offsetY - height / 2,
        w: focusW,//width,
        h: focusH,//height
    });

    //focusCanvas.canvas.style.transform = `translate(${(focusAreaChaserPos.x - focusAreaChaserWidth.val / 2)}px, ${(focusAreaChaserPos.y - focusAreaChaserHeight.val / 2)}px)`; // rotate(${chaser.rotation}rad)`;
    //focusCanvas.canvas.style.width = focusAreaChaserWidth.val + "px";
    //focusCanvas.canvas.style.height = focusAreaChaserHeight.val + "px";
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

function focusableOnMouseIn(e) {
    let target = e.target;
    while (!target.classList.contains(FOCUSABLE_CLASSNAME)) {
        target = target.parentNode;
    }

    activeElement = target;
}

function focusableOnMouseOut(e) {
    // activeElement = pointerCircle;
}

// ╔══════════════════════════════════════════════════════════╗
// ║                     Attach Callbacks                     ║
// ╚══════════════════════════════════════════════════════════╝
window.addEventListener('mousemove', onMouseMove);
window.addEventListener("resize", onResize)
onResize();
const focusables = document.getElementsByClassName(FOCUSABLE_CLASSNAME);
for (let i = 0; i < focusables.length; i++) {
    const focusable = focusables[i];
    focusable.addEventListener("mouseover", focusableOnMouseIn);
    focusable.addEventListener("mouseout", focusableOnMouseOut);
}


let lastTime = performance.now();
function gameLoop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    update(now / 1000, dt);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);