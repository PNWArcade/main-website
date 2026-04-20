import { NextResponse } from "next/server";

// Constants
const PNW_BASE_URL = process.env.PNW_BASE_URL;
const EVENTS_API = `${PNW_BASE_URL}/mobile_ws/v17/mobile_events_list`;
const DEFAULT_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

// Cache for 5 minutes (300 seconds)
export const revalidate = 300;

export interface PnwEvent {
  eventId: string;
  eventName: string;
  eventDates: string;
  eventLocation: string;
  eventPicture: string;
  eventUrl: string;
}

function parseEvent(raw: Record<string, unknown>): PnwEvent | null {
  if (raw.listingSeparator === "true") return null;

  const fields = (raw.fields as string)?.split(",") || [];
  const result: Record<string, unknown> = {};

  fields.forEach((field, index) => {
    if (field) result[field] = raw[`p${index}`];
  });

  if (!result.eventId) return null;

  return {
    eventId: String(result.eventId),
    eventName: String(result.eventName || "").trim(),
    eventDates: String(result.eventDates || "")
      .replace(/<[^>]*>/g, " ")
      .trim(),
    eventLocation: String(result.eventLocation || "").replace(/<[^>]*>/g, ""),
    eventPicture: result.eventPicture
      ? `${PNW_BASE_URL}${result.eventPicture}`
      : "",
    eventUrl: result.eventUrl ? `${PNW_BASE_URL}${result.eventUrl}` : "",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "arcade";

  const url = `${EVENTS_API}?range=0&limit=${limit}&search_word=${encodeURIComponent(search)}`;

  try {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    const rawData = await response.json();
    const events = (rawData as Record<string, unknown>[])
      .map(parseEvent)
      .filter((e): e is PnwEvent => e !== null);

    return NextResponse.json({ data: events });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 }
    );
  }
}
