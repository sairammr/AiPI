"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Loader2, GitCommitVertical, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useSearchParams } from "next/navigation";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// If you need ChartTooltip, ChartLegend, etc., import them as well
// import { ChartTooltip, ChartLegend } from "@/components/ui/chart";

// ChartContainer is the main chart wrapper. We'll use it below as <ChartContainer> instead of <Chart>.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021";

export default function AnalyticsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const apiId = searchParams.get("apiId") || "";
  const [error, setError] = useState("");

  const [avgResponse, setAvgResponse] = useState<number | null>(null);
  const [successRate, setSuccessRate] = useState<number | null>(null);
  const [totalRequests, setTotalRequests] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("Unknown");

  useEffect(() => {
    if (!apiId) return;
    setLoading(true);
    fetch(`${API_URL}/usage/${apiId}`)
      .then((res) => res.json())
      .then((data) => {
        const usageLogs = data.usage || [];
        setLogs(usageLogs);
        setLoading(false);
        setError("");
        if (usageLogs.length > 0) {
          const times = usageLogs.map((l: any) => l.responseTimeMs);
          const avg = times.reduce((a: number, b: number) => a + b, 0) / times.length;
          setAvgResponse(avg);
          const successes = usageLogs.filter((l: any) => l.responseStatus >= 200 && l.responseStatus < 300).length;
          setSuccessRate((successes / usageLogs.length) * 100);
          setTotalRequests(usageLogs.length);
          setStatus(successes / usageLogs.length > 0.95 ? "Healthy" : "Unhealthy");
        } else {
          setAvgResponse(null);
          setSuccessRate(null);
          setTotalRequests(null);
          setStatus("No Data");
        }
      })
      .catch((err) => {
        setError("Failed to fetch analytics");
        setLoading(false);
      });
  }, [apiId]);



  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black"></div>
              <span className="text-2xl font-black">AiPI</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="/marketplace" className="font-bold hover:underline">Marketplace</a>
              <a href="/add-api" className="font-bold hover:underline">Add API</a>
              <a href="/analytics" className="font-bold underline">Analytics</a>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>API Analytics</CardTitle>
            <CardDescription>Monitor your API usage, health, and performance metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            {!apiId && (
              <div className="mb-4 text-red-600 font-bold">No API selected. Please navigate from the marketplace.</div>
            )}
            {loading && (
              <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> Loading...</div>
            )}
            {error && <div className="text-red-600 font-bold">{error}</div>}
            {!loading && !error && logs && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-50 border-2 border-black p-4 rounded">
                    <div className="font-bold text-lg">Total Requests</div>
                    <div className="text-2xl font-black">{totalRequests ?? "-"}</div>
                  </div>
                  <div className="bg-gray-50 border-2 border-black p-4 rounded">
                    <div className="font-bold text-lg">Avg. Response Time</div>
                    <div className="text-2xl font-black">{avgResponse ? `${avgResponse.toFixed(1)} ms` : "-"}</div>
                  </div>
                  <div className="bg-gray-50 border-2 border-black p-4 rounded">
                    <div className="font-bold text-lg">Success Rate</div>
                    <div className="text-2xl font-black">{successRate ? `${successRate.toFixed(1)}%` : "-"}</div>
                  </div>
                  <div className="bg-gray-50 border-2 border-black p-4 rounded flex flex-col items-start">
                    <div className="font-bold text-lg">Status</div>
                    <Badge className={status === "Healthy" ? "bg-green-200 text-green-900 border-black border-2" : "bg-red-200 text-red-900 border-black border-2"}>{status}</Badge>
                  </div>
                </div>
                <div className="my-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Usage Over Time</CardTitle>
                      <CardDescription>Recent request response times</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{ response: { label: "Response Time", color: "grey" } }}>
                        <LineChart
                          data={logs.map(log => ({
                            x: log.timestamp,
                            response: log.responseTimeMs,
                          }))}
                          margin={{ left: 12, right: 12 }}
                        >
                          <CartesianGrid vertical={false} stroke="#000" strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="x"
                            tickLine={{stroke: '#000'}}
                            axisLine={{stroke: '#000'}}
                            tickMargin={8}
                            tickFormatter={x => {
                              const date = new Date(x);
                              return isNaN(date.getTime()) ? x : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Line
                            dataKey="response"
                            type="natural"
                            stroke="grey"
                            strokeWidth={2}
                            dot={({ cx, cy, payload }) => {
                              const r = 16;
                              return (
                                <GitCommitVertical
                                  key={payload.x}
                                  x={cx - r / 2}
                                  y={cy - r / 2}
                                  width={r}
                                  height={r}
                                  fill="black"
                                  stroke="black"
                                />
                              );
                            }}
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                      <div className="flex gap-2 leading-none font-medium">
                        Trending up by {successRate ? successRate.toFixed(1) : "-"}% this month <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="text-muted-foreground leading-none">
                        Showing recent API request response times
                      </div>
                    </CardFooter>
                  </Card>
                </div>
                <div className="my-8">
                  <div className="font-bold text-lg mb-2">Status Codes</div>
                  <ChartContainer config={{ bar: { color: "#111" } }}>
                    <BarChart data={Object.entries(
                      logs.reduce((acc, l) => {
                        acc[l.responseStatus] = (acc[l.responseStatus] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([status, count]) => ({ status, count }))}>
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#111" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
