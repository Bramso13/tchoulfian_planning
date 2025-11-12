import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

type CreateProfileBody = {
  id?: string;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: Role | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProfileBody;
    const { id, username, fullName, avatarUrl, role } = body;

    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant utilisateur est requis." },
        { status: 400 }
      );
    }

    const profile = await prisma.profiles.upsert({
      where: { id },
      update: {
        username: username ?? undefined,
        full_name: fullName ?? undefined,
        avatar_url: avatarUrl ?? undefined,
        updated_at: new Date(),
        role: role ?? undefined,
      },
      create: {
        id,
        username: username ?? null,
        full_name: fullName ?? null,
        avatar_url: avatarUrl ?? null,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Failed to create profile", error);
    return NextResponse.json(
      { error: "Impossible de créer le profil." },
      { status: 500 }
    );
  }
}
