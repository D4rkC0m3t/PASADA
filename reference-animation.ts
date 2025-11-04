import { useRef } from "react";
import { useWindowSize } from "react-use";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import { getDevicePixelRatio, twTheme } from "@Shared/utils";

import "../config";

import { LOADING_DURATION, WAVE_AMPLITUDE, WAVE_AMPLITUDE_DEVICES, WAVE_COLOR, WAVE_FREQUENCY } from "../config";

type UseAnimationProps = {
    onComplete?: () => void;
};

export const useAnimation = ({ onComplete }: UseAnimationProps = {}) => {
    const refComponent = useRef<HTMLDivElement>(null);
    const refLogo = useRef<HTMLDivElement>(null);
    const refCanvas = useRef<HTMLCanvasElement>(null);
    const refLoadingProgress = useRef<HTMLDivElement>(null);
    const refLoadingCounter = useRef<HTMLDivElement>(null);

    const { width } = useWindowSize();

    useGSAP(
        () => {
            if (
                !refComponent.current ||
                !refLogo.current ||
                !refCanvas.current ||
                !refLoadingProgress.current ||
                !refLoadingCounter.current
            ) {
                return;
            }

            const isLg = innerWidth >= parseInt(twTheme.screens.lg, 10);
            const devicePixelRatio = getDevicePixelRatio();
            const waveAmplitude = isLg ? WAVE_AMPLITUDE : WAVE_AMPLITUDE_DEVICES;
            const ctx = refCanvas.current.getContext("2d");

            const canvasWidth = refCanvas.current.offsetWidth;
            const canvasHeight = refCanvas.current.offsetHeight + waveAmplitude * 1.75;

            let phase = 0;

            refCanvas.current.width = canvasWidth * devicePixelRatio;
            refCanvas.current.height = canvasHeight * devicePixelRatio;

            refCanvas.current.style.width = `${canvasWidth}px`;
            refCanvas.current.style.height = `${canvasHeight}px`;

            ctx?.scale(devicePixelRatio, devicePixelRatio);

            const drawWave = (progress: number) => {
                if (!ctx) {
                    return;
                }

                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.beginPath();

                ctx.fillStyle = WAVE_COLOR;

                ctx.moveTo(0, canvasHeight);

                for (let x = 0; x < canvasWidth; x++) {
                    const wave1 = Math.sin(x * 0.02 + phase);
                    const wave2 = Math.sin(x * 0.01 + phase);
                    const wave3 = Math.sin(x * 0.05 + phase);

                    const y = canvasHeight * progress - wave1 * wave2 * wave3 * waveAmplitude;

                    ctx.lineTo(x * 3, y);
                }

                ctx.lineTo(canvasWidth, canvasHeight);
                ctx.lineTo(0, canvasHeight);
                ctx.closePath();
                ctx.fill();

                phase += WAVE_FREQUENCY;
            };

            refLoadingCounter.current.innerText = "100";

            gsap.set(refLoadingCounter.current, { width: refLoadingCounter.current.offsetWidth });

            refLoadingCounter.current.innerText = "0";

            const loadingProgress = {
                value: 0,
            };

            gsap.timeline({
                delay: 1,
                onComplete,
            })
                .to(loadingProgress, {
                    duration: LOADING_DURATION,
                    ease: "none",
                    value: 100,
                    onUpdate() {
                        if (refLoadingCounter.current) {
                            refLoadingCounter.current.innerText = `${Math.round(loadingProgress.value)}`;
                        }

                        drawWave(1 - loadingProgress.value / 100);
                    },
                })
                .to(refLoadingProgress.current, {
                    duration: 0.25,
                    ease: "none",
                    opacity: 0,
                })
                .to(refLogo.current, {
                    ease: "none",
                    backgroundColor: "#ffffff",
                })
                .to(
                    refLogo.current,
                    {
                        duration: 1,
                        ease: "none",
                        opacity: 0,
                        scale: (innerWidth / refLogo.current.offsetWidth) * (isLg ? 2 : 1.5),
                    },
                    "<90%"
                )
                .to(refComponent.current, {
                    ease: "none",
                    opacity: 0,
                });

            return () => {
                if (refCanvas.current) {
                    refCanvas.current.removeAttribute("style");
                }
            };
        },
        {
            scope: refCanvas,
            revertOnUpdate: true,
            dependencies: [width],
        }
    );

    return { refComponent, refLogo, refCanvas, refLoadingProgress, refLoadingCounter };
};
