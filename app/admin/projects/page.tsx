import { createClient } from "@/lib/supabase/server"
import { ProjectKanban } from "@/components/admin/project-kanban"

export default async function AdminProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("*, profiles!client_id(full_name, company_name, email)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestion des projets</h1>
        <p className="text-muted-foreground">Organisez et suivez tous vos projets clients.</p>
      </div>

      <ProjectKanban initialProjects={projects || []} />
    </div>
  )
}
