import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: assignments, error: assignmentsError } = await supabase
      .from("Assignment")
      .select("*")
      .order("startDate", { ascending: true });

    if (assignmentsError) throw assignmentsError;

    // Enrichir avec les relations
    const enrichedAssignments = await Promise.all(
      (assignments || []).map(async (assignment) => {
        // Employee avec profil, compétences et habilitations
        let employee = null;
        if (assignment.employeeId) {
          const { data: empData } = await supabase
            .from("Employee")
            .select("*")
            .eq("id", assignment.employeeId)
            .single();

          if (empData) {
            // Profil
            let profile = null;
            if (empData.profileId) {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", empData.profileId)
                .single();
              profile = profileData;
            }

            // Compétences
            const { data: skillsData } = await supabase
              .from("EmployeeSkill")
              .select("*")
              .eq("employeeId", empData.id);

            const skills = await Promise.all(
              (skillsData || []).map(async (skill) => {
                let skillData = null;
                if (skill.skillId) {
                  const { data } = await supabase
                    .from("Skill")
                    .select("*")
                    .eq("id", skill.skillId)
                    .single();
                  skillData = data;
                }
                return { ...skill, skill: skillData };
              })
            );

            // Habilitations / certifications
            const { data: certifications } = await supabase
              .from("EmployeeCertification")
              .select("*")
              .eq("employeeId", empData.id);

            employee = {
              ...empData,
              profile,
              skills: skills || [],
              certifications: certifications || [],
            };
          }
        }

        // Project
        let project = null;
        if (assignment.projectId) {
          const { data } = await supabase
            .from("Project")
            .select("*")
            .eq("id", assignment.projectId)
            .single();
          project = data;
        }

        return {
          ...assignment,
          employee,
          project,
        };
      })
    );

    return NextResponse.json(enrichedAssignments);
  } catch (error) {
    console.error("Erreur lors de la récupération des affectations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des affectations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Convertir les dates au bon format
    const formatDate = (date: string | Date | null): string | null => {
      if (!date) return null;
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0]; // Format YYYY-MM-DD pour DATE
    };

    const formatTime = (dateTime: string | Date | null): string | null => {
      if (!dateTime) return null;
      const dt = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
      if (isNaN(dt.getTime())) return null;
      const hours = dt.getHours().toString().padStart(2, '0');
      const minutes = dt.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}:00`; // Format HH:MM:SS pour TIME
    };

    // Validation des champs requis
    if (!body.employeeId || !body.projectId || !body.startDate) {
      return NextResponse.json(
        { error: "Les champs employeeId, projectId et startDate sont requis" },
        { status: 400 }
      );
    }

    const formattedStartDate = formatDate(body.startDate);
    if (!formattedStartDate) {
      return NextResponse.json(
        { error: "La date de début est invalide" },
        { status: 400 }
      );
    }

    const assignmentData = {
      employeeId: body.employeeId,
      projectId: body.projectId,
      role: body.role || null,
      startDate: formattedStartDate,
      endDate: formatDate(body.endDate) || null,
      startTime: formatTime(body.startTime) || null,
      endTime: formatTime(body.endTime) || null,
      status: body.status,
      plannedHours: body.plannedHours || null,
      notes: body.notes || null,
      isLocked: body.isLocked || false,
    };

    const { data: assignment, error: createError } = await supabase
      .from("Assignment")
      .insert(assignmentData)
      .select("*")
      .single();

    if (createError) throw createError;

    // Enrichir avec les relations
    let employee = null;
    if (assignment.employeeId) {
      const { data: empData } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", assignment.employeeId)
        .single();

      if (empData) {
        // Profil
        let profile = null;
        if (empData.profileId) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", empData.profileId)
            .single();
          profile = profileData;
        }

        // Compétences
        const { data: skillsData } = await supabase
          .from("EmployeeSkill")
          .select("*")
          .eq("employeeId", empData.id);

        const skills = await Promise.all(
          (skillsData || []).map(async (skill) => {
            let skillData = null;
            if (skill.skillId) {
              const { data } = await supabase
                .from("Skill")
                .select("*")
                .eq("id", skill.skillId)
                .single();
              skillData = data;
            }
            return { ...skill, skill: skillData };
          })
        );

        // Habilitations / certifications
        const { data: certifications } = await supabase
          .from("EmployeeCertification")
          .select("*")
          .eq("employeeId", empData.id);

        employee = {
          ...empData,
          profile,
          skills: skills || [],
          certifications: certifications || [],
        };
      }
    }

    let project = null;
    if (assignment.projectId) {
      const { data } = await supabase
        .from("Project")
        .select("*")
        .eq("id", assignment.projectId)
        .single();
      project = data;
    }

    const enrichedAssignment = {
      ...assignment,
      employee,
      project,
    };

    return NextResponse.json(enrichedAssignment, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création de l'affectation:", error);
    const errorMessage = error?.message || error?.details || "Erreur lors de la création de l'affectation";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
