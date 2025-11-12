import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const skill = await prisma.employeeSkill.update({
      where: { id },
      data: {
        level: body.level,
        yearsExp: body.yearsExp,
      },
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        skill: true,
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la compétence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la compétence" },
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

    await prisma.employeeSkill.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de la compétence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la compétence" },
      { status: 500 }
    );
  }
}
