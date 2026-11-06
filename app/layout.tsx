import type { Metadata } from "next";
import { garamond, pinyon } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrizzHacks Secret Santa",
  description: "Find out who you're buying for!",
  robots: "noindex",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${pinyon.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
