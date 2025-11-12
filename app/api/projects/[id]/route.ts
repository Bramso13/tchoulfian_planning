import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        status: body.status,
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        coordinates: body.coordinates,
        clientId: body.clientId,
        budgetTotal: body.budgetTotal,
        budgetConsumed: body.budgetConsumed,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        actualEndDate: body.actualEndDate ? new Date(body.actualEndDate) : null,
        progress: body.progress,
        projectManagerId: body.projectManagerId,
      },
      include: {
        client: true,
        projectManager: {
          include: {
            profile: true,
          },
        },
        assignments: {
          include: {
            employee: {
              include: {
                profile: true,
              },
            },
            project: true,
          },
        },
        milestones: true,
        documents: true,
        activities: true,
        alerts: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du projet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du projet" },
      { status: 500 }
    );
  }
}
