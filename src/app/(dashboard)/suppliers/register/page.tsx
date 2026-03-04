"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPLIER_CATEGORY_LABELS, OWNERSHIP_TIER_LABELS, GHANA_REGIONS } from "@/lib/constants";

export default function SupplierRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Company info
    description: "",
    yearsInBusiness: "",
    employeeCount: "",
    ghanaianEmployeePct: "",
    annualRevenue: "",
    // Categories
    categories: [] as string[],
    // Ownership
    ownershipTier: "",
    ghanaianOwnershipPct: "",
    shareholders: [{ name: "", nationality: "Ghanaian", isGhanaian: true, ownershipPct: "" }],
    // Capabilities
    capabilities: [{ category: "", description: "", certifications: "" }],
  });

  function updateForm(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }

  function addShareholder() {
    setForm((prev) => ({
      ...prev,
      shareholders: [...prev.shareholders, { name: "", nationality: "", isGhanaian: false, ownershipPct: "" }],
    }));
  }

  function updateShareholder(index: number, field: string, value: any) {
    setForm((prev) => {
      const shareholders = [...prev.shareholders];
      shareholders[index] = { ...shareholders[index], [field]: value };
      if (field === "nationality") {
        shareholders[index].isGhanaian = value === "Ghanaian";
      }
      return { ...prev, shareholders };
    });
  }

  async function handleSubmit() {
    setLoading(true);
    // This would submit to the API
    setLoading(false);
    router.push("/suppliers");
  }

  const steps = [
    { num: 1, label: "Company Details" },
    { num: 2, label: "Service Categories" },
    { num: 3, label: "Ownership Structure" },
    { num: 4, label: "Capabilities" },
    { num: 5, label: "Review & Submit" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supplier Registration</h1>
        <p className="text-muted-foreground">Register your organization as a supplier in the Ghana Mining Local Content Platform</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {steps.map((s) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {s.num}
            </div>
            <span className={`hidden sm:block text-sm ${step >= s.num ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
            {s.num < 5 && <div className={`flex-1 h-0.5 ${step > s.num ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Company Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Provide your organization&apos;s basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Description</Label>
              <Textarea placeholder="Brief description of your company and services..." value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Years in Business</Label>
                <Input type="number" value={form.yearsInBusiness} onChange={(e) => updateForm("yearsInBusiness", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Employee Count</Label>
                <Input type="number" value={form.employeeCount} onChange={(e) => updateForm("employeeCount", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ghanaian Employee %</Label>
                <Input type="number" max="100" value={form.ghanaianEmployeePct} onChange={(e) => updateForm("ghanaianEmployeePct", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Annual Revenue (GHS)</Label>
                <Input type="number" value={form.annualRevenue} onChange={(e) => updateForm("annualRevenue", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Categories */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Service Categories</CardTitle>
            <CardDescription>Select the L.I. 2431 service categories that apply to your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleCategory(value)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                    form.categories.includes(value) ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className={`h-4 w-4 rounded border ${form.categories.includes(value) ? "bg-primary border-primary" : "border-muted-foreground"}`} />
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Ownership */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Ownership Structure</CardTitle>
            <CardDescription>Declare ownership structure per L.I. 2431 requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ownership Tier</Label>
                <Select value={form.ownershipTier} onValueChange={(v) => updateForm("ownershipTier", v)}>
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(OWNERSHIP_TIER_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ghanaian Ownership %</Label>
                <Input type="number" max="100" value={form.ghanaianOwnershipPct} onChange={(e) => updateForm("ghanaianOwnershipPct", e.target.value)} />
              </div>
            </div>

            <Label>Shareholders</Label>
            {form.shareholders.map((sh, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 border rounded-lg p-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={sh.name} onChange={(e) => updateShareholder(i, "name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nationality</Label>
                  <Input value={sh.nationality} onChange={(e) => updateShareholder(i, "nationality", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ownership %</Label>
                  <Input type="number" value={sh.ownershipPct} onChange={(e) => updateShareholder(i, "ownershipPct", e.target.value)} />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addShareholder}>Add Shareholder</Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Capabilities */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Capabilities & Certifications</CardTitle>
            <CardDescription>Describe your technical capabilities, equipment, and certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.capabilities.map((cap, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={cap.category} onValueChange={(v) => {
                    const caps = [...form.capabilities];
                    caps[i] = { ...caps[i], category: v };
                    updateForm("capabilities", caps);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={cap.description} onChange={(e) => {
                    const caps = [...form.capabilities];
                    caps[i] = { ...caps[i], description: e.target.value };
                    updateForm("capabilities", caps);
                  }} />
                </div>
                <div className="space-y-2">
                  <Label>Certifications (comma separated)</Label>
                  <Input value={cap.certifications} onChange={(e) => {
                    const caps = [...form.capabilities];
                    caps[i] = { ...caps[i], certifications: e.target.value };
                    updateForm("capabilities", caps);
                  }} />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => updateForm("capabilities", [...form.capabilities, { category: "", description: "", certifications: "" }])}>
              Add Capability
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Review your information before submitting for verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <p><strong>Categories:</strong> {form.categories.map((c) => SUPPLIER_CATEGORY_LABELS[c]).join(", ") || "None selected"}</p>
              <p><strong>Employees:</strong> {form.employeeCount || "N/A"} ({form.ghanaianEmployeePct || 0}% Ghanaian)</p>
              <p><strong>Ownership:</strong> {OWNERSHIP_TIER_LABELS[form.ownershipTier] || "Not specified"} ({form.ghanaianOwnershipPct || 0}% Ghanaian)</p>
              <p><strong>Shareholders:</strong> {form.shareholders.filter((s) => s.name).length} declared</p>
              <p><strong>Capabilities:</strong> {form.capabilities.filter((c) => c.description).length} registered</p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              By submitting, you confirm that all information is accurate and compliant with L.I. 2431 requirements.
              Your registration will be reviewed by the Minerals Commission before approval.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Previous</Button>
        {step < 5 ? (
          <Button onClick={() => setStep(Math.min(5, step + 1))}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Registration
          </Button>
        )}
      </div>
    </div>
  );
}
