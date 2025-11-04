"use client";

import { FC, useLayoutEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ElProps } from "@Shared/types";
import { Text } from "@Shared/ui";
import { scrollLock, scrollToElement, twcx } from "@Shared/utils";

import { useAnimation } from "../hooks";
import styles from "./styles.module.scss";

const SCROLL_LOCK_NAME = "preloader";

export type PreloaderProps = ElProps<"div">;

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
        return;
    }

    return (
        <div
            ref={refComponent}
            className={twcx(
                "fixed inset-0 z-[999] flex select-none items-center justify-center bg-bg-black text-center text-white",
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
                    className={twcx("relative aspect-[962/192] w-full bg-[#aaa] bg-opacity-30", styles.mask)}
                >
                    <div
                        className={twcx("absolute inset-0 flex items-center justify-center overflow-hidden", className)}
                    >
                        <canvas className="size-full" ref={refCanvas} />
                    </div>
                </div>

                <Text
                    ref={refLoadingProgress}
                    className="absolute right-0 top-full mt-1"
                    variant="menu-link"
                    weight={500}
                >
                    loading...{" "}
                    <span ref={refLoadingCounter} className="inline-block">
                        0
                    </span>
                    %
                </Text>
            </div>
        </div>
    );
};
