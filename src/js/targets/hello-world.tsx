import {Target} from "./target";

export class HelloWorld implements Target {
    private x: number = 0;
    private y: number = 0;
    private vx: number = 1;
    private vy: number = 1;

    constructor(public canvas: HTMLCanvasElement) {

    }

    public draw() {
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.fillStyle = "blue";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "red";
        ctx.font = "200px Arial";
        ctx.fillText("Hello World", 500 + 10 * Math.random(), 500 + 10 * Math.random());

        //draw a square
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y, 305, 305);

        //draw a circle in the square
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x + 150, this.y + 150, 100, 0, 2 * Math.PI);
        ctx.fill();

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x + 300 > this.canvas.width) {
            this.vx = -this.vx;
        }
        if (this.y < 0 || this.y + 300 > this.canvas.height) {
            this.vy = -this.vy;
        }

    }
}