import {Target} from "./target";

export class VideoPlayer implements Target {
    public source: HTMLSourceElement;
    public video: HTMLVideoElement;
    constructor(public canvas: HTMLCanvasElement, public videoSrc: string) {
        this.source = document.createElement("source");
        this.source.src = videoSrc;
        this.source.type = "video/mp4";
    }

    public attachVideo(video: HTMLVideoElement) {
        if(video.children.length > 0)
            video.removeChild(video.children[0]);
        video.srcObject = null;
        this.video = video;
        video.appendChild(this.source);
        video.load();
        video.play();
    }

    public draw() {
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        if(this.video != null)
            ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    }
}