"use server"

import { createServiceClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"

export async function deleteProject(projectId: string) {
  const supabase = createServiceClient()
  await supabase.from("projects").delete().eq("id", projectId)
  redirect("/admin/projects")
}

export async function deleteTicket(ticketId: string) {
  const supabase = createServiceClient()
  // Supprimer les messages du ticket d'abord
  await supabase.from("messages").delete().eq("ticket_id", ticketId)
  await supabase.from("support_tickets").delete().eq("id", ticketId)
  redirect("/admin/support")
}

export async function markInvoicePaid(invoiceId: string) {
  const supabase = createServiceClient()
  await supabase.from("invoices").update({ status: "paid" }).eq("id", invoiceId)
  redirect("/admin/invoices")
}
