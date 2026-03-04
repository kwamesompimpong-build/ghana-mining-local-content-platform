"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceScoreCard } from "@/components/dashboard/compliance-score-card";
import { StatCard } from "@/components/dashboard/stat-card";

// Demo analytics data (would be fetched from /api/analytics in production)
const ANALYTICS_DATA = {
  overallCompliance: 74,
  localSpendRatio: 68,
  employmentLocalization: 82,
  expatriateCompliance: 61,
  suppliersByTier: [
    { tier: "Wholly Ghanaian", count: 52, pct: 41 },
    { tier: "Majority Ghanaian JV", count: 31, pct: 24 },
    { tier: "Minority Ghanaian JV", count: 18, pct: 14 },
    { tier: "Foreign with Local", count: 15, pct: 12 },
    { tier: "Foreign Incorporated", count: 11, pct: 9 },
  ],
  localSpendByQuarter: [
    { period: "2025-Q1", ratio: 58, total: 42.3, local: 24.5 },
    { period: "2025-Q2", ratio: 62, total: 45.1, local: 28.0 },
    { period: "2025-Q3", ratio: 66, total: 48.7, local: 32.1 },
    { period: "2025-Q4", ratio: 68, total: 51.2, local: 34.8 },
  ],
  expatriatesByCategory: [
    { category: "Executive Management", count: 45, withSuccession: 32 },
    { category: "Technical Professional", count: 128, withSuccession: 89 },
    { category: "Supervisory", count: 95, withSuccession: 67 },
    { category: "Skilled Trade", count: 74, withSuccession: 41 },
  ],
  topCompliantCompanies: [
    { name: "Newmont Ahafo", score: 85, trend: 3 },
    { name: "Gold Fields Ghana", score: 78, trend: 5 },
    { name: "Abosso Goldfields", score: 75, trend: -2 },
    { name: "AngloGold Ashanti Obuasi", score: 71, trend: 4 },
    { name: "Golden Star Resources", score: 67, trend: 1 },
  ],
  spendByCategory: [
    { category: "Mining Services", total: 12.4, local: 9.7, pct: 78 },
    { category: "Equipment Supply", total: 28.1, local: 12.6, pct: 45 },
    { category: "Transport & Logistics", total: 5.6, local: 5.0, pct: 89 },
    { category: "Construction", total: 8.3, local: 6.0, pct: 72 },
    { category: "Consumables", total: 3.2, local: 2.1, pct: 65 },
    { category: "Camp Management", total: 4.8, local: 4.3, pct: 90 },
    { category: "IT & Telecom", total: 2.1, local: 0.8, pct: 38 },
    { category: "Environmental", total: 1.9, local: 1.5, pct: 79 },
  ],
};

