export const testVertexShader = `
precision mediump float;
attribute vec2 aVertexPosition;
attribute vec2 aScreenPosition;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);

}`;

export const testFragmentShader = `
precision mediump float;

uniform vec2 uOutputResolution;
uniform vec2 uInputResolution;
uniform sampler2D uCurrFrame;
uniform sampler2D uPrevFrame;

vec2 pixel2uv(vec2 pixel) {
    return vec2(pixel.x / uOutputResolution.x, 1.0 - pixel.y / uOutputResolution.y);
}

void main() {
    float x = gl_FragCoord.x;
    float y = gl_FragCoord.y;
    vec2 texel = pixel2uv(vec2(x, y));
    gl_FragColor = texture2D(uCurrFrame, texel * vec2(2.0, 2.0));
    if(x > uOutputResolution.x / 2.0) {
        gl_FragColor = texture2D(uPrevFrame, texel * vec2(2.0, 2.0) - vec2(1.0, 1.0));
    }
}
`;

export function compileShader(gl: WebGLRenderingContext, src: string, type: number) {
    const shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    }

    return shader;
}

//https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Basic_2D_animation_example
export function buildShaderProgram(gl: WebGLRenderingContext, shaderInfo) {
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