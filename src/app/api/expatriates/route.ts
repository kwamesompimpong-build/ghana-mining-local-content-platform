import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let miningCompanyId: string | undefined;

    // If mining company, only show own expatriates
    if (session.user.role === "MINING_COMPANY" && session.user.organizationId) {
      const profile = await prisma.miningCompanyProfile.findUnique({
        where: { organizationId: session.user.organizationId },
      });
      if (profile) miningCompanyId = profile.id;
    }

    const where: any = {};
    if (miningCompanyId) where.miningCompanyId = miningCompanyId;

    const expatriates = await prisma.expatriateRecord.findMany({
      where,
      include: {
        miningCompany: {
          include: { organization: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(expatriates);
  } catch (error) {
    console.error("Error fetching expatriates:", error);
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

    const expatriate = await prisma.expatriateRecord.create({
      data: {
        miningCompanyId: profile.id,
        fullName: body.fullName,
        nationality: body.nationality,
        passportNumber: body.passportNumber || null,
        positionTitle: body.positionTitle,
        positionCategory: body.positionCategory,
        department: body.department || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        workPermitNumber: body.workPermitNumber || null,
        workPermitExpiry: body.workPermitExpiry ? new Date(body.workPermitExpiry) : null,
        hasSuccessionPlan: body.hasSuccessionPlan || false,
        understudyName: body.understudyName || null,
        understudyPosition: body.understudyPosition || null,
        localizationTargetDate: body.localizationTargetDate ? new Date(body.localizationTargetDate) : null,
      },
    });

    // Update current expat count
    const count = await prisma.expatriateRecord.count({
      where: { miningCompanyId: profile.id, status: "ACTIVE" },
    });
    await prisma.miningCompanyProfile.update({
      where: { id: profile.id },
      data: { currentExpatCount: count },
    });

    return NextResponse.json(expatriate, { status: 201 });
  } catch (error) {
    console.error("Error creating expatriate record:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
