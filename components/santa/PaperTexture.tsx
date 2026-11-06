"use client";

import styles from "./santa.module.css";
import { useSvgId } from "./useSvgId";

/**
 * Parchment texture with no image file, drawn over a cream background.
 *
 * feTurbulence makes random "Perlin" noise. feColorMatrix turns that noise
 * into brown with an alpha taken from the noise, so you get soft blotches
 * (low frequency) plus fine paper grain (high frequency). A radial
 * gradient darkens the edges like aged paper.
 *
 * There is no viewBox, so the noise is in CSS pixels: the grain stays the
 * same size however big the letter gets, like real paper.
 */
export function PaperTexture({ seed = 5 }: { seed?: number }) {
  const { id, url } = useSvgId();

  return (
    <svg className={styles.texture} aria-hidden="true" focusable="false">
      <defs>
        <filter id={id("blotch")} x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.18  1.4 0 0 0 -0.6" />
        </filter>
        <filter id={id("grain")} x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed + 3} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.24  0 0 0 0 0.12  0.4 0 0 0 -0.12" />
        </filter>
        <radialGradient id={id("vig")} cx=".5" cy=".5" r=".75">
          <stop offset=".6" stopColor="#8a5a24" stopOpacity="0" />
          <stop offset="1" stopColor="#8a5a24" stopOpacity=".32" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" filter={url("blotch")} opacity=".4" />
      <rect width="100%" height="100%" filter={url("grain")} />
      <rect width="100%" height="100%" fill={url("vig")} />
    </svg>
  );
}
