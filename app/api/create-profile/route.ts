import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@/lib/database";

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

    const supabase = await createClient();

    // Vérifier si le profil existe déjà
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    let profile;
    if (existingProfile) {
      // Mettre à jour le profil existant
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (username !== undefined) updateData.username = username;
      if (fullName !== undefined) updateData.full_name = fullName;
      if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
      if (role !== undefined) updateData.role = role;

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (updateError) throw updateError;
      profile = updatedProfile;
    } else {
      // Créer un nouveau profil
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id,
          username: username ?? null,
          full_name: fullName ?? null,
          avatar_url: avatarUrl ?? null,
          role: role ?? null,
        })
        .select("*")
        .single();

      if (createError) throw createError;
      profile = newProfile;
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Failed to create profile", error);
    return NextResponse.json(
      { error: "Impossible de créer le profil." },
      { status: 500 }
    );
  }
}
