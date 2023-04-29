import { HelloWorld } from "./targets/hello-world";
import { MotionEstimator } from "./motion-estimator";
import { MotionReconstructor } from "./motion-reconstructor";
import { VideoPlayer } from "./targets/video-player";

import { FRAME_RATE } from "./consts";
import { CameraFeed } from "./targets/camera-feed";
import { LiveVisualization } from "./targets/live-visualization";
import {Target, VideoTarget, AudioTarget} from "./targets/target";

import { SettingsManager } from "./settings";

let estimator: MotionEstimator;
let sources: Target[] = [];
const pFrameSrcIdx: number = 0;
let srcReconstructor: MotionReconstructor;
let destReconstructor: MotionReconstructor;
let settingsManager: SettingsManager;
let stream: MediaStream;
let options: MediaRecorderOptions;
let recorder: MediaRecorder;
let recordedBlobs: Blob[];
let video: HTMLVideoElement;
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

function addDropListener(container: HTMLDivElement, sourceIdx: number) {
    container.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    container.addEventListener("drop", (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0];
        if(file == null) return;
        const src = URL.createObjectURL(file);
        const prevVideo = sources[sourceIdx] as VideoTarget;
        const video = new VideoPlayer(sources[sourceIdx].canvas, src);
        video.attachVideo(container.children[0] as HTMLVideoElement);
        if(prevVideo.video != null) {
            video.video.playbackRate = prevVideo.video.playbackRate;
        }
        sources[sourceIdx] = video;
    });
}

function main() {
    const inCanvas = document.getElementById("incanvas") as HTMLCanvasElement;
    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    const outCanvas = document.getElementById("outcanvas") as HTMLCanvasElement;

    const src1Canvas = document.getElementById("src1canvas") as HTMLCanvasElement;
    const src2Canvas = document.getElementById("src2canvas") as HTMLCanvasElement;
    const destCanvas = document.getElementById("destcanvas") as HTMLCanvasElement;

    stream = destCanvas.captureStream(FRAME_RATE);
    options = {mimeType: 'video/webm'};
    video = document.getElementById("videof") as HTMLVideoElement;

    estimator = new MotionEstimator(inCanvas, canvas, outCanvas);
    // @ts-ignore
    sources.push(new LiveVisualization(src1Canvas, require("url:../videos/Partways_-_Kemuri.wav") as string));
    // sources.push(new CameraFeed(src1Canvas));
    // @ts-ignore
    sources.push(new VideoPlayer(src2Canvas, require("url:../videos/bun33s.mp4") as string));
    srcReconstructor = new MotionReconstructor(inCanvas, inCanvas, canvas, outCanvas);
    destReconstructor = new MotionReconstructor(src1Canvas, src2Canvas, canvas, destCanvas);

    settingsManager = new SettingsManager(sources, estimator, srcReconstructor, destReconstructor);
    settingsManager.mount();

    const video1Container = document.getElementById("video1-container") as HTMLDivElement;
    const video2Container = document.getElementById("video2-container") as HTMLDivElement;

    addDropListener(video1Container, 0);
    addDropListener(video2Container, 1);

    draw();
}

window.onload = main;

document.getElementById('begin-btn')?.addEventListener('click', () => {
    // currTarget = (currTarget + 1) % targets.length;
    // (sources[0] as VideoTarget).attachVideo(document.getElementById("video1") as HTMLVideoElement);
    (sources[0] as AudioTarget).attachAudio(document.getElementById("audio1") as HTMLAudioElement);
    (sources[1] as VideoTarget).attachVideo(document.getElementById("video2") as HTMLVideoElement);
});

document.getElementById("iframe-btn")?.addEventListener('click', () => {
    destReconstructor.iframeCountdown = 0;
});

document.getElementById('start-recording-btn')?.addEventListener('click', () => {
    recorder = new MediaRecorder(stream, options);
    recordedBlobs = [];
    recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    };
    recorder.onstop = (e) => {
        const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
        video.src = window.URL.createObjectURL(superBuffer);
    }
    recorder.start(100);
});

document.getElementById('stop-recording-btn')?.addEventListener('click', () => {
    recorder.stop();
});