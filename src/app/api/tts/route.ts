import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

// POST /api/tts - Generate speech from script text via ElevenLabs
export async function POST(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, voice_id, language, script_id } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
    }

    // Default voice IDs for different languages
    const defaultVoices: Record<string, string> = {
      English: "21m00Tcm4TlvDq8ikWAM",   // Rachel
      Zulu: "21m00Tcm4TlvDq8ikWAM",
      Sotho: "21m00Tcm4TlvDq8ikWAM",
      Afrikaans: "21m00Tcm4TlvDq8ikWAM",
      Xhosa: "21m00Tcm4TlvDq8ikWAM",
    }

    const selectedVoice = voice_id || defaultVoices[language] || defaultVoices.English

    // Call ElevenLabs TTS API
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!ttsResponse.ok) {
      const errBody = await ttsResponse.text()
      console.error("ElevenLabs error:", errBody)
      return NextResponse.json(
        { error: `ElevenLabs API error: ${ttsResponse.status}` },
        { status: 502 }
      )
    }

    // Get the audio as a buffer
    const audioBuffer = await ttsResponse.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`

    // If script_id is provided, create a video_job and update script status
    const supabase = createServerClient()
    let videoJob = null

    if (script_id) {
      // Update script status to 'voiced'
      await supabase
        .from("scripts")
        .update({ status: "voiced" })
        .eq("id", script_id)
        .eq("user_id", userId)

      // Create a video job
      const { data: job, error: jobError } = await supabase
        .from("video_jobs")
        .insert({
          script_id,
          user_id: userId,
          voice_url: audioDataUrl.slice(0, 200) + "...[base64]", // Store reference
          status: "voicing",
        })
        .select()
        .single()

      if (jobError) {
        console.error("Video job creation error:", jobError)
      } else {
        videoJob = job
      }
    }

    return NextResponse.json({
      audio_url: audioDataUrl,
      video_job: videoJob,
      message: "Audio generated successfully",
    })
  } catch (err) {
    console.error("POST /api/tts error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
