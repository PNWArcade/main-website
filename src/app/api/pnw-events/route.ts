import { NextResponse } from "next/server"
import { fetchPnwEvents } from "@/lib/pnw-events"

export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || "arcade"

  try {
    const events = await fetchPnwEvents(limit, search)
    return NextResponse.json({ data: events })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 }
    )
  }
}
