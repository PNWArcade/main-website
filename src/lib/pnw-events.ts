const PNW_BASE_URL = process.env.PNW_BASE_URL
const EVENTS_API = `${PNW_BASE_URL}/mobile_ws/v17/mobile_events_list`
const DEFAULT_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

export interface PnwEvent {
  eventId: string
  eventName: string
  eventDates: string
  eventLocation: string
  eventPicture: string
  eventUrl: string
}

function parseEvent(raw: Record<string, unknown>): PnwEvent | null {
  if (raw.listingSeparator === "true") return null

  const fields = (raw.fields as string)?.split(",") || []
  const result: Record<string, unknown> = {}

  fields.forEach((field, index) => {
    if (field) result[field] = raw[`p${index}`]
  })

  if (!result.eventId) return null

  return {
    eventId: String(result.eventId),
    eventName: String(result.eventName || "").trim(),
    eventDates: String(result.eventDates || "")
      .replace(/<[^>]*>/g, " ")
      .trim(),
    eventLocation: String(result.eventLocation || "").replace(/<[^>]*>/g, ""),
    eventPicture: result.eventPicture ? `${PNW_BASE_URL}${result.eventPicture}` : "",
    eventUrl: result.eventUrl ? `${PNW_BASE_URL}${result.eventUrl}` : "",
  }
}

export async function fetchPnwEvents(limit = 10, search = "arcade"): Promise<PnwEvent[]> {
  if (!PNW_BASE_URL) return []

  const url = `${EVENTS_API}?range=0&limit=${limit}&search_word=${encodeURIComponent(search)}`
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Upstream error: ${response.status}`)
  }

  const rawData = await response.json()
  return (rawData as Record<string, unknown>[])
    .map(parseEvent)
    .filter((event): event is PnwEvent => event !== null)
}
