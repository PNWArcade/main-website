"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { 
    Project, 
    ProjectWithRelations, 
    CreateProject, 
    UpdateProject,
    ProjectComponent,
    CreateProjectComponent,
    UpdateProjectComponent,
    Team,
    CreateTeam,
    ProjectTeamMemberWithTeam,
    CreateProjectTeamMember,
    UpdateProjectTeamMember,
    SubProject,
    CreateSubProject,
    UpdateSubProject,
    Article,
    CreateArticle,
    UpdateArticle,
    ArticleCategory,
    CreateArticleCategory,
    ProjectSponsor,
    CreateProjectSponsor,
    UpdateProjectSponsor,
    Sponsor,
    CreateSponsor,
    UpdateSponsor,
    UploadStatus,
} from '@/lib/schemas/project'

// ========================
// API Functions
// ========================

async function fetchProjects(status?: UploadStatus | 'all'): Promise<ProjectWithRelations[]> {
    // Use public API for published projects (public page), dashboard API for others
    const url = status === 'published' 
        ? '/api/projects'
        : status && status !== 'all' 
            ? `/api/dashboard/projects?status=${status}`
            : '/api/dashboard/projects'
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch projects')
    const { data } = await response.json()
    return data
}

async function fetchFeaturedProjects(): Promise<ProjectWithRelations[]> {
    const response = await fetch('/api/projects?featured=true')
    if (!response.ok) throw new Error('Failed to fetch featured projects')
    const { data } = await response.json()
    return data
}

async function fetchProject(id: string): Promise<ProjectWithRelations & { components: ProjectComponent[] }> {
    const response = await fetch(`/api/dashboard/projects/${id}`)
    if (!response.ok) throw new Error('Failed to fetch project')
    const { data } = await response.json()
    return data
}

async function createProject(data: CreateProject): Promise<Project> {
    const response = await fetch('/api/dashboard/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
    }
    const { data: project } = await response.json()
    return project
}

async function updateProject(id: string, data: UpdateProject): Promise<Project> {
    const response = await fetch(`/api/dashboard/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update project')
    }
    const { data: project } = await response.json()
    return project
}

async function deleteProject(id: string): Promise<void> {
    const response = await fetch(`/api/dashboard/projects/${id}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete project')
    }
}

// Components
async function fetchProjectComponents(projectId: string): Promise<ProjectComponent[]> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/components`)
    if (!response.ok) throw new Error('Failed to fetch components')
    const { data } = await response.json()
    return data
}

async function createProjectComponent(projectId: string, data: Omit<CreateProjectComponent, 'project_id'>): Promise<ProjectComponent> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create component')
    }
    const { data: component } = await response.json()
    return component
}

async function updateProjectComponent(projectId: string, componentId: string, data: UpdateProjectComponent): Promise<ProjectComponent> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/components/${componentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update component')
    }
    const { data: component } = await response.json()
    return component
}

async function deleteProjectComponent(projectId: string, componentId: string): Promise<void> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/components/${componentId}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete component')
    }
}

async function reorderProjectComponents(projectId: string, order: { id: string; order_index: number }[]): Promise<void> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/components`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    })
    if (!response.ok) throw new Error('Failed to reorder components')
}

// Teams
async function fetchTeams(): Promise<Team[]> {
    const response = await fetch('/api/dashboard/teams')
    if (!response.ok) throw new Error('Failed to fetch teams')
    const { data } = await response.json()
    return data
}

async function createTeam(data: CreateTeam): Promise<Team> {
    const response = await fetch('/api/dashboard/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create team')
    }
    const { data: team } = await response.json()
    return team
}

// Article Categories
async function fetchArticleCategories(): Promise<ArticleCategory[]> {
    const response = await fetch('/api/dashboard/article-categories')
    if (!response.ok) throw new Error('Failed to fetch article categories')
    const { data } = await response.json()
    return data
}

async function createArticleCategory(data: CreateArticleCategory): Promise<ArticleCategory> {
    const response = await fetch('/api/dashboard/article-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create article category')
    const { data: category } = await response.json()
    return category
}

