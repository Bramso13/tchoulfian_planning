import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const certification = await prisma.employeeCertification.update({
      where: { id },
      data: {
        name: body.name,
        issuer: body.issuer,
        certNumber: body.certNumber,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
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

    return NextResponse.json(certification);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la certification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la certification" },
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

    await prisma.employeeCertification.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de la certification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la certification" },
      { status: 500 }
    );
  }
}
