"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type LexiconEntry = {
  exam: string;
  term: string;
  gloss: string;
};

const LEXICON_ENTRIES: LexiconEntry[] = [
  { exam: "JLPT N3", term: "開発", gloss: "development" },
  { exam: "DELE B2", term: "con todo", gloss: "nevertheless" },
  { exam: "DALF C1", term: "néanmoins", gloss: "however" },
  { exam: "JLPT N2", term: "抽選", gloss: "lottery draw" },
  { exam: "DELE C1", term: "por … que", gloss: "no matter how" },
];

const CYCLE_MS = 3800;

export function HeroMotionStage() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches && stageRef.current) {
        targetRef.current = { x: 0, y: 0 };
        currentRef.current = { x: 0, y: 0 };
        stageRef.current.style.setProperty("--px", "0");
        stageRef.current.style.setProperty("--py", "0");
      }
    };

    mediaQuery.addEventListener("change", handlePreferenceChange);

    const timer = window.setInterval(() => {
      if (!pausedRef.current && !reducedMotionRef.current) {
        setActiveIndex((prev) => (prev + 1) % LEXICON_ENTRIES.length);
      }
    }, CYCLE_MS);

    return () => {
      mediaQuery.removeEventListener("change", handlePreferenceChange);
      window.clearInterval(timer);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const scheduleParallaxTick = () => {
    if (rafRef.current !== null || reducedMotionRef.current) return;

    const step = () => {
      const el = stageRef.current;
      if (!el) {
        rafRef.current = null;
        return;
      }

      const nextX = currentRef.current.x + (targetRef.current.x - currentRef.current.x) * 0.11;
      const nextY = currentRef.current.y + (targetRef.current.y - currentRef.current.y) * 0.11;

      currentRef.current.x = nextX;
      currentRef.current.y = nextY;

      el.style.setProperty("--px", nextX.toFixed(4));
      el.style.setProperty("--py", nextY.toFixed(4));

      const settled =
        Math.abs(targetRef.current.x - nextX) < 0.0015 &&
        Math.abs(targetRef.current.y - nextY) < 0.0015;

      if (settled) {
        currentRef.current.x = targetRef.current.x;
        currentRef.current.y = targetRef.current.y;
        el.style.setProperty("--px", targetRef.current.x.toFixed(4));
        el.style.setProperty("--py", targetRef.current.y.toFixed(4));
        rafRef.current = null;
        return;
      }

      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current || event.pointerType !== "mouse") return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const normX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    targetRef.current = {
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
    };
    scheduleParallaxTick();
  };

  const handlePointerEnter = () => {
    pausedRef.current = true;
    setIsPaused(true);
  };

  const handlePointerLeave = () => {
    pausedRef.current = false;
    setIsPaused(false);
    targetRef.current = { x: 0, y: 0 };
    scheduleParallaxTick();
  };

  const currentEntry = LEXICON_ENTRIES[activeIndex];

  return (
    <figure className="hero-artwork">
      <div
        ref={stageRef}
        className="hero-collage-stage"
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {/* Precision SVG orbital rings & exam-timer ticks */}
        <svg
          className="hero-motion-svg"
          viewBox="0 0 600 280"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heroArcIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7455e8" stopOpacity="0.48" />
              <stop offset="55%" stopColor="#35c6d8" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#302b63" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroArcStone" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#302b63" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#b9b3a6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer slow-rotating calibration ring */}
          <g className="hero-orbit-outer">
            <ellipse
              cx="300"
              cy="142"
              rx="258"
              ry="104"
              stroke="rgba(48, 43, 99, 0.11)"
              strokeWidth="1"
              strokeDasharray="3 8"
            />
            <ellipse
              cx="300"
              cy="142"
              rx="258"
              ry="104"
              stroke="url(#heroArcIndigo)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray="128 980"
              className="hero-arc-sweep"
            />
          </g>

          {/* Inner counter-rotating fine guide ring */}
          <g className="hero-orbit-inner">
            <ellipse
              cx="300"
              cy="142"
              rx="202"
              ry="76"
              stroke="url(#heroArcStone)"
              strokeWidth="1"
              strokeDasharray="2 11"
            />
          </g>

          {/* Editorial registration crosshairs */}
          <g className="hero-crosshairs" stroke="rgba(48, 43, 99, 0.24)" strokeWidth="1">
            <path d="M26 36h10M31 31v10" />
            <path d="M564 236h10M569 231v10" />
            <circle cx="534" cy="48" r="2.5" fill="rgba(53, 198, 216, 0.55)" stroke="none" className="hero-beacon-dot" />
            <circle cx="64" cy="222" r="2.2" fill="rgba(116, 85, 232, 0.45)" stroke="none" className="hero-beacon-dot hero-beacon-dot-alt" />
          </g>
        </svg>

        {/* Subtle drifting multilingual script glyphs */}
        <div className="hero-glyph-layer" aria-hidden="true">
          <span className="hero-glyph hero-glyph-1">語</span>
          <span className="hero-glyph hero-glyph-2">ñ</span>
          <span className="hero-glyph hero-glyph-3">é</span>
          <span className="hero-glyph hero-glyph-4">文</span>
        </div>

        {/* Live cycling exam vocabulary token */}
        <div
          className={`hero-lexicon-pill${isPaused ? " is-paused" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="hero-lexicon-row" key={currentEntry.exam + currentEntry.term}>
            <span className="hero-lexicon-tag">{currentEntry.exam}</span>
            <strong className="hero-lexicon-term">{currentEntry.term}</strong>
            <span className="hero-lexicon-gloss">{currentEntry.gloss}</span>
          </div>
          <span
            key={`bar-${activeIndex}`}
            className="hero-lexicon-progress"
            aria-hidden="true"
          />
        </div>

        {/* Main tactile magazine-cutout collage */}
        <div className="hero-collage-float">
          <Image
            src="/images/hero-vocabulary.png"
            alt="Editorial magazine-cutout typography spelling Vocabulary"
            width={566}
            height={132}
            priority
            className="hero-collage-image"
          />
        </div>

        {/* Minimal timed-cadence pulse indicator */}
        <div className="hero-cadence-pill" aria-hidden="true">
          <span className="hero-cadence-bars">
            <i />
            <i />
            <i />
          </span>
          <span>Timed checkpoints · Active recall</span>
        </div>
      </div>

      <figcaption className="hero-artwork-caption">
        <span>JLPT · DELE · DALF</span>
        <span aria-hidden="true" className="hero-caption-rule" />
        <span>Lexicon, grammar &amp; reading</span>
      </figcaption>
    </figure>
  );
}
