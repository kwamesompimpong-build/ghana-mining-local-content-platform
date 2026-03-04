import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "REGULATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, reviewNotes } = body;

    if (!["APPROVED", "REJECTED", "REVISION_REQUESTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const report = await prisma.complianceReport.update({
      where: { id: params.id },
      data: {
        status,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `COMPLIANCE_${status}`,
        entityType: "ComplianceReport",
        entityId: params.id,
        details: { reviewNotes },
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error reviewing compliance report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
