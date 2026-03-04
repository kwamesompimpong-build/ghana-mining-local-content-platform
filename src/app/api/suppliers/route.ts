import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const ownershipTier = searchParams.get("ownershipTier");

    const where: any = {};
    if (category) where.categories = { has: category };
    if (status) where.status = status;

    const suppliers = await prisma.supplierProfile.findMany({
      where,
      include: {
        organization: {
          include: {
            ownershipRecords: true,
          },
        },
        complianceScores: {
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by ownership tier if needed (from organization)
    let result = suppliers;
    if (ownershipTier) {
      result = suppliers.filter((s) => s.organization.ownershipTier === ownershipTier);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
