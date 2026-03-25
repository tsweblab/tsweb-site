"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Clock, AlertCircle, Eye, CheckCircle2, XCircle, MoreVertical, Globe, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Project {
  id: string
  project_name: string
  status: string
  project_type: string
  created_at: string
  estimated_delivery: string | null
  profiles: {
    full_name: string | null
    company_name: string | null
  } | null
}

interface ProjectKanbanProps {
  initialProjects: Project[]
}

const columns = [
  { id: "pending", title: "En attente", icon: Clock, color: "text-yellow-500" },
  { id: "in_progress", title: "En cours", icon: AlertCircle, color: "text-primary" },
  { id: "review", title: "En révision", icon: Eye, color: "text-purple-500" },
  { id: "completed", title: "Terminés", icon: CheckCircle2, color: "text-green-500" },
]

export function ProjectKanban({ initialProjects }: ProjectKanbanProps) {
  const [projects, setProjects] = useState(initialProjects)

  async function updateProjectStatus(projectId: string, newStatus: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", projectId)

    if (!error) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
      )
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {columns.map((column) => {
        const columnProjects = projects.filter((p) => p.status === column.id)
        const Icon = column.icon

        return (
          <div key={column.id} className="space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", column.color)} />
                <h3 className="font-semibold">{column.title}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {columnProjects.length}
              </Badge>
            </div>

            {/* Projects */}
            <div className="space-y-3">
              {columnProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {project.project_type === "vitrine" ? (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Rocket className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Link href={`/admin/projects/${project.id}`}>
                          <CardTitle className="text-sm hover:text-primary">
                            {project.project_name}
                          </CardTitle>
                        </Link>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {columns
                            .filter((c) => c.id !== project.status)
                            .map((c) => (
                              <DropdownMenuItem
                                key={c.id}
                                onClick={() => updateProjectStatus(project.id, c.id)}
                              >
                                <c.icon className={cn("mr-2 h-4 w-4", c.color)} />
                                {c.title}
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuItem
                            onClick={() => updateProjectStatus(project.id, "cancelled")}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground">
                      {project.profiles?.full_name || "Client"}
                      {project.profiles?.company_name && ` - ${project.profiles.company_name}`}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          project.project_type === "vitrine"
                            ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                            : "border-purple-500/20 bg-purple-500/10 text-purple-500"
                        )}
                      >
                        {project.project_type === "vitrine" ? "Vitrine" : "Dynamique"}
                      </Badge>
                      {project.estimated_delivery && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(project.estimated_delivery).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnProjects.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/50 p-6 text-center">
                  <p className="text-sm text-muted-foreground">Aucun projet</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
