"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { Send, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  project_id: string | null
  is_read: boolean
  created_at: string
}

interface Project {
  id: string
  name: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // Load projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (projectsData) {
        setProjects(projectsData)
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0].id)
        }
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!selectedProject || !userId) return

      const supabase = createClient()
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("project_id", selectedProject)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: true })

      if (data) {
        setMessages(data)
        // Mark messages as read
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("receiver_id", userId)
          .eq("project_id", selectedProject)
      }
    }

    loadMessages()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${selectedProject}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedProject, userId])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedProject || !userId) return

    const supabase = createClient()
    
    // For now, we'll send to a generic admin (in production, you'd have admin user IDs)
    await supabase.from("messages").insert({
      content: newMessage,
      sender_id: userId,
      receiver_id: userId, // This would be admin ID in production
      project_id: selectedProject,
    })

    setNewMessage("")
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Messages</h1>
          <p className="text-muted-foreground">Communiquez avec notre équipe.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold">Aucun projet</h3>
            <p className="text-muted-foreground">
              Créez un projet pour commencer à discuter avec notre équipe.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Messages</h1>
        <p className="text-muted-foreground">Communiquez avec notre équipe.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Project List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Projets</CardTitle>
            <CardDescription>Sélectionnez un projet</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 p-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    selectedProject === project.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {project.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="flex flex-col lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {projects.find((p) => p.id === selectedProject)?.name || "Messages"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                  <p>Aucun message. Commencez la conversation !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col",
                        message.sender_id === userId ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2",
                          message.sender_id === userId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <Input
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit" size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
