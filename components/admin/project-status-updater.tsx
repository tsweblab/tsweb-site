"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface ProjectStatusUpdaterProps {
  projectId: string
  currentStatus: string
}

const statuses = [
  { value: "pending", label: "En attente" },
  { value: "in_progress", label: "En cours" },
  { value: "review", label: "En révision" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
]

export function ProjectStatusUpdater({ projectId, currentStatus }: ProjectStatusUpdaterProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleUpdateStatus() {
    if (status === currentStatus) return
    
    setIsUpdating(true)
    const supabase = createClient()

    await supabase
      .from("projects")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", projectId)

    setIsUpdating(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleUpdateStatus}
        disabled={status === currentStatus || isUpdating}
        className="glow-primary"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mise à jour...
          </>
        ) : (
          "Mettre à jour"
        )}
      </Button>
    </div>
  )
}
