'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/buttons/Button'
import {
  EMPTY_MEMBER_FORM,
  MemberFormFields,
  type MemberFormData,
} from '@/components/dashboard/team/MemberFormFields'

export type ManualMemberFormData = MemberFormData

export function ManualMemberCreateForm({
  isSaving,
  onSubmit,
  onCancel,
}: {
  isSaving: boolean
  onSubmit: (form: MemberFormData) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<MemberFormData>(EMPTY_MEMBER_FORM)

  const updateField = <K extends keyof MemberFormData>(
    key: K,
    value: MemberFormData[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await onSubmit(form)
  }

  return (
    <div className="lab-plate space-y-4 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Add Manual Team Member</h2>
          <p className="text-sm text-muted-foreground">
            Add someone who is missing from the PNW leadership page.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} aria-label="Close manual member form">
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <MemberFormFields form={form} onChange={updateField} idPrefix="manual-member" />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && (
              <FontAwesomeIcon icon={faArrowsRotate} aria-hidden="true" className="h-4 w-4 animate-spin" />
            )}
            {isSaving ? 'Adding…' : 'Add Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}
