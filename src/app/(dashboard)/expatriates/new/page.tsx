"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPATRIATE_POSITION_LABELS } from "@/lib/constants";

export default function NewExpatriatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    nationality: "",
    passportNumber: "",
    positionTitle: "",
    positionCategory: "",
    department: "",
    startDate: "",
    endDate: "",
    workPermitNumber: "",
    workPermitExpiry: "",
    hasSuccessionPlan: "false",
    understudyName: "",
    understudyPosition: "",
    localizationTargetDate: "",
  });

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/expatriates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hasSuccessionPlan: form.hasSuccessionPlan === "true",
        }),
      });
      if (res.ok) router.push("/expatriates");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Expatriate Record</h1>
        <p className="text-muted-foreground">Register a new expatriate employee per L.I. 2431 requirements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input value={form.nationality} onChange={(e) => updateForm("nationality", e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Passport Number</Label>
              <Input value={form.passportNumber} onChange={(e) => updateForm("passportNumber", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Position Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position Title</Label>
                <Input value={form.positionTitle} onChange={(e) => updateForm("positionTitle", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Position Category</Label>
                <Select value={form.positionCategory} onValueChange={(v) => updateForm("positionCategory", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPATRIATE_POSITION_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={(e) => updateForm("department", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => updateForm("startDate", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => updateForm("endDate", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Work Permit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work Permit Number</Label>
                <Input value={form.workPermitNumber} onChange={(e) => updateForm("workPermitNumber", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Permit Expiry Date</Label>
                <Input type="date" value={form.workPermitExpiry} onChange={(e) => updateForm("workPermitExpiry", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Succession Plan</CardTitle>
            <CardDescription>L.I. 2431 requires succession plans for expatriate positions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Has Succession Plan?</Label>
              <Select value={form.hasSuccessionPlan} onValueChange={(v) => updateForm("hasSuccessionPlan", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.hasSuccessionPlan === "true" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Understudy Name</Label>
                    <Input value={form.understudyName} onChange={(e) => updateForm("understudyName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Understudy Position</Label>
                    <Input value={form.understudyPosition} onChange={(e) => updateForm("understudyPosition", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Localization Target Date</Label>
                  <Input type="date" value={form.localizationTargetDate} onChange={(e) => updateForm("localizationTargetDate", e.target.value)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/expatriates")}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Expatriate Record
          </Button>
        </div>
      </form>
    </div>
  );
}
