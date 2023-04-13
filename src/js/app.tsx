import {testFragmentShader, testVertexShader} from "./shaders";

function compileShader(gl: WebGLRenderingContext, src: string, type: number) {
    const shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    }

    return shader;
}

//https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Basic_2D_animation_example
function buildShaderProgram(gl: WebGLRenderingContext, shaderInfo) {
    const program = gl.createProgram() as WebGLProgram;

    shaderInfo.forEach(desc => {
        const shader = compileShader(gl, desc.src, desc.type);
        if(shader) {
            gl.attachShader(program, shader);
        }
    });

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    }

    return program;
}

function ndcToScreen(gl: WebGLRenderingContext, x: number, y: number) {
    return {
        x: (x + 1) * gl.canvas.width / 2,
        y: (y + 1) * gl.canvas.height / 2
    };
}

function draw() {
    const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl") as WebGLRenderingContext;

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const shaderSet = [
        {type: gl.VERTEX_SHADER, src: testVertexShader},
        {type: gl.FRAGMENT_SHADER, src: testFragmentShader}
    ];

    const shaderProgram = buildShaderProgram(gl, shaderSet);

    const aspectRatio = canvas.width / canvas.height;

    const vertexArray = new Float32Array([
      -1, 1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1,
    ]);
    const screenPosArray = new Float32Array(vertexArray.length);
    for(let i = 0; i < vertexArray.length; i += 2) {
        const screenPos = ndcToScreen(gl, vertexArray[i], vertexArray[i + 1]);
        screenPosArray[i] = screenPos.x;
        screenPosArray[i + 1] = screenPos.y;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);

    const uGlobalColor = gl.getUniformLocation(shaderProgram, "uGlobalColor");
    gl.uniform4fv(uGlobalColor, [0, 1.0, 0, 1.0]);

    const aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.vertexAttribPointer(
        aVertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    const aScreenPosition = gl.getAttribLocation(shaderProgram, "aScreenPosition");
    const screenPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, screenPosArray, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aScreenPosition);
    gl.vertexAttribPointer(
        aScreenPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.drawArrays(gl.TRIANGLES, 0, vertexArray.length / 2);
}

window.onload = draw;