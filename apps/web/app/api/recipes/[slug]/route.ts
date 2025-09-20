// app/api/recipes/[slug]/route.ts — robust proxy to the local API
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic" // always run on server, no cache

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8083"

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const upstream = await fetch(`${API_BASE}/api/recipes/${params.slug}`, {
      // ensure we don't cache stale data
      cache: "no-store"
    })

    if (upstream.status === 404) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "")
      return NextResponse.json(
        { error: "Upstream error", status: upstream.status, body: text },
        { status: upstream.status }
      )
    }

    const data = await upstream.json()
    return NextResponse.json(data, { status: 200 })
  } catch (err: any) {
    // surface the real error message to help debugging
    return NextResponse.json(
      { error: err?.message || "fetch failed" },
      { status: 500 }
    )
  }
}
