import { HelloWorld } from "./targets/hello-world";
import { MotionEstimator } from "./motion-estimator";
import { MotionReconstructor } from "./motion-reconstructor";
import { VideoPlayer } from "./targets/video-player";

import { FRAME_RATE } from "./consts";
import { CameraFeed } from "./targets/camera-feed";
import {Target, VideoTarget} from "./targets/target";

import { SettingsManager } from "./settings";

let estimator: MotionEstimator;
let sources: Target[] = [];
const pFrameSrcIdx: number = 0;
let srcReconstructor: MotionReconstructor;
let destReconstructor: MotionReconstructor;
let settingsManager: SettingsManager;
function draw() {
    for(let source of sources) {
        source.draw();
    }

    const pFrameSrc = sources[pFrameSrcIdx];
    const pFrameSrcCanvas = pFrameSrc.canvas;
    const inCanvas = estimator.inCanvas;

    const inCtx = inCanvas.getContext("2d") as CanvasRenderingContext2D;
    const pFrameSrcCtx = pFrameSrcCanvas.getContext("2d") as CanvasRenderingContext2D;
    const imgData = pFrameSrcCtx.getImageData(0, 0, pFrameSrcCanvas.width, pFrameSrcCanvas.height);
    inCtx.putImageData(imgData, 0, 0);

    estimator.draw();
    srcReconstructor.draw();
    destReconstructor.draw();

    dbg();

    setTimeout(() => {
        requestAnimationFrame(draw);
    },  1000 / FRAME_RATE);
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

    if(srcReconstructor.iframeNeeded(imgData)) {
        srcReconstructor.iframeCountdown = 0;
    }

    for(let i = 0; i < imgData.length / 4; i++) {
        let b = imgData[i * 4 + 2];

        let bailedOut = b / 255.0 > 0.9;
        bailedOut ||= srcReconstructor.isIframe();

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

    const src1Canvas = document.getElementById("src1canvas") as HTMLCanvasElement;
    const src2Canvas = document.getElementById("src2canvas") as HTMLCanvasElement;
    const destCanvas = document.getElementById("destcanvas") as HTMLCanvasElement;

    estimator = new MotionEstimator(inCanvas, canvas, outCanvas);
    // sources.push(new HelloWorld(src1Canvas));
    sources.push(new CameraFeed(src1Canvas));
    // @ts-ignore
    sources.push(new VideoPlayer(src2Canvas, require("url:../videos/bun33s.mp4") as string));
    srcReconstructor = new MotionReconstructor(inCanvas, inCanvas, canvas, outCanvas);
    destReconstructor = new MotionReconstructor(src1Canvas, src2Canvas, canvas, destCanvas);

    settingsManager = new SettingsManager(srcReconstructor, destReconstructor);
    settingsManager.mount();

    draw();
}

window.onload = main;

document.getElementById('begin-btn')?.addEventListener('click', () => {
    // currTarget = (currTarget + 1) % targets.length;
    (sources[0] as VideoTarget).attachVideo(document.getElementById("video1") as HTMLVideoElement);
    (sources[1] as VideoTarget).attachVideo(document.getElementById("video2") as HTMLVideoElement);
});

document.getElementById("iframe-btn")?.addEventListener('click', () => {
    destReconstructor.iframeCountdown = 0;
});