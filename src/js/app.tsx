import { HelloWorld } from "./hello-world";
import { MotionEstimator } from "./motion-estimator";
import { MotionReconstructor } from "./motion-reconstructor";
import { VideoPlayer } from "./video-player";

let estimator: MotionEstimator;
let target;
let reconstructor: MotionReconstructor;
function draw() {
    target.draw();
    estimator.draw();
    reconstructor.draw();

    dbg();
}

function dbg() {
    const dbgCanvas1 = document.getElementById("dbgcanvas1") as HTMLCanvasElement;
    const dbgCanvas2 = document.getElementById("dbgcanvas2") as HTMLCanvasElement;

    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    dbgCanvas1.width = canvas.width;
    dbgCanvas1.height = canvas.height;
    const dbgCtx1 = dbgCanvas1.getContext("2d") as CanvasRenderingContext2D;
    dbgCtx1.drawImage(canvas, 0, 0);

    const outCanvas = document.getElementById("outcanvas") as HTMLCanvasElement;
    dbgCanvas2.width = outCanvas.width;
    dbgCanvas2.height = outCanvas.height;
    const dbgCtx2 = dbgCanvas2.getContext("2d") as CanvasRenderingContext2D;
    dbgCtx2.drawImage(outCanvas, 0, 0);

}

function main() {
    const inCanvas = document.getElementById("incanvas") as HTMLCanvasElement;
    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    const outCanvas = document.getElementById("outcanvas") as HTMLCanvasElement;

    estimator = new MotionEstimator(inCanvas, canvas);
    // target = new VideoPlayer(inCanvas, document.getElementById("video") as HTMLVideoElement);
    target = new HelloWorld(inCanvas);
    reconstructor = new MotionReconstructor(inCanvas, canvas, outCanvas);
    draw();
}

window.onload = main;

document.getElementById("btn")?.addEventListener("click", draw);