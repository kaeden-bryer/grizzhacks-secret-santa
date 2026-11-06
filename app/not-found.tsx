import { redirect } from "next/navigation";

// Catch-all for any URL that matches no route (e.g. /a/b/c). The single-segment
// case (/nobody) is handled in app/[slug]/page.tsx, which has to look the name
// up in the database first.
export default function NotFound() {
  redirect("/");
}
