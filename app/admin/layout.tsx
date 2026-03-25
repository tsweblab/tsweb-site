import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Vérifier si l'utilisateur est authentifié
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 2. Vérifier le rôle 'admin' dans la table profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // 3. Sécurité stricte : si pas admin, redirection immédiate
  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="admin-container">
      {/* Tu peux ajouter ici ta Sidebar Admin ou ton Header Admin spécifique */}
      <main>{children}</main>
    </div>
  )
}