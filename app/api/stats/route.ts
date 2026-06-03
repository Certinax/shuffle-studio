import { NextResponse } from "next/server";

import { getShuffleStats } from "@/lib/stats/shuffles";
import { getPublicSession } from "@/lib/session";

export async function GET() {
  const session = await getPublicSession();
  const stats = await getShuffleStats(session?.user.id);

  return NextResponse.json(stats);
}
