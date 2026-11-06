"use client";

import { useId } from "react";

/**
 * A page-unique prefix for SVG ids.
 *
 * SVG ids (gradients, filters, clip paths) are global to the whole page.
 * If the envelope seal and the letter seal both defined id="wax", the
 * second would silently use the first one's gradient. React's useId()
 * gives each component instance its own stable id that matches between
 * server and client. We strip its punctuation (":r1:" or "«r1»")
 * because those characters are awkward inside url(#...).
 */
export function useSvgId() {
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return {
    id: (name: string) => `${prefix}-${name}`,
    url: (name: string) => `url(#${prefix}-${name})`,
  };
}
