"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { HelpCircle, Clock, CheckCircle2, AlertCircle, User, ChevronRight } from "lucide-react"
import Link from "next/link"

interface SupportTicket {
  id: string
  subject: string
  message: string
  priority: string
  status: string
  created_at: string
  profiles: {
    full_name: string | null
    company_name: string | null
  } | null
}

const priorityConfig = {
  low: { label: "Basse", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  medium: { label: "Moyenne", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  high: { label: "Haute", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  urgent: { label: "Urgent", className: "bg-destructive/10 text-destructive border-destructive/20" },
}

const statusConfig = {
  open: { label: "Ouvert", icon: AlertCircle, className: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "En cours", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  resolved: { label: "Résolu", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/20" },
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  async function loadTickets() {
    const supabase = createClient()
    
    let query = supabase
      .from("support_tickets")
      .select("*, profiles!client_id(full_name, company_name)")
      .order("created_at", { ascending: false })

    if (filter !== "all") {
      query = query.eq("status", filter)
    }

    const { data } = await query

    if (data) {
      setTickets(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadTickets()
  }, [filter])

  async function updateTicketStatus(ticketId: string, newStatus: string) {
    const supabase = createClient()
    
    await supabase
      .from("support_tickets")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", ticketId)

    loadTickets()
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Support</h1>
          <p className="text-muted-foreground">Gérez les tickets de support clients.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="open">Ouverts</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="resolved">Résolus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const prio = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium
            const stat = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open
            const StatusIcon = stat.icon

            return (
              <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
              <Card className="transition-all hover:border-primary/30 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">{ticket.subject} <ChevronRight className="h-4 w-4 text-muted-foreground" /></CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {ticket.profiles?.full_name || "Client"}
                        {ticket.profiles?.company_name && ` - ${ticket.profiles.company_name}`}
                        <span className="mx-1">|</span>
                        {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={prio.className}>
                        {prio.label}
                      </Badge>
                      <Badge variant="outline" className={stat.className}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {stat.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground whitespace-pre-wrap">
                    {ticket.message}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.status !== "in_progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTicketStatus(ticket.id, "in_progress")}
                      >
                        Prendre en charge
                      </Button>
                    )}
                    {ticket.status !== "resolved" && (
                      <Button
                        size="sm"
                        className="glow-primary"
                        onClick={() => updateTicketStatus(ticket.id, "resolved")}
                      >
                        Marquer résolu
                      </Button>
                    )}
                    {ticket.status === "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTicketStatus(ticket.id, "open")}
                      >
                        Réouvrir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <HelpCircle className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold">Aucun ticket</h3>
            <p className="text-muted-foreground">
              {filter !== "all" 
                ? "Aucun ticket avec ce filtre." 
                : "Aucun ticket de support pour le moment."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
