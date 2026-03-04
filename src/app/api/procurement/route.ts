import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const opportunities = await prisma.procurementOpportunity.findMany({
      include: {
        miningCompany: {
          include: { organization: true },
        },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Error fetching procurement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.miningCompanyProfile.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Mining company profile not found" }, { status: 404 });
    }

    const body = await request.json();

    const opportunity = await prisma.procurementOpportunity.create({
      data: {
        miningCompanyId: profile.id,
        title: body.title,
        description: body.description,
        category: body.category,
        estimatedValue: body.estimatedValue,
        closingDate: new Date(body.closingDate),
        status: "OPEN",
        requiredOwnershipTier: body.requiredOwnershipTier !== "any" ? body.requiredOwnershipTier : null,
        isLocalOnly: body.isLocalOnly || false,
        requirements: body.requirements || null,
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error("Error creating procurement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
