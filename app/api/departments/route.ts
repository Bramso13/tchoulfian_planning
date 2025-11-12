import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des départements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const department = await prisma.department.create({
      data: {
        name: body.name,
        description: body.description,
        code: body.code,
        managerId: body.managerId,
      },
      include: {
        employees: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du département:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du département" },
      { status: 500 }
    );
  }
}
