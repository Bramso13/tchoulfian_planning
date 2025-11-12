import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        jobTitle: body.jobTitle,
        contractType: body.contractType,
        status: body.status,
        departmentId: body.departmentId,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        hireDate: body.hireDate ? new Date(body.hireDate) : null,
        terminationDate: body.terminationDate
          ? new Date(body.terminationDate)
          : null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        availableFrom: body.availableFrom ? new Date(body.availableFrom) : null,
        notes: body.notes,
      },
      include: {
        profile: true,
        department: true,
        assignments: {
          include: {
            project: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        certifications: true,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'employé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'employé" },
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

    await prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'employé" },
      { status: 500 }
    );
  }
}
