import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true,
        projectManager: {
          include: {
            profile: true,
          },
        },
        assignments: {
          include: {
            employee: {
              include: {
                profile: true,
              },
            },
            project: true,
          },
        },
        milestones: true,
        documents: true,
        activities: true,
        alerts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      where: {
        deletedAt: null,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        status: body.status,
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        coordinates: body.coordinates,
        clientId: body.clientId,
        budgetTotal: body.budgetTotal,
        budgetConsumed: body.budgetConsumed,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        progress: body.progress || 0,
        projectManagerId: body.projectManagerId,
      },
      include: {
        client: true,
        projectManager: {
          include: {
            profile: true,
          },
        },
        assignments: {
          include: {
            employee: {
              include: {
                profile: true,
              },
            },
            project: true,
          },
        },
        milestones: true,
        documents: true,
        activities: true,
        alerts: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    );
  }
}
