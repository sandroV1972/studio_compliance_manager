import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Initialize Super Admin
 * ONE-TIME endpoint to create super admin user
 * Can only be called when database is empty
 */
export async function POST() {
  try {
    // Security check: Only allow if NO users exist
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      return NextResponse.json(
        {
          error:
            "Database already has users. This endpoint can only be used on empty database.",
          userCount,
        },
        { status: 403 },
      );
    }

    // Get credentials from environment
    const email = process.env.SUPER_ADMIN_EMAIL || "admin@3jdigital.solutions";
    const password = process.env.SUPER_ADMIN_PASSWORD || "Admin123!";
    const name = process.env.SUPER_ADMIN_NAME || "Amministratore Sistema";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        isSuperAdmin: true,
        accountStatus: "APPROVED",
        emailVerified: new Date(),
        needsOnboarding: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Super admin created successfully",
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
      },
    });
  } catch (error) {
    console.error("Error creating super admin:", error);

    return NextResponse.json(
      {
        error: "Failed to create super admin",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
