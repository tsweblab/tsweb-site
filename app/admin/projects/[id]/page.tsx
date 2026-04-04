import { notFound } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, XCircle, Globe, Rocket, ExternalLink, User, Building2, Phone, Mail } from "lucide-react"
import { ProjectStatusUpdater } from "@/components/admin/project-status-updater"

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:     { label: "En attente",       className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  quoted:      { label: "Devis envoyé",     className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  accepted:    { label: "Accepté",          className: "bg-green-500/10 text-green-500 border-green-500/20" },
  maquette:    { label: "Maquette",         className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  development: { label: "En développement", className: "bg-primary/10 text-primary border-primary/20" },
  testing:     { label: "En test",          className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  delivered:   { label: "Livré",            className: "bg-green-500/10 text-green-500 border-green-500/20" },
  cancelled:   { label: "Annulé",           className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from("projects")
    .select("*, profiles!client_id(full_name, company_name, email, phone)")
    .eq("id", id)
    .single()

  if (!project) notFound()

  const status = statusConfig[project.status] || statusConfig.pending
  const profile = project.profiles as {
    full_name: string | null
    company_name: string | null
    email: string | null
    phone: string | null
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
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{project.project_name}</h1>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project.project_type === "vitrine" ? "Pack Vitrine" : "Pack Dynamique"} — Créé le{" "}
              {new Date(project.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <ProjectStatusUpdater projectId={project.id} currentStatus={project.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {project.project_type === "vitrine" ? (
                  <Globe className="h-5 w-5 text-primary" />
                ) : (
                  <Rocket className="h-5 w-5 text-primary" />
                )}
                Brief du projet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.description && (
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{project.description}</p>
                </div>
              )}
              {project.objectives && (
                <div>
                  <h4 className="mb-2 font-medium">Objectifs & fonctionnalités</h4>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{project.objectives}</p>
                </div>
              )}
              {project.example_sites && project.example_sites.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Sites de référence</h4>
                  <ul className="space-y-2 text-sm">
                    {project.example_sites.map((ref: string, i: number) => (
                      <li key={i}>
                        <a href={ref.startsWith("http") ? ref : `https://${ref}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" />
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!project.description && !project.objectives && (
                <p className="py-4 text-center text-muted-foreground">Aucun brief disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{profile?.full_name || "Client"}</p>
                  {profile?.company_name && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3" /> {profile.company_name}
                    </p>
                  )}
                </div>
              </div>
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Mail className="h-4 w-4" /> {profile.email}
                </a>
              )}
              {profile?.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Phone className="h-4 w-4" /> {profile.phone}
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant="outline" className={status.className}>{status.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pack</span>
                <span className="font-medium">{project.project_type === "vitrine" ? "Vitrine" : "Dynamique"}</span>
              </div>
              {project.budget_range && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{project.budget_range}</span>
                </div>
              )}
              {project.estimated_delivery && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium">{new Date(project.estimated_delivery).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {project.quoted_price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Devis</span>
                  <span className="font-medium text-primary">{project.quoted_price} €</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span className="font-medium">{new Date(project.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
