import { createClient } from '@supabase/supabase-js'

/**
 * Service role client — bypasses RLS.
 * ONLY use in Server Components or API routes, NEVER in client-side code.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
