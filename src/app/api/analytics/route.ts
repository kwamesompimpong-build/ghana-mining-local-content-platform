import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Aggregate analytics
    const [
      supplierCount,
      approvedSupplierCount,
      complianceReports,
      expatriateCount,
      procurementCount,
    ] = await Promise.all([
      prisma.supplierProfile.count(),
      prisma.supplierProfile.count({ where: { status: "APPROVED" } }),
      prisma.complianceReport.findMany({
        where: { overallScore: { not: null } },
        select: { overallScore: true, localSpendRatio: true, expatQuotaCompliance: true },
      }),
      prisma.expatriateRecord.count({ where: { status: "ACTIVE" } }),
      prisma.procurementOpportunity.count({ where: { status: "OPEN" } }),
    ]);

    const avgScore = complianceReports.length > 0
      ? complianceReports.reduce((sum, r) => sum + (r.overallScore || 0), 0) / complianceReports.length
      : 0;

    const avgLocalSpend = complianceReports.length > 0
      ? complianceReports.reduce((sum, r) => sum + (r.localSpendRatio || 0), 0) / complianceReports.length
      : 0;

    const expatCompliantCount = complianceReports.filter((r) => r.expatQuotaCompliance).length;

    return NextResponse.json({
      supplierCount,
      approvedSupplierCount,
      avgComplianceScore: Math.round(avgScore),
      avgLocalSpendRatio: Math.round(avgLocalSpend),
      expatriateCount,
      openProcurementCount: procurementCount,
      totalReports: complianceReports.length,
      expatQuotaComplianceRate: complianceReports.length > 0
        ? Math.round((expatCompliantCount / complianceReports.length) * 100)
        : 0,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
