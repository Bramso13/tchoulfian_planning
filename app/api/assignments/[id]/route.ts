import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fonctions de formatage
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

    const updateData: Record<string, unknown> = {};
    if (body.role !== undefined) updateData.role = body.role;
    if (body.startDate !== undefined) {
      const formatted = formatDate(body.startDate);
      if (formatted) updateData.startDate = formatted;
    }
    if (body.endDate !== undefined) {
      updateData.endDate = formatDate(body.endDate) || null;
    }
    if (body.startTime !== undefined) {
      updateData.startTime = formatTime(body.startTime) || null;
    }
    if (body.endTime !== undefined) {
      updateData.endTime = formatTime(body.endTime) || null;
    }
    if (body.status !== undefined) updateData.status = body.status;
    if (body.plannedHours !== undefined)
      updateData.plannedHours = body.plannedHours;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.isLocked !== undefined) updateData.isLocked = body.isLocked;
    updateData.updatedAt = new Date().toISOString();

    const { data: assignment, error: updateError } = await supabase
      .from("Assignment")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

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

    return NextResponse.json(enrichedAssignment);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'affectation:", error);
    const errorMessage = error?.message || error?.details || "Erreur lors de la mise à jour de l'affectation";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error: deleteError } = await supabase
      .from("Assignment")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'affectation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'affectation" },
      { status: 500 }
    );
  }
}
