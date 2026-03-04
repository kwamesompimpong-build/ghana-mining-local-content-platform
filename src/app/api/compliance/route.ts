import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = {};

    // If mining company or supplier, only show own org's reports
    if (session.user.role === "MINING_COMPANY" || session.user.role === "SUPPLIER") {
      if (session.user.organizationId) {
        where.organizationId = session.user.organizationId;
      }
    }

    const reports = await prisma.complianceReport.findMany({
      where,
      include: {
        organization: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching compliance reports:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Calculate local spend ratio from entries
    const totalSpend = body.localSpendEntries?.reduce(
      (sum: number, e: any) => sum + (parseFloat(e.totalSpend) || 0),
      0
    ) || 0;
    const localSpend = body.localSpendEntries?.reduce(
      (sum: number, e: any) => sum + (parseFloat(e.localSpend) || 0),
      0
    ) || 0;
    const localSpendRatio = totalSpend > 0 ? (localSpend / totalSpend) * 100 : 0;

    // Calculate employment metrics
    const totalEmployees = parseInt(body.totalEmployees) || 0;
    const ghanaianEmployees = parseInt(body.ghanaianEmployees) || 0;
    const ghanaianEmploymentPct = totalEmployees > 0 ? (ghanaianEmployees / totalEmployees) * 100 : 0;

    // Expatriate quota check
    const expatriateCount = parseInt(body.expatriateCount) || 0;
    const approvedQuota = parseInt(body.approvedQuota) || 0;
    const expatQuotaCompliance = expatriateCount <= approvedQuota;

    // Simple overall score calculation
    const spendScore = Math.min(localSpendRatio / 0.6 * 30, 30); // 30% weight, target 60%
    const expatScore = expatQuotaCompliance ? 25 : 0; // 25% weight
    const employmentScore = Math.min(ghanaianEmploymentPct / 100 * 25, 25); // 25% weight
    const overallScore = spendScore + expatScore + employmentScore + 10; // 10% baseline

    const report = await prisma.complianceReport.create({
      data: {
        organizationId: session.user.organizationId,
        period: body.period,
        localSpendRatio,
        expatQuotaCompliance,
        ghanaianEmploymentPct,
        overallScore: Math.min(overallScore, 100),
        status: body.status || "DRAFT",
        submittedAt: body.status === "SUBMITTED" ? new Date() : null,
      },
    });

    // Create local spend records for each category
    if (body.localSpendEntries) {
      const miningProfile = await prisma.miningCompanyProfile.findUnique({
        where: { organizationId: session.user.organizationId },
      });

      if (miningProfile) {
        for (const entry of body.localSpendEntries) {
          if (entry.category && entry.totalSpend) {
            const total = parseFloat(entry.totalSpend) || 0;
            const local = parseFloat(entry.localSpend) || 0;
            await prisma.localSpendRecord.upsert({
              where: {
                miningCompanyId_period_category: {
                  miningCompanyId: miningProfile.id,
                  period: body.period,
                  category: entry.category,
                },
              },
              update: {
                totalSpend: total,
                localSpend: local,
                foreignSpend: total - local,
                localSpendPct: total > 0 ? (local / total) * 100 : 0,
              },
              create: {
                miningCompanyId: miningProfile.id,
                period: body.period,
                category: entry.category,
                totalSpend: total,
                localSpend: local,
                foreignSpend: total - local,
                localSpendPct: total > 0 ? (local / total) * 100 : 0,
              },
            });
          }
        }
      }
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating compliance report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
