"use client";

import { useSession } from "next-auth/react";
import { Building2, ClipboardCheck, Users, ShoppingCart, TrendingUp, FileCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { ComplianceScoreCard } from "@/components/dashboard/compliance-score-card";

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}. Here&apos;s your local content overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Registered Suppliers"
          value="127"
          description="15 pending review"
          icon={Building2}
          trend={{ value: 12, label: "from last quarter" }}
        />
        <StatCard
          title="Compliance Reports"
          value="48"
          description="8 under review"
          icon={ClipboardCheck}
          trend={{ value: 5, label: "from last quarter" }}
        />
        <StatCard
          title="Active Expatriates"
          value="342"
          description="Across 12 mining companies"
          icon={Users}
          trend={{ value: -3, label: "from last quarter" }}
        />
        <StatCard
          title="Open Procurement"
          value="23"
          description="GHS 45.2M total value"
          icon={ShoppingCart}
          trend={{ value: 8, label: "from last month" }}
        />
      </div>

      {/* Compliance scores & key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceScoreCard score={74} label="Overall Compliance" description="Sector-wide average score" />
        <ComplianceScoreCard score={68} label="Local Spend Ratio" description="Average across mining companies" />
        <ComplianceScoreCard score={82} label="Employment Localization" description="Ghanaian employment ratio" />
        <ComplianceScoreCard score={61} label="Expatriate Quota" description="Average compliance rate" />
      </div>

      {/* Recent activity & alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Compliance Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Compliance Reports</CardTitle>
            <CardDescription>Latest submissions requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { org: "Gold Fields Ghana", period: "2025-Q4", score: 78, status: "UNDER_REVIEW" },
                { org: "Newmont Ahafo", period: "2025-Q4", score: 85, status: "APPROVED" },
                { org: "AngloGold Ashanti Obuasi", period: "2025-Q4", score: 62, status: "SUBMITTED" },
                { org: "Abosso Goldfields", period: "2025-Q3", score: 71, status: "APPROVED" },
              ].map((r) => (
                <div key={`${r.org}-${r.period}`} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{r.org}</p>
                    <p className="text-xs text-muted-foreground">{r.period}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{r.score}%</span>
                    <Badge variant={r.status === "APPROVED" ? "success" : r.status === "UNDER_REVIEW" ? "warning" : "secondary"}>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Ownership Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier Ownership Distribution</CardTitle>
            <CardDescription>Breakdown by L.I. 2431 ownership tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { tier: "100% Ghanaian-Owned", count: 52, pct: 41, color: "bg-green-500" },
                { tier: "Majority Ghanaian JV (51%+)", count: 31, pct: 24, color: "bg-emerald-500" },
                { tier: "Minority Ghanaian JV", count: 18, pct: 14, color: "bg-yellow-500" },
                { tier: "Foreign with Local Partner", count: 15, pct: 12, color: "bg-orange-500" },
                { tier: "Foreign Incorporated", count: 11, pct: 9, color: "bg-red-500" },
              ].map((t) => (
                <div key={t.tier} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t.tier}</span>
                    <span className="font-medium">{t.count} ({t.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Alerts</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, msg: "3 mining companies exceeded expatriate quotas", severity: "destructive" as const },
                { icon: AlertTriangle, msg: "12 supplier documents expiring within 30 days", severity: "warning" as const },
                { icon: FileCheck, msg: "5 compliance reports awaiting regulator review", severity: "secondary" as const },
                { icon: CheckCircle2, msg: "Gold Fields Ghana achieved 80%+ local spend", severity: "success" as const },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <a.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">{a.msg}</p>
                  </div>
                  <Badge variant={a.severity}>Alert</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Local Spend Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Local Spend by Category</CardTitle>
            <CardDescription>Top spending categories this quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { cat: "Mining Services", local: 78, total: "GHS 12.4M" },
                { cat: "Equipment Supply", local: 45, total: "GHS 28.1M" },
                { cat: "Transport & Logistics", local: 89, total: "GHS 5.6M" },
                { cat: "Construction", local: 72, total: "GHS 8.3M" },
                { cat: "Consumables", local: 65, total: "GHS 3.2M" },
              ].map((c) => (
                <div key={c.cat} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{c.cat}</span>
                    <span className="text-muted-foreground">{c.total} ({c.local}% local)</span>
                  </div>
                  <Progress value={c.local} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
