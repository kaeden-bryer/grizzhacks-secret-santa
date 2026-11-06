"use client";

import type { CSSProperties } from "react";
import { useSvgId } from "./useSvgId";

/** The snowflake pressed into the wax: one arm with two chevrons, rotated 3×. */
const ARM = "M0 -26 V26 M-7 -20 L0 -13 L7 -20 M-7 20 L0 13 L7 20";

interface WaxSealProps {
  className?: string;
  style?: CSSProperties;
  /** Soft cast shadow under the wax (use on the envelope). */
  shadow?: boolean;
}

/**
 * Red wax seal. The lumpy edge is one circle plus eight smaller circles
 * around its rim, all filled with the same gradient. Because that
 * gradient uses userSpaceOnUse, the lumps share one light source and
 * read as a single blob of wax.
 */
export function WaxSeal({ className, style, shadow = false }: WaxSealProps) {
  const { id, url } = useSvgId();

  return (
    <svg viewBox="-90 -90 180 180" className={className} style={style} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id("wax")} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="82" fx="-24" fy="-28">
          <stop offset="0" stopColor="#d4363c" />
          <stop offset=".6" stopColor="#a3171c" />
          <stop offset="1" stopColor="#7a0e13" />
        </radialGradient>
        <radialGradient id={id("in")} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="46" fx="14" fy="16">
          <stop offset="0" stopColor="#b52127" />
          <stop offset="1" stopColor="#8f1318" />
        </radialGradient>
        <filter id={id("soft")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {shadow && <ellipse cx="5" cy="10" rx="74" ry="70" fill="#3c140a" opacity=".38" filter={url("soft")} />}

      <g fill={url("wax")}>
        <circle r="62" />
        <circle cx="0" cy="-60" r="14" />
        <circle cx="42" cy="-44" r="16" />
        <circle cx="62" cy="-6" r="13" />
        <circle cx="48" cy="38" r="17" />
        <circle cx="10" cy="62" r="14" />
        <circle cx="-36" cy="52" r="15" />
        <circle cx="-62" cy="12" r="16" />
        <circle cx="-50" cy="-34" r="14" />
      </g>
      <circle r="49" fill="none" stroke="#ffb4aa" strokeOpacity=".22" strokeWidth="1.5" />
      <circle r="46" fill="none" stroke="#6e0b10" strokeOpacity=".8" strokeWidth="5" />
      <circle r="43" fill={url("in")} />

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* faint light edge offset down-right, then the dark impression: reads as pressed in */}
        <g stroke="#ffc8c0" strokeOpacity=".35" strokeWidth="1.4" transform="translate(1.2 1.2)">
          <path d={ARM} />
          <path d={ARM} transform="rotate(60)" />
          <path d={ARM} transform="rotate(120)" />
        </g>
        <g stroke="#640a0e" strokeWidth="3.4">
          <path d={ARM} />
          <path d={ARM} transform="rotate(60)" />
          <path d={ARM} transform="rotate(120)" />
        </g>
      </g>

      <ellipse cx="-26" cy="-34" rx="20" ry="8" fill="#ffffff" opacity=".22" transform="rotate(-35 -26 -34)" />
    </svg>
  );
}
