import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const trainingSession = await prisma.trainingSession.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        provider: body.provider,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        maxParticipants: body.maxParticipants,
      },
      include: {
        enrollments: {
          include: {
            employee: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(trainingSession);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la session" },
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

    await prisma.trainingSession.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de la session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la session" },
      { status: 500 }
    );
  }
}
