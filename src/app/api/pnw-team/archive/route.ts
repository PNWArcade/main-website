import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_PNW_HEADERS,
  findChapterPresident,
  getPnwTeamPageUrl,
  isChapterPresident,
  parseOfficerCards,
} from "@/lib/pnw-team";

function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear} - ${startYear + 1}`;
}

async function getPreferredPhotoUrl(
  supabase: ReturnType<typeof createAdminClient>,
  name: string,
  fallback: string | null
): Promise<string | null> {
  const { data, error } = await supabase
    .from("team_member_overrides")
    .select("custom_image_url")
    .eq("member_name", name)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch photo override for ${name}:`, error);
    return fallback;
  }

  return data?.custom_image_url || fallback;
}

// Call periodically (e.g. weekly) to detect president changes.
// Only the latest draft row is the current baseline. Published rows are former presidents.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(getPnwTeamPageUrl(), {
      headers: DEFAULT_PNW_HEADERS,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch team page: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const roster = parseOfficerCards(html);
    const currentPresident = findChapterPresident(roster);

    if (!currentPresident) {
      return NextResponse.json({
        message: "No president found on the team page",
        archived: 0,
      });
    }

    const supabase = createAdminClient();
    const academicYear = getAcademicYear();
    const currentPresidentPhoto = await getPreferredPhotoUrl(
      supabase,
      currentPresident.name,
      currentPresident.image
    );

    const { data: baseline } = await supabase
      .from("past_presidents")
      .select("id, name, photo_url, year, status")
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!baseline) {
      const { error: insertError } = await supabase.from("past_presidents").insert({
        name: currentPresident.name,
        photo_url: currentPresidentPhoto,
        year: academicYear,
        status: "draft",
      });

      if (insertError) {
        console.error("Failed to insert baseline president:", insertError);
        return NextResponse.json(
          { error: "Failed to save baseline president" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Baseline recorded: ${currentPresident.name} for ${academicYear}`,
        archived: 0,
      });
    }

    if (baseline.name === currentPresident.name) {
      const { error: updatePhotoError } = await supabase
        .from("past_presidents")
        .update({ photo_url: currentPresidentPhoto })
        .eq("id", baseline.id);

      if (updatePhotoError) {
        console.error("Failed to refresh current president photo:", updatePhotoError);
      }

      return NextResponse.json({
        message: `${currentPresident.name} is still the current president`,
        archived: 0,
      });
    }

    const baselineOnRoster = roster.find(
      (member) => member.name.toLowerCase() === baseline.name.toLowerCase()
    );

    // Draft was never actually president (e.g. Treasurer matched by a bad parser).
    if (baselineOnRoster && !isChapterPresident(baselineOnRoster.position)) {
      await supabase.from("past_presidents").delete().eq("id", baseline.id);

      const { error: insertError } = await supabase.from("past_presidents").insert({
        name: currentPresident.name,
        photo_url: currentPresidentPhoto,
        year: academicYear,
        status: "draft",
      });

      if (insertError) {
        console.error("Failed to replace bad baseline:", insertError);
        return NextResponse.json(
          { error: "Failed to replace invalid president baseline" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Removed invalid baseline ${baseline.name} (${baselineOnRoster.position}). Current president: ${currentPresident.name}`,
        archived: 0,
        removedInvalidBaseline: baseline.name,
        newPresident: currentPresident.name,
      });
    }

    const baselinePhoto = await getPreferredPhotoUrl(
      supabase,
      baseline.name,
      baseline.photo_url
    );

    const { error: publishError } = await supabase
      .from("past_presidents")
      .update({ status: "published", photo_url: baselinePhoto })
      .eq("id", baseline.id);

    if (publishError) {
      console.error("Failed to publish former president:", publishError);
    }

    const { error: insertError } = await supabase.from("past_presidents").insert({
      name: currentPresident.name,
      photo_url: currentPresidentPhoto,
      year: academicYear,
      status: "draft",
    });

    if (insertError) {
      console.error("Failed to insert new president:", insertError);
      return NextResponse.json(
        { error: "Failed to save new president" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Leadership change detected! ${baseline.name} (${baseline.year}) is now a former president. New president: ${currentPresident.name} (${academicYear})`,
      archived: 1,
      formerPresident: baseline.name,
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
