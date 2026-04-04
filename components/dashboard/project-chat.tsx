"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Send, Loader2, MessageSquare } from "lucide-react"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

interface ProjectChatProps {
  projectId: string
  userId: string
  projectName: string
}

export function ProjectChat({ projectId, userId, projectName }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function initChat() {
    const supabase = createClient()

    // Cherche un ticket de discussion existant pour ce projet
    const { data: existing } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("client_id", userId)
      .eq("project_id", projectId)
      .maybeSingle()

    let tid = existing?.id

    if (!tid) {
      const { data: created, error: createError } = await supabase
        .from("support_tickets")
        .insert({
          client_id: userId,
          project_id: projectId,
          subject: `Discussion — ${projectName}`,
          message: "Fil de discussion du projet.",
          status: "open",
          priority: "medium",
        })
        .select("id")
        .single()

      if (createError) {
        setInitError(createError.message)
        setIsLoading(false)
        return
      }
      tid = created?.id
    }

    if (tid) {
      setTicketId(tid)
      await loadMessages(tid)
    }
    setIsLoading(false)
  }

  async function loadMessages(tid: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from("messages")
      .select("id, content, sender_id, created_at")
      .eq("ticket_id", tid)
      .order("created_at", { ascending: true })
    if (data) setMessages(data)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    if (!ticketId) {
      setSendError("La discussion n'est pas encore initialisée. Rechargez la page.")
      return
    }
    setSendError(null)
    setIsSending(true)

    const supabase = createClient()
    const { error } = await supabase.from("messages").insert({
      ticket_id: ticketId,
      sender_id: userId,
      content: content.trim(),
    })

    if (error) {
      setSendError(error.message)
    } else {
      setContent("")
      await loadMessages(ticketId)
    }
    setIsSending(false)
  }

  useEffect(() => {
    initChat()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!ticketId) return
    const interval = setInterval(() => loadMessages(ticketId), 3000)
    return () => clearInterval(interval)
  }, [ticketId])

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  if (initError) {
    return (
      <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-destructive">
        Erreur : {initError}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Messages */}
      <div className="h-80 overflow-y-auto space-y-3 p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:transparent">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-30" />
            <p className="text-sm">Aucun message pour le moment.</p>
            <p className="text-xs">Posez vos questions sur le projet ici.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  {!isMe && (
                    <p className="mb-1 text-xs font-medium opacity-70">TS WEB Lab</p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`mt-1 text-xs ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-border/50 p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Écrivez votre message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e as unknown as React.FormEvent)
              }
            }}
          />
          <Button type="submit" size="icon" className="h-auto glow-primary" disabled={isSending || !content.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {sendError && (
          <p className="mt-1 text-xs text-destructive">{sendError}</p>
        )}
        {!sendError && (
          <p className="mt-1 text-xs text-muted-foreground">Entrée pour envoyer · Maj+Entrée pour sauter une ligne</p>
        )}
      </form>
    </div>
  )
}
