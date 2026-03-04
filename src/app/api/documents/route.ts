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

    // Non-admin/regulator users only see own org docs
    if (session.user.role === "MINING_COMPANY" || session.user.role === "SUPPLIER") {
      if (session.user.organizationId) {
        where.organizationId = session.user.organizationId;
      }
    }

    const documents = await prisma.document.findMany({
      where,
      include: { organization: true },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
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

    const document = await prisma.document.create({
      data: {
        organizationId: session.user.organizationId,
        type: body.type,
        fileName: body.fileName,
        fileUrl: body.fileUrl || `/uploads/${body.fileName}`,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
