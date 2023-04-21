export const BLOCK_SIZE = 16;
export const IBLOCK_THRESH = 0.005; // higher means more compression artifacts
export const IFRAME_THRESH = 0.3; // percentage of i-blocks that force an iframe
export const FRAME_RATE = 30;
export const IFRAME_INTERVAL = 20000000 * FRAME_RATE; // force an iframe every two seconds