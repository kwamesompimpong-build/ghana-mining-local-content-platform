"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ClipboardCheck, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { COMPLIANCE_REPORT_STATUS_LABELS } from "@/lib/constants";

export default function CompliancePage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch("/api/compliance");
      if (res.ok) setReports(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const canCreate = session?.user?.role === "MINING_COMPANY" || session?.user?.role === "ADMIN";
  const statusVariant = (s: string) => {
    switch (s) {
      case "APPROVED": return "success" as const;
      case "REJECTED": return "destructive" as const;
      case "UNDER_REVIEW": return "warning" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
          <p className="text-muted-foreground">Local content compliance reporting and review per L.I. 2431</p>
        </div>
        {canCreate && (
          <Link href="/compliance/new">
            <Button><Plus className="mr-2 h-4 w-4" />New Report</Button>
          </Link>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Reports", value: reports.length, color: "bg-blue-500" },
          { label: "Approved", value: reports.filter((r) => r.status === "APPROVED").length, color: "bg-green-500" },
          { label: "Under Review", value: reports.filter((r) => r.status === "UNDER_REVIEW" || r.status === "SUBMITTED").length, color: "bg-yellow-500" },
          { label: "Avg. Score", value: reports.length > 0 ? `${Math.round(reports.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reports.length)}%` : "N/A", color: "bg-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Local Spend</TableHead>
              <TableHead>Expat Quota</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : reports.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No compliance reports found</TableCell></TableRow>
            ) : (
              reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.organization?.name || "N/A"}</TableCell>
                  <TableCell>{r.period}</TableCell>
                  <TableCell>
                    {r.localSpendRatio != null ? (
                      <div className="space-y-1">
                        <span className="text-sm">{r.localSpendRatio.toFixed(1)}%</span>
                        <Progress value={r.localSpendRatio} className="h-1.5" />
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {r.expatQuotaCompliance != null ? (
                      <Badge variant={r.expatQuotaCompliance ? "success" : "destructive"}>
                        {r.expatQuotaCompliance ? "Compliant" : "Non-compliant"}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {r.overallScore != null ? (
                      <span className={`font-semibold ${r.overallScore >= 70 ? "text-green-600" : r.overallScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                        {Math.round(r.overallScore)}%
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(r.status)}>{COMPLIANCE_REPORT_STATUS_LABELS[r.status] || r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/compliance/${r.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
