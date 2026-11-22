"use client";

import { useEffect, useRef } from "react";

export function LandingMotionDirector() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing-motion]");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-motion]"));

    if (reducedMotion) {
      revealNodes.forEach((node) => node.setAttribute("data-visible", "true"));
      return;
    }

    root.classList.add("motion-ready");

    // Immediately reveal elements already within the initial viewport
    const viewportHeight = window.innerHeight;
    revealNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.92) {
        node.setAttribute("data-visible", "true");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealNodes.forEach((node) => {
      if (node.getAttribute("data-visible") !== "true") {
        observer.observe(node);
      }
    });

    // Scroll-linked top progress hairline (GPU transform only)
    let scrollRaf: number | null = null;
    const updateScrollProgress = () => {
      scrollRaf = null;
      const bar = barRef.current;
      if (!bar) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      bar.style.setProperty("--scroll-p", progress.toFixed(4));
    };

    const onScroll = () => {
      if (scrollRaf === null) {
        scrollRaf = window.requestAnimationFrame(updateScrollProgress);
      }
    };

    updateScrollProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Subtle pointer spotlight for dark/accent interactive surfaces
    const spotlights = Array.from(root.querySelectorAll<HTMLElement>("[data-motion-spotlight]"));
    const cleanups: Array<() => void> = [];

    spotlights.forEach((el) => {
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = el.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--spot-x", `${x.toFixed(2)}%`);
        el.style.setProperty("--spot-y", `${y.toFixed(2)}%`);
        el.setAttribute("data-spot-active", "true");
      };

      const onLeave = () => {
        el.removeAttribute("data-spot-active");
      };

      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave, { passive: true });
      cleanups.push(() => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollRaf !== null) {
        window.cancelAnimationFrame(scrollRaf);
      }
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="scroll-progress-track" aria-hidden="true">
      <div ref={barRef} className="scroll-progress-bar" />
    </div>
  );
}
