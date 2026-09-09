import { NextRequest, NextResponse } from "next/server";
import { OpenAffiliate, type Program } from "openaffiliate-sdk";

const oa = new OpenAffiliate();

function sortPrograms(programs: Program[], sort: string) {
  const copy = [...programs];
  if (sort === "newest") {
    copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } else if (sort === "commission") {
    copy.sort((a, b) => {
      const va = typeof a.commission?.rate === "number" ? a.commission.rate : parseFloat(String(a.commission?.rate)) || 0;
      const vb = typeof b.commission?.rate === "number" ? b.commission.rate : parseFloat(String(b.commission?.rate)) || 0;
      return vb - va;
    });
  }
  // "top" = registry's own relevance/verified ordering, no re-sort
  return copy;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const type = (searchParams.get("type") as "recurring" | "one-time" | "tiered" | null) ?? undefined;
  const verified = searchParams.get("verified") === "true" ? true : undefined;
  const sort = searchParams.get("sort") ?? "top";
  const limit = Number(searchParams.get("limit") ?? "10");

  try {
    const programs = await oa.search(query, { category, type, verified });
    const sorted = sortPrograms(programs, sort);
    return NextResponse.json({ programs: sorted.slice(0, limit) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Search failed" },
      { status: 502 }
    );
  }
}
