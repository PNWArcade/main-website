# Graph Report - src  (2026-09-02)

## Corpus Check
- 121 files · ~52,624 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 653 nodes · 1316 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 115 edges
2. `cn()` - 52 edges
3. `Button()` - 28 edges
4. `useToast()` - 11 edges
5. `createAdminClient()` - 11 edges
6. `ContactStatus` - 9 edges
7. `MembersPage()` - 8 edges
8. `TeamOverridesPage()` - 8 edges
9. `GET()` - 8 edges
10. `Input()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `RoleBadge()` --calls--> `cn()`  [EXTRACTED]
  app/(dasboard)/dashboard/members/page.tsx → lib/utils.ts
- `StatusBadge()` --calls--> `cn()`  [EXTRACTED]
  app/(dasboard)/dashboard/members/page.tsx → lib/utils.ts
- `StatCard()` --calls--> `cn()`  [EXTRACTED]
  app/(dasboard)/dashboard/page.tsx → lib/utils.ts
- `StatusBadge()` --calls--> `cn()`  [EXTRACTED]
  app/(dasboard)/dashboard/page.tsx → lib/utils.ts
- `ArticlePage()` --calls--> `createClient()`  [EXTRACTED]
  app/(main)/projects/[id]/articles/[slug]/page.tsx → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (44 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (45): POST(), verifyCaptcha(), DELETE(), GET(), PATCH(), RouteParams, GET(), InquiriesPage() (+37 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (13): ArticlesTab(), articleCategoryKeys, createArticleCategory(), fetchArticleCategories(), projectKeys, sponsorKeys, teamKeys, useArticleCategories() (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (26): apiFetch(), createManualMember(), createOverride(), deleteOverride(), EMPTY_FORM, fetchFormerPresidents(), fetchOverrides(), fetchScrapedMembers() (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (27): GET(), POST(), DELETE(), createInviteSchema, GET(), POST(), GET(), DELETE() (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (32): DELETE(), emptyToNull(), PATCH(), requireDashboardUser(), emptyToNull(), GET(), POST(), requireDashboardUser() (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (36): ComponentEditor(), OverviewTab(), ProjectEditorPage(), SettingsTab(), SponsorsTab(), statusOptions, SubProjectsTab(), Tab (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (34): ArticleCategory, articleCategorySchema, articleSchema, CreateArticle, CreateArticleCategory, CreateProject, CreateProjectComponent, CreateProjectSponsor (+26 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (24): DELETE(), PATCH(), updateMemberSchema, GET(), ParsedEvent, parseEvent(), sendDiscordNotification(), GET() (+16 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (14): geistMono, geistSans, metadata, logout(), Footer(), DashboardSidebar(), navigation, NavbarWrapper() (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (19): ContactForm(), FormError(), FormErrorProps, FormField(), FormFieldProps, FormSuccess(), FormSuccessProps, SubmitButton() (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (9): ProjectArticlesPage(), ArticlePage(), ProjectDetail(), SubProjectsPage(), ProjectTeamPage(), Button(), buttonVariants, SubProjectCard() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (15): SponsorsPage(), tierOptions, createSponsor(), deleteSponsor(), fetchSponsors(), useCreateSponsor(), useDeleteSponsor(), useSponsors() (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (10): InviteData, Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle() (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (11): InviteContent(), LoginPage(), CATEGORY_LABELS, DashboardTeamPage(), EMPTY_FORM, PastPresidentRow, ROLE_PRESETS, Input() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (10): TeamPage(), CategorizedTeam, fetchPastPresidents(), fetchTeam(), PastPresident, PastPresidentsResponse, TeamMember, TeamResponse (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (11): deleteInvite(), deleteMember(), fetchInvites(), fetchMembers(), Invite, Member, MembersPage(), RoleBadge() (+3 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (11): DELETE(), PATCH(), RouteParams, uuidSchema, GET(), POST(), PUT(), RouteParams (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.23
Nodes (10): ProjectsPage(), DetailedProjectCard(), DetailedProjectCardProps, detailedProjectCardVariants, ProjectCard(), ProjectCardProps, projectCardVariants, fetchFeaturedProjects() (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (10): DELETE(), PATCH(), RouteParams, uuidSchema, GET(), POST(), RouteParams, uuidSchema (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.20
Nodes (8): TiptapEditor(), TiptapEditorProps, FormerPresidentCard(), FormerPresidentCardProps, formerPresidentCardVariants, InfoCard(), InfoCardProps, infoCardVariants

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (5): EventsPage(), HomeEvents(), EventsResponse, PnwEvent, useEvents()

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (5): ScrollButton, ScrollButtonProps, scrollButtonVariants, TypingText, TypingTextProps

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (7): Alert(), AlertDescription(), AlertTitle(), alertVariants, toastIcons, ToastProps, toastStyles

### Community 24 - "Community 24"
Cohesion: 0.32
Nodes (7): ProjectsPage(), statusConfig, createProject(), deleteProject(), useCreateProject(), useDeleteProject(), UploadStatus

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (6): DELETE(), GET(), PATCH(), RouteParams, uuidSchema, updateProjectSchema

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (6): DELETE(), GET(), PATCH(), RouteParams, uuidSchema, updateSubProjectSchema

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (5): GET(), POST(), RouteParams, uuidSchema, createProjectSponsorSchema

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): DELETE(), PATCH(), RouteParams, uuidSchema, updateProjectSponsorSchema

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (5): GET(), POST(), RouteParams, uuidSchema, createSubProjectSchema

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (5): DELETE(), PATCH(), RouteParams, uuidSchema, updateSponsorSchema

### Community 31 - "Community 31"
Cohesion: 0.40
Nodes (4): GET(), POST(), createProjectSchema, projectSchema

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (4): DEFAULT_HEADERS, GET(), parseEvent(), PnwEvent

### Community 34 - "Community 34"
Cohesion: 0.50
Nodes (4): SocialLinks, TeamCard(), TeamCardProps, teamCardVariants

### Community 35 - "Community 35"
Cohesion: 0.60
Nodes (3): updateSession(), config, proxy()

### Community 36 - "Community 36"
Cohesion: 0.50
Nodes (3): GET(), POST(), createTeamSchema

## Knowledge Gaps
- **137 isolated node(s):** `InviteData`, `UserRole`, `Member`, `Invite`, `StatCardProps` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 3` to `Community 0`, `Community 4`, `Community 7`, `Community 8`, `Community 10`, `Community 12`, `Community 16`, `Community 18`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 31`, `Community 33`, `Community 36`, `Community 37`, `Community 38`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 12` to `Community 0`, `Community 34`, `Community 2`, `Community 5`, `Community 8`, `Community 9`, `Community 10`, `Community 15`, `Community 17`, `Community 19`, `Community 22`, `Community 23`, `Community 24`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 10` to `Community 0`, `Community 2`, `Community 5`, `Community 8`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 21`, `Community 22`, `Community 23`, `Community 24`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **What connects `InviteData`, `UserRole`, `Member` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05649717514124294 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.052854122621564484 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06585365853658537 - nodes in this community are weakly interconnected._