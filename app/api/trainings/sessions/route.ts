import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trainingSessions = await prisma.trainingSession.findMany({
      include: {
        enrollments: {
          include: {
            employee: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(trainingSessions);
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sessions de formation" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const trainingSession = await prisma.trainingSession.create({
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        provider: body.provider,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        maxParticipants: body.maxParticipants,
      },
      include: {
        enrollments: {
          include: {
            employee: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(trainingSession, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de formation" },
      { status: 500 }
    );
  }
}
