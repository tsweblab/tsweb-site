import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  FolderKanban, 
  Users, 
  HelpCircle, 
  Euro,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const { count: totalProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })

  const { count: activeProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "in_progress", "review"])

  const { count: totalClients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: openTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .neq("status", "resolved")

  // Fetch recent projects
  const { data: recentProjects } = await supabase
    .from("projects")
    .select("*, profiles!client_id(full_name, company_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recent tickets
  const { data: recentTickets } = await supabase
    .from("support_tickets")
    .select("*, profiles!client_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    {
      title: "Projets actifs",
      value: activeProjects || 0,
      total: totalProjects || 0,
      icon: FolderKanban,
      href: "/admin/projects",
      color: "text-primary",
    },
    {
      title: "Clients",
      value: totalClients || 0,
      icon: Users,
      href: "/admin/clients",
      color: "text-green-500",
    },
    {
      title: "Tickets ouverts",
      value: openTickets || 0,
      icon: HelpCircle,
      href: "/admin/support",
      color: "text-yellow-500",
    },
    {
      title: "Revenu mensuel",
      value: "N/A",
      icon: Euro,
      href: "/admin/invoices",
      color: "text-emerald-500",
    },
  ]

  const statusConfig = {
    pending: { label: "En attente", icon: Clock, className: "bg-yellow-500/10 text-yellow-500" },
    in_progress: { label: "En cours", icon: AlertCircle, className: "bg-primary/10 text-primary" },
    review: { label: "En révision", icon: AlertCircle, className: "bg-purple-500/10 text-purple-500" },
    completed: { label: "Terminé", icon: CheckCircle2, className: "bg-green-500/10 text-green-500" },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre activité.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  {stat.total !== undefined && stat.total > 0 && (
                    <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                  )}
                </div>
                {stat.title === "Projets actifs" && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    +2 cette semaine
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projets récents</CardTitle>
            <CardDescription>Derniers projets créés</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects && recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => {
                  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending
                  const profile = project.profiles as { full_name: string | null; company_name: string | null } | null

                  return (
                    <Link
                      key={project.id}
                      href={`/admin/projects/${project.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{project.project_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.full_name || "Client"} - {profile?.company_name || "N/A"}
                        </p>
                      </div>
                      <Badge variant="secondary" className={status.className}>
                        {status.label}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun projet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets récents</CardTitle>
            <CardDescription>Demandes de support</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTickets && recentTickets.length > 0 ? (
              <div className="space-y-4">
                {recentTickets.map((ticket) => {
                  const profile = ticket.profiles as { full_name: string | null } | null

                  return (
                    <Link
                      key={ticket.id}
                      href="/admin/support"
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.full_name || "Client"} -{" "}
                          {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          ticket.status === "open"
                            ? "bg-primary/10 text-primary"
                            : ticket.status === "in_progress"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-green-500/10 text-green-500"
                        }
                      >
                        {ticket.status === "open"
                          ? "Ouvert"
                          : ticket.status === "in_progress"
                          ? "En cours"
                          : "Résolu"}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun ticket</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
