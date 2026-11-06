import styles from "./santa.module.css";

interface SmokeProps {
  /** Chimney top, in the parent SVG's own coordinates. */
  x: number;
  y: number;
  /** id of a <radialGradient> defined in the parent SVG. */
  gradientId: string;
  /** Bigger puffs and a longer climb, for the desktop composition. */
  large?: boolean;
  count?: number;
}

/**
 * Chimney smoke: a few soft puffs that run the same CSS loop.
 *
 * Every puff gets a NEGATIVE animation-delay, spread evenly across one
 * loop. A negative delay starts the animation partway through, so the
 * plume is already full on first paint instead of building up from
 * an empty chimney.
 */
export function Smoke({ x, y, gradientId, large = false, count = large ? 7 : 6 }: SmokeProps) {
  const duration = large ? 10 : 8;
  const r = large ? 20 : 12;
  const className = large ? `${styles.puff} ${styles.puffLarge}` : styles.puff;

  return (
    <g aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill={`url(#${gradientId})`}
          className={className}
          style={{ animationDelay: `${(-i * duration) / count}s` }}
        />
      ))}
    </g>
  );
}
