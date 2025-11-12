import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const milestones = await prisma.milestone.findMany({
      include: {
        project: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Erreur lors de la récupération des jalons:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des jalons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const milestone = await prisma.milestone.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status,
        order: body.order || 0,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du jalon:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du jalon" },
      { status: 500 }
    );
  }
}
