import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const opportunity = await prisma.procurementOpportunity.findUnique({
      where: { id: params.id },
      include: {
        miningCompany: {
          include: { organization: true },
        },
        bids: {
          include: {
            supplier: {
              include: { organization: true },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
        contracts: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("Error fetching procurement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
