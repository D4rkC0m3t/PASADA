"use client";

/**
 * Preloader Animation Hook
 * Manages GSAP animations and canvas wave effects for the preloader
 */

import { useRef } from 'react';
import { useWindowSize } from 'react-use';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import {
  WAVE_COLOR,
  WAVE_FREQUENCY,
  WAVE_AMPLITUDE,
  WAVE_AMPLITUDE_DEVICES,
  LOADING_DURATION,
  getDevicePixelRatio,
  isLargeScreen,
} from '../config';

interface UseAnimationProps {
  onComplete?: () => void;
}

interface UseAnimationReturn {
  refComponent: React.RefObject<HTMLDivElement>;
  refLogo: React.RefObject<HTMLDivElement>;
  refCanvas: React.RefObject<HTMLCanvasElement>;
  refLoadingProgress: React.RefObject<HTMLDivElement>;
  refLoadingCounter: React.RefObject<HTMLDivElement>;
}

export function useAnimation({ onComplete }: UseAnimationProps = {}): UseAnimationReturn {
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

    const component = refComponent.current;
    const logo = refLogo.current;
    const canvas = refCanvas.current;
    const loadingProgressEl = refLoadingProgress.current;
    const loadingCounterEl = refLoadingCounter.current;

    // Determine if large screen and wave amplitude
    const isLg = isLargeScreen();
    const devicePixelRatio = getDevicePixelRatio();
    const waveAmplitude = isLg ? WAVE_AMPLITUDE : WAVE_AMPLITUDE_DEVICES;
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas 2D context');
      return;
    }

    // Calculate canvas dimensions
    const canvasWidth = canvas.offsetWidth || logo.offsetWidth;
    const canvasHeight = (canvas.offsetHeight || logo.offsetHeight) + waveAmplitude * 1.75;

    let phase = 0;

    // Set canvas size with device pixel ratio for sharp rendering
    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    /**
     * Draw wave animation on canvas
     * @param progress - Progress value from 0 to 1 (1 = full, 0 = empty)
     */
    const drawWave = (progress: number) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.beginPath();

      ctx.fillStyle = WAVE_COLOR;

      ctx.moveTo(0, canvasHeight);

      // Draw wave path
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

    // Set counter width based on "100" to prevent layout shift
    loadingCounterEl.innerText = '100';
    gsap.set(loadingCounterEl, { width: loadingCounterEl.offsetWidth });
    loadingCounterEl.innerText = '0';

    // Create loading progress object for GSAP animation
    const progressValue = {
      value: 0,
    };

    // GSAP Timeline
    gsap
      .timeline({
        delay: 1,
        onComplete,
      })
      .to(progressValue, {
        duration: LOADING_DURATION,
        ease: 'none',
        value: 100,
        onUpdate() {
          if (loadingCounterEl) {
            loadingCounterEl.innerText = `${Math.round(progressValue.value)}`;
          }
          
          // Draw wave (inverted progress: 1 = full, 0 = empty)
          drawWave(1 - progressValue.value / 100);
        },
      })
      .to(loadingProgressEl, {
        duration: 0.25,
        ease: 'none',
        opacity: 0,
      })
      .to(logo, {
        ease: 'none',
        backgroundColor: '#ffffff',
      })
      .to(
        logo,
        {
          duration: 1,
          ease: 'none',
          opacity: 0,
          scale: (window.innerWidth / logo.offsetWidth) * (isLg ? 2 : 1.5),
        },
        '<90%'
      )
      .to(component, {
        ease: 'none',
        opacity: 0,
      });

    // Cleanup function
    return () => {
      if (canvas) {
        canvas.removeAttribute('style');
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
}
