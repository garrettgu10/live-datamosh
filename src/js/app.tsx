import {testFragmentShader, testVertexShader, buildShaderProgram} from "./shaders";

function ndcToScreen(gl: WebGLRenderingContext, x: number, y: number) {
    return {
        x: (x + 1) * gl.canvas.width / 2,
        y: (y + 1) * gl.canvas.height / 2
    };
}

function draw() {
    const inCanvas = document.getElementById("incanvas") as HTMLCanvasElement;
    const inCtx = inCanvas.getContext("2d") as CanvasRenderingContext2D;
    inCtx.fillStyle = "blue";
    inCtx.fillRect(0, 0, inCanvas.width, inCanvas.height);
    inCtx.fillStyle = "red";
    inCtx.font = "200px Arial";
    inCtx.fillText("Hello World", 500 + 50 * Math.random(), 500 + 50 * Math.random());

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

    const vertexArray = new Float32Array([
      -1, 1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1,
    ]);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);

    const uInputResolution = gl.getUniformLocation(shaderProgram, "uInputResolution");
    gl.uniform2fv(uInputResolution, [inCanvas.width, inCanvas.height]);

    const uInputTexture = gl.getUniformLocation(shaderProgram, "uInputTexture");
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inCanvas);
    // gl.texImage2D(
    //     gl.TEXTURE_2D,
    //     0,
    //     gl.RGBA,
    //     1,
    //     1,
    //     0,
    //     gl.RGBA,
    //     gl.UNSIGNED_BYTE,
    //     new Uint8Array([255, 0, 0, 255])
    // )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(uInputTexture, 0);

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

    gl.drawArrays(gl.TRIANGLES, 0, vertexArray.length / 2);

    requestAnimationFrame(draw);
}

window.onload = draw;