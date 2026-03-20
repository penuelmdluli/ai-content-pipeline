import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

// PUT /api/scripts/[id] - Update script status or content
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await req.json()
    const allowedFields = ["status", "content", "hook", "body", "cta", "topic", "niche", "language", "tone"]
    const filtered: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (updates[key] !== undefined) filtered[key] = updates[key]
    }

    if (Object.keys(filtered).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("scripts")
      .update(filtered)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Update script error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    return NextResponse.json({ script: data })
  } catch (err) {
    console.error("PUT /api/scripts/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/scripts/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from("scripts")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId)

    if (error) {
      console.error("Delete script error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/scripts/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
