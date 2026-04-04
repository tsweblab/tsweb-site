import { createServiceClient } from "@/lib/supabase/service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, User, Building2, FolderKanban, Calendar, Mail, Phone } from "lucide-react"

export default async function AdminClientsPage() {
  const supabase = createServiceClient()

  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false })

  const { data: projects } = await supabase
    .from("projects")
    .select("client_id, status")

  const projectCounts = projects?.reduce((acc, project) => {
    acc[project.client_id] = (acc[project.client_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const activeProjectCounts = projects?.reduce((acc, project) => {
    if (project.status !== "delivered" && project.status !== "cancelled") {
      acc[project.client_id] = (acc[project.client_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Clients</h1>
        <p className="text-muted-foreground">Gérez vos clients et leurs projets.</p>
      </div>

      {clients && clients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="transition-all hover:border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {client.full_name || "Client sans nom"}
                      </CardTitle>
                      {client.company_name && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {client.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {activeProjectCounts[client.id] > 0 && (
                    <Badge className="shrink-0 bg-primary/10 text-primary">
                      {activeProjectCounts[client.id]} actif{activeProjectCounts[client.id] > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a href={`mailto:${client.email}`} className="truncate text-muted-foreground hover:text-primary">
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a href={`tel:${client.phone}`} className="text-muted-foreground hover:text-primary">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {projectCounts[client.id] || 0} projet{(projectCounts[client.id] || 0) > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Inscrit le {new Date(client.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold">Aucun client</h3>
            <p className="text-muted-foreground">
              Les clients apparaîtront ici après leur inscription.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
