import {Target} from "./target";

export class VideoPlayer implements Target {
    constructor(public canvas: HTMLCanvasElement, public video: HTMLVideoElement) {

    }

    public draw() {
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    }
}