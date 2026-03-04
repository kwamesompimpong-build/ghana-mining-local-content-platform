import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supplier = await prisma.supplierProfile.update({
      where: { id: params.id },
      data: {
        status,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    // If approved, also mark organization as verified
    if (status === "APPROVED") {
      await prisma.organization.update({
        where: { id: supplier.organizationId },
        data: { isVerified: true },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `SUPPLIER_${status}`,
        entityType: "SupplierProfile",
        entityId: params.id,
        details: { reviewNotes },
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error verifying supplier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
