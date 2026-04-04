"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare, Clock, CheckCircle2, AlertCircle, User, ChevronRight, FolderKanban, HelpCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface SupportTicket {
  id: string
  subject: string
  message: string
  priority: string
  status: string
  project_id: string | null
  created_at: string
  profiles: {
    full_name: string | null
    company_name: string | null
  } | null
}

const priorityConfig = {
  low:    { label: "Basse",   className: "bg-green-500/10 text-green-500 border-green-500/20" },
  medium: { label: "Moyenne", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  high:   { label: "Haute",   className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  urgent: { label: "Urgent",  className: "bg-destructive/10 text-destructive border-destructive/20" },
}

const statusConfig = {
  open:        { label: "Ouvert",   icon: AlertCircle,  className: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "En cours", icon: Clock,        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  resolved:    { label: "Résolu",   icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/20" },
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function loadTickets() {
    const supabase = createClient()

    let query = supabase
      .from("support_tickets")
      .select("*, profiles!client_id(full_name, company_name)")
      .order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }
    if (typeFilter === "project") {
      query = query.not("project_id", "is", null)
    } else if (typeFilter === "support") {
      query = query.is("project_id", null)
    }

    const { data } = await query
    if (data) setTickets(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadTickets()
  }, [statusFilter, typeFilter])

  async function updateTicketStatus(ticketId: string, newStatus: string) {
    setUpdatingId(ticketId)
    const supabase = createClient()
    await supabase
      .from("support_tickets")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
    await loadTickets()
    setUpdatingId(null)
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Messages</h1>
          <p className="text-muted-foreground">Discussions projets et tickets de support.</p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les messages</SelectItem>
              <SelectItem value="project">Discussions projet</SelectItem>
              <SelectItem value="support">Support client</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="open">Ouverts</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="resolved">Résolus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const isProjectDiscussion = ticket.project_id !== null
            const prio = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium
            const stat = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open
            const StatusIcon = stat.icon

            return (
              <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
                <Card className={`cursor-pointer transition-all hover:border-primary/30 ${
                  isProjectDiscussion
                    ? "border-l-4 border-l-purple-500"
                    : "border-l-4 border-l-green-500"
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          {isProjectDiscussion ? (
                            <FolderKanban className="h-4 w-4 shrink-0 text-purple-500" />
                          ) : (
                            <HelpCircle className="h-4 w-4 shrink-0 text-green-500" />
                          )}
                          {ticket.subject}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {ticket.profiles?.full_name || "Client"}
                          {ticket.profiles?.company_name && ` - ${ticket.profiles.company_name}`}
                          <span className="mx-1">·</span>
                          {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={
                          isProjectDiscussion
                            ? "border-purple-500/20 bg-purple-500/10 text-purple-500"
                            : "border-green-500/20 bg-green-500/10 text-green-500"
                        }>
                          {isProjectDiscussion ? "Projet" : "Support"}
                        </Badge>
                        <Badge variant="outline" className={prio.className}>
                          {prio.label}
                        </Badge>
                        <Select
                          value={ticket.status}
                          onValueChange={(val) => updateTicketStatus(ticket.id, val)}
                          disabled={updatingId === ticket.id}
                        >
                          <SelectTrigger
                            className={`h-7 w-32 text-xs ${stat.className} border`}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                          >
                            {updatingId === ticket.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <><StatusIcon className="mr-1 h-3 w-3" /><SelectValue /></>
                            }
                          </SelectTrigger>
                          <SelectContent onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                            <SelectItem value="open">Ouvert</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="resolved">Résolu</SelectItem>
                            <SelectItem value="closed">Fermé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.message}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold">Aucun message</h3>
            <p className="text-muted-foreground">Aucun message pour le moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
