import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        project: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Erreur lors de la récupération des affectations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des affectations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const assignment = await prisma.assignment.create({
      data: {
        employeeId: body.employeeId,
        projectId: body.projectId,
        role: body.role,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        startTime: body.startTime ? new Date(body.startTime) : null,
        endTime: body.endTime ? new Date(body.endTime) : null,
        status: body.status,
        plannedHours: body.plannedHours,
        notes: body.notes,
      },
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        project: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'affectation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'affectation" },
      { status: 500 }
    );
  }
}
