import { NextResponse } from "next/server";
import { getKickLiveStatusBySlug } from "@/lib/live/kick";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Missing Kick channel slug" }, { status: 400 });
  }

  try {
    const status = await getKickLiveStatusBySlug(slug);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Kick live status error:", error);
    return NextResponse.json(
      { error: "Unable to fetch Kick live status" },
      { status: 502 }
    );
  }
}
