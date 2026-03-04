"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Users, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { EXPATRIATE_POSITION_LABELS } from "@/lib/constants";

export default function ExpatriatesPage() {
  const { data: session } = useSession();
  const [expatriates, setExpatriates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpatriates();
  }, []);

  async function fetchExpatriates() {
    try {
      const res = await fetch("/api/expatriates");
      if (res.ok) setExpatriates(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const canCreate = session?.user?.role === "MINING_COMPANY" || session?.user?.role === "ADMIN";
  const active = expatriates.filter((e) => e.status === "ACTIVE");
  const withSuccession = active.filter((e) => e.hasSuccessionPlan);
  const byCategory = Object.entries(EXPATRIATE_POSITION_LABELS).map(([key, label]) => ({
    label,
    count: active.filter((e) => e.positionCategory === key).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expatriate Management</h1>
          <p className="text-muted-foreground">Track expatriate positions, quotas, and succession plans per L.I. 2431</p>
        </div>
        {canCreate && (
          <Link href="/expatriates/new">
            <Button><Plus className="mr-2 h-4 w-4" />Add Expatriate</Button>
          </Link>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Expatriates</p>
            <p className="text-3xl font-bold">{active.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">With Succession Plan</p>
            <p className="text-3xl font-bold text-green-600">{withSuccession.length}</p>
            <p className="text-xs text-muted-foreground">{active.length > 0 ? `${Math.round((withSuccession.length / active.length) * 100)}% coverage` : "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expiring Permits</p>
            <p className="text-3xl font-bold text-yellow-600">
              {expatriates.filter((e) => e.status === "PENDING_RENEWAL").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">By Position Category</p>
            <div className="mt-2 space-y-1">
              {byCategory.map((c) => (
                <div key={c.label} className="flex justify-between text-xs">
                  <span>{c.label}</span>
                  <span className="font-medium">{c.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expatriate table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Succession Plan</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : expatriates.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No expatriate records found</TableCell></TableRow>
            ) : (
              expatriates.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.fullName}</TableCell>
                  <TableCell>{e.nationality}</TableCell>
                  <TableCell>{e.positionTitle}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{EXPATRIATE_POSITION_LABELS[e.positionCategory] || e.positionCategory}</Badge>
                  </TableCell>
                  <TableCell>
                    {e.hasSuccessionPlan ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{e.understudyName || "Yes"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-muted-foreground">None</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={e.status === "ACTIVE" ? "success" : e.status === "PENDING_RENEWAL" ? "warning" : "destructive"}>
                      {e.status}
                    </Badge>
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
