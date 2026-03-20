import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

// PUT /api/schedule/[id] - Update a schedule entry
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await req.json()
    const allowedFields = ["scheduled_for", "platforms", "status"]
    const filtered: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (updates[key] !== undefined) filtered[key] = updates[key]
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("publish_schedule")
      .update(filtered)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entry: data })
  } catch (err) {
    console.error("PUT /api/schedule/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/schedule/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from("publish_schedule")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/schedule/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
