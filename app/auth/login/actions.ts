'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'

export async function loginAction(email: string, password: string): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Service role bypasses RLS — fiable peu importe les politiques
  const serviceSupabase = createServiceClient()
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}
