import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        project: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des activités" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const activity = await prisma.activity.create({
      data: {
        type: body.type,
        title: body.title,
        description: body.description,
        employeeId: body.employeeId,
        projectId: body.projectId,
        userId: body.userId,
        metadata: body.metadata,
      },
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        project: true,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'activité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'activité" },
      { status: 500 }
    );
  }
}
