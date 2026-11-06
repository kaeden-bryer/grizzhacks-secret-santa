import { notFound } from "next/navigation";
import { PreviewClient } from "./PreviewClient";

/**
 * Dev-only playground for the cozy-cabin design: /design-preview
 * It uses made-up names and never touches the database.
 * In production builds it 404s.
 */
export const metadata = { robots: { index: false, follow: false } };

export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PreviewClient />;
}
