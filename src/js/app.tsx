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

    setTimeout(() => {
        requestAnimationFrame(draw);
    }, 1000 / 60);
}

function main() {
    const inCanvas = document.getElementById("incanvas") as HTMLCanvasElement;
    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    const outCanvas = document.getElementById("outcanvas") as HTMLCanvasElement;

    estimator = new MotionEstimator(inCanvas, canvas);
    target = new VideoPlayer(inCanvas, document.getElementById("video") as HTMLVideoElement);
    // target = new HelloWorld(inCanvas);
    reconstructor = new MotionReconstructor(inCanvas, canvas, outCanvas);
    draw();
}

window.onload = main;