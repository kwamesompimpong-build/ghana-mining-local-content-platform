import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          include: {
            ownershipRecords: true,
            documents: true,
          },
        },
        capabilities: true,
        complianceScores: {
          orderBy: { calculatedAt: "desc" },
        },
        bids: {
          include: { procurement: true },
          orderBy: { submittedAt: "desc" },
          take: 10,
        },
        contracts: {
          orderBy: { startDate: "desc" },
          take: 10,
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supplier = await prisma.supplierProfile.update({
      where: { id: params.id },
      data: {
        categories: body.categories,
        subcategories: body.subcategories,
        yearsInBusiness: body.yearsInBusiness ? parseInt(body.yearsInBusiness) : undefined,
        employeeCount: body.employeeCount ? parseInt(body.employeeCount) : undefined,
        ghanaianEmployeePct: body.ghanaianEmployeePct ? parseFloat(body.ghanaianEmployeePct) : undefined,
        annualRevenue: body.annualRevenue ? parseFloat(body.annualRevenue) : undefined,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
