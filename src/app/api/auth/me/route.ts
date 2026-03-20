import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getAuthClient } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const supabase = getAuthClient()
    // Get the token from cookies to retrieve user info
    const cookieHeader = req.headers.get("cookie") || ""
    const tokenMatch = cookieHeader.match(/sb-access-token=([^;]+)/)
    if (tokenMatch) {
      const { data } = await supabase.auth.getUser(tokenMatch[1])
      return NextResponse.json({ user: data.user })
    }

    return NextResponse.json({ user: { id: userId } })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
