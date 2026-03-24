import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FolderKanban, 
  Users, 
  Euro, 
  TrendingUp,
  Globe,
  Rocket,
  CheckCircle2,
  Clock
} from "lucide-react"

export default async function AdminStatsPage() {
  const supabase = await createClient()

  // Fetch all data for statistics
  const { data: projects } = await supabase.from("projects").select("*")
  const { data: profiles } = await supabase.from("profiles").select("*")
  const { data: invoices } = await supabase.from("invoices").select("*")
  const { data: tickets } = await supabase.from("support_tickets").select("*")

  // Calculate statistics
  const totalProjects = projects?.length || 0
  const vitrineProjects = projects?.filter(p => p.pack_type === "vitrine").length || 0
  const dynamiqueProjects = projects?.filter(p => p.pack_type === "dynamique").length || 0
  const completedProjects = projects?.filter(p => p.status === "completed").length || 0
  const activeProjects = projects?.filter(p => 
    p.status !== "completed" && p.status !== "cancelled"
  ).length || 0

  const totalClients = profiles?.length || 0
  const totalRevenue = invoices?.filter(i => i.status === "paid").reduce((sum, i) => sum + (i.amount || 0), 0) || 0
  const pendingRevenue = invoices?.filter(i => i.status === "pending").reduce((sum, i) => sum + (i.amount || 0), 0) || 0

  const resolvedTickets = tickets?.filter(t => t.status === "resolved").length || 0
  const totalTickets = tickets?.length || 0

  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
  const ticketResolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Statistiques</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre activité.</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projets
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} actifs, {completedProjects} terminés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Clients enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenu total
            </CardTitle>
            <Euro className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat("fr-FR", { 
                style: "currency", 
                currency: "EUR",
                maximumFractionDigits: 0 
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat("fr-FR", { 
                style: "currency", 
                currency: "EUR",
                maximumFractionDigits: 0 
              }).format(pendingRevenue)} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de complétion
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Projets livrés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des projets</CardTitle>
            <CardDescription>Par type de pack</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Pack Vitrine</p>
                    <p className="text-sm text-muted-foreground">Sites vitrines</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{vitrineProjects}</p>
                  <p className="text-sm text-muted-foreground">
                    {totalProjects > 0 ? Math.round((vitrineProjects / totalProjects) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Rocket className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Pack Dynamique</p>
                    <p className="text-sm text-muted-foreground">Sites dynamiques</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{dynamiqueProjects}</p>
                  <p className="text-sm text-muted-foreground">
                    {totalProjects > 0 ? Math.round((dynamiqueProjects / totalProjects) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance support</CardTitle>
            <CardDescription>Statistiques des tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Tickets résolus</p>
                    <p className="text-sm text-muted-foreground">Demandes traitées</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{resolvedTickets}</p>
                  <p className="text-sm text-muted-foreground">
                    sur {totalTickets} total
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Taux de résolution</p>
                    <p className="text-sm text-muted-foreground">Performance globale</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{ticketResolutionRate}%</p>
                  <p className="text-sm text-green-500">Excellent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
