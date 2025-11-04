"use client";

import { FC, useLayoutEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollLock, scrollToElement, twcx } from "@/lib/utils";
import { useAnimation } from "./hooks/useAnimationNew";
import { SCROLL_LOCK_NAME, Z_INDEX, LOGO_CONFIG } from "./config";
import styles from "./Preloader.module.css";

export interface PreloaderProps {
  className?: string;
}

export const Preloader: FC<PreloaderProps> = ({ className, ...restProps }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const { refComponent, refLogo, refCanvas, refLoadingProgress, refLoadingCounter } = useAnimation({
    onComplete: () => setIsCompleted(true),
  });

  useLayoutEffect(() => {
    scrollLock(!isCompleted, SCROLL_LOCK_NAME);

    if (isCompleted) {
      ScrollTrigger.refresh();
      
      if (location.hash) {
        scrollToElement(document.querySelector(location.hash));
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [isCompleted]);

  if (isCompleted) {
    return null;
  }

  return (
    <div
      ref={refComponent}
      className={twcx(
        "fixed inset-0 z-[999] flex select-none items-center justify-center bg-black text-center text-white",
        className
      )}
      {...restProps}
    >
      <div
        className={twcx(
          "relative w-full max-w-[80%]",
          "md:max-w-[70%]",
          "lg:max-w-[740px]",
          "xl:max-w-[965px]"
        )}
      >
        <div
          ref={refLogo}
          className="relative w-full"
          style={{
            aspectRatio: LOGO_CONFIG.aspectRatio,
          }}
        >
          {/* Inline SVG mask for better control */}
          <svg className="absolute inset-0 w-0 h-0">
            <defs>
              <mask id="pasada-text-mask">
                <rect width="100%" height="100%" fill="black" />
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="white"
                  fontSize="140"
                  fontWeight="800"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  letterSpacing="-5"
                >
                  PASADA
                </text>
              </mask>
            </defs>
          </svg>

          {/* Canvas with inline mask applied */}
          <div 
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
              maskImage: "url(#pasada-text-mask)",
              WebkitMaskImage: "url(#pasada-text-mask)",
            }}
          >
            <canvas className="size-full" ref={refCanvas} />
          </div>
          
          {/* Text outline for visibility when wave is low */}
          <h1
            className="absolute inset-0 flex items-center justify-center text-[8vw] font-extrabold uppercase pointer-events-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255, 255, 255, 0.2)",
              letterSpacing: "-2px",
            }}
          >
            PASADA
          </h1>
        </div>

        <div
          ref={refLoadingProgress}
          className="absolute right-0 top-full mt-1 text-sm font-medium tracking-wide"
        >
          loading...{" "}
          <span ref={refLoadingCounter} className="inline-block">
            0
          </span>
          %
        </div>
      </div>
    </div>
  );
};
