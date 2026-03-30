import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Cache for 10 minutes — past presidents change very rarely
export const revalidate = 600;

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("past_presidents")
      .select("id, name, photo_url, year")
      .eq("status", "published")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("year", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch past presidents" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
