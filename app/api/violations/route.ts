import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const violations = await prisma.violation.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: { vehicle: true, enforcer: true, payment: true },
  });
  const total = await prisma.violation.count();

  return NextResponse.json({ data: violations, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const violation = await prisma.violation.create({
    data: {
      vehicleId: body.vehicleId,
      enforcerId: Number(session.user.id),
      violationType: body.violationType,
      fineAmount: body.fineAmount,
      description: body.description,
      payment: { create: { status: "UNPAID", amountPaid: 0 } },
    },
  });

  await prisma.auditTrail.create({
    data: {
      userId: Number(session.user.id),
      action: `Created Violation #${violation.id}`,
      details: `Violation for vehicle ${body.vehicleId}`,
    },
  });

  return NextResponse.json(violation, { status: 201 });
}