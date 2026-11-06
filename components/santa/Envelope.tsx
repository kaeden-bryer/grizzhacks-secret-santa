"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./santa.module.css";
import { WaxSeal } from "./WaxSeal";
import { useSvgId } from "./useSvgId";

/*
 * Parchment envelope with a wax seal, built as four stacked layers so the
 * top flap can really open:
 *
 *   z0  back       inside of the envelope (darker, in shadow)
 *   z1  slot       optional children, e.g. a letter peeking out
 *   z2  pocket     the front, with a V-shaped notch at the top
 *   z3  flap       top triangle + seal; turns on rotateX around its top edge
 *
 * Once the flap is fully open it drops to z0, so anything rising out
 * of the slot passes in front of it, as with a real envelope.
 *
 * All layers share one 620×430 coordinate space, so the paper texture
 * and the edge darkening line up across layers like one sheet.
 */

const W = 620;
const H = 430;
const POCKET = "M0 0 L310 232 L620 0 V430 H0 Z";
const FLAP = "M0 0 L310 250 L620 0 Z";

interface EnvelopeProps {
  /** false = sealed. Set true to swing the flap open. */
  open: boolean;
  /** Fired when the sealed envelope is tapped/clicked. */
  onOpen: () => void;
  /** Fired once the flap has finished opening. */
  onFlapOpened?: () => void;
  /** Rendered inside the envelope, between back and pocket. */
  children?: ReactNode;
  /** Gentle idle bob while sealed (paused automatically for reduced motion). */
  bob?: boolean;
  label?: string;
}

export function Envelope({ open, onOpen, onFlapOpened, children, bob = true, label = "Open your envelope" }: EnvelopeProps) {
  const reduce = useReducedMotion();
  const { id, url } = useSvgId();
  const [flapBehind, setFlapBehind] = useState(false);

  useEffect(() => {
    if (!open) setFlapBehind(false);
  }, [open]);

  // Clipped to a shape: base colour, blotches, grain, edge darkening.
  const paper = (
    <>
      <rect width={W} height={H} fill="#ecdcb8" />
      <rect width={W} height={H} filter={url("blotch")} opacity=".55" />
      <rect width={W} height={H} filter={url("grain")} />
      <rect width={W} height={H} fill={url("vig")} />
    </>
  );

  return (
    <div className={`${styles.envelopeShadow} ${bob && !open ? styles.bob : ""}`}>
      <div className={styles.envelope}>
        {/* back + shared defs (SVG ids work across every <svg> on the page) */}
        <svg className={styles.layer} style={{ zIndex: 0 }} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={id("env")}>
              <rect width={W} height={H} rx="14" />
            </clipPath>
            <clipPath id={id("pocket")}>
              <path d={POCKET} />
            </clipPath>
            <clipPath id={id("flap")}>
              <path d={FLAP} />
            </clipPath>
            <filter id={id("blotch")} x="0" y="0" width="1" height="1">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={11} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.52  0 0 0 0 0.36  0 0 0 0 0.16  1.6 0 0 0 -0.62" />
            </filter>
            <filter id={id("grain")} x="0" y="0" width="1" height="1">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.24  0 0 0 0 0.12  0.45 0 0 0 -0.12" />
            </filter>
            <filter id={id("soft")} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <radialGradient id={id("vig")} gradientUnits="userSpaceOnUse" cx="310" cy="215" r="446">
              <stop offset=".55" stopColor="#8a5a24" stopOpacity="0" />
              <stop offset="1" stopColor="#8a5a24" stopOpacity=".38" />
            </radialGradient>
            <linearGradient id={id("inside")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bfa271" />
              <stop offset="1" stopColor="#dcc79c" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} rx="14" fill={url("inside")} />
        </svg>

        <div className={styles.slot}>{children}</div>

        {/* pocket (front) */}
        <svg className={styles.layer} style={{ zIndex: 2 }} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          <g clipPath={url("env")}>
            <g clipPath={url("pocket")}>
              {paper}
              {/* bottom-flap folds */}
              <path d="M0 430 L262 236 M620 430 L358 236" fill="none" stroke="#9a7040" strokeOpacity=".35" strokeWidth="3" />
              <path d="M3 434 L265 240 M617 434 L355 240" fill="none" stroke="#fff6e0" strokeOpacity=".5" strokeWidth="2" />
            </g>
            <rect x="1" y="1" width={W - 2} height={H - 2} rx="13" fill="none" stroke="#7a5020" strokeOpacity=".22" strokeWidth="2" />
          </g>
          <path d="M0 0 L310 232 L620 0" fill="none" stroke="#9a7040" strokeOpacity=".3" strokeWidth="2" />
        </svg>

        {/* flap */}
        <motion.div
          className={styles.flap}
          style={{ zIndex: flapBehind ? 0 : 3 }}
          initial={false}
          animate={{ rotateX: open ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={() => {
            if (open) {
              setFlapBehind(true);
              onFlapOpened?.();
            }
          }}
        >
          <div className={styles.face}>
            <svg className={styles.layer} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
              <path d="M0 0 L310 250 L620 0" fill="none" stroke="#5a3814" strokeOpacity=".22" strokeWidth="10" filter={url("soft")} transform="translate(0 5)" />
              <g clipPath={url("env")}>
                <g clipPath={url("flap")}>{paper}</g>
              </g>
              <path d="M0 0 L310 250 L620 0" fill="none" stroke="#9a7040" strokeOpacity=".45" strokeWidth="3" />
              <path d="M0 -4 L310 246 L620 -4" fill="none" stroke="#fff6e0" strokeOpacity=".55" strokeWidth="2" />
            </svg>
            <WaxSeal className={styles.sealOnFlap} shadow />
          </div>
          {/* Inside of the flap, seen once it has swung up. rotateY (not X)
              flips which way it faces while keeping it in place; the
              triangle is symmetric, so the mirror doesn't show. */}
          <div className={`${styles.face} ${styles.faceBack}`}>
            <svg className={styles.layer} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
              <g clipPath={url("env")}>
                <g clipPath={url("flap")}>
                  <rect width={W} height={H} fill="#e2cfa6" />
                  <rect width={W} height={H} filter={url("grain")} />
                </g>
              </g>
            </svg>
          </div>
        </motion.div>

        {/* A <button> laid over the art, not wrapping it: a button can't
            legally contain headings, and the slot may hold a letter. */}
        {!open && <button type="button" className={styles.openButton} aria-label={label} onClick={onOpen} />}
      </div>
    </div>
  );
}
