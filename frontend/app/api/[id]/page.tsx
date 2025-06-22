"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Globe, DollarSign, Activity, Copy, ExternalLink } from "lucide-react"

import { useEffect, useState } from "react"

const mockApi = {
  rating: 4.8,
  requests: 125000,
  isOnline: true,
  provider: "AI Solutions Inc.",
  version: "1.2.0",
  responseTime: "150ms",
  uptime: "99.9%",
  features: [
    "Sentiment Analysis",
    "Emotion Detection",
    "Key Phrase Extraction",
    "Content Classification",
    "Language Detection",
    "Toxicity Detection",
  ],
}


import { use as usePromise } from "react"

export default function ApiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cid } = usePromise(params)
  const [api, setApi] = useState<any>(mockApi)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApi() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
        if (!res.ok) throw new Error("Could not fetch from IPFS")
        const data = await res.json()
        setApi({ ...mockApi, ...data })
      } catch (err: any) {
        setError(err.message || "Unknown error")
        setApi(mockApi)
      } finally {
        setLoading(false)
      }
    }
    fetchApi()
  }, [cid])

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
              <Link href="/marketplace" className="font-bold hover:underline">
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
        {/* API Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/marketplace" className="text-black hover:underline font-semibold">
              ← Back to Marketplace
            </Link>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl md:text-6xl font-black">{api.name}</h1>
                <div className={`w-4 h-4 ${api.isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
              </div>
              <p className="text-xl font-semibold text-gray-600 mb-4">{api.description}</p>
              <div className="flex items-center space-x-4">
                <Badge className="bg-gray-100 text-black border-2 border-black font-bold text-lg px-3 py-1">
                  {api.category}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-black text-black" />
                  <span className="font-bold text-lg">{api.rating}</span>
                </div>
                <span className="font-bold text-lg">{api.requests.toLocaleString()} requests</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(
              typeof api.tags === "string"
                ? api.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : Array.isArray(api.tags)
                  ? api.tags
                  : []
            ).map((tag: string) => (
              <Badge key={tag} variant="outline" className="border-2 border-black font-semibold">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 border-4 border-black bg-white">
                <TabsTrigger
                  value="overview"
                  className="font-bold data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="documentation"
                  className="font-bold data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Documentation
                </TabsTrigger>
                <TabsTrigger
                  value="pricing"
                  className="font-bold data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Pricing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black">API Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-black text-lg mb-2">Provider</h3>
                        <p className="font-semibold text-gray-600">{mockApi.provider}</p>
                      </div>
                      <div>
                        <h3 className="font-black text-lg mb-2">Version</h3>
                        <p className="font-semibold text-gray-600">{mockApi.version}</p>
                      </div>
                      <div>
                        <h3 className="font-black text-lg mb-2">Response Time</h3>
                        <p className="font-semibold text-gray-600">{mockApi.responseTime}</p>
                      </div>
                      <div>
                        <h3 className="font-black text-lg mb-2">Uptime</h3>
                        <p className="font-semibold text-gray-600">{mockApi.uptime}</p>
                      </div>
                    </div>

                    <h3 className="font-black text-lg mb-4">Features</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {mockApi.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-black"></div>
                          <span className="font-semibold text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentation" className="mt-6">
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black">API Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-black text-lg mb-2">Endpoint</h3>
                        <div className="bg-gray-50 border-2 border-black p-4 font-mono font-semibold flex items-center justify-between">
                          <span>{api.endpoint}</span>
                          <Button
                            size="sm"
                            className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-black text-lg mb-2">Example Request</h3>
                        <div className="bg-gray-50 border-2 border-black p-4 font-mono text-sm">
                          <pre>{`curl -X POST "${api.endpoint}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "I love this product!",
    "analysis_type": "sentiment"
  }'`}</pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-black text-lg mb-2">Example Response</h3>
                        <div className="bg-gray-50 border-2 border-black p-4 font-mono text-sm">
                          <pre>{`{
  "sentiment": "positive",
  "confidence": 0.95,
  "emotions": {
    "joy": 0.8,
    "trust": 0.6
  },
  "key_phrases": ["love", "product"]
}`}</pre>
                        </div>
                      </div>

                      {api.documentation ? (
                        <Link href={api.documentation as string} target="_blank">
                          <Button className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold">
                            Full Documentation
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="mt-6">
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black">Pricing Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-black mb-2">${api.costPerRequest}</div>
                      <div className="text-lg font-semibold text-gray-600">per request</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b-2 border-gray-200">
                        <span className="font-semibold">1- infinite requests</span>
                        <span className="font-bold">${api.costPerRequest}/req</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 border-2 border-black">
                      <p className="font-semibold">
                        💡 <strong>Volume Discounts:</strong> Automatically applied based on monthly usage
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Using Section */}
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Start Using Now</CardTitle>
                <CardDescription className="font-semibold text-gray-600">
                  Get started with this API in minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="font-bold text-sm mb-2 block">API Endpoint</label>
                  <div className="bg-gray-50 border-2 border-black p-3 font-mono text-sm flex items-center justify-between">
                    <span className="truncate">https://aipi-marketplace.vercel.app?id={cid}</span>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://aipi-marketplace.vercel.app?id=${cid}`
                          )
                        }}
                        className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                  </div>
                </div>

                {api.documentation ? (
                  <Link href={api.documentation as string} target="_blank">
                    <Button
                      variant="outline"
                      className="w-full border-2 mt-4 border-black font-bold hover:bg-black hover:text-white"
                    >
                    View Documentation
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                ) : null}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-black">API Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span className="font-semibold">Status</span>
                  </div>
                  <Badge
                    className={`${mockApi.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} border-2 border-black font-bold`}
                  >
                    {mockApi.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span className="font-semibold">Uptime</span>
                  </div>
                  <span className="font-bold">{mockApi.uptime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">Total Requests</span>
                  </div>
                  <span className="font-bold">{mockApi.requests.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