// Project Team Members
async function fetchProjectTeamMembers(projectId: string): Promise<ProjectTeamMemberWithTeam[]> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/team`)
    if (!response.ok) throw new Error('Failed to fetch team members')
    const { data } = await response.json()
    return data
}

async function createProjectTeamMember(projectId: string, data: Omit<CreateProjectTeamMember, 'project_id'>): Promise<ProjectTeamMemberWithTeam> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create team member')
    }
    const { data: member } = await response.json()
    return member
}

async function updateProjectTeamMember(projectId: string, memberId: string, data: UpdateProjectTeamMember): Promise<ProjectTeamMemberWithTeam> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update team member')
    }
    const { data: member } = await response.json()
    return member
}

async function deleteProjectTeamMember(projectId: string, memberId: string): Promise<void> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/team/${memberId}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete team member')
    }
}

// Sub-projects
async function fetchSubProjects(projectId: string): Promise<SubProject[]> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sub-projects`)
    if (!response.ok) throw new Error('Failed to fetch sub-projects')
    const { data } = await response.json()
    return data
}

async function fetchSubProject(projectId: string, subProjectId: string): Promise<SubProject> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sub-projects/${subProjectId}`)
    if (!response.ok) throw new Error('Failed to fetch sub-project')
    const { data } = await response.json()
    return data
}

async function createSubProject(projectId: string, data: Omit<CreateSubProject, 'project_id'>): Promise<SubProject> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sub-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create sub-project')
    }
    const { data: subProject } = await response.json()
    return subProject
}

async function updateSubProject(projectId: string, subProjectId: string, data: UpdateSubProject): Promise<SubProject> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sub-projects/${subProjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sub-project')
    }
    const { data: subProject } = await response.json()
    return subProject
}

async function deleteSubProject(projectId: string, subProjectId: string): Promise<void> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sub-projects/${subProjectId}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete sub-project')
    }
}

// Articles API
async function fetchProjectArticles(projectId: string): Promise<Article[]> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/articles`)
    if (!response.ok) throw new Error('Failed to fetch articles')
    const { data } = await response.json()
    return data
}

