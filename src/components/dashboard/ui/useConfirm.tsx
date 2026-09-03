"use client"

import { useCallback, useState } from "react"
import { ConfirmDialog } from "@/components/dashboard/ui/ConfirmDialog"

export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((nextTitle: string, nextDescription?: string) => {
    return new Promise<boolean>((resolve) => {
      setTitle(nextTitle)
      setDescription(nextDescription || "")
      setResolver(() => resolve)
      setOpen(true)
    })
  }, [])

  const finish = (value: boolean) => {
    resolver?.(value)
    setResolver(null)
    setOpen(false)
  }

  const dialog = (
    <ConfirmDialog
      open={open}
      title={title}
      description={description}
      confirmLabel="Confirm"
      destructive
      onClose={() => finish(false)}
      onConfirm={() => finish(true)}
    />
  )

  return { confirm, dialog }
}
