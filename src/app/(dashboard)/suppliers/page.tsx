"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Search, Filter, Plus, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SUPPLIER_CATEGORY_LABELS, OWNERSHIP_TIER_LABELS, OWNERSHIP_TIER_COLORS } from "@/lib/constants";

interface Supplier {
  id: string;
  organization: {
    name: string;
    registrationNumber: string;
    region: string | null;
    ownershipTier: string | null;
    ghanaianOwnershipPct: number | null;
  };
  categories: string[];
  employeeCount: number | null;
  ghanaianEmployeePct: number | null;
  qualificationScore: number | null;
  status: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    try {
      const res = await fetch("/api/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = suppliers.filter((s) => {
    const matchesSearch = s.organization.name.toLowerCase().includes(search.toLowerCase()) ||
      s.organization.registrationNumber.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.categories.includes(categoryFilter);
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "PENDING_REVIEW": case "UNDER_REVIEW": return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Directory</h1>
          <p className="text-muted-foreground">Browse and manage registered suppliers and contractors</p>
        </div>
        <Link href="/suppliers/register">
          <Button><Plus className="mr-2 h-4 w-4" />Register Supplier</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or registration number..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Ownership</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading suppliers...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No suppliers found</TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.organization.name}</p>
                      <p className="text-xs text-muted-foreground">{s.organization.registrationNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.categories.slice(0, 2).map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">
                          {SUPPLIER_CATEGORY_LABELS[c] || c}
                        </Badge>
                      ))}
                      {s.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{s.categories.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.organization.ownershipTier && (
                      <Badge className={OWNERSHIP_TIER_COLORS[s.organization.ownershipTier] || ""} variant="outline">
                        {s.organization.ghanaianOwnershipPct != null ? `${s.organization.ghanaianOwnershipPct}%` : "N/A"} Ghanaian
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {s.employeeCount || "N/A"}
                    {s.ghanaianEmployeePct != null && (
                      <span className="text-xs text-muted-foreground ml-1">({s.ghanaianEmployeePct}% local)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {s.qualificationScore != null ? (
                      <span className={`font-semibold ${s.qualificationScore >= 70 ? "text-green-600" : s.qualificationScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                        {Math.round(s.qualificationScore)}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {statusIcon(s.status)}
                      <span className="text-sm">{s.status.replace(/_/g, " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/suppliers/${s.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
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