async function fetchProjectArticle(projectId: string, articleId: string): Promise<Article> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/articles/${articleId}`)
    if (!response.ok) throw new Error('Failed to fetch article')
    const { data } = await response.json()
    return data
}

async function createProjectArticle(projectId: string, data: Omit<CreateArticle, 'project_id'>): Promise<Article> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create article')
    }
    const { data: result } = await response.json()
    return result
}

async function updateProjectArticle(projectId: string, articleId: string, data: UpdateArticle): Promise<Article> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update article')
    }
    const { data: result } = await response.json()
    return result
}

async function deleteProjectArticle(projectId: string, articleId: string): Promise<void> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/articles/${articleId}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete article')
    }
}

// ========================
// Query Keys
// ========================

export const projectKeys = {
    all: ['projects'] as const,
    list: (status?: UploadStatus | 'all') => [...projectKeys.all, 'list', status] as const,
    featured: () => [...projectKeys.all, 'featured'] as const,
    detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
    components: (projectId: string) => [...projectKeys.all, 'components', projectId] as const,
    team: (projectId: string) => [...projectKeys.all, 'team', projectId] as const,
    subProjects: (projectId: string) => [...projectKeys.all, 'sub-projects', projectId] as const,
    subProject: (projectId: string, subProjectId: string) => [...projectKeys.all, 'sub-project', projectId, subProjectId] as const,
    articles: (projectId: string) => [...projectKeys.all, 'articles', projectId] as const,
    article: (projectId: string, articleId: string) => [...projectKeys.all, 'article', projectId, articleId] as const,
    sponsors: (projectId: string) => [...projectKeys.all, 'sponsors', projectId] as const,
}

export const teamKeys = {
    all: ['teams'] as const,
    list: () => [...teamKeys.all, 'list'] as const,
}

export const articleCategoryKeys = {
    all: ['articleCategories'] as const,
    list: () => [...articleCategoryKeys.all, 'list'] as const,
}

// ========================
// Hooks
// ========================

export function useProjects(status?: UploadStatus | 'all') {
    return useQuery({
        queryKey: projectKeys.list(status),
        queryFn: () => fetchProjects(status),
    })
}

export function useFeaturedProjects() {
    return useQuery({
        queryKey: projectKeys.featured(),
        queryFn: fetchFeaturedProjects,
    })
}

export function useProject(id: string) {
    return useQuery({
        queryKey: projectKeys.detail(id),
        queryFn: () => fetchProject(id),
        enabled: !!id,
    })
}

export function useCreateProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all })
        },
    })
}

export function useUpdateProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProject }) => updateProject(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: projectKeys.list() })
        },
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all })
        },
    })
}

// Components
export function useProjectComponents(projectId: string) {
    return useQuery({
        queryKey: projectKeys.components(projectId),
        queryFn: () => fetchProjectComponents(projectId),
        enabled: !!projectId,
    })
}

export function useCreateProjectComponent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: Omit<CreateProjectComponent, 'project_id'> }) =>
            createProjectComponent(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.components(projectId) })
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
        },
    })
}

export function useUpdateProjectComponent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, componentId, data }: { projectId: string; componentId: string; data: UpdateProjectComponent }) =>
            updateProjectComponent(projectId, componentId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.components(projectId) })
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
        },
    })
}

export function useDeleteProjectComponent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, componentId }: { projectId: string; componentId: string }) =>
            deleteProjectComponent(projectId, componentId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.components(projectId) })
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
        },
    })
}

export function useReorderProjectComponents() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, order }: { projectId: string; order: { id: string; order_index: number }[] }) =>
            reorderProjectComponents(projectId, order),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.components(projectId) })
        },
    })
}

// Teams
export function useTeams() {
    return useQuery({
        queryKey: teamKeys.list(),
        queryFn: fetchTeams,
    })
}

export function useCreateTeam() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.all })
        },
    })
}

// Article Categories
export function useArticleCategories() {
    return useQuery({
        queryKey: articleCategoryKeys.list(),
        queryFn: fetchArticleCategories,
    })
}

export function useCreateArticleCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createArticleCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: articleCategoryKeys.list() })
        },
    })
}

// Project Team Members
export function useProjectTeamMembers(projectId: string) {
    return useQuery({
        queryKey: projectKeys.team(projectId),
        queryFn: () => fetchProjectTeamMembers(projectId),
        enabled: !!projectId,
    })
}

export function useCreateProjectTeamMember() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: Omit<CreateProjectTeamMember, 'project_id'> }) =>
            createProjectTeamMember(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.team(projectId) })
        },
    })
}

export function useUpdateProjectTeamMember() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, memberId, data }: { projectId: string; memberId: string; data: UpdateProjectTeamMember }) =>
            updateProjectTeamMember(projectId, memberId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.team(projectId) })
        },
    })
}

export function useDeleteProjectTeamMember() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
            deleteProjectTeamMember(projectId, memberId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.team(projectId) })
        },
    })
}

// Sub-projects
export function useSubProjects(projectId: string) {
    return useQuery({
        queryKey: projectKeys.subProjects(projectId),
        queryFn: () => fetchSubProjects(projectId),
        enabled: !!projectId,
    })
}

export function useSubProject(projectId: string, subProjectId: string) {
    return useQuery({
        queryKey: projectKeys.subProject(projectId, subProjectId),
        queryFn: () => fetchSubProject(projectId, subProjectId),
        enabled: !!projectId && !!subProjectId,
    })
}

export function useCreateSubProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: Omit<CreateSubProject, 'project_id'> }) =>
            createSubProject(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.subProjects(projectId) })
        },
    })
}

export function useUpdateSubProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, subProjectId, data }: { projectId: string; subProjectId: string; data: UpdateSubProject }) =>
            updateSubProject(projectId, subProjectId, data),
        onSuccess: (_, { projectId, subProjectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.subProjects(projectId) })
            queryClient.invalidateQueries({ queryKey: projectKeys.subProject(projectId, subProjectId) })
        },
    })
}

export function useDeleteSubProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, subProjectId }: { projectId: string; subProjectId: string }) =>
            deleteSubProject(projectId, subProjectId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.subProjects(projectId) })
        },
    })
}

// ========================
// Article Hooks
// ========================

export function useProjectArticles(projectId: string) {
    return useQuery({
        queryKey: projectKeys.articles(projectId),
        queryFn: () => fetchProjectArticles(projectId),
        enabled: !!projectId,
    })
}

export function useProjectArticle(projectId: string, articleId: string) {
    return useQuery({
        queryKey: projectKeys.article(projectId, articleId),
        queryFn: () => fetchProjectArticle(projectId, articleId),
        enabled: !!projectId && !!articleId,
    })
}

export function useCreateProjectArticle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: Omit<CreateArticle, 'project_id'> }) =>
            createProjectArticle(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.articles(projectId) })
        },
    })
}

export function useUpdateProjectArticle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, articleId, data }: { projectId: string; articleId: string; data: UpdateArticle }) =>
            updateProjectArticle(projectId, articleId, data),
        onSuccess: (_, { projectId, articleId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.articles(projectId) })
            queryClient.invalidateQueries({ queryKey: projectKeys.article(projectId, articleId) })
        },
    })
}

export function useDeleteProjectArticle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, articleId }: { projectId: string; articleId: string }) =>
            deleteProjectArticle(projectId, articleId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.articles(projectId) })
        },
    })
}

// ========================
// Sponsor API Functions
// ========================

async function fetchProjectSponsors(projectId: string): Promise<ProjectSponsor[]> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sponsors`)
    if (!response.ok) throw new Error('Failed to fetch sponsors')
    const { data } = await response.json()
    return data
}

