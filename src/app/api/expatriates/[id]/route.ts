import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const expatriate = await prisma.expatriateRecord.update({
      where: { id: params.id },
      data: {
        fullName: body.fullName,
        nationality: body.nationality,
        positionTitle: body.positionTitle,
        positionCategory: body.positionCategory,
        department: body.department,
        hasSuccessionPlan: body.hasSuccessionPlan,
        understudyName: body.understudyName,
        understudyPosition: body.understudyPosition,
        localizationTargetDate: body.localizationTargetDate ? new Date(body.localizationTargetDate) : null,
        status: body.status,
      },
    });

    return NextResponse.json(expatriate);
  } catch (error) {
    console.error("Error updating expatriate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
