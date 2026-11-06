import type { ReactNode } from "react";
import styles from "./santa.module.css";
import { Smoke } from "./Smoke";

/*
 * The cozy-cabin night scene, drawn as inline SVG (no image files).
 *
 * There are two compositions: a tall one for phones and a wide one for
 * desktop. Both are always in the HTML and CSS shows one by aspect ratio.
 * Choosing with CSS instead of JS (window.innerWidth) means the right
 * layout is there on the very first paint, with no flash during hydration.
 *
 * preserveAspectRatio="... slice" works like `object-fit: cover`: the
 * drawing fills the screen and the extra is cropped. The phone version
 * is centred; the desktop version is anchored right so the cabin never
 * gets cropped on narrow-ish windows.
 *
 * SVG ids are global to the whole HTML page, so each composition uses
 * its own prefix (p- / d-). Render <Scene> only once per page.
 */

type Twinkle = 0 | 1 | 2 | 3;
type Star = readonly [x: number, y: number, r: number, twinkle?: Twinkle, opacity?: number];

interface Composition {
  prefix: "p" | "d";
  w: number;
  h: number;
  align: string;
  stars: readonly Star[];
  hills: readonly [back: string, mid: string, front: string];
  farPines: readonly string[];
  pines: readonly string[];
  cabin: string;
  tree: string;
  pool: { cx: number; cy: number; rx: number; ry: number };
  smoke: { x: number; y: number; large: boolean };
  lineWidth: number;
}

const PHONE: Composition = {
  prefix: "p",
  w: 390,
  h: 844,
  align: "xMidYMax slice",
  stars: [
    [24, 40, 1.2, 1], [58, 92, 0.8], [92, 30, 1], [130, 70, 1.4, 2], [160, 22, 0.8], [188, 118, 1], [214, 52, 1.1, 3],
    [246, 88, 0.7], [270, 28, 1.3], [302, 64, 0.9, 1], [336, 20, 1], [362, 98, 1.2, 2], [380, 48, 0.7],
    [18, 150, 0.9], [48, 198, 1.3, 3], [84, 140, 0.7], [120, 176, 1], [150, 236, 0.8, 1], [176, 160, 1.2], [226, 190, 0.9],
    [258, 146, 1, 2], [290, 212, 1.3], [322, 160, 0.8], [356, 206, 1, 3],
    [30, 270, 1], [70, 320, 0.8, 2], [104, 262, 1.2], [140, 300, 0.7], [200, 280, 1, 1], [244, 318, 0.8], [280, 268, 1.1],
    [330, 300, 0.9, 3], [372, 262, 1.2],
    [20, 410, 0.8], [60, 380, 1, 1], [110, 440, 0.7], [170, 400, 1], [230, 430, 0.8, 2], [300, 390, 1], [350, 440, 0.9],
    [380, 350, 0.7, 3],
    [40, 500, 0.8, 0, 0.7], [140, 520, 0.7, 0, 0.6], [260, 500, 0.8, 0, 0.7], [360, 530, 0.7, 0, 0.6],
  ],
  hills: [
    "M0 600 C 80 570 160 575 230 610 C 290 640 350 620 390 610 V844 H0 Z",
    "M0 690 C 70 660 150 665 210 700 C 260 728 330 715 390 712 V844 H0 Z",
    "M0 790 C 90 760 170 752 250 750 C 310 748 360 750 390 754 V844 H0 Z",
  ],
  farPines: [],
  pines: ["translate(378 730)", "translate(292 668) scale(.5)", "translate(170 744) scale(.6)"],
  cabin: "translate(250 660)",
  tree: "translate(222 614)",
  pool: { cx: 310, cy: 762, rx: 70, ry: 9 },
  smoke: { x: 342, y: 656, large: false },
  lineWidth: 1.5,
};

const DESKTOP: Composition = {
  prefix: "d",
  w: 1440,
  h: 900,
  align: "xMaxYMax slice",
  stars: [
    [40, 60, 1.4, 1], [120, 140, 1], [190, 40, 1.2], [260, 210, 1.6, 2], [330, 90, 0.9], [380, 300, 1.2], [70, 260, 1, 3],
    [150, 350, 1.3], [230, 440, 0.9], [310, 380, 1.1, 1], [50, 460, 1], [400, 500, 0.8], [120, 540, 0.8, 0, 0.7],
    [300, 560, 0.8, 0, 0.6], [420, 170, 1.4, 2], [20, 360, 0.8],
    [470, 24, 1], [620, 30, 1.3, 3], [760, 20, 0.9], [900, 32, 1.2, 1], [980, 18, 1],
    [1040, 80, 1.3, 2], [1100, 190, 1], [1160, 60, 1.6, 3], [1220, 150, 0.9], [1280, 40, 1.2], [1330, 230, 1.4, 1],
    [1390, 110, 1], [1420, 300, 0.9], [1060, 300, 1.1, 1], [1140, 380, 1], [1210, 290, 1.2, 2], [1260, 420, 0.8],
    [1370, 370, 1.1], [1050, 460, 0.9, 3], [1180, 500, 0.8], [1410, 480, 1], [1090, 560, 0.7, 0, 0.7],
    [1320, 540, 0.8, 0, 0.6],
  ],
  hills: [
    "M0 640 C 200 560 420 580 620 640 C 800 690 1000 600 1200 620 C 1320 632 1400 650 1440 660 V900 H0 Z",
    "M0 760 C 180 700 380 700 560 750 C 700 790 860 720 1040 730 C 1200 740 1340 760 1440 770 V900 H0 Z",
    "M0 860 C 240 820 520 830 760 860 C 900 876 1000 830 1140 818 C 1260 808 1380 815 1440 822 V900 H0 Z",
  ],
  farPines: ["translate(150 612) scale(.5)", "translate(182 606) scale(.36)", "translate(520 616) scale(.42)"],
  pines: ["translate(90 742) scale(.8)", "translate(1395 800) scale(1.6)", "translate(1440 790) scale(1.25)"],
  cabin: "translate(1150 660) scale(1.7)",
  tree: "translate(1100 602) scale(1.6)",
  pool: { cx: 1252, cy: 832, rx: 130, ry: 14 },
  smoke: { x: 1306, y: 652, large: true },
  lineWidth: 1.2,
};

