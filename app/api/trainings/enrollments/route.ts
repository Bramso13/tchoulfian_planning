import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const enrollments = await prisma.trainingEnrollment.findMany({
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        trainingSession: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des inscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const enrollment = await prisma.trainingEnrollment.create({
      data: {
        employeeId: body.employeeId,
        trainingSessionId: body.trainingSessionId,
        status: body.status || "ENROLLED",
        certificateUrl: body.certificateUrl,
      },
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        trainingSession: true,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'inscription" },
      { status: 500 }
    );
  }
}
