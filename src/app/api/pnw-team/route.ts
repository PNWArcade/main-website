import { NextResponse } from "next/server"
import { getPublicTeam } from "@/lib/public-team"

export const revalidate = 600

export async function GET() {
  try {
    const { count, data } = await getPublicTeam()
    return NextResponse.json({
      source: "html_parsed",
      count,
      data,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch" },
      { status: 500 }
    )
  }
}
