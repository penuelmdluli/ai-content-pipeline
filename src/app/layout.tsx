import type { Metadata } from "next"
import "./globals.css"
export const metadata: Metadata = {
  title: "AI Content Factory — Faceless Video Pipeline",
  description: "Automated AI video content production pipeline. Scripts, voiceovers, avatars, editing — fully automated."
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
