import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============ Constants ============
const PNW_BASE_URL = process.env.PNW_BASE_URL;
const EVENTS_API = `${PNW_BASE_URL}/mobile_ws/v17/mobile_events_list`;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface ParsedEvent {
  eventId: string;
  eventName: string;
  eventDates: string;
  eventLocation: string;
  eventPicture: string;
  eventUrl: string;
}

// ============ Helpers ============
function parseEvent(raw: Record<string, unknown>): ParsedEvent | null {
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
    eventDates: String(result.eventDates || "").replace(/<[^>]*>/g, " ").trim(),
    eventLocation: String(result.eventLocation || "").replace(/<[^>]*>/g, ""),
    eventPicture: result.eventPicture
      ? `${PNW_BASE_URL}${result.eventPicture}`
      : "",
    eventUrl: result.eventUrl ? `${PNW_BASE_URL}${result.eventUrl}` : "",
  };
}

async function sendDiscordNotification(event: ParsedEvent): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    console.error("DISCORD_WEBHOOK_URL is not configured");
    return false;
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: " @everyone Hey Engineers! There is a  **New ASME Event!**",
        embeds: [
          {
            title: event.eventName,
            url: event.eventUrl,
            color: 0xCFB991, // Purdue Gold
            fields: [
              {
                name: "📅 Date & Time",
                value: event.eventDates || "TBD",
                inline: true,
              },
              {
                name: "📍 Location",
                value: event.eventLocation || "TBD",
                inline: true,
              },
            ],
            image: event.eventPicture ? { url: event.eventPicture } : undefined,
            footer: {
              text: "ASME PNW Events",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Discord webhook error:", error);
    return false;
  }
}

// ============ Route Handler ============
// Call this endpoint periodically (e.g., via Vercel Cron) to check for new events
export async function GET(request: Request) {
  // Optional: Add a secret key for security
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  // You can set this in your environment variables
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch current events from PNW
    const eventsResponse = await fetch(
      `${EVENTS_API}?range=0&limit=20&search_word=asme`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!eventsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch events from PNW" },
        { status: 502 }
      );
    }

    const rawEvents = await eventsResponse.json();
    const events = (rawEvents as Record<string, unknown>[])
      .map(parseEvent)
      .filter((e): e is ParsedEvent => e !== null);

    if (events.length === 0) {
      return NextResponse.json({ message: "No events found", notified: 0 });
    }

    // 2. Check which events we've already notified about
    const supabase = createAdminClient();
    const eventIds = events.map((e) => e.eventId);

    const { data: existingNotifications } = await supabase
      .from("pnw_event_notifications")
      .select("event_id")
      .in("event_id", eventIds);

    const notifiedIds = new Set(
      existingNotifications?.map((n) => n.event_id) || []
    );

    // 3. Find new events
    const newEvents = events.filter((e) => !notifiedIds.has(e.eventId));

    if (newEvents.length === 0) {
      return NextResponse.json({
        message: "No new events to notify",
        notified: 0,
      });
    }

    // 4. Send Discord notifications for new events
    const results = [];
    for (const event of newEvents) {
      const success = await sendDiscordNotification(event);

      if (success) {
        // Mark as notified in database
        await supabase.from("pnw_event_notifications").insert({
          event_id: event.eventId,
          event_name: event.eventName,
          notified_at: new Date().toISOString(),
        });

        results.push({ eventId: event.eventId, success: true });
      } else {
        results.push({ eventId: event.eventId, success: false });
      }

      // Small delay between notifications to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      message: `Notified about ${results.filter((r) => r.success).length} new events`,
      notified: results.filter((r) => r.success).length,
      results,
    });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
