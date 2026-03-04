import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPPLIER" || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: "Supplier profile not found" }, { status: 404 });
    }

    // Check opportunity exists and is open
    const opportunity = await prisma.procurementOpportunity.findUnique({
      where: { id: params.id },
    });

    if (!opportunity || opportunity.status !== "OPEN") {
      return NextResponse.json({ error: "Opportunity not found or closed" }, { status: 400 });
    }

    const body = await request.json();

    const bid = await prisma.bid.create({
      data: {
        procurementId: params.id,
        supplierId: supplierProfile.id,
        amount: body.amount,
        technicalProposal: body.technicalProposal || null,
        localContentPct: body.localContentPct || null,
        deliveryTimeline: body.deliveryTimeline || null,
      },
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "You have already submitted a bid for this opportunity" }, { status: 409 });
    }
    console.error("Error submitting bid:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
