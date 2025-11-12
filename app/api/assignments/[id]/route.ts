import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        role: body.role,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
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

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'affectation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'affectation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    await prisma.assignment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'affectation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'affectation" },
      { status: 500 }
    );
  }
}
