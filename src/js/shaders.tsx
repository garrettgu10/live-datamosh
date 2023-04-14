export const testVertexShader = `
precision mediump float;
attribute vec2 aVertexPosition;
attribute vec2 aScreenPosition;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);

}`;

export const testFragmentShader = (blockSize: number) => `
precision mediump float;

uniform vec2 uOutputResolution;
uniform vec2 uInputResolution;
uniform sampler2D uCurrFrame;
uniform sampler2D uPrevFrame;

vec2 pixel2uv(vec2 pixel) {
    return vec2(pixel.x / uInputResolution.x, 1.0 - pixel.y / uInputResolution.y);
}

float mse(vec2 xy) {
    float mse = 0.0;

    for(int i = 0; i < ${blockSize}; i++) {
        for(int j = 0; j < ${blockSize}; j++) {
            vec2 uv = pixel2uv(xy + vec2(float(i), float(j)));
            vec4 curr = texture2D(uCurrFrame, uv);
            vec4 prev = texture2D(uPrevFrame, uv);
            mse += pow(curr.r - prev.r, 2.0) + pow(curr.g - prev.g, 2.0) + pow(curr.b - prev.b, 2.0);
        }
    }

    return mse / float(${blockSize * blockSize});
}

vec2 search(vec2 xy, int S) {
    vec2 best = xy;
    float bestMse = mse(xy);
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) {
                continue;
            }
            vec2 search = xy + vec2(float(i) * float(S), float(j) * float(S));
            float mse = mse(search);
            if (mse < bestMse) {
                best = search;
                bestMse = mse;
            }
        }
    }

    return best;
}

// three step search algorithm
vec2 tss(vec2 xy) {
    vec2 best = xy;

    int S = 4;
    for(int i = 0; i < 3; i++) {
        best = search(best, S);
        S /= 2;
    }

    return best;
}

void main() {
    float x = gl_FragCoord.x / uOutputResolution.x * uInputResolution.x;
    float y = gl_FragCoord.y / uOutputResolution.y * uInputResolution.y;

    vec2 tss = tss(vec2(x, y));
    vec2 delta = tss - vec2(x, y);
    
    gl_FragColor = vec4(0.5 + delta.x / 7.0, 0.5 + delta.y / 7.0, 0, 1);
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