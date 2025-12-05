import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { id } = params;
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (body.level !== undefined) updateData.level = body.level;
    if (body.yearsExp !== undefined) updateData.yearsExp = body.yearsExp;
    updateData.updatedAt = new Date().toISOString();

    const { data: skill, error: updateError } = await supabase
      .from("EmployeeSkill")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    // Enrichir avec les relations
    let employee = null;
    if (skill.employeeId) {
      const { data: empData } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", skill.employeeId)
        .single();
      
      if (empData) {
        let profile = null;
        if (empData.profileId) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", empData.profileId)
            .single();
          profile = profileData;
        }
        employee = { ...empData, profile };
      }
    }

    let skillData = null;
    if (skill.skillId) {
      const { data } = await supabase
        .from("Skill")
        .select("*")
        .eq("id", skill.skillId)
        .single();
      skillData = data;
    }

    const enrichedSkill = {
      ...skill,
      employee,
      skill: skillData,
    };

    return NextResponse.json(enrichedSkill);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la compétence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la compétence" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const supabase = await createClient();

    const { error: deleteError } = await supabase
      .from("EmployeeSkill")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de la compétence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la compétence" },
      { status: 500 }
    );
  }
}
