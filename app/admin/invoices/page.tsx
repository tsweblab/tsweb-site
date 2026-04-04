import { createServiceClient } from "@/lib/supabase/service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, User, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { markInvoicePaid } from "@/app/admin/actions"

const statusConfig = {
  pending: { label: "En attente", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  paid: { label: "Payée", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  overdue: { label: "En retard", icon: AlertCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default async function AdminInvoicesPage() {
  const supabase = createServiceClient()

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, profiles(full_name, company_name), projects(project_name)")
    .order("created_at", { ascending: false })

  // Calculate totals
  const totalPending = invoices
    ?.filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
  
  const totalPaid = invoices
    ?.filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Factures</h1>
        <p className="text-muted-foreground">Gérez la facturation de vos clients.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalPending)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total encaissé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nombre de factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.pending
            const StatusIcon = status.icon
            const profile = invoice.profiles as { full_name: string | null; company_name: string | null } | null
            const project = invoice.projects as { project_name: string } | null

            return (
              <Card key={invoice.id} className="transition-all hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Facture #{invoice.invoice_number}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {profile?.full_name || "Client"}
                        {profile?.company_name && ` - ${profile.company_name}`}
                      </CardDescription>
                      {project && (
                        <CardDescription>
                          Projet: {project.project_name}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(invoice.amount)}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>
                          Émise: {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
                        </span>
                        {invoice.due_date && (
                          <span>
                            Échéance: {new Date(invoice.due_date).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {invoice.status === "pending" && (
                        <form action={markInvoicePaid.bind(null, invoice.id)}>
                          <Button size="sm" type="submit" className="glow-primary">
                            Marquer payée
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold">Aucune facture</h3>
            <p className="mb-6 text-muted-foreground">
              Les factures apparaîtront ici une fois créées.
            </p>
            <Button className="glow-primary">
              Créer une facture
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
