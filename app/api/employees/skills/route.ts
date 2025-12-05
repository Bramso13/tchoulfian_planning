import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: skills, error: skillsError } = await supabase
      .from("EmployeeSkill")
      .select("*")
      .order("createdAt", { ascending: false });

    if (skillsError) throw skillsError;

    // Enrichir avec les relations
    const enrichedSkills = await Promise.all(
      (skills || []).map(async (skill) => {
        // Employee avec profile
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

        // Skill
        let skillData = null;
        if (skill.skillId) {
          const { data } = await supabase
            .from("Skill")
            .select("*")
            .eq("id", skill.skillId)
            .single();
          skillData = data;
        }

        return {
          ...skill,
          employee,
          skill: skillData,
        };
      })
    );

    return NextResponse.json(enrichedSkills);
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
    const supabase = await createClient();

    // Si un skillName est fourni, chercher ou créer le skill
    let skillId = body.skillId;
    if (body.skillName && !skillId) {
      // Chercher le skill existant par nom (insensible à la casse)
      const { data: existingSkills } = await supabase
        .from("Skill")
        .select("*")
        .ilike("name", body.skillName)
        .limit(1);

      let existingSkill = existingSkills?.[0] || null;

      // Si le skill n'existe pas, le créer
      if (!existingSkill) {
        const { data: newSkill, error: createSkillError } = await supabase
          .from("Skill")
          .insert({
            name: body.skillName,
            category: body.category || null,
          })
          .select("*")
          .single();

        if (createSkillError) throw createSkillError;
        existingSkill = newSkill;
      }

      skillId = existingSkill.id;
    }

    const skillData = {
      employeeId: body.employeeId,
      skillId: skillId,
      level: body.level,
      yearsExp: body.yearsExp || null,
    };

    const { data: skill, error: createError } = await supabase
      .from("EmployeeSkill")
      .insert(skillData)
      .select("*")
      .single();

    if (createError) throw createError;

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

    let skillDataObj = null;
    if (skill.skillId) {
      const { data } = await supabase
        .from("Skill")
        .select("*")
        .eq("id", skill.skillId)
        .single();
      skillDataObj = data;
    }

    const enrichedSkill = {
      ...skill,
      employee,
      skill: skillDataObj,
    };

    return NextResponse.json(enrichedSkill, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la compétence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la compétence" },
      { status: 500 }
    );
  }
}
