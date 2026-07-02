"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useRef } from "react";

type SvgDrawProps = ComponentPropsWithoutRef<"div">;

export function SvgDraw({ children, className, ...props }: SvgDrawProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.24 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={["svg-draw", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
