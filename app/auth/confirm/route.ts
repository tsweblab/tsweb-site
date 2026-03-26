import { type EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/dashboard"

  if (token_hash && type) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error && data.user) {
      // Vérifier le rôle pour rediriger au bon endroit
      const serviceSupabase = createServiceClient()
      const { data: profile } = await serviceSupabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      const redirectTo = profile?.role === "admin" ? "/admin" : next
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  return NextResponse.redirect(new URL("/auth/error", request.url))
}
