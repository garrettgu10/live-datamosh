import { MotionReconstructor } from "./motion-reconstructor";
import { MotionEstimator } from "./motion-estimator";

export class SettingsManager {
    constructor(
        public motionEstimator: MotionEstimator,
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
            this.setIframeThreshold(parseFloat(iframeThresholdInput.value));
        });

        const iframeSourceInput = document.getElementById("iframe-source") as HTMLSelectElement;
        iframeSourceInput.addEventListener("change", (e) => {
            this.setIframeSrc(parseInt(iframeSourceInput.value));
        });

        const iblockSourceInput = document.getElementById("iblock-source") as HTMLSelectElement;
        iblockSourceInput.addEventListener("change", (e) => {
            this.setIblockSrc(parseInt(iblockSourceInput.value));
        });

        const iblockThresholdInput = document.getElementById("iblock-threshold") as HTMLInputElement;
        iblockThresholdInput.value = this.motionEstimator.iblockThresh.toString();
        iblockThresholdInput.addEventListener("change", (e) => {
            this.setIblockThreshold(parseFloat(iblockThresholdInput.value));
        });

        const deltaMultXInput = document.getElementById("delta-mult-x") as HTMLInputElement;
        deltaMultXInput.value = this.destReconstructor.deltaMultiplier[0].toString();
        deltaMultXInput.addEventListener("change", (e) => {
            this.destReconstructor.deltaMultiplier[0] = parseFloat(deltaMultXInput.value);
        });

        const deltaMultYInput = document.getElementById("delta-mult-y") as HTMLInputElement;
        deltaMultYInput.value = this.destReconstructor.deltaMultiplier[1].toString();
        deltaMultYInput.addEventListener("change", (e) => {
            this.destReconstructor.deltaMultiplier[1] = parseFloat(deltaMultYInput.value);
        });

        const deltaOffsetXInput = document.getElementById("delta-offset-x") as HTMLInputElement;
        deltaOffsetXInput.value = this.destReconstructor.deltaOffset[0].toString();
        deltaOffsetXInput.addEventListener("change", (e) => {
            this.destReconstructor.deltaOffset[0] = parseFloat(deltaOffsetXInput.value);
        });

        const deltaOffsetYInput = document.getElementById("delta-offset-y") as HTMLInputElement;
        deltaOffsetYInput.value = this.destReconstructor.deltaOffset[1].toString();
        deltaOffsetYInput.addEventListener("change", (e) => {
            this.destReconstructor.deltaOffset[1] = parseFloat(deltaOffsetYInput.value);
        });

        const spinMultXInput = document.getElementById("spin-mult-x") as HTMLInputElement;
        spinMultXInput.value = this.destReconstructor.spinMultiplier[0].toString();
        spinMultXInput.addEventListener("change", (e) => {
            this.destReconstructor.spinMultiplier[0] = parseFloat(spinMultXInput.value);
        });

        const spinMultYInput = document.getElementById("spin-mult-y") as HTMLInputElement;
        spinMultYInput.value = this.destReconstructor.spinMultiplier[1].toString();
        spinMultYInput.addEventListener("change", (e) => {
            this.destReconstructor.spinMultiplier[1] = parseFloat(spinMultYInput.value);
        });

        const scaleMultXInput = document.getElementById("scale-mult-x") as HTMLInputElement;
        scaleMultXInput.value = this.destReconstructor.scaleMultiplier[0].toString();
        scaleMultXInput.addEventListener("change", (e) => {
            this.destReconstructor.scaleMultiplier[0] = parseFloat(scaleMultXInput.value);
        });

        const scaleMultYInput = document.getElementById("scale-mult-y") as HTMLInputElement;
        scaleMultYInput.value = this.destReconstructor.scaleMultiplier[1].toString();
        scaleMultYInput.addEventListener("change", (e) => {
            this.destReconstructor.scaleMultiplier[1] = parseFloat(scaleMultYInput.value);
        });
    }

    setIframeSrc(idx: number) {
        this.destReconstructor.iframeSrcIdx = idx;
    }

    setIblockSrc(idx: number) {
        this.destReconstructor.iblockSrcIdx = idx;
    }

    setIblockThreshold(threshold: number) {
        console.log(threshold);
        if(threshold <= 0 || threshold > 1) {
            return;
        }
        this.motionEstimator.iblockThresh = threshold;
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