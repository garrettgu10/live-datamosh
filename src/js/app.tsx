import { HelloWorld } from "./targets/hello-world";
import { MotionEstimator } from "./motion-estimator";
import { MotionReconstructor } from "./motion-reconstructor";
import { VideoPlayer } from "./targets/video-player";

import { FRAME_RATE, MSE_SCALE, MSE_THRESH } from "./consts";
import { CameraFeed } from "./targets/camera-feed";
import {Target} from "./targets/target";

let estimator: MotionEstimator;
let targets: Target[] = [];
let currTarget = 0;
let reconstructor: MotionReconstructor;
function draw() {
    targets[currTarget].draw();
    estimator.draw();
    reconstructor.draw();

    dbg();

    setTimeout(() => {
        requestAnimationFrame(draw);
    },  1000 / 30);
}

function dbg() {
    const dbgCanvas1 = document.getElementById("dbgcanvas1") as HTMLCanvasElement;
    const dbgCanvas2 = document.getElementById("dbgcanvas2") as HTMLCanvasElement;

    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    dbgCanvas1.width = canvas.width;
    dbgCanvas1.height = canvas.height;
    const dbgCtx1 = dbgCanvas1.getContext("2d") as CanvasRenderingContext2D;
    dbgCtx1.drawImage(canvas, 0, 0);
    const imgData = dbgCtx1.getImageData(0, 0, canvas.width, canvas.height).data;
    for(let i = 0; i < imgData.length / 4; i++) {
        let b = imgData[i * 4 + 2];

        let bailedOut = b / 255.0 > MSE_THRESH * MSE_SCALE;
        bailedOut ||= reconstructor.isIframe();

        imgData[i * 4] = bailedOut ? 255: 0;
        imgData[i * 4 + 1] = 0;
        imgData[i * 4 + 2] = 0;
        imgData[i * 4 + 3] = 255;
    }
    dbgCtx1.putImageData(new ImageData(imgData, canvas.width, canvas.height), 0, 0);

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

    estimator = new MotionEstimator(inCanvas, canvas, outCanvas);
    targets.push(new HelloWorld(inCanvas));
    targets.push(new VideoPlayer(inCanvas, document.getElementById("video") as HTMLVideoElement));
    targets.push(new CameraFeed(inCanvas, document.getElementById("webcam-video") as HTMLVideoElement));
    reconstructor = new MotionReconstructor(inCanvas, canvas, outCanvas);
    draw();
}

window.onload = main;

document.getElementById('target-btn')?.addEventListener('click', () => {
    currTarget = (currTarget + 1) % targets.length;
    (document.getElementById("video") as HTMLVideoElement).play();
    (document.getElementById("webcam-video") as HTMLVideoElement).play();
});

document.getElementById("dbg-btn")?.addEventListener('click', () => {
    draw();
});