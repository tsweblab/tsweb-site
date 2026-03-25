"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, Loader2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  profiles: { full_name: string | null; role: string } | null
}

interface Ticket {
  id: string
  subject: string
  message: string | null
  priority: string | null
  status: string
  created_at: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Ouvert", className: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "En cours", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  resolved: { label: "Résolu", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  closed: { label: "Fermé", className: "bg-muted text-muted-foreground border-border" },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Basse", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  medium: { label: "Moyenne", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  high: { label: "Haute", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  urgent: { label: "Urgent", className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/auth/login"); return }
    setCurrentUserId(user.id)

    const { data: ticketData } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", id)
      .eq("client_id", user.id)
      .single()

    if (!ticketData) { router.push("/dashboard/support"); return }
    setTicket(ticketData)

    const { data: messagesData } = await supabase
      .from("messages")
      .select("*, profiles!sender_id(full_name, role)")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true })

    setMessages(messagesData || [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  // Realtime subscription for new messages
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`ticket-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `ticket_id=eq.${id}` },
        async (payload) => {
          const { data } = await supabase
            .from("messages")
            .select("*, profiles!sender_id(full_name, role)")
            .eq("id", payload.new.id)
            .single()
          if (data) setMessages((prev) => [...prev, data])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId) return
    setIsSending(true)

    const supabase = createClient()
    const { error } = await supabase.from("messages").insert({
      ticket_id: id,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })

    if (!error) {
      setNewMessage("")
      await loadData()
    }
    setIsSending(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!ticket) return null

  const status = statusConfig[ticket.status] || statusConfig.open
  const priority = ticket.priority ? (priorityConfig[ticket.priority] || priorityConfig.medium) : null

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/support">
            <Button variant="ghost" size="icon" className="mt-1 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{ticket.subject}</h1>
              <Badge variant="outline" className={status.className}>{status.label}</Badge>
              {priority && <Badge variant="outline" className={priority.className}>{priority.label}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              Ouvert le {new Date(ticket.created_at).toLocaleDateString("fr-FR")} à{" "}
              {new Date(ticket.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-border/50 bg-card/30 p-4">
        {/* Message initial du ticket */}
        {ticket.message && (
          <div className="mb-4 flex justify-end">
            <div className="max-w-[75%] space-y-1">
              <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground">
                <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
              </div>
              <p className="text-right text-xs text-muted-foreground">
                Vous · {new Date(ticket.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        )}

        {messages.length === 0 && !ticket.message && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Aucun message pour le moment.<br />Notre équipe va vous répondre bientôt.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          const isAdmin = msg.profiles?.role === "admin"
          const senderName = isMe ? "Vous" : (isAdmin ? "Support TS WEB" : (msg.profiles?.full_name || "Support"))

          return (
            <div key={msg.id} className={`mb-4 flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%] space-y-1">
                <div className={`rounded-2xl px-4 py-3 ${isMe ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted"}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className={`text-xs text-muted-foreground ${isMe ? "text-right" : "text-left"}`}>
                  {senderName} · {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply form */}
      {ticket.status !== "closed" && ticket.status !== "resolved" ? (
        <form onSubmit={sendMessage} className="flex gap-3 pt-4">
          <Textarea
            placeholder="Écrire un message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={2}
            className="flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e as unknown as React.FormEvent)
              }
            }}
          />
          <Button type="submit" className="glow-primary self-end" disabled={isSending || !newMessage.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
          Ce ticket est {ticket.status === "resolved" ? "résolu" : "fermé"}.
        </div>
      )}
    </div>
  )
}
