import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import type { OrganizationType, UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      organizationName,
      registrationNumber,
      tinNumber,
      region,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role || !organizationName || !registrationNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Check if organization already exists
    const existingOrg = await prisma.organization.findUnique({ where: { registrationNumber } });
    if (existingOrg) {
      return NextResponse.json({ error: "Organization registration number already exists" }, { status: 409 });
    }

    // Map role to organization type
    const orgTypeMap: Record<string, OrganizationType> = {
      MINING_COMPANY: "MINING_COMPANY",
      SUPPLIER: "SUPPLIER",
      REGULATOR: "REGULATORY_BODY",
    };

    const passwordHash = await hash(password, 12);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          type: orgTypeMap[role] || "SUPPLIER",
          registrationNumber,
          tinNumber: tinNumber || null,
          region: region || null,
        },
      });

      // Create type-specific profile
      if (role === "SUPPLIER") {
        await tx.supplierProfile.create({
          data: { organizationId: organization.id },
        });
      } else if (role === "MINING_COMPANY") {
        await tx.miningCompanyProfile.create({
          data: { organizationId: organization.id },
        });
      }

      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          role: role as UserRole,
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        userId: result.user.id,
        organizationId: result.organization.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
