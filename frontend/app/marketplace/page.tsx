'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star } from "lucide-react"

import { useEffect, useState } from "react"

export default function MarketplacePage() {
  const [marketplace, setMarketplace] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021"}/listings`)
        const data = await res.json()
        if (!data.listings) throw new Error("No listings found")
        const fetched = await Promise.all(
          data.listings.map(async (item: { cid: string, timestamp: number }) => {
            try {
              const ipfsRes = await fetch(`https://gateway.pinata.cloud/ipfs/${item.cid}`)
              if (!ipfsRes.ok) throw new Error("Not found on IPFS")
              const ipfsData = await ipfsRes.json()
              return { ...ipfsData, cid: item.cid, timestamp: item.timestamp }
            } catch {
              return { cid: item.cid, timestamp: item.timestamp, error: "Could not fetch from IPFS" }
            }
          })
        )
        setMarketplace(fetched)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  const filtered = (() => {
    const seen = new Set<string>()
    return marketplace.filter(api => {
      if (!api.cid || seen.has(api.cid)) return false
      seen.add(api.cid)
      if (!search) return true
      return (
        (api.name && api.name.toLowerCase().includes(search.toLowerCase())) ||
        (api.description && api.description.toLowerCase().includes(search.toLowerCase())) ||
        (api.category && api.category.toLowerCase().includes(search.toLowerCase())) ||
        (api.tags && api.tags.toLowerCase().includes(search.toLowerCase()))
      )
    })
  })()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black"></div>
              <span className="text-2xl font-black">AiPI</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/marketplace" className="font-bold underline">
                Marketplace
              </Link>
              <Link href="/add-api" className="font-bold hover:underline">
                Add API
              </Link>
            </nav>
            <Link href="/add-api">
              <Button className="bg-black text-white border-4 border-black hover:bg-white hover:text-black font-bold">
                List Your API
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-8 text-center">API Marketplace</h1>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6" />
            <Input
              placeholder="Search APIs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 h-14 text-lg border-4 border-black font-semibold shadow-[4px_4px_0px_0px_#000]"
            />
          </div>
        </div>

        {/* Live Marketplace APIs */}
        <section>
          <h2 className="text-3xl font-black mb-6">All APIs</h2>
          {loading && <div className="text-center">Loading APIs...</div>}
          {error && <div className="text-center text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length === 0 && <div className="col-span-3 text-center text-gray-500">No APIs found.</div>}
              {filtered.map((api, i) => (
                <ApiCard key={api.cid || i} api={api} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ApiCard({ api }: { api: any }) {
  const tagsArray = typeof api.tags === "string"
    ? api.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : Array.isArray(api.tags) ? api.tags : [];

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 hover:shadow-[12px_12px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col">
          <h3 className="text-xl font-black mb-1">{api.name || "Untitled API"}</h3>
          <span className="text-xs text-gray-400 break-all">CID: {api.cid || "-"}</span>
        </div>
        <Badge className="bg-gray-100 text-black border-2 border-black font-bold">{api.category || "-"}</Badge>
      </div>
      <div className="mb-2 text-xs text-gray-400">{api.timestamp ? new Date(api.timestamp).toLocaleString() : ""}</div>
      <div className="mb-2 text-gray-600">{api.description || "No description."}</div>
      <div className="mb-2"><span className="font-semibold">Endpoint:</span> <span className="font-mono">{api.endpoint || "-"}</span></div>
      <div className="mb-2"><span className="font-semibold">Cost:</span> {api.costPerRequest ? `$${api.costPerRequest}` : "-"}</div>
      <div className="mb-2"><span className="font-semibold">Docs:</span> {api.documentation ? <a href={api.documentation} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{api.documentation}</a> : "-"}</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tagsArray.length > 0 ? tagsArray.map((tag: string) => (
          <Badge key={tag} variant="outline" className="border-2 border-black font-semibold">
            {tag}
          </Badge>
        )) : <span className="text-xs text-gray-400">No tags</span>}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Link href={`/api/${api.cid}`}>
          <Button className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold">
            View Details
          </Button>
        </Link>
        <Link href={`/analytics?apiId=${encodeURIComponent(api.cid)}`}>
          <Button className="bg-blue-600 text-white border-2 border-black hover:bg-white hover:text-blue-600 font-bold">
            Stats
          </Button>
        </Link>
      </div>
    </div>
  )
}
