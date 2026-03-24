"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, HelpCircle, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface SupportTicket {
  id: string
  subject: string
  message: string
  priority: string
  status: string
  created_at: string
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

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("medium")

  async function loadTickets() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setTickets(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadTickets()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject,
      message,
      priority,
      status: "open",
    })

    if (!error) {
      setSubject("")
      setMessage("")
      setPriority("medium")
      setIsDialogOpen(false)
      loadTickets()
    }

    setIsSubmitting(false)
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
          <p className="text-muted-foreground">Gérez vos demandes d&apos;assistance.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 glow-primary">
              <Plus className="h-4 w-4" />
              Nouveau ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un ticket de support</DialogTitle>
              <DialogDescription>
                Décrivez votre problème ou question et nous vous répondrons rapidement.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="subject">Sujet</FieldLabel>
                  <Input
                    id="subject"
                    placeholder="Ex: Problème d'affichage sur mobile"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="priority">Priorité</FieldLabel>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="message">Message</FieldLabel>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre problème en détail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                  />
                </Field>
                <Button type="submit" className="w-full glow-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le ticket"
                  )}
                </Button>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const prio = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium
            const stat = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open
            const StatusIcon = stat.icon

            return (
              <Card key={ticket.id} className="transition-all hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      <CardDescription>
                        Créé le {new Date(ticket.created_at).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(ticket.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
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
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <HelpCircle className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold">Aucun ticket</h3>
            <p className="mb-6 text-muted-foreground">
              Vous n&apos;avez pas encore créé de ticket de support.
            </p>
            <Button className="gap-2 glow-primary" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Créer mon premier ticket
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
