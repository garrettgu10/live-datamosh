import { MotionEstimator } from "./motion-estimator";

function main() {
    const inCanvas = document.getElementById("incanvas") as HTMLCanvasElement;
    const inCtx = inCanvas.getContext("2d") as CanvasRenderingContext2D;
    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl") as WebGLRenderingContext;

    const estimator = new MotionEstimator(inCanvas, inCtx, canvas, gl);
    estimator.draw();
}

window.onload = main;