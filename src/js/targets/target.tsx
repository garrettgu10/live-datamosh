
export interface Target {
    canvas: HTMLCanvasElement;
    draw(): void;
}

export interface VideoTarget extends Target {
    video: HTMLVideoElement;
    attachVideo(video: HTMLVideoElement): void;
}

export interface AudioTarget extends Target {
    audio: HTMLAudioElement;
    attachAudio(audio: HTMLAudioElement): void;
}