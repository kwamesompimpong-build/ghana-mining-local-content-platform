"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Building2, DollarSign, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SUPPLIER_CATEGORY_LABELS, OWNERSHIP_TIER_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProcurementDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ amount: "", technicalProposal: "", localContentPct: "", deliveryTimeline: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOpportunity();
  }, [params.id]);

  async function fetchOpportunity() {
    try {
      const res = await fetch(`/api/procurement/${params.id}`);
      if (res.ok) setOpportunity(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBidSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/procurement/${params.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bidForm,
          amount: parseFloat(bidForm.amount),
          localContentPct: parseFloat(bidForm.localContentPct),
        }),
      });
      if (res.ok) fetchOpportunity();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const canBid = session?.user?.role === "SUPPLIER" && opportunity?.status === "OPEN";
  const canViewBids = session?.user?.role === "MINING_COMPANY" || session?.user?.role === "ADMIN" || session?.user?.role === "REGULATOR";

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;
  if (!opportunity) return <div className="flex items-center justify-center py-20 text-muted-foreground">Opportunity not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={opportunity.status === "OPEN" ? "success" : "secondary"}>{opportunity.status}</Badge>
            {opportunity.isLocalOnly && <Badge variant="outline" className="bg-green-50 text-green-700">Local Only</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{opportunity.title}</h1>
          <p className="text-muted-foreground mt-1">{opportunity.miningCompany?.organization?.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" /><span className="text-sm">Estimated Value</span>
            </div>
            <p className="text-xl font-bold">{opportunity.estimatedValue ? formatCurrency(opportunity.estimatedValue) : "Not disclosed"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" /><span className="text-sm">Closing Date</span>
            </div>
            <p className="text-xl font-bold">{formatDate(opportunity.closingDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" /><span className="text-sm">Bids Received</span>
            </div>
            <p className="text-xl font-bold">{opportunity.bids?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{opportunity.description}</p>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Category:</span> {SUPPLIER_CATEGORY_LABELS[opportunity.category] || opportunity.category}</div>
            {opportunity.requiredOwnershipTier && (
              <div><span className="text-muted-foreground">Required Ownership:</span> {OWNERSHIP_TIER_LABELS[opportunity.requiredOwnershipTier]}</div>
            )}
            {opportunity.requirements && (
              <div className="col-span-2"><span className="text-muted-foreground">Requirements:</span> {opportunity.requirements}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bid submission form */}
      {canBid && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Submit Your Bid</CardTitle>
            <CardDescription>Provide your bid details and local content commitment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bid Amount (GHS)</Label>
                  <Input type="number" value={bidForm.amount} onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Local Content Commitment (%)</Label>
                  <Input type="number" max="100" value={bidForm.localContentPct} onChange={(e) => setBidForm({ ...bidForm, localContentPct: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Delivery Timeline</Label>
                <Input value={bidForm.deliveryTimeline} onChange={(e) => setBidForm({ ...bidForm, deliveryTimeline: e.target.value })} placeholder="e.g., 6 weeks from contract signing" />
              </div>
              <div className="space-y-2">
                <Label>Technical Proposal</Label>
                <Textarea value={bidForm.technicalProposal} onChange={(e) => setBidForm({ ...bidForm, technicalProposal: e.target.value })} placeholder="Describe your approach, methodology, and qualifications..." />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Bid
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bids table (visible to mining company / admin / regulator) */}
      {canViewBids && opportunity.bids?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bids ({opportunity.bids.length})</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Local Content</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunity.bids.map((bid: any) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">{bid.supplier?.organization?.name || "N/A"}</TableCell>
                  <TableCell>{formatCurrency(bid.amount)}</TableCell>
                  <TableCell>{bid.localContentPct}%</TableCell>
                  <TableCell>{bid.deliveryTimeline || "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{bid.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
