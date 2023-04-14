import {testFragmentShader, testVertexShader, buildShaderProgram} from "./shaders";

function ndcToScreen(gl: WebGLRenderingContext, x: number, y: number) {
    return {
        x: (x + 1) * gl.canvas.width / 2,
        y: (y + 1) * gl.canvas.height / 2
    };
}

class MotionEstimator{
    private shaderProgram: WebGLProgram;
    private vertexArray: Float32Array;
    private vertexBuffer: WebGLBuffer;
    private textures: WebGLTexture[];
    private currentFrameTextureIdx: number;
    public constructor(
        public inCanvas: HTMLCanvasElement,
        public inCtx: CanvasRenderingContext2D,
        public canvas: HTMLCanvasElement,
        public gl: WebGLRenderingContext
    ) {
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }
    
        const shaderSet = [
            {type: gl.VERTEX_SHADER, src: testVertexShader},
            {type: gl.FRAGMENT_SHADER, src: testFragmentShader}
        ];
    
        this.shaderProgram = buildShaderProgram(gl, shaderSet);

        this.vertexArray = new Float32Array([
            -1, 1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1,
        ]);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.shaderProgram);

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        this.textures = [gl.createTexture() as WebGLTexture, gl.createTexture() as WebGLTexture];
        this.currentFrameTextureIdx = 0;
    }

    private nextFrame() {
        const {gl, inCanvas} = this;

        const textures = [gl.TEXTURE0, gl.TEXTURE1];
        const nextTextureIdx = 1 - this.currentFrameTextureIdx;
        gl.activeTexture(textures[nextTextureIdx]);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[nextTextureIdx]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inCanvas);

        this.currentFrameTextureIdx = nextTextureIdx;

        const uCurrFrame = gl.getUniformLocation(this.shaderProgram, "uCurrFrame");
        gl.uniform1i(uCurrFrame, this.currentFrameTextureIdx);
        const uPrevFrame = gl.getUniformLocation(this.shaderProgram, "uPrevFrame");
        gl.uniform1i(uPrevFrame, 1 - this.currentFrameTextureIdx);
    }

    public draw() {
        const {gl, inCanvas, inCtx} = this;
        inCtx.fillStyle = "blue";
        inCtx.fillRect(0, 0, inCanvas.width, inCanvas.height);
        inCtx.fillStyle = "red";
        inCtx.font = "200px Arial";
        inCtx.fillText("Hello World", 500 + 50 * Math.random(), 500 + 50 * Math.random());

        const uInputResolution = gl.getUniformLocation(this.shaderProgram, "uInputResolution");
        gl.uniform2fv(uInputResolution, [inCanvas.width, inCanvas.height]);
        const uOutputResolution = gl.getUniformLocation(this.shaderProgram, "uOutputResolution");
        gl.uniform2fv(uOutputResolution, [gl.canvas.width, gl.canvas.height]);

        this.nextFrame();
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

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
    
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexArray.length / 2);

        setTimeout(this.draw.bind(this), 1000);
    }

}

function main() {
    const inCanvas = document.getElementById("incanvas") as HTMLCanvasElement;
    const inCtx = inCanvas.getContext("2d") as CanvasRenderingContext2D;
    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl") as WebGLRenderingContext;

    const estimator = new MotionEstimator(inCanvas, inCtx, canvas, gl);
    estimator.draw();
}

window.onload = main;