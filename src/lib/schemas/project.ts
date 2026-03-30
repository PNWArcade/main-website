import { z } from 'zod'

// Enums
export const uploadStatusSchema = z.enum(['draft', 'published', 'archived'])
export type UploadStatus = z.infer<typeof uploadStatusSchema>

// Project Category
export const projectCategorySchema = z.object({
    id: z.uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type ProjectCategory = z.infer<typeof projectCategorySchema>

// Team
export const teamSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    order_index: z.number().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type Team = z.infer<typeof teamSchema>

// Article Category
export const articleCategorySchema = z.object({
    id: z.uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type ArticleCategory = z.infer<typeof articleCategorySchema>

export const createArticleCategorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().max(500).optional(),
})
export type CreateArticleCategory = z.infer<typeof createArticleCategorySchema>

// Project
export const projectSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    hero_image_url: z.string().nullable(),
    category_id: z.uuid().nullable(),
    status: uploadStatusSchema.nullable(),
    featured: z.boolean().nullable(),
    order_index: z.number().nullable(),
    created_by: z.uuid().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type Project = z.infer<typeof projectSchema>

// Project with relations
export const projectWithRelationsSchema = projectSchema.extend({
    category: projectCategorySchema.nullable().optional(),
})
export type ProjectWithRelations = z.infer<typeof projectWithRelationsSchema>

// Project Component (text/image blocks)
export const projectComponentSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    title: z.string().nullable(),
    description: z.string().nullable(), // Tiptap JSON content
    image_url: z.string().nullable(),
    image_title: z.string().nullable(),
    order_index: z.number(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type ProjectComponent = z.infer<typeof projectComponentSchema>

// Project Team Member
export const projectTeamMemberSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    team_id: z.string().uuid().nullable(),
    name: z.string(),
    title: z.string().nullable(),
    image_url: z.string().nullable(),
    date: z.string().nullable(),
    order_index: z.number().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type ProjectTeamMember = z.infer<typeof projectTeamMemberSchema>

// Project Team Member with team info
export const projectTeamMemberWithTeamSchema = projectTeamMemberSchema.extend({
    team: teamSchema.nullable().optional(),
})
export type ProjectTeamMemberWithTeam = z.infer<typeof projectTeamMemberWithTeamSchema>

// Sub-project
export const subProjectSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    image_url: z.string().nullable(),
    content: z.string().nullable(), // Tiptap JSON content
    author_name: z.string().nullable(),
    status: uploadStatusSchema.nullable(),
    published_at: z.string().nullable(),
    order_index: z.number().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type SubProject = z.infer<typeof subProjectSchema>

// Article (technical articles)
export const articleSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    image_url: z.string().nullable(),
    content: z.string().nullable(), // Tiptap JSON content
    category_id: z.string().uuid().nullable(),
    author_name: z.string().nullable(),
    time_to_read: z.number().nullable(),
    status: uploadStatusSchema.nullable(),
    published_at: z.string().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type Article = z.infer<typeof articleSchema>

// Project Sponsor
export const projectSponsorSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    name: z.string(),
    logo_url: z.string().nullable(),
    website_url: z.string().nullable(),
    description: z.string().nullable(),
    order_index: z.number().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type ProjectSponsor = z.infer<typeof projectSponsorSchema>

// ========================
// Create/Update schemas
// ========================

export const createProjectSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().max(2000).optional(),
    hero_image_url: z.string().url().optional().or(z.literal('')),
    category_id: z.string().uuid().optional().nullable(),
    status: uploadStatusSchema.optional(),
    featured: z.boolean().optional(),
    order_index: z.number().optional(),
})
export type CreateProject = z.infer<typeof createProjectSchema>

export const updateProjectSchema = createProjectSchema.partial()
export type UpdateProject = z.infer<typeof updateProjectSchema>

export const createProjectComponentSchema = z.object({
    project_id: z.string().uuid(),
    title: z.string().max(200).optional(),
    description: z.string().optional(), // Tiptap JSON
    image_url: z.string().url().optional().or(z.literal('')),
    image_title: z.string().max(200).optional(),
    order_index: z.number().default(0),
})
export type CreateProjectComponent = z.infer<typeof createProjectComponentSchema>

export const updateProjectComponentSchema = createProjectComponentSchema.partial().omit({ project_id: true })
export type UpdateProjectComponent = z.infer<typeof updateProjectComponentSchema>

export const createTeamSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().max(500).optional(),
    order_index: z.number().optional(),
})
export type CreateTeam = z.infer<typeof createTeamSchema>

