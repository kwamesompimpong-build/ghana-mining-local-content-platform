"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingCart, Plus, Clock, DollarSign, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPLIER_CATEGORY_LABELS, OWNERSHIP_TIER_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProcurementPage() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  async function fetchOpportunities() {
    try {
      const res = await fetch("/api/procurement");
      if (res.ok) setOpportunities(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const canCreate = session?.user?.role === "MINING_COMPANY" || session?.user?.role === "ADMIN";

  const filtered = opportunities.filter((o) => {
    const matchesSearch = o.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || o.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const statusColors: Record<string, string> = {
    OPEN: "success",
    EVALUATION: "warning",
    AWARDED: "default",
    CLOSED: "secondary",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Marketplace</h1>
          <p className="text-muted-foreground">Browse and manage mining procurement opportunities</p>
        </div>
        {canCreate && (
          <Link href="/procurement/new">
            <Button><Plus className="mr-2 h-4 w-4" />Create Opportunity</Button>
          </Link>
        )}
      </div>

      {/* Search & filter */}
      <div className="flex gap-4">
        <Input placeholder="Search opportunities..." className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Opportunity cards */}
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Loading opportunities...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">No procurement opportunities found</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <Card key={o.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant={statusColors[o.status] as any || "secondary"}>{o.status}</Badge>
                  {o.isLocalOnly && <Badge variant="outline" className="bg-green-50 text-green-700">Local Only</Badge>}
                </div>
                <CardTitle className="text-lg mt-2">{o.title}</CardTitle>
                <CardDescription className="line-clamp-2">{o.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{o.miningCompany?.organization?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{o.estimatedValue ? formatCurrency(o.estimatedValue) : "Not disclosed"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Closes: {formatDate(o.closingDate)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline">{SUPPLIER_CATEGORY_LABELS[o.category] || o.category}</Badge>
                    {o.requiredOwnershipTier && (
                      <Badge variant="outline" className="text-xs">{OWNERSHIP_TIER_LABELS[o.requiredOwnershipTier]}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {o._count?.bids || 0} bids submitted
                  </p>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href={`/procurement/${o.id}`}>
                  <Button className="w-full" variant={o.status === "OPEN" ? "default" : "outline"}>
                    {o.status === "OPEN" && session?.user?.role === "SUPPLIER" ? "Submit Bid" : "View Details"}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
