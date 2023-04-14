import { HelloWorld } from "./hello-world";
import { MotionEstimator } from "./motion-estimator";

let estimator: MotionEstimator;
let helloWorld: HelloWorld;
function draw() {
    helloWorld.draw();
    estimator.draw();

    setTimeout(() => {
        requestAnimationFrame(draw);
    }, 1000 / 30);
}

function main() {
    const inCanvas = document.getElementById("incanvas") as HTMLCanvasElement;
    const inCtx = inCanvas.getContext("2d") as CanvasRenderingContext2D;
    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl") as WebGLRenderingContext;

    estimator = new MotionEstimator(inCanvas, canvas, gl);
    helloWorld = new HelloWorld(inCanvas);
    draw();
}

window.onload = main;