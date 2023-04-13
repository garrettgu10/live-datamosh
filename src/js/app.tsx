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

let currentAngle, previousTime = 0, currentScale = [1, 1], currentRotation = [0, 1], uScalingFactor, uGlobalColor, uRotationVector, aVertexPosition, vertexNumComponents, vertexCount, vertexBuffer, shaderProgram;
function animateScene(gl: WebGLRenderingContext) {

    const radians = (currentAngle * Math.PI) / 180.0;
    currentRotation[0] = Math.sin(radians);
    currentRotation[1] = Math.cos(radians);

    gl.useProgram(shaderProgram);

    uScalingFactor = gl.getUniformLocation(shaderProgram, "uScalingFactor");
    uGlobalColor = gl.getUniformLocation(shaderProgram, "uGlobalColor");
    uRotationVector = gl.getUniformLocation(shaderProgram, "uRotationVector");

    gl.uniform2fv(uScalingFactor, currentScale);
    gl.uniform2fv(uRotationVector, currentRotation);
    gl.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 1.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");

    gl.enableVertexAttribArray(aVertexPosition);
    gl.vertexAttribPointer(
        aVertexPosition,
        vertexNumComponents,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

    requestAnimationFrame((currentTime) => {
        const deltaAngle =
            ((currentTime - previousTime) / 1000.0) * 90;

        currentAngle = (currentAngle + deltaAngle) % 360;

        previousTime = currentTime;
        animateScene(gl);
    });
}

function main() {
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

    shaderProgram = buildShaderProgram(gl, shaderSet);

    const aspectRatio = canvas.width / canvas.height;
    currentRotation = [0, 1];
    currentScale = [1.0, aspectRatio];

    const vertexArray = new Float32Array([
      -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5,
    ]);
  
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    vertexNumComponents = 2;
    vertexCount = vertexArray.length / vertexNumComponents;

    currentAngle = 0.0;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    animateScene(gl);
}

window.onload = main;