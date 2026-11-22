export function MethodTimelineGraphic() {
  return (
    <div className="method-timeline-wrap" aria-hidden="true">
      <svg className="method-timeline-svg" viewBox="0 0 1200 56" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="methodBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#35c6d8" stopOpacity="0" />
            <stop offset="48%" stopColor="#35c6d8" stopOpacity="0.95" />
            <stop offset="76%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7455e8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M20 28 C 240 28, 360 12, 600 28 C 840 44, 960 28, 1180 28"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1.25"
          strokeDasharray="4 8"
        />
        <path
          d="M20 28 C 240 28, 360 12, 600 28 C 840 44, 960 28, 1180 28"
          stroke="url(#methodBeamGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="method-timeline-beam"
        />
        <g className="method-node method-node-1">
          <circle cx="20" cy="28" r="10" stroke="rgba(53, 198, 216, 0.4)" strokeWidth="1" className="method-node-ring" />
          <circle cx="20" cy="28" r="4" fill="#35c6d8" />
        </g>
        <g className="method-node method-node-2">
          <circle cx="600" cy="28" r="10" stroke="rgba(255, 255, 255, 0.42)" strokeWidth="1" className="method-node-ring" />
          <circle cx="600" cy="28" r="4" fill="#ffffff" />
        </g>
        <g className="method-node method-node-3">
          <circle cx="1180" cy="28" r="10" stroke="rgba(116, 85, 232, 0.55)" strokeWidth="1" className="method-node-ring" />
          <circle cx="1180" cy="28" r="4" fill="#a894ff" />
        </g>
      </svg>
    </div>
  );
}

export function PreviewCadenceGraphic() {
  return (
    <div className="preview-cadence-graphic" aria-hidden="true">
      <div className="preview-cadence-bars">
        <span className="cadence-col">
          <i className="cadence-fill cadence-fill-1" />
          <em>Mon</em>
        </span>
        <span className="cadence-col">
          <i className="cadence-fill cadence-fill-2" />
          <em>Tue</em>
        </span>
        <span className="cadence-col">
          <i className="cadence-fill cadence-fill-3" />
          <em>Wed</em>
        </span>
        <span className="cadence-col">
          <i className="cadence-fill cadence-fill-4" />
          <em>Thu</em>
        </span>
        <span className="cadence-col">
          <i className="cadence-fill cadence-fill-5" />
          <em>Fri</em>
        </span>
      </div>
    </div>
  );
}

export function SkillRadarGraphic() {
  return (
    <div className="skill-radar-card" aria-hidden="true" data-motion="fade-up" data-delay="140">
      <svg className="skill-radar-svg" viewBox="0 0 340 168" fill="none">
        <defs>
          <linearGradient id="skillArcA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#302b63" />
            <stop offset="100%" stopColor="#7455e8" />
          </linearGradient>
          <linearGradient id="skillArcB" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7455e8" />
            <stop offset="100%" stopColor="#35c6d8" />
          </linearGradient>
        </defs>

        {/* Left concentric mastery dial */}
        <g transform="translate(86 86)">
          <circle r="66" stroke="rgba(48, 43, 99, 0.12)" strokeWidth="1" strokeDasharray="3 6" />
          <circle r="50" stroke="rgba(48, 43, 99, 0.14)" strokeWidth="5" />
          <circle
            r="50"
            stroke="url(#skillArcA)"
            strokeWidth="5"
            strokeLinecap="round"
            transform="rotate(-90)"
            className="skill-ring-outer"
          />
          <circle r="33" stroke="rgba(48, 43, 99, 0.12)" strokeWidth="4.5" />
          <circle
            r="33"
            stroke="url(#skillArcB)"
            strokeWidth="4.5"
            strokeLinecap="round"
            transform="rotate(-90)"
            className="skill-ring-inner"
          />
          <circle r="6" fill="#302b63" />
          <circle r="13" stroke="rgba(116, 85, 232, 0.32)" strokeWidth="1" className="skill-core-pulse" />
        </g>

        {/* Right modular skill signal bars */}
        <g transform="translate(180 32)" fontFamily="inherit">
          <text x="0" y="10" fill="#585d72" fontSize="10" fontWeight="700" letterSpacing="0.06em">VOCABULARY</text>
          <rect x="0" y="17" width="144" height="5" rx="2.5" fill="rgba(48, 43, 99, 0.11)" />
          <rect x="0" y="17" width="118" height="5" rx="2.5" fill="#302b63" className="skill-bar skill-bar-1" />

          <text x="0" y="42" fill="#585d72" fontSize="10" fontWeight="700" letterSpacing="0.06em">GRAMMAR</text>
          <rect x="0" y="49" width="144" height="5" rx="2.5" fill="rgba(48, 43, 99, 0.11)" />
          <rect x="0" y="49" width="104" height="5" rx="2.5" fill="#7455e8" className="skill-bar skill-bar-2" />

          <text x="0" y="74" fill="#585d72" fontSize="10" fontWeight="700" letterSpacing="0.06em">READING</text>
          <rect x="0" y="81" width="144" height="5" rx="2.5" fill="rgba(48, 43, 99, 0.11)" />
          <rect x="0" y="81" width="128" height="5" rx="2.5" fill="#35c6d8" className="skill-bar skill-bar-3" />

          <text x="0" y="106" fill="#585d72" fontSize="10" fontWeight="700" letterSpacing="0.06em">LISTENING</text>
          <rect x="0" y="113" width="144" height="5" rx="2.5" fill="rgba(48, 43, 99, 0.11)" />
          <rect x="0" y="113" width="92" height="5" rx="2.5" fill="#302b63" className="skill-bar skill-bar-4" />
        </g>
      </svg>
    </div>
  );
}

export function SimulationClockBadge() {
  return (
    <div className="sim-clock-badge" aria-hidden="true">
      <svg className="sim-clock-svg" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="2" />
        <circle
          cx="18"
          cy="18"
          r="14"
          stroke="#35c6d8"
          strokeWidth="2.2"
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
          className="sim-clock-arc"
        />
        <line x1="18" y1="18" x2="18" y2="10.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" className="sim-clock-hand" />
        <circle cx="18" cy="18" r="2" fill="#35c6d8" />
      </svg>
      <span>Timed checkpoint</span>
    </div>
  );
}

export function StoriesWaveGraphic() {
  return (
    <svg className="stories-wave-svg" viewBox="0 0 640 160" fill="none" aria-hidden="true">
      <path
        d="M0 94 C 120 34, 240 144, 380 86 C 480 44, 560 72, 640 42"
        stroke="rgba(53, 198, 216, 0.34)"
        strokeWidth="1.5"
        strokeDasharray="5 9"
        className="stories-wave-path"
      />
      <path
        d="M0 118 C 140 62, 260 156, 410 104 C 510 70, 576 92, 640 72"
        stroke="rgba(48, 43, 99, 0.14)"
        strokeWidth="1.2"
        className="stories-wave-path-alt"
      />
    </svg>
  );
}

export function CtaAmbientMotion() {
  return (
    <svg className="cta-ambient-svg" viewBox="0 0 1200 480" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ctaRingSweep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#35c6d8" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="960" cy="240" r="320" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="4 10" />
      <circle
        cx="960"
        cy="240"
        r="320"
        stroke="url(#ctaRingSweep)"
        strokeWidth="2"
        strokeLinecap="round"
        className="cta-orbit-arc"
      />
      <circle cx="960" cy="240" r="215" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="2 9" className="cta-orbit-inner" />
      <circle cx="960" cy="240" r="118" stroke="rgba(53, 198, 216, 0.24)" strokeWidth="1" />
    </svg>
  );
}
