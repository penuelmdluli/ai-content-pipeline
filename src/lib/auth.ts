import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export function getAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getSessionFromCookie() {
  const cookieStore = cookies()
  const token = cookieStore.get("sb-access-token")?.value
  const refresh = cookieStore.get("sb-refresh-token")?.value
  if (!token) return null

  const supabase = getAuthClient()
  const { data, error } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: refresh || "",
  })
  if (error) return null
  return data.session
}

export async function getUserFromRequest(req: Request): Promise<string | null> {
  // Check Authorization header first
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    const supabase = getAuthClient()
    const { data } = await supabase.auth.getUser(token)
    return data.user?.id || null
  }

  // Check cookies
  const session = await getSessionFromCookie()
  return session?.user?.id || null
}
