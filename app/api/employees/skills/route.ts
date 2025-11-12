import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.employeeSkill.findMany({
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        skill: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Erreur lors de la récupération des compétences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des compétences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Si un skillName est fourni, chercher ou créer le skill
    let skillId = body.skillId;
    if (body.skillName && !skillId) {
      // Chercher le skill existant par nom
      let existingSkill = await prisma.skill.findFirst({
        where: {
          name: {
            equals: body.skillName,
            mode: "insensitive",
          },
        },
      });

      // Si le skill n'existe pas, le créer
      if (!existingSkill) {
        existingSkill = await prisma.skill.create({
          data: {
            name: body.skillName,
            category: body.category || null,
          },
        });
      }

      skillId = existingSkill.id;
    }

    const skill = await prisma.employeeSkill.create({
      data: {
        employeeId: body.employeeId,
        skillId: skillId,
        level: body.level,
        yearsExp: body.yearsExp || null,
      },
      include: {
        employee: {
          include: {
            profile: true,
          },
        },
        skill: true,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la compétence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la compétence" },
      { status: 500 }
    );
  }
}