export default function AnalyticsPage() {
  const data = ANALYTICS_DATA;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Sector-wide local content compliance analytics and reporting</p>
      </div>

      {/* Top-level compliance gauges */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceScoreCard score={data.overallCompliance} label="Overall Compliance" description="Weighted sector average" />
        <ComplianceScoreCard score={data.localSpendRatio} label="Local Spend Ratio" description="% spent with local suppliers" />
        <ComplianceScoreCard score={data.employmentLocalization} label="Employment Localization" description="Ghanaian employee ratio" />
        <ComplianceScoreCard score={data.expatriateCompliance} label="Expatriate Compliance" description="Quota adherence rate" />
      </div>

      <Tabs defaultValue="spend">
        <TabsList>
          <TabsTrigger value="spend">Local Spend</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analysis</TabsTrigger>
          <TabsTrigger value="expatriates">Expatriate Analytics</TabsTrigger>
          <TabsTrigger value="leaderboard">Compliance Leaderboard</TabsTrigger>
        </TabsList>

        {/* Local Spend Tab */}
        <TabsContent value="spend" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Local Spend Trend by Quarter</CardTitle>
                <CardDescription>Aggregate local procurement ratio over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.localSpendByQuarter.map((q) => (
                    <div key={q.period} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{q.period}</span>
                        <span>GHS {q.local}M / {q.total}M ({q.ratio}%)</span>
                      </div>
                      <div className="h-6 rounded-full bg-muted overflow-hidden flex">
                        <div className="h-full bg-green-500 rounded-l-full flex items-center justify-center text-xs text-white font-medium" style={{ width: `${q.ratio}%` }}>
                          {q.ratio}%
                        </div>
                        <div className="h-full bg-red-200 flex-1" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-green-500" />Local Spend</div>
                  <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-red-200" />Foreign Spend</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
                <CardDescription>Local spend ratio by service category (GHS millions)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.spendByCategory.map((c) => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{c.category}</span>
                        <span className="text-muted-foreground">GHS {c.total}M ({c.pct}% local)</span>
                      </div>
                      <Progress value={c.pct} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Supplier Analysis Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ownership Distribution</CardTitle>
                <CardDescription>Registered suppliers by L.I. 2431 ownership tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.suppliersByTier.map((t) => {
                    const colors = ["bg-green-500", "bg-emerald-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"];
                    const idx = data.suppliersByTier.indexOf(t);
                    return (
                      <div key={t.tier} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{t.tier}</span>
                          <span className="font-medium">{t.count} ({t.pct}%)</span>
                        </div>
                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${colors[idx]}`} style={{ width: `${t.pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
                  <p><strong>Total registered:</strong> {data.suppliersByTier.reduce((s, t) => s + t.count, 0)}</p>
                  <p><strong>Ghanaian-majority (51%+):</strong> {data.suppliersByTier[0].count + data.suppliersByTier[1].count} ({Math.round(((data.suppliersByTier[0].count + data.suppliersByTier[1].count) / data.suppliersByTier.reduce((s, t) => s + t.count, 0)) * 100)}%)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supplier Qualification Summary</CardTitle>
                <CardDescription>Average scores across all registered suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Ownership Score", avg: 68 },
                    { label: "Employment Score", avg: 72 },
                    { label: "Procurement Score", avg: 55 },
                    { label: "Capacity Score", avg: 61 },
                    { label: "Documentation Score", avg: 78 },
                  ].map((s) => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{s.label}</span>
                        <span className="font-medium">{s.avg}/100</span>
                      </div>
                      <Progress value={s.avg} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expatriate Analytics Tab */}
        <TabsContent value="expatriates" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Expatriates" value={data.expatriatesByCategory.reduce((s, c) => s + c.count, 0)} icon={Users} />
            <StatCard title="With Succession Plans" value={data.expatriatesByCategory.reduce((s, c) => s + c.withSuccession, 0)} icon={Users} />
            <StatCard title="Succession Coverage" value={`${Math.round((data.expatriatesByCategory.reduce((s, c) => s + c.withSuccession, 0) / data.expatriatesByCategory.reduce((s, c) => s + c.count, 0)) * 100)}%`} icon={TrendingUp} />
            <StatCard title="Position Categories" value={data.expatriatesByCategory.length} icon={BarChart3} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expatriates by Position Category</CardTitle>
              <CardDescription>Count and succession plan coverage by L.I. 2431 position categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.expatriatesByCategory.map((c) => {
                  const successionPct = Math.round((c.withSuccession / c.count) * 100);
                  return (
                    <div key={c.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.category}</span>
                        <span className="text-sm text-muted-foreground">{c.count} expatriates</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-4 rounded-full bg-muted overflow-hidden flex">
                            <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${successionPct}%` }} />
                            <div className="h-full bg-yellow-300" style={{ width: `${100 - successionPct}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-24 text-right">
                          {c.withSuccession}/{c.count} ({successionPct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-green-500" />With succession plan</div>
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-yellow-300" />No succession plan</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Leaderboard</CardTitle>
              <CardDescription>Top performing mining companies by composite compliance score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topCompliantCompanies.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={c.score} className="h-2 flex-1" />
                        <span className={`text-sm font-bold ${c.score >= 80 ? "text-green-600" : c.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                          {c.score}%
                        </span>
                      </div>
                    </div>
                    <Badge variant={c.trend > 0 ? "success" : c.trend < 0 ? "destructive" : "secondary"}>
                      {c.trend > 0 ? "+" : ""}{c.trend}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
