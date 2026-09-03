---
name: arcade-website
description: Arcade PNW main website conventions — team roster (PNW scrape, overrides, manual members, former presidents), admin dashboard, and Supabase patterns. Use when working on /team, dashboard team pages, pnw-team APIs, past presidents, or chapter officer roles.
---

# Arcade PNW website

Next.js App Router site. Public chapter roster is **not** a simple DB table.

## Team roster (three sources)

The public `/team` page reads `/api/pnw-team`, which **merges**:

1. **PNW scrape** — `PNW_BASE_URL/arcade/leadership-team/`
2. **Overrides** — `team_member_overrides` (image / LinkedIn / email for scraped names **and former presidents**)
3. **Manual members** — rows in `teams` whose slug starts with `member-` (added in admin)

Former presidents come from `/api/past-presidents` (`past_presidents` where `status = published`). That API applies `team_member_overrides.custom_image_url` over the stored `photo_url`.

### Admin surfaces

| Page | Route | Purpose |
|------|--------|---------|
| Team | `/dashboard/teams` | Add/edit/remove people, assign chapter roles, and remove mistaken former presidents |
| Team Overrides | `/dashboard/team-overrides` | Extra contact/photo for scraped members **and former presidents** |
| Members | `/dashboard/members` | Dashboard login roles (`admin` / `officer`) — not the public roster |

Do not confuse dashboard `user_role` with public team positions (President, Treasurer, …).

### Manual member storage

`teams` is reused (empty project-category table). Each manual person is:

- `name` — display name
- `slug` — `member-{slugified-name}`
- `description` — JSON: `{ _type: "chapter_member", position, category, image_url, linkedin_url, email }`
- `order_index` — sort within a section

Categories: `leadership` | `officers` | `mentors` | `advisors`.

Shared helpers: `src/lib/pnw-team.ts`, `src/lib/chapter-team.ts`.

## President archive — do not regress

`/api/pnw-team/archive` promotes the previous **draft** baseline to a published former president when the **chapter President** changes.

Known bug (fixed, same as ASME): a loose cross-card regex could pair a Treasurer with "President". Cron then published them as former president.

Rules:

- Parse **one officer card at a time** (`type-team` chunks). Never let `[\s\S]*?` span cards.
- Chapter president means position is exactly `president` or `chapter president` (case-insensitive). Not Vice-President.
- Only the latest `status = draft` row is the current baseline. Never treat a published former president as the baseline.
- If a draft baseline still appears on the roster with a **non-president** role, delete the draft. Do not publish them as former president.
- Former president photos are overridable via Team Overrides. Saving an override also writes `past_presidents.photo_url`.

## Stack notes

- App routes: `src/app/(main)/` public, `src/app/(dasboard)/dashboard/` admin (folder name is misspelled — do not rename casually).
- Supabase types: `src/types/database.ts`. Schema snapshot: `supabase/schema.sql`.
- Dashboard APIs authenticate via `createClient()` + `profiles` row. Public scrape merge may use `createAdminClient()`.
- Images upload to the `images` bucket through `/api/upload`.
- Reusable UI/UX skills live in `.agents/skills/` (copied from `Desktop/reusable-uiux-skills`). Graphify is `.agents/skills/graphify`; code graph output is `graphify-out/`.
