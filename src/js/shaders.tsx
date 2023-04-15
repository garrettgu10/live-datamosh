import { MSE_SCALE } from "./consts";

export const motionEstimateVertexShader = `
precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aXY;

varying vec2 frag_xy;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);
    frag_xy = aXY;
}`;

export const motionEstimateFragmentShader = (blockSize: number) => `
precision highp float;

varying vec2 frag_xy;

uniform vec2 uOutputResolution;
uniform vec2 uInputResolution;
uniform sampler2D uCurrFrame;
uniform sampler2D uPrevFrame;

vec2 pixel2uv(vec2 pixel) {
    return pixel / uInputResolution;
}

// computes the mean squared error between the block in currFrame at curr_xy and the block in prevFrame at prev_xy
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
    vec3 best = vec3(xy, mse(xy, xy));

    int S = 4;
    for(int i = 0; i < 3; i++) {
        best = search(xy, vec2(best.x, best.y), S);

        S /= 2;
    }

    return best;
}

void main() {
    // vec2 pos = vec2(gl_FragCoord.x, uOutputResolution.y - gl_FragCoord.y) - 0.5;
    vec2 pos = frag_xy;
    pos *= uInputResolution / uOutputResolution;
    float x = pos.x;
    float y = pos.y;

    vec3 tss = tss(vec2(x, y));
    vec2 delta = vec2(tss.x, tss.y) - vec2(x, y);

    gl_FragColor = vec4(0.5 + delta.x / 15.0, 0.5 + delta.y / 15.0, tss.z / 3.0 * ${MSE_SCALE}.0, 1.0);
    // gl_FragColor = vec4(0, 0, tss.z / 3.0 * 100.0, 1.0);

    // if(tss.z == 0.0) {
    //     gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    // }

    // gl_FragColor = texture2D(uCurrFrame, pixel2uv(vec2(x, y)));
    gl_FragColor = vec4((vec2(gl_FragCoord.x, uOutputResolution.y - gl_FragCoord.y) - 0.5) / uOutputResolution, 0.0, 1.0);
}
`;

export const motionReconstructVertexShader = `
precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aXY;

varying vec2 frag_xy;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);
    frag_xy = aXY;
}`;

export const motionReconstructFragmentShader = (blockSize: number, mseThresh: number) => `
precision highp float;

uniform vec2 uResolution;
uniform bool uUseGroundTruth;

uniform sampler2D uPrevFrame; // the frame we should base reconstruction on
uniform sampler2D uMotionEstimate; // the motion estimate from the previous frame
uniform sampler2D uGroundTruth; // the ground truth frame, sample when mseThresh is hit

varying vec2 frag_xy;

float round(float x) {
    return floor(x + 0.5);
}

void main() {
    // vec2 pos = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - 0.5;
    vec2 pos = frag_xy;
    vec2 uv = pos / uResolution.xy;

    vec2 me_resolution = uResolution / ${blockSize}.0;
    vec2 me_xy = floor(uv * me_resolution);
    vec2 me_uv = me_xy / me_resolution;

    vec4 me = texture2D(uMotionEstimate, me_uv);

    vec2 delta = vec2(me.r - 0.5, me.g - 0.5) * 15.0;
    vec2 sample_xy = pos + vec2(round(delta.x), round(delta.y));

    gl_FragColor = vec4(1.0-abs(delta.x - round(delta.x)), 1.0-abs(delta.y - round(delta.y)), 0, 1);

    vec2 sample_uv = sample_xy / uResolution;

    gl_FragColor = texture2D(uPrevFrame, sample_uv);

    if (me.b > float(${mseThresh * MSE_SCALE}) || uUseGroundTruth) {
        gl_FragColor = texture2D(uGroundTruth, uv);
        // gl_FragColor.b = 1.0;
    }

    // gl_FragColor = vec4(me.b, 0, 0, 1);
    // gl_FragColor /= 2.0;
    // gl_FragColor += vec4(me.r / 2.0, me.g / 2.0, me.b / 2.0, 1.0);

    gl_FragColor = vec4(1.0, gl_FragCoord.xy == frag_xy? 1.0: 0.0, 0.0, 1.0);
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