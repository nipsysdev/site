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
          viewBox="0 0 1600 900"
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
                baseFrequency="0.010 0.024"
                numOctaves={4}
                seed={7}
                result="noise"
              >
                {/* Animate the noise scale so the displacement morphs the blob
                    organically over time (lava-lamp / metaball behaviour).
                    x and y frequencies swing WIDE + asymmetric for a pronounced,
                    non-uniform morph. */}
                <animate
                  attributeName="baseFrequency"
                  dur="14s"
                  values="0.010 0.024; 0.026 0.012; 0.014 0.028; 0.010 0.024"
                  keyTimes="0; 0.33; 0.66; 1"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={190}
                xChannelSelector="R"
                yChannelSelector="G"
              >
                {/* Breathe the displacement depth on a different cycle than the
                    turbulence so the blob varies in both shape AND wobble. */}
                <animate
                  attributeName="scale"
                  dur="11s"
                  values="190; 240; 140; 190"
                  keyTimes="0; 0.33; 0.66; 1"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                  repeatCount="indefinite"
                />
              </feDisplacementMap>
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
        <div className="aurora-loading-text">
          <span className="aurora-loading-text-en">Please wait</span>
          <span className="aurora-loading-text-fr">Veuillez patienter</span>
        </div>
      )}
    </div>
  );
}
