import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============ Constants ============
const PNW_BASE_URL = process.env.PNW_BASE_URL;
const TEAM_PAGE_URL = `${PNW_BASE_URL}/asme/leadership-team/`;
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

const OFFICER_PATTERN =
  /<img[^>]*src="([^"]*)"[^>]*alt="[^"]*Profile"[\s\S]*?<span class="h5">([^<]+)<\/span>[\s\S]*?<span[^>]*class="[^"]*officers_position[^"]*"[^>]*>([^<]+)<\/span>/g;

// ============ Helpers ============
const decodeHtmlEntities = (str: string): string =>
  str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const toAbsoluteUrl = (path: string): string =>
  path.startsWith("http") ? path : `${PNW_BASE_URL}${path}`;

interface ScrapedPresident {
  name: string;
  position: string;
  image: string;
}

function parsePresidents(html: string): ScrapedPresident[] {
  const presidents: ScrapedPresident[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = OFFICER_PATTERN.exec(html)) !== null) {
    const [, imagePath, name, position] = match;
    const trimmedName = name.trim();
    const trimmedPosition = decodeHtmlEntities(position.trim());

    // Only capture positions containing "president"
    if (
      trimmedName &&
      !seen.has(trimmedName) &&
      trimmedPosition.toLowerCase().includes("president")
    ) {
      seen.add(trimmedName);
      presidents.push({
        name: trimmedName,
        position: trimmedPosition,
        image: toAbsoluteUrl(imagePath),
      });
    }
  }

  return presidents;
}

function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // Academic year starts in August (month 7)
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear} - ${startYear + 1}`;
}

// ============ Route Handler ============
// Call periodically (e.g., weekly via pg_cron) to detect president changes.
// Logic: We track who the current president is. When a NEW person becomes president,
// the PREVIOUS person gets saved as a former president.
export async function GET(request: Request) {
  // Verify cron secret for security
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Scrape current president from PNW website
    const response = await fetch(TEAM_PAGE_URL, {
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch team page: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const currentPresidents = parsePresidents(html);

    // Only care about the actual President (not Vice President)
    const currentPresident = currentPresidents.find(
      (p) =>
        p.position.toLowerCase().includes("president") &&
        !p.position.toLowerCase().includes("vice")
    );

    if (!currentPresident) {
      return NextResponse.json({
        message: "No president found on the team page",
        archived: 0,
      });
    }

    const supabase = createAdminClient();
    const academicYear = getAcademicYear();

    // 2. Get the most recent past president entry (the last known president)
    const { data: lastRecorded } = await supabase
      .from("past_presidents")
      .select("id, name, year")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // 3. If no records exist yet, store the current president as the baseline
    //    (they'll become a "former" president once someone new takes over)
    if (!lastRecorded) {
      const { error: insertError } = await supabase
        .from("past_presidents")
        .insert({
          name: currentPresident.name,
          photo_url: currentPresident.image,
          year: academicYear,
          status: "draft", // draft = still active, not yet "former"
        });

      if (insertError) {
        console.error("Failed to insert baseline president:", insertError);
        return NextResponse.json(
          { error: "Failed to save baseline president" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Baseline recorded: ${currentPresident.name} for ${academicYear} (will become "former" when replaced)`,
        archived: 0,
      });
    }

    // 4. Same person is still president — nothing to do
    if (lastRecorded.name === currentPresident.name) {
      return NextResponse.json({
        message: `${currentPresident.name} is still the current president`,
        archived: 0,
      });
    }

    // 5. DIFFERENT person is now president — the previous one is now a former president!
    //    Publish the old president's record (they are now officially "former")
    const { error: publishError } = await supabase
      .from("past_presidents")
      .update({ status: "published" })
      .eq("id", lastRecorded.id);

    if (publishError) {
      console.error("Failed to publish former president:", publishError);
    }

    //    Insert the new current president as draft (baseline for next transition)
    const { error: insertError } = await supabase
      .from("past_presidents")
      .insert({
        name: currentPresident.name,
        photo_url: currentPresident.image,
        year: academicYear,
        status: "draft", // still active, not yet "former"
      });

    if (insertError) {
      console.error("Failed to insert new president:", insertError);
      return NextResponse.json(
        { error: "Failed to save new president" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Leadership change detected! ${lastRecorded.name} (${lastRecorded.year}) is now a former president. New president: ${currentPresident.name} (${academicYear})`,
      archived: 1,
      formerPresident: lastRecorded.name,
      newPresident: currentPresident.name,
      year: academicYear,
    });
  } catch (error) {
    console.error("Archive error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
