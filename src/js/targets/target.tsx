
export interface Target {
    canvas: HTMLCanvasElement;
    draw(): void;
}

export interface VideoTarget extends Target {
    attachVideo(video: HTMLVideoElement): void;
}