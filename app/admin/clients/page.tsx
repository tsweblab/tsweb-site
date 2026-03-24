import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, User, Building, FolderKanban, Calendar } from "lucide-react"
import Link from "next/link"

export default async function AdminClientsPage() {
  const supabase = await createClient()

  // Fetch all profiles with their project counts
  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch projects for each client
  const { data: projects } = await supabase
    .from("projects")
    .select("user_id, status")

  // Create a map of project counts by user
  const projectCounts = projects?.reduce((acc, project) => {
    acc[project.user_id] = (acc[project.user_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const activeProjectCounts = projects?.reduce((acc, project) => {
    if (project.status !== "completed" && project.status !== "cancelled") {
      acc[project.user_id] = (acc[project.user_id] || 0) + 1
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {client.full_name || "Client sans nom"}
                      </CardTitle>
                      {client.company && (
                        <CardDescription className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {client.company}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {activeProjectCounts[client.id] > 0 && (
                    <Badge className="bg-primary/10 text-primary">
                      {activeProjectCounts[client.id]} actif{activeProjectCounts[client.id] > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <FolderKanban className="h-4 w-4" />
                      Total projets
                    </span>
                    <span className="font-medium">{projectCounts[client.id] || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Inscrit le
                    </span>
                    <span className="font-medium">
                      {new Date(client.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  {client.phone && (
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  )}
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
