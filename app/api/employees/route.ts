import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des employés" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const employee = await prisma.employee.create({
      data: {
        profileId: body.profileId || null,
        name: body.name || null,
        jobTitle: body.jobTitle,
        contractType: body.contractType,
        status: body.status,
        departmentId: body.departmentId || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        postalCode: body.postalCode || null,
        imageUrl: body.imageUrl || null,
        hireDate: body.hireDate ? new Date(body.hireDate) : null,
        terminationDate: body.terminationDate
          ? new Date(body.terminationDate)
          : null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        availableFrom: body.availableFrom ? new Date(body.availableFrom) : null,
        notes: body.notes || null,
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

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'employé" },
      { status: 500 }
    );
  }
}