async function createProjectSponsor(projectId: string, data: Omit<CreateProjectSponsor, 'project_id'>): Promise<ProjectSponsor> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sponsors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create sponsor')
    }
    const { data: sponsor } = await response.json()
    return sponsor
}

async function updateProjectSponsor(projectId: string, sponsorId: string, data: UpdateProjectSponsor): Promise<ProjectSponsor> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sponsors/${sponsorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sponsor')
    }
    const { data: sponsor } = await response.json()
    return sponsor
}

async function deleteProjectSponsor(projectId: string, sponsorId: string): Promise<void> {
    const response = await fetch(`/api/dashboard/projects/${projectId}/sponsors/${sponsorId}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete sponsor')
    }
}

// ========================
// Sponsor Hooks
// ========================

export function useProjectSponsors(projectId: string) {
    return useQuery({
        queryKey: projectKeys.sponsors(projectId),
        queryFn: () => fetchProjectSponsors(projectId),
        enabled: !!projectId,
    })
}

export function useCreateProjectSponsor() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: Omit<CreateProjectSponsor, 'project_id'> }) =>
            createProjectSponsor(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.sponsors(projectId) })
        },
    })
}

export function useUpdateProjectSponsor() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, sponsorId, data }: { projectId: string; sponsorId: string; data: UpdateProjectSponsor }) =>
            updateProjectSponsor(projectId, sponsorId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.sponsors(projectId) })
        },
    })
}

export function useDeleteProjectSponsor() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, sponsorId }: { projectId: string; sponsorId: string }) =>
            deleteProjectSponsor(projectId, sponsorId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.sponsors(projectId) })
        },
    })
}

// ========================
// Global Sponsors API Functions
// ========================

export const sponsorKeys = {
    all: ['sponsors'] as const,
    list: () => [...sponsorKeys.all, 'list'] as const,
}

async function fetchSponsors(): Promise<Sponsor[]> {
    const response = await fetch('/api/dashboard/sponsors')
    if (!response.ok) throw new Error('Failed to fetch sponsors')
    const { data } = await response.json()
    return data
}

async function createSponsor(data: CreateSponsor): Promise<Sponsor> {
    const response = await fetch('/api/dashboard/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create sponsor')
    }
    const { data: sponsor } = await response.json()
    return sponsor
}

async function updateSponsor(id: string, data: UpdateSponsor): Promise<Sponsor> {
    const response = await fetch(`/api/dashboard/sponsors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sponsor')
    }
    const { data: sponsor } = await response.json()
    return sponsor
}

async function deleteSponsor(id: string): Promise<void> {
    const response = await fetch(`/api/dashboard/sponsors/${id}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete sponsor')
    }
}

// ========================
// Global Sponsor Hooks
// ========================

export function useSponsors() {
    return useQuery({
        queryKey: sponsorKeys.list(),
        queryFn: fetchSponsors,
    })
}

export function useCreateSponsor() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createSponsor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sponsorKeys.all })
        },
    })
}

export function useUpdateSponsor() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSponsor }) => updateSponsor(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sponsorKeys.all })
        },
    })
}

export function useDeleteSponsor() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteSponsor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sponsorKeys.all })
        },
    })
}

