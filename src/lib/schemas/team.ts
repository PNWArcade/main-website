import { z } from 'zod'

export const teamCategorySchema = z.enum(['leadership', 'officers', 'mentors', 'advisors'])

const optionalUrl = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.string().url().nullable().optional()
)

const optionalEmail = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.string().email().nullable().optional()
)

export const chapterTeamMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  position: z.string().trim().min(1, 'Role is required').max(100),
  category: teamCategorySchema,
  image_url: optionalUrl,
  linkedin_url: optionalUrl,
  email: optionalEmail,
  order_index: z.number().int().nullable().optional(),
})

export const updateChapterTeamMemberSchema = chapterTeamMemberSchema.partial()

export type ChapterTeamMemberInput = z.infer<typeof chapterTeamMemberSchema>
