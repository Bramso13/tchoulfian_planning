import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
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
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const document = await prisma.document.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        fileUrl: body.fileUrl,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
        employeeId: body.employeeId,
        projectId: body.projectId,
        uploadedBy: body.uploadedBy,
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

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du document:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du document" },
      { status: 500 }
    );
  }
}
