import { NextResponse } from "next/server"
import { getPublishedPastPresidents } from "@/lib/public-past-presidents"

export const revalidate = 600

export async function GET() {
  try {
    const data = await getPublishedPastPresidents()
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
