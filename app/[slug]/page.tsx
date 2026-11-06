import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ParticipantClient } from "./client";

// This page depends on cookies and DB; block prerender.
export const instant = false;

export async function generateMetadata() {
  return {
    title: "GrizzHacks Secret Santa",
    robots: "noindex",
  };
}

export default async function ParticipantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Redirect uppercase to lowercase
  if (slug !== slug.toLowerCase()) {
    redirect(`/${slug.toLowerCase()}`);
  }

  const rows = await sql`
    SELECT id, name, slug, pin_hash IS NOT NULL AS has_pin
    FROM participants WHERE slug = ${slug}
  `;

  // Unknown name: send them home instead of showing a 404. This also means
  // a stranger can't tell a real name from a made-up one by the response.
  if (rows.length === 0) redirect("/");

  const participant = rows[0];
  const session = await getSession();
  const isAuthenticated = session?.participantId === participant.id;

  return (
    <ParticipantClient
      name={participant.name as string}
      slug={participant.slug as string}
      hasPin={participant.has_pin as boolean}
      isAuthenticated={isAuthenticated}
    />
  );
}
