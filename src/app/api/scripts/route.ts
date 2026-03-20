import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

// POST /api/scripts - Save a generated script
export async function POST(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { niche, language, tone, topic, content, hook, body, cta } = await req.json()
    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("scripts")
      .insert({
        user_id: userId,
        niche: niche || "General",
        language: language || "english",
        tone: tone || "educational",
        topic: topic || null,
        content,
        hook: hook || null,
        body: body || null,
        cta: cta || null,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Insert script error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ script: data }, { status: 201 })
  } catch (err) {
    console.error("POST /api/scripts error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/scripts - Fetch script history with optional filters
export async function GET(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const niche = searchParams.get("niche")
    const language = searchParams.get("language")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    const supabase = createServerClient()
    let query = supabase
      .from("scripts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (niche) query = query.eq("niche", niche)
    if (language) query = query.eq("language", language)
    if (status) query = query.eq("status", status)

    const { data, error } = await query

    if (error) {
      console.error("Fetch scripts error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ scripts: data })
  } catch (err) {
    console.error("GET /api/scripts error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
