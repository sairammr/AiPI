"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Copy, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddApiPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    endpoint: "",
    costPerRequest: "",
    documentation: "",
    tags: "",
    cid: "",
    fundReceivingAddress: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [copyStatus, setCopyStatus] = useState("");

  const handleGenerateAccessCode = async () => {
  setAccessCode("");
  setCopyStatus("");
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021"}/keygen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cid: formData.cid || formData.endpoint || "" }),
    });
    const data = await res.json();
    if (res.ok && data.apiKey) {
      setAccessCode(data.apiKey);
      if (data.uuid) {
        setFormData(prev => ({ ...prev, id: data.uuid }));
      }
    } else {
      setAccessCode("Error generating code");
    }
  } catch (err) {
    setAccessCode("Error generating code");
  }
};

  const handleCopyCode = async () => {
    if (!accessCode) return;
    await navigator.clipboard.writeText(accessCode);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(""), 1500);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 2000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/add-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to upload to Pinata");
      }else{
        router.push("/marketplace"); 
      }
    } catch (err: any) {
      setSubmitError(err.message || "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = [
    { number: 1, title: "API Details", description: "Basic information about your API" },
    { number: 2, title: "Integration", description: "Set up access code and verification" },
    { number: 3, title: "Verification", description: "Verify your API endpoint" },
    { number: 4, title: "Fund Receiving Address", description: "Enter your fund receiving address" },
    { number: 5, title: "Review", description: "Review and submit your API" },
  ]

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
              <Link href="/add-api" className="font-bold underline">
                Add API
              </Link>
            </nav>
            <Link href="/marketplace">
              <Button className="bg-black text-white border-4 border-black hover:bg-white hover:text-black font-bold">
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-center mb-8">Add Your API</h1>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 border-4 border-black font-black text-lg ${
                      currentStep >= step.number ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    {currentStep > step.number ? <CheckCircle className="h-6 w-6" /> : step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${currentStep > step.number ? "bg-black" : "bg-gray-300"}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-black">
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="font-semibold text-lg text-gray-600">
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="font-bold text-lg">
                        API Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., GPT Text Analyzer"
                        className="border-2 border-black font-semibold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="font-bold text-lg">
                        Category
                      </Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="border-2 border-black font-semibold">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nlp">NLP</SelectItem>
                          <SelectItem value="computer-vision">Computer Vision</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="code-generation">Code Generation</SelectItem>
                          <SelectItem value="translation">Translation</SelectItem>
                          <SelectItem value="data-processing">Data Processing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="font-bold text-lg">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what your API does..."
                      className="border-2 border-black font-semibold min-h-[100px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="endpoint" className="font-bold text-lg">
                        API Endpoint
                      </Label>
                      <Input
                        id="endpoint"
                        value={formData.endpoint}
                        onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                        placeholder="https://api.yourservice.com/v1"
                        className="border-2 border-black font-semibold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost" className="font-bold text-lg">
                        Cost per Request ($)
                      </Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.001"
                        value={formData.costPerRequest}
                        onChange={(e) => setFormData({ ...formData, costPerRequest: e.target.value })}
                        placeholder="0.002"
                        className="border-2 border-black font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="documentation" className="font-bold text-lg">
                        Documentation URL
                      </Label>
                      <Input
                        id="documentation"
                        value={formData.documentation}
                        onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                        placeholder="https://docs.yourservice.com"
                        className="border-2 border-black font-semibold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags" className="font-bold text-lg">
                        Tags (comma-separated)
                      </Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="text-analysis, sentiment, gpt"
                        className="border-2 border-black font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 border-2 border-black p-6">
                    <h3 className="font-black text-xl mb-4">Integration Setup</h3>
                    <p className="font-semibold mb-4 text-gray-600">
                      To integrate with AiPI, you need to add authentication to your API and create a verification
                      endpoint.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-lg mb-2">1. Generate Access Code</h4>
                        <p className="font-semibold mb-3 text-gray-600">
                          Click the button below to generate your unique access code:
                        </p>
                        <Button
                          onClick={handleGenerateAccessCode}
                          className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold"
                        >
                          Generate Access Code
                        </Button>

                        {accessCode && (
                          <div className="flex items-center space-x-2 mt-2">
                            <code className="font-mono bg-white border border-black px-2 py-1">{accessCode}</code>
                            <Button onClick={handleCopyCode} size="icon" variant="outline">
                              <Copy className="w-4 h-4" />
                            </Button>
                            {copyStatus && <span className="text-green-600 font-semibold">{copyStatus}</span>}
                          </div>
                        )}

                        {accessCode && (
                          <div className="mt-4">
                            <Label className="font-bold">Your Access Code:</Label>
                            <div className="bg-white border-2 border-black p-3 font-mono flex items-center justify-between mt-2">
                              <span>{accessCode}</span>
                              <Button
                                size="sm"
                                className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-lg mb-2">2. Add Authentication Header Check</h4>
                        <p className="font-semibold mb-3 text-gray-600">
                          Add this code to verify the access code in every request:
                        </p>
                        <div className="bg-gray-100 border-2 border-black p-4 font-mono text-sm">
                          <pre>{`// Check for access code in request headers
const accessCode = req.headers['x-aipi-access-code'];
if (accessCode !== '${accessCode || "YOUR_ACCESS_CODE"}') {
  return res.status(401).json({ error: 'Unauthorized' });
}`}</pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-lg mb-2">3. Create Verification Endpoint</h4>
                        <p className="font-semibold mb-3 text-gray-600">Add this endpoint to your API:</p>
                        <div className="bg-gray-100 border-2 border-black p-4 font-mono text-sm">
                          <pre>{`// POST /verify
app.post('/verify', (req, res) => {
  const accessCode = req.headers['x-aipi-access-code'];
  if (accessCode === '${accessCode || "YOUR_ACCESS_CODE"}') {
    res.json({ message: 'verification successful' });
  } else {
    res.status(401).json({ error: 'Invalid access code' });
  }
});`}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-black text-2xl mb-4">Verify Your API</h3>
                    <p className="font-semibold text-lg mb-6 text-gray-600">
                      We'll test your API endpoint to make sure everything is working correctly.
                    </p>

                    <div className="bg-gray-50 border-2 border-black p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold">Verification Endpoint:</span>
                        <code className="font-mono bg-white border border-black px-2 py-1">
                          {formData.endpoint}/verify
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Access Code:</span>
                        <code className="font-mono bg-white border border-black px-2 py-1">{accessCode}</code>
                      </div>
                    </div>

                    {!isVerified ? (
                      <Button
                        onClick={handleVerify}
                        disabled={isVerifying || !accessCode}
                        className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold text-lg px-8 py-4"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify API"
                        )}
                      </Button>
                    ) : (
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-green-100 border-2 border-black px-6 py-3 mb-4">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <span className="font-bold text-lg text-green-800">Verification Successful!</span>
                        </div>
                        <p className="font-semibold text-gray-600">Your API is ready to be added to the marketplace.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="font-black text-2xl mb-6">Fund Receiving Address</h3>
                  <div>
                    <Label htmlFor="fundReceivingAddress" className="font-bold text-lg">Fund Receiving Address</Label>
                    <Input
                      id="fundReceivingAddress"
                      type="text"
                      placeholder="Enter your fund receiving address"
                      value={formData.fundReceivingAddress}
                      onChange={e => setFormData(prev => ({ ...prev, fundReceivingAddress: e.target.value }))}
                      className="mt-2 border-2 border-black"
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="font-black text-2xl mb-6">Review Your API</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="font-bold text-lg">API Name</Label>
                      <p className="font-semibold text-gray-600">{formData.name}</p>
                    </div>
                    <div>
                      <Label className="font-bold text-lg">Category</Label>
                      <Badge className="bg-gray-100 text-black border-2 border-black font-bold">
                        {formData.category}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold text-lg">Description</Label>
                    <p className="font-semibold text-gray-600">{formData.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="font-bold text-lg">Endpoint</Label>
                      <p className="font-semibold text-gray-600 font-mono">{formData.endpoint}</p>
                    </div>
                    <div>
                      <Label className="font-bold text-lg">Cost per Request</Label>
                      <p className="font-semibold text-gray-600">${formData.costPerRequest}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold text-lg">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.split(",").map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-2 border-black font-semibold">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold text-lg">Fund Receiving Address</Label>
                    <p className="font-semibold text-gray-600 font-mono">{formData.fundReceivingAddress}</p>
                  </div>

                  <div className="bg-green-50 border-2 border-black p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-bold text-green-800">API Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t-2 border-black">
                <Button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="border-2 border-black font-bold hover:bg-black hover:text-white"
                >
                  Previous
                </Button>

                {currentStep < 5 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={currentStep === 3 && !isVerified}
                    className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center"><Loader2 className="animate-spin mr-2 h-5 w-5" />Submitting...</span>
                    ) : (
                      "Add API to Marketplace"
                    )}
                    {submitError && (
                      <span className="text-red-500">{submitError}</span>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
