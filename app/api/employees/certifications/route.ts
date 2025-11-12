import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const certifications = await prisma.employeeCertification.findMany({
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des certifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des certifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const certification = await prisma.employeeCertification.create({
      data: {
        employeeId: body.employeeId,
        name: body.name,
        issuer: body.issuer,
        certNumber: body.certNumber,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        documentUrl: body.documentUrl,
      },
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la certification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la certification" },
      { status: 500 }
    );
  }
}
