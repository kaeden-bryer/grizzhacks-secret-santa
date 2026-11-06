import { EB_Garamond, Pinyon_Script } from "next/font/google";

/*
 * next/font downloads these at build time and serves them from your own
 * domain. That means no request to Google from the visitor's browser,
 * and no layout jump when the font arrives (Next sizes the fallback font
 * to match). The `variable` option exposes each font as a CSS variable,
 * which santa.module.css reads.
 */
export const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

export const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});
