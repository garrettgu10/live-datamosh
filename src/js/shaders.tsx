export const motionEstimateVertexShader = `
precision mediump float;
attribute vec2 aVertexPosition;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);

}`;

export const motionEstimateFragmentShader = (blockSize: number) => `
precision mediump float;

uniform vec2 uOutputResolution;
uniform vec2 uInputResolution;
uniform sampler2D uCurrFrame;
uniform sampler2D uPrevFrame;

vec2 pixel2uv(vec2 pixel) {
    return vec2(pixel.x / uInputResolution.x, pixel.y / uInputResolution.y);
}

float mse(vec2 curr_xy, vec2 prev_xy) {
    float mse = 0.0; // mean squared error

    for(int i = 0; i < ${blockSize}; i++) {
        for(int j = 0; j < ${blockSize}; j++) {
            vec2 curr_uv = pixel2uv(curr_xy + vec2(float(i), float(j)));
            vec2 prev_uv = pixel2uv(prev_xy + vec2(float(i), float(j)));
            vec4 curr = texture2D(uCurrFrame, curr_uv);
            vec4 prev = texture2D(uPrevFrame, prev_uv);
            mse += pow(curr.r - prev.r, 2.0) + pow(curr.g - prev.g, 2.0) + pow(curr.b - prev.b, 2.0);
        }
    }

    return mse / float(${blockSize * blockSize});
}

vec3 search(vec2 curr_xy, vec2 prev_xy, int S) {
    vec2 best = prev_xy;
    float bestMse = mse(curr_xy, prev_xy);
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) {
                continue;
            }
            vec2 search = prev_xy + vec2(float(i) * float(S), float(j) * float(S));
            float mse = mse(curr_xy, search);
            if (mse < bestMse) {
                best = search;
                bestMse = mse;
            }
        }
    }

    return vec3(best, bestMse);
}

// three step search algorithm
vec3 tss(vec2 xy) {
    vec3 best = vec3(xy, 3);

    int S = 4;
    for(int i = 0; i < 3; i++) {
        best = search(xy, vec2(best.x, best.y), S);
        S /= 2;
    }

    return best;
}

void main() {
    float x = gl_FragCoord.x / uOutputResolution.x * uInputResolution.x;
    float y = gl_FragCoord.y / uOutputResolution.y * uInputResolution.y;

    vec3 tss = tss(vec2(x, y));
    vec2 delta = vec2(tss.x, tss.y) - vec2(x, y);
    
    gl_FragColor = vec4(0.5 + delta.x / 7.0, 0.5 + delta.y / 7.0, tss.z / 3.0, 1.0);
}
`;

export const motionReconstructVertexShader = `
precision mediump float;
attribute vec2 aVertexPosition;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);

}`;

export const motionReconstructFragmentShader = (blockSize: number, mseThresh: number) => `
precision mediump float;

uniform vec2 resolution;

uniform sampler2D uPrevFrame; // the frame we should base reconstruction on
uniform sampler2D uMotionEstimate; // the motion estimate from the previous frame
uniform sampler2D uGroundTruth; // the ground truth frame, sample when mseThresh is hit

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec2 me_resolution = resolution / ${blockSize}.0;
    vec2 me_uv = floor(uv * me_resolution) / me_resolution;

    vec4 me = texture2D(uMotionEstimate, me_uv);

    vec2 delta = vec2(me.r - 0.5, me.g - 0.5) * 7.0;
    vec2 sample_xy = uv * resolution - delta;

    vec2 sample_uv = sample_xy / resolution;

    gl_FragColor = texture2D(uPrevFrame, sample_uv);

    if (me.b < ${mseThresh}) {
        gl_FragColor = texture2D(uGroundTruth, uv);
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