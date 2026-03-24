import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, XCircle, Globe, Rocket, ExternalLink, User, Mail, Building } from "lucide-react"
import { ProjectStatusUpdater } from "@/components/admin/project-status-updater"

const statusConfig = {
  pending: { label: "En attente", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  in_progress: { label: "En cours", icon: AlertCircle, className: "bg-primary/10 text-primary border-primary/20" },
  review: { label: "En révision", icon: AlertCircle, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  completed: { label: "Terminé", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  cancelled: { label: "Annulé", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("*, profiles(*)")
    .eq("id", id)
    .single()

  if (!project) {
    notFound()
  }

  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon
  const profile = project.profiles as {
    id: string
    full_name: string | null
    company: string | null
    email: string | null
    phone: string | null
  } | null
  const brief = project.brief as {
    description?: string
    target_audience?: string
    features?: string[]
    references?: string[]
    budget?: string
  } | null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{project.name}</h1>
              <Badge variant="outline" className={status.className}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project.pack_type === "vitrine" ? "Pack Vitrine" : "Pack Dynamique"} - Créé le{" "}
              {new Date(project.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <ProjectStatusUpdater projectId={project.id} currentStatus={project.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Brief */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {project.pack_type === "vitrine" ? (
                  <Globe className="h-5 w-5 text-primary" />
                ) : (
                  <Rocket className="h-5 w-5 text-primary" />
                )}
                Brief du projet
              </CardTitle>
              <CardDescription>Les détails de la demande client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {brief?.description && (
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{brief.description}</p>
                </div>
              )}

              {brief?.target_audience && (
                <div>
                  <h4 className="mb-2 font-medium">Public cible</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{brief.target_audience}</p>
                </div>
              )}

              {brief?.features && brief.features.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Fonctionnalités souhaitées</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {brief.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {brief?.references && brief.references.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Sites de référence</h4>
                  <ul className="space-y-2 text-sm">
                    {brief.references.map((ref, i) => (
                      <li key={i}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!brief?.description && !brief?.target_audience && !brief?.features?.length && (
                <p className="text-center text-muted-foreground py-4">Aucun brief disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{profile?.full_name || "Client"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.company || "N/A"}</p>
                </div>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {profile.phone}
                </div>
              )}
              <Link href={`/admin/clients`}>
                <Button variant="outline" className="w-full">
                  Voir le profil client
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pack</span>
                <span className="font-medium">
                  {project.pack_type === "vitrine" ? "Vitrine" : "Dynamique"}
                </span>
              </div>
              {project.deadline && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium">
                    {new Date(project.deadline).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
              {brief?.budget && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{brief.budget}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créé le</span>
                <span className="font-medium">
                  {new Date(project.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
