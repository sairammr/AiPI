import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, TrendingUp, Clock } from "lucide-react"

// Mock data for APIs
const mockApis = [
  {
    id: 1,
    name: "GPT Text Analyzer",
    description: "Advanced text analysis and sentiment detection using GPT models",
    category: "NLP",
    costPerRequest: 0.002,
    rating: 4.8,
    requests: 125000,
    isOnline: true,
    tags: ["text-analysis", "sentiment", "gpt"],
  },
  {
    id: 2,
    name: "Image Recognition Pro",
    description: "State-of-the-art image classification and object detection",
    category: "Computer Vision",
    costPerRequest: 0.005,
    rating: 4.9,
    requests: 89000,
    isOnline: true,
    tags: ["image", "classification", "detection"],
  },
  {
    id: 3,
    name: "Voice Synthesis API",
    description: "High-quality text-to-speech with multiple voice options",
    category: "Audio",
    costPerRequest: 0.003,
    rating: 4.7,
    requests: 67000,
    isOnline: false,
    tags: ["tts", "voice", "audio"],
  },
  {
    id: 4,
    name: "Code Generator AI",
    description: "Generate code snippets and complete functions from descriptions",
    category: "Code Generation",
    costPerRequest: 0.004,
    rating: 4.6,
    requests: 156000,
    isOnline: true,
    tags: ["code", "generation", "programming"],
  },
  {
    id: 5,
    name: "Translation Master",
    description: "Multi-language translation with context awareness",
    category: "Translation",
    costPerRequest: 0.001,
    rating: 4.8,
    requests: 203000,
    isOnline: true,
    tags: ["translation", "multilingual", "context"],
  },
  {
    id: 6,
    name: "Data Extractor",
    description: "Extract structured data from unstructured text and documents",
    category: "Data Processing",
    costPerRequest: 0.006,
    rating: 4.5,
    requests: 45000,
    isOnline: true,
    tags: ["data", "extraction", "parsing"],
  },
]

export default function MarketplacePage() {
  const mostUsedApis = mockApis.sort((a, b) => b.requests - a.requests).slice(0, 3)
  const topRatedApis = mockApis.sort((a, b) => b.rating - a.rating).slice(0, 3)
  const recentApis = mockApis.slice(0, 3)

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
              className="pl-12 h-14 text-lg border-4 border-black font-semibold shadow-[4px_4px_0px_0px_#000]"
            />
          </div>
        </div>

        {/* Most Used APIs */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-black">Most Used</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {mostUsedApis.map((api) => (
              <ApiCard key={api.id} api={api} />
            ))}
          </div>
        </section>

        {/* Top Rated APIs */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Star className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-black">Top Rated</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {topRatedApis.map((api) => (
              <ApiCard key={api.id} api={api} />
            ))}
          </div>
        </section>

        {/* Recently Added */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Clock className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-black">Recently Added</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {recentApis.map((api) => (
              <ApiCard key={api.id} api={api} />
            ))}
          </div>
        </section>

        {/* All APIs */}
        <section>
          <h2 className="text-3xl font-black mb-6">All APIs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockApis.map((api) => (
              <ApiCard key={api.id} api={api} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function ApiCard({ api }: { api: any }) {
  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 hover:shadow-[12px_12px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-black">{api.name}</h3>
          <div className={`w-3 h-3 ${api.isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
        </div>
        <Badge className="bg-gray-100 text-black border-2 border-black font-bold">{api.category}</Badge>
      </div>

      <p className="font-semibold text-gray-600 mb-4">{api.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-black text-black" />
          <span className="font-bold">{api.rating}</span>
        </div>
        <span className="font-bold text-black">${api.costPerRequest}/req</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {api.tags.map((tag: string) => (
          <Badge key={tag} variant="outline" className="border-2 border-black font-semibold">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">{api.requests.toLocaleString()} requests</span>
        <Link href={`/api/${api.id}`}>
          <Button className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  )
}
