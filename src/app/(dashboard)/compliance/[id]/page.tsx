"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { COMPLIANCE_REPORT_STATUS_LABELS } from "@/lib/constants";

export default function ComplianceDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  async function fetchReport() {
    try {
      const res = await fetch(`/api/compliance?id=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(Array.isArray(data) ? data[0] : data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(status: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/compliance/${params.id}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNotes }),
    });
    if (res.ok) fetchReport();
  }

  const canReview = session?.user?.role === "ADMIN" || session?.user?.role === "REGULATOR";

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;
  if (!report) return <div className="flex items-center justify-center py-20 text-muted-foreground">Report not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Report</h1>
          <p className="text-muted-foreground">{report.organization?.name} — {report.period}</p>
        </div>
        <Badge variant={report.status === "APPROVED" ? "success" : report.status === "REJECTED" ? "destructive" : "secondary"}>
          {COMPLIANCE_REPORT_STATUS_LABELS[report.status] || report.status}
        </Badge>
      </div>

      {/* Score overview */}
      {report.overallScore != null && (
        <Card>
          <CardHeader><CardTitle>Overall Compliance Score</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center">
              <span className={`text-5xl font-bold ${report.overallScore >= 70 ? "text-green-600" : report.overallScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {Math.round(report.overallScore)}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Local Spend Ratio</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{report.localSpendRatio?.toFixed(1) || 0}%</div>
              <Progress value={report.localSpendRatio || 0} className="h-3" />
              <p className="text-xs text-muted-foreground">Target: 60% minimum per L.I. 2431</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Employment Localization</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{report.ghanaianEmploymentPct?.toFixed(1) || 0}%</div>
              <Progress value={report.ghanaianEmploymentPct || 0} className="h-3" />
              <p className="text-xs text-muted-foreground">Ghanaian employees as % of total workforce</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Expatriate Quota</CardTitle></CardHeader>
          <CardContent>
            <Badge variant={report.expatQuotaCompliance ? "success" : "destructive"} className="text-lg px-4 py-2">
              {report.expatQuotaCompliance ? "Compliant" : "Non-Compliant"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Succession Planning</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{report.successionPlanPct?.toFixed(0) || 0}%</div>
            <p className="text-xs text-muted-foreground">Expat positions with succession plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Review section */}
      {canReview && (report.status === "SUBMITTED" || report.status === "UNDER_REVIEW") && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Regulator Review</CardTitle>
            <CardDescription>Review this compliance report and provide a decision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Review notes..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleReview("REJECTED")}>
                <XCircle className="mr-2 h-4 w-4" />Reject
              </Button>
              <Button onClick={() => handleReview("APPROVED")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {report.reviewNotes && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Review Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">{report.reviewNotes}</p>
            {report.reviewedAt && (
              <p className="text-xs text-muted-foreground mt-2">Reviewed: {new Date(report.reviewedAt).toLocaleDateString()}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
