export const testVertexShader = `
precision mediump float;
attribute vec2 aVertexPosition;
attribute vec2 aScreenPosition;

varying vec2 vScreenPosition;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);

    vScreenPosition = aScreenPosition;
}`;

export const testFragmentShader = `
precision mediump float;
uniform vec4 uGlobalColor;

varying vec2 vScreenPosition;

void main() {
    int x = int(vScreenPosition.x);
    int y = int(vScreenPosition.y);
    gl_FragColor = vec4(mod(float(x+y), 2.0), 0, 0, 1.0);
}
`;
