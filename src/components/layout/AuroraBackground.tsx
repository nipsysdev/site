'use client';

import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

import { $isAppReady } from '@/stores/app-store';

type AuroraPhase = 'loading' | 'transitioning' | 'ready';

export default function AuroraBackground() {
  const isAppReady = useStore($isAppReady);
  const [phase, setPhase] = useState<AuroraPhase>('loading');

  useEffect(() => {
    if (!isAppReady) return;
    // Phase 1: shrink to 0 at loading position
    setPhase('transitioning');
    // Phase 2: after shrink completes, teleport position + expand back
    const timer = setTimeout(() => setPhase('ready'), 300);
    return () => clearTimeout(timer);
  }, [isAppReady]);

  return (
    <div aria-hidden="true" className={`aurora-root is-${phase}`}>
      {/* Layer 1: blurred glow (CSS blur on oversized wrapper) */}
      <div className="aurora-canvas-wrap">
        <svg
          role="presentation"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="aurora-glow-grad">
              <stop
                offset="0%"
                style={{
                  stopColor: 'var(--aurora-glow)',
                  stopOpacity: 'var(--glow-alpha)',
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor: 'var(--aurora-glow)',
                  stopOpacity: 0,
                }}
              />
            </radialGradient>
            {/* Distortion filter — NO feGaussianBlur here (CSS handles blur) */}
            <filter
              id="aurora-distort"
              filterUnits="userSpaceOnUse"
              x="-25%"
              y="-25%"
              width="150%"
              height="150%"
              color-interpolation-filters="sRGB"
            >
              <feTurbulence
                type="turbulence"
                baseFrequency="0.015 0.018"
                numOctaves={4}
                seed={7}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={120}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <g className="aurora-light">
            <g className="aurora-rotate">
              <g className="aurora-breathe">
                <ellipse
                  rx="20%"
                  ry="28%"
                  fill="url(#aurora-glow-grad)"
                  filter="url(#aurora-distort)"
                />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {phase === 'loading' && (
        <div className="aurora-loading-text">Please wait</div>
      )}

      {/* Layer 2: grain overlay (separate SVG so it stays SHARP, not blurred by CSS) */}
      <svg
        className="aurora-grain-layer"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter
            id="aurora-grain"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
            color-interpolation-filters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves={2}
              seed={3}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="2.2" intercept="-0.6" />
              <feFuncG type="linear" slope="2.2" intercept="-0.6" />
              <feFuncB type="linear" slope="2.2" intercept="-0.6" />
            </feComponentTransfer>
          </filter>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          filter="url(#aurora-grain)"
        />
      </svg>
    </div>
  );
}
