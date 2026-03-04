"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SUPPLIER_CATEGORY_LABELS } from "@/lib/constants";

export default function NewComplianceReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    period: "",
    localSpendEntries: [{ category: "", totalSpend: "", localSpend: "" }],
    expatriateCount: "",
    approvedQuota: "",
    totalEmployees: "",
    ghanaianEmployees: "",
    notes: "",
  });

  function updateForm(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSpendEntry(index: number, field: string, value: string) {
    const entries = [...form.localSpendEntries];
    entries[index] = { ...entries[index], [field]: value };
    setForm((prev) => ({ ...prev, localSpendEntries: entries }));
  }

  function addSpendEntry() {
    setForm((prev) => ({
      ...prev,
      localSpendEntries: [...prev.localSpendEntries, { category: "", totalSpend: "", localSpend: "" }],
    }));
  }

  async function handleSubmit(status: "DRAFT" | "SUBMITTED") {
    setLoading(true);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      if (res.ok) router.push("/compliance");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totalSpend = form.localSpendEntries.reduce((s, e) => s + (parseFloat(e.totalSpend) || 0), 0);
  const totalLocal = form.localSpendEntries.reduce((s, e) => s + (parseFloat(e.localSpend) || 0), 0);
  const localRatio = totalSpend > 0 ? (totalLocal / totalSpend) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Compliance Report</h1>
        <p className="text-muted-foreground">Submit your quarterly local content compliance report per L.I. 2431</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reporting Period</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={form.period} onValueChange={(v) => updateForm("period", v)}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-Q1">2026 Q1</SelectItem>
              <SelectItem value="2025-Q4">2025 Q4</SelectItem>
              <SelectItem value="2025-Q3">2025 Q3</SelectItem>
              <SelectItem value="2025-Q2">2025 Q2</SelectItem>
              <SelectItem value="2025-Q1">2025 Q1</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local Spend by Category</CardTitle>
          <CardDescription>Report procurement spending broken down by service category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.localSpendEntries.map((entry, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 border rounded-lg p-3">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={entry.category} onValueChange={(v) => updateSpendEntry(i, "category", v)}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Total Spend (GHS)</Label>
                <Input type="number" value={entry.totalSpend} onChange={(e) => updateSpendEntry(i, "totalSpend", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Local Spend (GHS)</Label>
                <Input type="number" value={entry.localSpend} onChange={(e) => updateSpendEntry(i, "localSpend", e.target.value)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSpendEntry}>Add Category</Button>

          {totalSpend > 0 && (
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p>Total Procurement: <strong>GHS {totalSpend.toLocaleString()}</strong></p>
              <p>Local Procurement: <strong>GHS {totalLocal.toLocaleString()}</strong></p>
              <p>Local Spend Ratio: <strong className={localRatio >= 60 ? "text-green-600" : "text-red-600"}>{localRatio.toFixed(1)}%</strong></p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment & Expatriate Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Employees</Label>
              <Input type="number" value={form.totalEmployees} onChange={(e) => updateForm("totalEmployees", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ghanaian Employees</Label>
              <Input type="number" value={form.ghanaianEmployees} onChange={(e) => updateForm("ghanaianEmployees", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Expatriate Count</Label>
              <Input type="number" value={form.expatriateCount} onChange={(e) => updateForm("expatriateCount", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Approved Expatriate Quota</Label>
              <Input type="number" value={form.approvedQuota} onChange={(e) => updateForm("approvedQuota", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Additional Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Any additional information or explanations..." value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => handleSubmit("DRAFT")} disabled={loading}>Save as Draft</Button>
        <Button onClick={() => handleSubmit("SUBMITTED")} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>
      </div>
    </div>
  );
}
