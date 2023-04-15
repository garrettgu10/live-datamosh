import { motionReconstructFragmentShader, motionReconstructVertexShader, buildShaderProgram } from "./shaders";
import { BLOCK_SIZE, MSE_THRESH, IFRAME_INTERVAL } from "./consts";

export class MotionReconstructor {
    private shaderProgram: WebGLProgram;
    private vertexArray: Float32Array;
    private vertexBuffer: WebGLBuffer;
    private xyArray: Float32Array;
    private xyBuffer: WebGLBuffer;
    private framesDrawn: number = 0;
    public gl: WebGLRenderingContext;
    private textures: WebGLTexture[];
    public constructor(
        public inCanvas: HTMLCanvasElement,
        public meCanvas: HTMLCanvasElement,
        public canvas: HTMLCanvasElement
    ) {
        const gl = canvas.getContext("webgl", {preserveDrawingBuffer: true}) as WebGLRenderingContext;
        this.gl = gl;
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        const shaderSet = [
            { type: gl.VERTEX_SHADER, src: motionReconstructVertexShader },
            { type: gl.FRAGMENT_SHADER, src: motionReconstructFragmentShader(BLOCK_SIZE, MSE_THRESH) }
        ];

        canvas.width = inCanvas.width;
        canvas.height = inCanvas.height;

        this.shaderProgram = buildShaderProgram(gl, shaderSet);

        this.vertexArray = new Float32Array([
            -1, 1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1,
        ]);

        const { width, height } = canvas;
        this.xyArray = new Float32Array([
            0, 0, width, 0, width, height, 0, 0, width, height, 0, height,
        ]);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.shaderProgram);

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        this.xyBuffer = gl.createBuffer() as WebGLBuffer;

        this.textures = [];
        for(let i = 0; i < 3; i++) {
            this.textures[i] = gl.createTexture() as WebGLTexture;
        }
    }

    public isIframe() {
        return this.framesDrawn % IFRAME_INTERVAL === 0;
    }

    private assignTexture(name: string, canvas: HTMLCanvasElement, idx: number) {
        const { gl } = this;
        const textures = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2];
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
        const {gl, inCanvas, meCanvas, canvas} = this;

        const uResolution = gl.getUniformLocation(this.shaderProgram, "uResolution");
        gl.uniform2f(uResolution, canvas.width, canvas.height);

        const uUseGroundTruth = gl.getUniformLocation(this.shaderProgram, "uUseGroundTruth");
        gl.uniform1i(uUseGroundTruth, this.framesDrawn % IFRAME_INTERVAL === 0 ? 1 : 0);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        this.assignTexture("uPrevFrame", canvas, 0)
        this.assignTexture("uMotionEstimate", meCanvas, 1);
        this.assignTexture("uGroundTruth", inCanvas, 2);

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

        this.framesDrawn++;
    }


}