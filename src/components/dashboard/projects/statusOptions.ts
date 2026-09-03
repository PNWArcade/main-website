import type { UploadStatus } from '@/lib/schemas/project'

export const statusOptions: { value: UploadStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]
