"use client"
import { useState } from "react"
import Link from "next/link"

export default function ContentPipelineHome() {
  return (
    <div className="min-h-screen bg-[#060612] grid-bg">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-[#1a1a1a]">
        <div className="font-black text-xl">🎬 Content<span className="text-[#8B5CF6]">Factory</span></div>
        <div className="flex gap-3">
          <Link href="/dashboard" className="bg-[#8B5CF6] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#7C3AED]">
            Open Dashboard →
          </Link>
        </div>
      </nav>
      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
          3 Videos/Day,<br/><span className="text-[#8B5CF6]">Zero Effort</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-xl mx-auto mb-10">
          Fully automated AI video pipeline. Pick a niche, set a schedule, watch videos publish themselves.
        </p>
        <Link href="/dashboard" className="inline-block bg-[#8B5CF6] text-white font-black px-8 py-4 rounded-xl text-lg hover:bg-[#7C3AED] transition-all hover:scale-105">
          Start Producing →
        </Link>
      </section>
    </div>
  )
}