export const createProjectTeamMemberSchema = z.object({
    project_id: z.string().uuid(),
    team_id: z.string().uuid().optional().nullable(),
    name: z.string().min(1, 'Name is required').max(100),
    title: z.string().max(100).optional(),
    image_url: z.string().url().optional().or(z.literal('')),
    date: z.string().max(50).optional(),
    order_index: z.number().optional(),
})
export type CreateProjectTeamMember = z.infer<typeof createProjectTeamMemberSchema>

export const updateProjectTeamMemberSchema = createProjectTeamMemberSchema.partial().omit({ project_id: true })
export type UpdateProjectTeamMember = z.infer<typeof updateProjectTeamMemberSchema>

export const createSubProjectSchema = z.object({
    project_id: z.string().uuid(),
    title: z.string().min(1, 'Title is required').max(200),
    slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().max(2000).optional(),
    image_url: z.string().url().optional().or(z.literal('')),
    content: z.string().optional(), // Tiptap JSON
    author_name: z.string().max(100).optional(),
    status: uploadStatusSchema.optional(),
    order_index: z.number().optional(),
})
export type CreateSubProject = z.infer<typeof createSubProjectSchema>

export const updateSubProjectSchema = createSubProjectSchema.partial().omit({ project_id: true })
export type UpdateSubProject = z.infer<typeof updateSubProjectSchema>

export const createArticleSchema = z.object({
    project_id: z.string().uuid(),
    title: z.string().min(1, 'Title is required').max(200),
    slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().max(2000).optional(),
    image_url: z.string().url().optional().or(z.literal('')),
    content: z.string().optional(), // Tiptap JSON
    category_id: z.string().uuid().optional().or(z.literal('')),
    author_name: z.string().max(100).optional(),
    time_to_read: z.number().optional(),
    status: uploadStatusSchema.optional(),
})
export type CreateArticle = z.infer<typeof createArticleSchema>

export const updateArticleSchema = createArticleSchema.partial().omit({ project_id: true })
export type UpdateArticle = z.infer<typeof updateArticleSchema>

// Project Sponsor (per-project sponsors)
export const createProjectSponsorSchema = z.object({
    project_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required').max(200),
    logo_url: z.string().url().optional().or(z.literal('')),
    website_url: z.string().url().optional().or(z.literal('')),
    description: z.string().max(500).optional(),
    order_index: z.number().optional(),
})
export type CreateProjectSponsor = z.infer<typeof createProjectSponsorSchema>

export const updateProjectSponsorSchema = createProjectSponsorSchema.partial().omit({ project_id: true })
export type UpdateProjectSponsor = z.infer<typeof updateProjectSponsorSchema>

// Global Sponsor (for main page)
export const sponsorTierSchema = z.enum(['platinum', 'gold', 'silver', 'bronze'])
export type SponsorTier = z.infer<typeof sponsorTierSchema>

export const sponsorSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    logo_url: z.string().nullable(),
    link: z.string().nullable(),
    tier: sponsorTierSchema,
    description: z.string().nullable(),
    order_index: z.number().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type Sponsor = z.infer<typeof sponsorSchema>

export const createSponsorSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    logo_url: z.string().url().optional().or(z.literal('')),
    link: z.string().url().optional().or(z.literal('')),
    tier: sponsorTierSchema,
    description: z.string().max(500).optional(),
    order_index: z.number().optional(),
})
export type CreateSponsor = z.infer<typeof createSponsorSchema>

export const updateSponsorSchema = createSponsorSchema.partial()
export type UpdateSponsor = z.infer<typeof updateSponsorSchema>
