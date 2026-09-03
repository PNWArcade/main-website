"use client"

import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import ImageUploader from "@/components/ui/ImageUploader"
import type { TeamCategory } from "@/lib/pnw-team"

export interface MemberFormData {
  name: string
  position: string
  category: TeamCategory
  imageUrl: string
  pendingImage: File | null
  linkedinUrl: string
  email: string
}

export const CATEGORY_LABELS: Record<TeamCategory, string> = {
  leadership: "Leadership",
  officers: "Officers",
  mentors: "Mentors",
  advisors: "Advisors",
}

export const ROLE_PRESETS: { position: string; category: TeamCategory }[] = [
  { position: "President", category: "leadership" },
  { position: "Vice-President", category: "leadership" },
  { position: "Treasurer", category: "officers" },
  { position: "Secretary", category: "officers" },
  { position: "Lead Mentor", category: "mentors" },
  { position: "Mentor", category: "mentors" },
  { position: "Advisor", category: "advisors" },
]

export const EMPTY_MEMBER_FORM: MemberFormData = {
  name: "",
  position: "",
  category: "officers",
  imageUrl: "",
  pendingImage: null,
  linkedinUrl: "",
  email: "",
}

export function MemberFormFields({
  form,
  onChange,
  idPrefix = "member",
}: {
  form: MemberFormData
  onChange: <K extends keyof MemberFormData>(key: K, value: MemberFormData[K]) => void
  idPrefix?: string
}) {
  const presetMatch = ROLE_PRESETS.some((role) => role.position === form.position)
  const roleSelectValue = !form.position ? "" : presetMatch ? form.position : "__custom"

  return (
    <>
      <div>
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="mt-1"
          autoComplete="off"
          required
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-role`}>Role</Label>
        <select
          id={`${idPrefix}-role`}
          name="position"
          value={roleSelectValue}
          onChange={(e) => {
            const value = e.target.value
            if (value === "__custom") {
              onChange("position", "")
              return
            }
            const preset = ROLE_PRESETS.find((role) => role.position === value)
            onChange("position", value)
            if (preset) onChange("category", preset.category)
          }}
          className="mt-1 w-full rounded-md border border-input bg-input/30 px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-purdue-gold focus:outline-none"
        >
          <option value="">Select a role...</option>
          {ROLE_PRESETS.map((role) => (
            <option key={role.position} value={role.position}>
              {role.position}
            </option>
          ))}
          <option value="__custom">Custom role...</option>
        </select>
      </div>

      {roleSelectValue === "__custom" && (
        <div>
          <Label htmlFor={`${idPrefix}-custom-role`}>Custom role</Label>
          <Input
            id={`${idPrefix}-custom-role`}
            value={form.position}
            onChange={(e) => onChange("position", e.target.value)}
            className="mt-1"
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor={`${idPrefix}-category`}>Section</Label>
        <select
          id={`${idPrefix}-category`}
          name="category"
          value={form.category}
          onChange={(e) => onChange("category", e.target.value as TeamCategory)}
          className="mt-1 w-full rounded-md border border-input bg-input/30 px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-purdue-gold focus:outline-none"
        >
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Photo</Label>
        <ImageUploader
          value={form.imageUrl}
          onChange={(v) => onChange("imageUrl", v)}
          onFileSelect={(f) => onChange("pendingImage", f)}
          folder="team-members"
          previewMode
          aspectRatio="square"
          maxHeight={120}
          className="mt-1 max-w-40"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-linkedin`}>LinkedIn URL</Label>
        <Input
          id={`${idPrefix}-linkedin`}
          name="linkedin_url"
          type="url"
          placeholder="https://linkedin.com/in/..."
          value={form.linkedinUrl}
          onChange={(e) => onChange("linkedinUrl", e.target.value)}
          className="mt-1"
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          placeholder="member@example.com"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="mt-1"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </>
  )
}
