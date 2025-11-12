import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
        status: body.status,
        order: body.order,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du jalon:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du jalon" },
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

    await prisma.milestone.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression du jalon:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du jalon" },
      { status: 500 }
    );
  }
}
