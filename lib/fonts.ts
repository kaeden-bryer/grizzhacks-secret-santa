import { Great_Vibes } from "next/font/google";

// Formal script font for the recipient's name on the revealed card.
// next/font downloads it at build time and serves it from our own domain,
// so viewers' browsers never make a request to Google.
export const scriptFont = Great_Vibes({
  weight: "400", // the only weight this font comes in
  subsets: ["latin"],
});
