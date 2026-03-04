"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Building2, MapPin, Users, Award, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUPPLIER_CATEGORY_LABELS, OWNERSHIP_TIER_LABELS, OWNERSHIP_TIER_COLORS, DOCUMENT_TYPE_LABELS } from "@/lib/constants";

export default function SupplierDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplier();
  }, [params.id]);

  async function fetchSupplier() {
    try {
      const res = await fetch(`/api/suppliers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSupplier(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(action: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/suppliers/${params.id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    if (res.ok) fetchSupplier();
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading supplier profile...</div>;
  if (!supplier) return <div className="flex items-center justify-center py-20 text-muted-foreground">Supplier not found</div>;

  const org = supplier.organization;
  const canVerify = session?.user?.role === "ADMIN" || session?.user?.role === "REGULATOR";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-muted-foreground">
            <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{org.registrationNumber}</span>
            {org.region && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{org.region}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={OWNERSHIP_TIER_COLORS[org.ownershipTier] || ""} variant="outline">
            {OWNERSHIP_TIER_LABELS[org.ownershipTier] || org.ownershipTier}
          </Badge>
          <Badge variant={supplier.status === "APPROVED" ? "success" : supplier.status === "REJECTED" ? "destructive" : "secondary"}>
            {supplier.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* Verification actions */}
      {canVerify && supplier.status !== "APPROVED" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between pt-6">
            <p className="text-sm font-medium">This supplier is awaiting verification review.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleVerify("REJECTED")}>
                <XCircle className="mr-2 h-4 w-4" />Reject
              </Button>
              <Button onClick={() => handleVerify("APPROVED")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">TIN</span><span>{org.tinNumber || "Not provided"}</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Years in Business</span><span>{supplier.yearsInBusiness || "N/A"}</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Employees</span><span>{supplier.employeeCount || "N/A"}</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Ghanaian Employees</span><span>{supplier.ghanaianEmployeePct != null ? `${supplier.ghanaianEmployeePct}%` : "N/A"}</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Annual Revenue</span><span>{supplier.annualRevenue ? `GHS ${(supplier.annualRevenue / 1_000_000).toFixed(1)}M` : "N/A"}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {supplier.categories?.map((c: string) => (
                    <Badge key={c} variant="outline">{SUPPLIER_CATEGORY_LABELS[c] || c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Score Breakdown */}
          {supplier.complianceScores?.[0] && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance Score Breakdown</CardTitle>
                <CardDescription>Latest period: {supplier.complianceScores[0].period}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Ownership", value: supplier.complianceScores[0].ownershipScore },
                  { label: "Employment", value: supplier.complianceScores[0].employmentScore },
                  { label: "Procurement", value: supplier.complianceScores[0].procurementScore },
                  { label: "Capacity", value: supplier.complianceScores[0].capacityScore },
                  { label: "Documentation", value: supplier.complianceScores[0].documentScore },
                ].map((s) => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{s.label}</span>
                      <span className="font-medium">{Math.round(s.value)}/100</span>
                    </div>
                    <Progress value={s.value} className="h-2" />
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Composite Score</span>
                  <span className={supplier.complianceScores[0].compositeScore >= 70 ? "text-green-600" : "text-yellow-600"}>
                    {Math.round(supplier.complianceScores[0].compositeScore)}/100
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="capabilities">
          <Card>
            <CardHeader><CardTitle>Capabilities & Certifications</CardTitle></CardHeader>
            <CardContent>
              {supplier.capabilities?.length > 0 ? (
                <div className="space-y-4">
                  {supplier.capabilities.map((cap: any) => (
                    <div key={cap.id} className="border rounded-lg p-4">
                      <Badge variant="outline" className="mb-2">{SUPPLIER_CATEGORY_LABELS[cap.category] || cap.category}</Badge>
                      <p className="text-sm">{cap.description}</p>
                      {cap.certifications?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cap.certifications.map((c: string) => (
                            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No capabilities registered yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ownership">
          <Card>
            <CardHeader>
              <CardTitle>Ownership Structure</CardTitle>
              <CardDescription>
                Ghanaian ownership: {org.ghanaianOwnershipPct != null ? `${org.ghanaianOwnershipPct}%` : "Not verified"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {org.ownershipRecords?.length > 0 ? (
                <div className="space-y-3">
                  {org.ownershipRecords.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <p className="font-medium">{r.shareholderName}</p>
                        <p className="text-xs text-muted-foreground">{r.nationality}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{r.ownershipPct}%</span>
                        <Badge variant={r.isGhanaian ? "success" : "outline"}>
                          {r.isGhanaian ? "Ghanaian" : "Foreign"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No ownership records submitted.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent>
              {org.documents?.length > 0 ? (
                <div className="space-y-3">
                  {org.documents.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{DOCUMENT_TYPE_LABELS[d.type] || d.type}</p>
                          <p className="text-xs text-muted-foreground">{d.fileName}</p>
                        </div>
                      </div>
                      <Badge variant={d.status === "VERIFIED" ? "success" : d.status === "REJECTED" ? "destructive" : "secondary"}>
                        {d.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No documents uploaded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader><CardTitle>Compliance History</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Compliance history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
