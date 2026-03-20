import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

// GET /api/video-jobs - List all video jobs for the user
export async function GET(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("video_jobs")
      .select("*, scripts(topic, niche, content)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Fetch video jobs error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ jobs: data })
  } catch (err) {
    console.error("GET /api/video-jobs error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
