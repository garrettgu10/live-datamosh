import {Target} from "./target";

export class LiveVisualization implements Target {
    private r: number;
    private g: number;
    private b: number;

    private prevBass: number;

    public audio: HTMLAudioElement;
    public audioCtx: AudioContext;
    public audioSrc: string;
    public audioMediaElementSource: MediaElementAudioSourceNode;
    public analyzer: AnalyserNode;

    public bufferCanvas: HTMLCanvasElement;
    public balls: Array<Ball>;

    constructor(public canvas: HTMLCanvasElement, public audioS: string) {
        this.audioSrc = audioS;
        this.r = Math.floor(Math.random() * 256);
        this.g = Math.floor(Math.random() * 256);
        this.b = Math.floor(Math.random() * 256);
        this.prevBass = 255;
    }

    public attachAudio(audio: HTMLAudioElement) {
        if(audio.children.length > 0)
            audio.removeChild(audio.children[0]);
        audio.srcObject = null;
        this.audio = audio;
        audio.src = this.audioSrc;
        this.audioCtx = new window.AudioContext();
        audio.muted = false;
        audio.play();
        this.audioMediaElementSource = this.audioCtx.createMediaElementSource(audio);
        this.analyzer = this.audioCtx.createAnalyser();
        this.audioMediaElementSource.connect(this.analyzer);
        this.analyzer.connect(this.audioCtx.destination);
        this.analyzer.fftSize = 128;
        this.balls = [];
        for(let i = 0; i < this.analyzer.frequencyBinCount; i++) {
            this.balls[i] = new Ball(Math.random() * 1280, Math.random() * 720, 1, 
            '#' + Math.floor(Math.random() * 16777215).toString(16), Math.random() * 2 * Math.PI);
        }
        console.log(this.analyzer);
    }

    public draw() {
        const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        let x = 0;
        if (this.analyzer === undefined) {
            return;
        }
        const bufferLength = this.analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const barWidth = this.canvas.width / bufferLength;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.analyzer.getByteFrequencyData(dataArray);

        if (dataArray[bufferLength/2] - this.prevBass >= 20) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            document.getElementById("iframe-btn")?.click();
        }  
        else {
            for (let i = 0; i < bufferLength; i++) {
                let barHeight = dataArray[i] * 2;
                ctx.fillStyle = 'rgba(' + ((this.r * barHeight + (25 * i/bufferLength)) % 256) + ',' + this.g + ',' + this.b + ', 50)';
                this.r += Math.floor(Math.random() * 256);
                this.g += Math.floor(Math.random() * 256);
                this.b += Math.floor(Math.random() * 256);
                this.r %= 256;
                this.g %= 256;
                this.b %= 256;
                
                ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
                ctx.fillRect(x, 0, barWidth, barHeight);
                x += barWidth;
            }
        }
        this.prevBass = dataArray[bufferLength/2];        
        console.log(dataArray[bufferLength/2]);
        ctx.fillStyle = 'rgba(200, 200, 200, 50)';

        this.balls.forEach((ball, idx) => {
            ball.move(dataArray[idx] / 255 * 3);
            ball.radius = dataArray[idx] / 255 * 150;

            ball.draw(ctx);
        });
    }
}

class Ball {
    constructor(
        public x: number,
        public y: number,
        public radius: number,
        public color: string,
        public direction: number,
    ) {}

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    move(speed: number) {
        this.x += Math.cos(this.direction) * speed;
        this.y += Math.sin(this.direction) * speed;

        if(this.x < 0) {
            this.x = 1280;
        }else if(this.x > 1280) {
            this.x = 0;
        }

        if(this.y < 0) {
            this.y = 720;
        }else if(this.y > 720) {
            this.y = 0;
        }
    }
}