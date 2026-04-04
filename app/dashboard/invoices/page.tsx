import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const statusConfig = {
  pending: { label: "En attente", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  paid: { label: "Payée", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  overdue: { label: "En retard", icon: AlertCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, projects(project_name)")
    .eq("client_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Factures</h1>
        <p className="text-muted-foreground">Consultez et téléchargez vos factures.</p>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.pending
            const StatusIcon = status.icon
            const project = invoice.projects as { project_name: string } | null

            return (
              <Card key={invoice.id} className="transition-all hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Facture #{invoice.invoice_number}
                      </CardTitle>
                      <CardDescription>
                        {project?.project_name || "Projet"} - Émise le{" "}
                        {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
                      </CardDescription>
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
                      {invoice.due_date && (
                        <p className="text-sm text-muted-foreground">
                          Échéance: {new Date(invoice.due_date).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground italic">Téléchargement bientôt disponible</p>
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
            <p className="text-muted-foreground">
              Vos factures apparaîtront ici une fois vos projets démarrés.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
