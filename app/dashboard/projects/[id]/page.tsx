import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, XCircle, Globe, Rocket, ExternalLink, MessageSquare } from "lucide-react"

const statusConfig = {
  pending: { label: "En attente", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  quoted: { label: "Devis envoyé", icon: AlertCircle, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  accepted: { label: "Accepté", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  maquette: { label: "Maquette", icon: AlertCircle, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  development: { label: "En développement", icon: AlertCircle, className: "bg-primary/10 text-primary border-primary/20" },
  testing: { label: "En test", icon: AlertCircle, className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  delivered: { label: "Livré", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  cancelled: { label: "Annulé", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("client_id", user?.id)
    .single()

  if (!project) {
    notFound()
  }

  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{project.project_name}</h1>
              <Badge variant="outline" className={status.className}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project.project_type === "vitrine" ? "Pack Vitrine" : "Pack Dynamique"} - Créé le{" "}
              {new Date(project.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/messages?project=${project.id}`}>
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Contacter l&apos;équipe
          </Button>
        </Link>
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
              <CardDescription>Les détails de votre demande</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.description && (
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              {project.objectives && (
                <div>
                  <h4 className="mb-2 font-medium">Objectifs & fonctionnalités</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.objectives}</p>
                </div>
              )}

              {project.example_sites && project.example_sites.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Sites de référence</h4>
                  <ul className="space-y-2 text-sm">
                    {project.example_sites.map((ref: string, i: number) => (
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
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
                  {project.project_type === "vitrine" ? "Vitrine" : "Dynamique"}
                </span>
              </div>
              {project.estimated_delivery && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium">
                    {new Date(project.estimated_delivery).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
              {project.budget_range && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{project.budget_range}</span>
                </div>
              )}
              {project.quoted_price && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Devis</span>
                  <span className="font-medium">{project.quoted_price} €</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Besoin d&apos;aide ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Notre équipe est disponible pour répondre à vos questions.
              </p>
              <Link href="/dashboard/support" className="block">
                <Button variant="outline" className="w-full">
                  Ouvrir un ticket
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
