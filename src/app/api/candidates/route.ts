import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("oa_candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const row = {
    slug: body.slug,
    name: body.name,
    url: body.url ?? null,
    category: body.category ?? null,
    commission_type: body.commission?.type ?? null,
    commission_rate: body.commission?.rate != null ? String(body.commission.rate) : null,
    cookie_days: body.cookieDays ?? null,
    stars: body.stars ?? null,
    verified: body.verified ?? false,
    signup_url: body.signupUrl ?? body.url ?? null,
    short_description: body.shortDescription ?? null,
  };

  const { data, error } = await supabase
    .from("oa_candidates")
    .upsert(row, { onConflict: "slug" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidate: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("oa_candidates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
