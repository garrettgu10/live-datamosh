import { MotionReconstructor } from "./motion-reconstructor";

export class SettingsManager {
    constructor(
        public srcReconstructor: MotionReconstructor,
        public destReconstructor: MotionReconstructor) {

    }

    mount() {
        const iframeIntervalInput = document.getElementById("iframe-interval") as HTMLInputElement;
        iframeIntervalInput.value = this.srcReconstructor.iframeInterval.toString();
        iframeIntervalInput.addEventListener("change", (e) => {
            this.setIframeInterval(parseInt(iframeIntervalInput.value));
        });

        const iframeThresholdInput = document.getElementById("iframe-threshold") as HTMLInputElement;
        iframeThresholdInput.value = this.srcReconstructor.iframeThreshold.toString();
        iframeThresholdInput.addEventListener("change", (e) => {
            this.setIframeThreshold(parseInt(iframeThresholdInput.value));
        });

        const iframeSourceInput = document.getElementById("iframe-source") as HTMLSelectElement;
        iframeSourceInput.addEventListener("change", (e) => {
            this.setIframeSrc(parseInt(iframeSourceInput.value));
        });

        const iblockSourceInput = document.getElementById("iblock-source") as HTMLSelectElement;
        iblockSourceInput.addEventListener("change", (e) => {
            this.setIblockSrc(parseInt(iblockSourceInput.value));
        });

    }

    setIframeSrc(idx: number) {
        this.destReconstructor.iframeSrcIdx = idx;
    }

    setIblockSrc(idx: number) {
        this.destReconstructor.iblockSrcIdx = idx;
    }

    setIframeInterval(interval: number) {
        this.srcReconstructor.iframeInterval = interval;
        this.srcReconstructor.iframeCountdown = interval;
        this.destReconstructor.iframeInterval = interval;
        this.destReconstructor.iframeCountdown = interval;
    }

    setIframeThreshold(threshold: number) {
        this.srcReconstructor.iframeThreshold = threshold;
        this.destReconstructor.iframeThreshold = threshold;
    }
}