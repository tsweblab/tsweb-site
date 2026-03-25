import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FolderKanban, MessageSquare, HelpCircle, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch open support tickets
  const { count: openTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user?.id)
    .neq("status", "resolved")

  const unreadCount = 0

  const stats = [
    {
      title: "Projets actifs",
      value: projects?.filter(p => p.status !== "completed" && p.status !== "cancelled").length || 0,
      icon: FolderKanban,
      href: "/dashboard/projects",
    },
    {
      title: "Messages non lus",
      value: unreadCount || 0,
      icon: MessageSquare,
      href: "/dashboard/messages",
    },
    {
      title: "Tickets ouverts",
      value: openTickets || 0,
      icon: HelpCircle,
      href: "/dashboard/support",
    },
  ]

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs text-yellow-500">
            <Clock className="h-3 w-3" />
            En attente
          </span>
        )
      case "in_progress":
        return (
          <span className="flex items-center gap-1 text-xs text-primary">
            <AlertCircle className="h-3 w-3" />
            En cours
          </span>
        )
      case "completed":
        return (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 className="h-3 w-3" />
            Terminé
          </span>
        )
      default:
        return (
          <span className="text-xs text-muted-foreground">{status}</span>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Bienvenue sur votre espace</h1>
          <p className="text-muted-foreground">Gérez vos projets et suivez leur avancement.</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2 glow-primary">
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Projets récents</CardTitle>
            <CardDescription>Vos derniers projets en cours</CardDescription>
          </div>
          <Link href="/dashboard/projects">
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-card"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{project.project_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.project_type === "vitrine" ? "Pack Vitrine" : "Pack Dynamique"}
                    </p>
                  </div>
                  {getStatusBadge(project.status)}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Aucun projet pour le moment</p>
              <Link href="/dashboard/projects/new" className="mt-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer mon premier projet
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
