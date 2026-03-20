import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

// GET /api/schedule - List schedule entries
export async function GET(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("publish_schedule")
      .select("*, video_jobs(*, scripts(topic, niche))")
      .eq("user_id", userId)
      .order("scheduled_for", { ascending: true })
      .limit(100)

    if (error) {
      console.error("Fetch schedule error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entries: data })
  } catch (err) {
    console.error("GET /api/schedule error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/schedule - Create a schedule entry
export async function POST(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { video_job_id, platforms, scheduled_for } = await req.json()

    if (!scheduled_for) {
      return NextResponse.json({ error: "scheduled_for is required" }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("publish_schedule")
      .insert({
        video_job_id: video_job_id || null,
        user_id: userId,
        platforms: platforms || ["tiktok", "youtube_shorts"],
        scheduled_for,
        status: "scheduled",
      })
      .select()
      .single()

    if (error) {
      console.error("Create schedule error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entry: data }, { status: 201 })
  } catch (err) {
    console.error("POST /api/schedule error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
