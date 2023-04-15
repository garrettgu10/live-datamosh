import {Target} from "./target";

export class CameraFeed implements Target {

    constructor(public canvas: HTMLCanvasElement, public video: HTMLVideoElement) {
        //draw image from webcam
        var localStreamConstraints = {
            audio: true,
            video: { width: 1280, height: 720 },
        };

        if (this.video) {
            navigator.mediaDevices
                .getUserMedia(localStreamConstraints)
                .then(stream => {
                    this.video.srcObject = stream;
                })
                .catch(function (e) {
                    console.error(e);
                });
        }
    }

    public draw() {
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    }
}