/** Tree lights in the tree's local coordinates: x, y, radius, colour, blink group. */
const LIGHTS: readonly (readonly [number, number, number, string, 1 | 2 | 3])[] = [
  [-8, 28, 2.6, "#ff5a5a", 1], [6, 34, 2.6, "#ffd65a", 2], [1, 16, 2.4, "#6fd3ff", 3],
  [-18, 66, 2.6, "#8cf28c", 2], [10, 60, 2.6, "#ff9ad5", 3], [22, 72, 2.6, "#ff5a5a", 1], [-4, 48, 2.4, "#ffd65a", 1],
  [-28, 112, 2.6, "#6fd3ff", 1], [-10, 100, 2.6, "#ff5a5a", 3], [14, 108, 2.6, "#ffd65a", 2], [30, 116, 2.6, "#8cf28c", 3],
  [0, 86, 2.6, "#ff9ad5", 1], [-22, 92, 2.4, "#ffd65a", 2], [24, 94, 2.4, "#6fd3ff", 1],
];

const twinkleClass = (t: Twinkle | undefined) =>
  t === 1 ? styles.st1 : t === 2 ? styles.st2 : t === 3 ? styles.st3 : undefined;
const blinkClass = (t: 1 | 2 | 3) => (t === 1 ? styles.tw1 : t === 2 ? styles.tw2 : styles.tw3);

function Landscape({ c, smoke }: { c: Composition; smoke: boolean }) {
  const id = (name: string) => `${c.prefix}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg
      className={`${styles.sceneSvg} ${c.prefix === "p" ? styles.phone : styles.desktop}`}
      viewBox={`0 0 ${c.w} ${c.h}`}
      preserveAspectRatio={c.align}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06102a" />
          <stop offset=".55" stopColor="#0f2756" />
          <stop offset="1" stopColor="#2b5d90" />
        </linearGradient>
        <linearGradient id={id("hb")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f90bf" />
          <stop offset="1" stopColor="#2f5e8c" />
        </linearGradient>
        <linearGradient id={id("hm")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#93bee2" />
          <stop offset="1" stopColor="#5b8ebd" />
        </linearGradient>
        <linearGradient id={id("hf")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6f2fb" />
          <stop offset="1" stopColor="#a7c9e5" />
        </linearGradient>
        <radialGradient id={id("glow")}>
          <stop offset="0" stopColor="#ffd27a" stopOpacity=".95" />
          <stop offset="1" stopColor="#ffb84d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("puff")}>
          <stop offset="0" stopColor="#d6e0ee" stopOpacity=".6" />
          <stop offset=".5" stopColor="#d6e0ee" stopOpacity=".22" />
          <stop offset="1" stopColor="#d6e0ee" stopOpacity="0" />
        </radialGradient>
        <filter id={id("bloom")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* One pine, reused with <use> at different positions and sizes. */}
        <g id={id("pine")}>
          <polygon points="0,-110 -22,-68 22,-68" fill="#1e4a5c" />
          <polygon points="0,-90 -30,-40 30,-40" fill="#1e4a5c" />
          <polygon points="0,-68 -38,-8 38,-8" fill="#1e4a5c" />
          <rect x="-3" y="-8" width="6" height="8" fill="#2b2320" />
          <polygon points="0,-110 -22,-68 -6,-72" fill="#cfe3ef" opacity=".75" />
          <polygon points="0,-90 -30,-40 -8,-46" fill="#cfe3ef" opacity=".75" />
          <polygon points="0,-68 -38,-8 -10,-16" fill="#cfe3ef" opacity=".75" />
        </g>
      </defs>

      <rect width={c.w} height={c.h} fill={url("sky")} />

      <g fill="#ffffff">
        {c.stars.map(([x, y, r, t, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={o} className={twinkleClass(t)} />
        ))}
      </g>

      <path d={c.hills[0]} fill={url("hb")} />
      {c.farPines.length > 0 && (
        <g opacity=".75">
          {c.farPines.map((t) => (
            <use key={t} href={`#${id("pine")}`} transform={t} />
          ))}
        </g>
      )}
      <path d={c.hills[1]} fill={url("hm")} />
      {c.pines.map((t) => (
        <use key={t} href={`#${id("pine")}`} transform={t} />
      ))}

      <Cabin transform={c.cabin} glow={url("glow")} lineWidth={c.lineWidth} />
      <Tree transform={c.tree} bloom={url("bloom")} />

      <path d={c.hills[2]} fill={url("hf")} />
      <ellipse {...c.pool} fill="#ffcf6b" opacity=".16" />

      {smoke && <Smoke x={c.smoke.x} y={c.smoke.y} large={c.smoke.large} gradientId={id("puff")} />}
    </svg>
  );
}

