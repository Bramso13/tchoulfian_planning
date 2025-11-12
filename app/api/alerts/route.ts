import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        project: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Erreur lors de la récupération des alertes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des alertes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const alert = await prisma.alert.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        description: body.description,
        severity: body.severity,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'alerte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'alerte" },
      { status: 500 }
    );
  }
}
