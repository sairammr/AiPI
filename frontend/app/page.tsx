import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, DollarSign } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black"></div>
              <span className="text-2xl font-black">AiPI</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/marketplace" className="font-bold hover:underline">
                Marketplace
              </Link>
              <Link href="/add-api" className="font-bold hover:underline">
                Add API
              </Link>
            </nav>
            <Link href="/marketplace">
              <Button className="bg-black text-white border-4 border-black hover:bg-white hover:text-black font-bold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-black">AiPI</h1>
          <p className="text-2xl md:text-3xl font-bold mb-8 text-black max-w-4xl mx-auto">
            The Ultimate Marketplace for AI-Powered APIs
          </p>
          <p className="text-lg font-semibold mb-12 text-gray-600 max-w-2xl mx-auto">
            Monetize your APIs with x402 payments. Connect AI developers with powerful tools. Build the future of AI
            integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button className="bg-black text-white border-4 border-black hover:bg-white hover:text-black font-bold text-lg px-8 py-4 h-auto shadow-[8px_8px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
                Browse APIs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/add-api">
              <Button className="bg-white text-black border-4 border-black hover:bg-black hover:text-white font-bold text-lg px-8 py-4 h-auto shadow-[8px_8px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
                List Your API
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-16">Why Choose AiPI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000]">
              <Zap className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-black mb-4">Lightning Fast</h3>
              <p className="font-semibold text-gray-600">
                Instant API discovery and integration. Get your AI tools connected in minutes, not hours.
              </p>
            </div>
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000]">
              <Shield className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-black mb-4">Secure & Reliable</h3>
              <p className="font-semibold text-gray-600">
                Built-in verification system and monitoring. Your APIs are protected with enterprise-grade security.
              </p>
            </div>
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000]">
              <DollarSign className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-black mb-4">Monetize Easily</h3>
              <p className="font-semibold text-gray-600">
                x402 payment integration makes monetization seamless. Start earning from your APIs today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to Get Started?</h2>
          <p className="text-xl font-semibold mb-12 max-w-2xl mx-auto text-gray-300">
            Join thousands of developers already using AiPI to power their AI applications.
          </p>
          <Link href="/marketplace">
            <Button className="bg-white text-black border-4 border-white hover:bg-black hover:text-white hover:border-gray-300 font-bold text-xl px-12 py-6 h-auto shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-1 hover:translate-y-1 transition-all">
              Explore Marketplace
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-black"></div>
            <span className="text-xl font-black">AiPI</span>
          </div>
          <p className="font-semibold text-gray-600">© 2024 AiPI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
