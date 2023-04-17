import {Target} from "./target";

export class CameraFeed implements Target {
    public source: MediaStream;
    public video: HTMLVideoElement;

    constructor(public canvas: HTMLCanvasElement) {
        //draw image from webcam
        var localStreamConstraints = {
            audio: true,
            video: { width: 1280, height: 720 },
        };
        navigator.mediaDevices
            .getUserMedia(localStreamConstraints)
            .then(stream => {
                this.source = stream;
            })
            .catch(function (e) {
                console.error(e);
            });
    }

    public attachVideo(video: HTMLVideoElement) {
        this.video = video;
        video.srcObject = this.source;
        video.load();
        video.play();
    }

    public draw() {
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        if(this.video != null)
            ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    }
}