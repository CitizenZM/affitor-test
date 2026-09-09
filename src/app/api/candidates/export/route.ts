import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const COLUMNS = [
  "slug",
  "name",
  "url",
  "category",
  "commission_type",
  "commission_rate",
  "cookie_days",
  "stars",
  "verified",
  "signup_url",
  "short_description",
  "status",
  "created_at",
] as const;

export async function GET() {
  const { data, error } = await supabase
    .from("oa_candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const header = COLUMNS.join(",");
  const lines = rows.map((r) =>
    COLUMNS.map((c) => csvEscape((r as Record<string, unknown>)[c])).join(",")
  );
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="oa-candidates-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
