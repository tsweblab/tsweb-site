import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Clock, CheckCircle2, AlertCircle, XCircle, FolderKanban } from "lucide-react"

const statusConfig = {
  pending: { label: "En attente", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  in_progress: { label: "En cours", icon: AlertCircle, className: "bg-primary/10 text-primary border-primary/20" },
  review: { label: "En révision", icon: AlertCircle, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  completed: { label: "Terminé", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  cancelled: { label: "Annulé", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Mes projets</h1>
          <p className="text-muted-foreground">Gérez et suivez l&apos;avancement de vos projets web.</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2 glow-primary">
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => {
            const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending
            const StatusIcon = status.icon

            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="line-clamp-1">{project.project_name}</CardTitle>
                        <CardDescription>
                          {project.project_type === "vitrine" ? "Pack Vitrine" : "Pack Dynamique"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={status.className}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description || "Aucune description disponible."}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Créé le {new Date(project.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      {project.estimated_delivery && (
                        <span>
                          Deadline: {new Date(project.estimated_delivery).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold">Aucun projet pour le moment</h3>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Commencez votre aventure digitale en créant votre premier projet web.
            </p>
            <Link href="/dashboard/projects/new">
              <Button className="gap-2 glow-primary">
                <Plus className="h-4 w-4" />
                Créer mon premier projet
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
