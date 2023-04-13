export const testVertexShader = `
attribute vec2 aVertexPosition;

uniform vec2 uScalingFactor;
uniform vec2 uRotationVector;

void main() {
    vec2 rotatedPosition = vec2(
        aVertexPosition.x * uRotationVector.x - aVertexPosition.y * uRotationVector.y,
        aVertexPosition.x * uRotationVector.y + aVertexPosition.y * uRotationVector.x
    );
    gl_Position = vec4(rotatedPosition * uScalingFactor, 0, 1);
}`;

export const testFragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec4 uGlobalColor;

void main() {
    gl_FragColor = uGlobalColor;
}
`;
