import { motionReconstructFragmentShader, motionReconstructVertexShader, buildShaderProgram } from "./shaders";
import { BLOCK_SIZE, IFRAME_INTERVAL, IFRAME_THRESH } from "./consts";

export class MotionReconstructor {
    private shaderProgram: WebGLProgram;
    private vertexArray: Float32Array;
    private vertexBuffer: WebGLBuffer;
    private xyArray: Float32Array;
    private xyBuffer: WebGLBuffer;
    public iframeCountdown: number = 0;
    public gl: WebGLRenderingContext;
    private textures: WebGLTexture[];

    public iframeInterval: number = IFRAME_INTERVAL;
    public iframeThreshold: number = IFRAME_THRESH;

    public iblockSrcIdx: number = 1;
    public iframeSrcIdx: number = 1;

    public constructor(
        public inCanvas0: HTMLCanvasElement,
        public inCanvas1: HTMLCanvasElement,
        public meCanvas: HTMLCanvasElement,
        public outCanvas: HTMLCanvasElement
    ) {
        const gl = outCanvas.getContext("webgl", {preserveDrawingBuffer: true}) as WebGLRenderingContext;
        this.gl = gl;
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        const shaderSet = [
            { type: gl.VERTEX_SHADER, src: motionReconstructVertexShader },
            { type: gl.FRAGMENT_SHADER, src: motionReconstructFragmentShader(BLOCK_SIZE) }
        ];

        inCanvas1.width = inCanvas0.width;
        inCanvas1.height = inCanvas0.height;
        outCanvas.width = inCanvas0.width;
        outCanvas.height = inCanvas0.height;

        this.shaderProgram = buildShaderProgram(gl, shaderSet);

        this.vertexArray = new Float32Array([
            -1, 1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1,
        ]);

        const { width, height } = outCanvas;
        this.xyArray = new Float32Array([
            0, 0, width, 0, width, height, 0, 0, width, height, 0, height,
        ]);

        gl.viewport(0, 0, outCanvas.width, outCanvas.height);
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.shaderProgram);

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        this.xyBuffer = gl.createBuffer() as WebGLBuffer;

        this.textures = [];
        for(let i = 0; i < 4; i++) {
            this.textures[i] = gl.createTexture() as WebGLTexture;
        }
    }

    public iframeNeeded(motionEstimate: Uint8ClampedArray): boolean {
        let count = 0;
        for(let i = 0; i < motionEstimate.length / 4; i++) {
            let b = motionEstimate[i * 4 + 2];

            let bailedOut = b / 255.0 > 0.9;

            count += bailedOut ? 1 : 0;
        }
        return count / (motionEstimate.length / 4) > this.iframeThreshold;
    }

    public isIframe() {
        return this.iframeCountdown <= 0;
    }

    private assignTexture(name: string, canvas: HTMLCanvasElement, idx: number) {
        const { gl } = this;
        const textures = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3];
        gl.activeTexture(textures[idx]);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[idx]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const uCurrFrame = gl.getUniformLocation(this.shaderProgram, name);
        gl.uniform1i(uCurrFrame, idx);
    }

    public draw = () => {
        const {gl, inCanvas0, inCanvas1, meCanvas, outCanvas: canvas} = this;
        const inCanvases = [inCanvas0, inCanvas1];

        const uResolution = gl.getUniformLocation(this.shaderProgram, "uResolution");
        gl.uniform2f(uResolution, canvas.width, canvas.height);

        const uIsIframe = gl.getUniformLocation(this.shaderProgram, "uIsIframe");
        gl.uniform1i(uIsIframe, this.iframeCountdown <= 0 ? 1 : 0);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        this.assignTexture("uPrevFrame", canvas, 0);
        this.assignTexture("uMotionEstimate", meCanvas, 1);
        this.assignTexture("uIblockSrc", inCanvases[this.iblockSrcIdx], 2);
        this.assignTexture("uIframe", inCanvases[this.iframeSrcIdx], 3);

        const aVertexPosition = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(
            aVertexPosition,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        const aXY = gl.getAttribLocation(this.shaderProgram, "aXY");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.xyBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.xyArray, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(aXY);
        gl.vertexAttribPointer(
            aXY,
            2,  
            gl.FLOAT,
            false,
            0,
            0
        );
    
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexArray.length / 2);

        this.iframeCountdown--;
        if(this.iframeCountdown < 0) {
            this.iframeCountdown = this.iframeInterval;
        }
    }


}