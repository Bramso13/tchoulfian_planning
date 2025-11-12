import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const enrollment = await prisma.trainingEnrollment.update({
      where: { id },
      data: {
        status: body.status,
        completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
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

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'inscription" },
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

    await prisma.trainingEnrollment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'inscription" },
      { status: 500 }
    );
  }
}