function Cabin({ transform, glow, lineWidth }: { transform: string; glow: string; lineWidth: number }) {
  const logs = [48, 56, 64, 72, 80, 88];
  return (
    <g transform={transform}>
      {/* chimney sits behind the roof; its cap is where the smoke starts */}
      <rect x="84" y="4" width="16" height="32" fill="#6b3a2a" />
      <rect x="81" y="0" width="22" height="6" rx="3" fill="#eef6fb" />
      <rect x="10" y="40" width="100" height="56" fill="#6a3523" />
      <g stroke="#4a2216" strokeWidth={lineWidth}>
        {logs.map((y) => (
          <line key={y} x1="10" y1={y} x2="110" y2={y} />
        ))}
      </g>
      <rect x="10" y="40" width="5" height="56" fill="#4f2618" />
      <rect x="105" y="40" width="5" height="56" fill="#4f2618" />
      <polygon points="60,14 14,44 106,44" fill="#6a3523" />
      <rect x="53" y="26" width="14" height="12" fill="#ffcf6b" />
      <path d="M60 26 V38 M53 32 H67" stroke="#6a3523" strokeWidth={lineWidth} />
      <path d="M2 52 L60 10 L118 52 L112 52 L60 16 L8 52 Z" fill="#3c1d12" />
      <path d="M-6 48 L60 -2 L126 48 L118 53 L60 10 L2 53 Z" fill="#f3f8fc" />
      <rect x="22" y="58" width="20" height="18" fill="#ffc65a" />
      <path d="M32 58 V76 M22 67 H42" stroke="#6a3523" strokeWidth={lineWidth} />
      <rect x="78" y="58" width="20" height="18" fill="#ffc65a" />
      <path d="M88 58 V76 M78 67 H98" stroke="#6a3523" strokeWidth={lineWidth} />
      <rect x="50" y="56" width="20" height="40" fill="#3e1c10" />
      <circle cx="66" cy="77" r="1.5" fill="#d9a84e" />
      <rect x="20" y="75" width="22" height="3" rx="1.5" fill="#f3f8fc" />
      <rect x="76" y="75" width="24" height="3" rx="1.5" fill="#f3f8fc" />
      <circle cx="32" cy="67" r="26" fill={glow} className={styles.flick} />
      <circle cx="88" cy="67" r="26" fill={glow} className={styles.flick} />
      <circle cx="60" cy="32" r="16" fill={glow} opacity=".5" />
    </g>
  );
}

function Tree({ transform, bloom }: { transform: string; bloom: string }) {
  return (
    <g transform={transform}>
      <polygon points="0,0 -20,40 20,40" fill="#1f4f3c" />
      <polygon points="0,22 -30,78 30,78" fill="#1f4f3c" />
      <polygon points="0,52 -40,124 40,124" fill="#1f4f3c" />
      <rect x="-5" y="124" width="10" height="14" fill="#4a2a1a" />
      <g fill="#e8f3fa" opacity=".85">
        <path d="M-20 40 Q0 32 20 40 L20 42 Q0 37 -20 42 Z" />
        <path d="M-30 78 Q0 68 30 78 L30 80 Q0 73 -30 80 Z" />
        <path d="M-40 124 Q0 112 40 124 L40 126 Q0 118 -40 126 Z" />
      </g>
      <g filter={bloom}>
        {LIGHTS.map(([x, y, r, color, group], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={color} className={blinkClass(group)} />
        ))}
      </g>
      <path
        d="M0 -10 L2.4 -4.2 L8.6 -3.8 L3.8 0.2 L5.4 6.2 L0 2.8 L-5.4 6.2 L-3.8 0.2 L-8.6 -3.8 L-2.4 -4.2 Z"
        fill="#ffd65a"
        filter={bloom}
      />
    </g>
  );
}

interface SceneProps {
  /** Page content, drawn above the scene. */
  children?: ReactNode;
  /** Chimney smoke on/off. */
  smoke?: boolean;
}

/** Full-screen night backdrop with your page content layered on top. */
export function Scene({ children, smoke = true }: SceneProps) {
  return (
    <>
      <div className={styles.scene} aria-hidden="true">
        <Landscape c={PHONE} smoke={smoke} />
        <Landscape c={DESKTOP} smoke={smoke} />
      </div>
      {children}
    </>
  );
}
