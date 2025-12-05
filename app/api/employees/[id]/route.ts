import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { id } = params;
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (body.jobTitle !== undefined) updateData.jobTitle = body.jobTitle;
    if (body.contractType !== undefined) updateData.contractType = body.contractType;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode;
    if (body.hireDate !== undefined) updateData.hireDate = body.hireDate || null;
    if (body.terminationDate !== undefined) updateData.terminationDate = body.terminationDate || null;
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate || null;
    if (body.availableFrom !== undefined) updateData.availableFrom = body.availableFrom || null;
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.updatedAt = new Date().toISOString();

    const { data: employee, error: updateError } = await supabase
      .from("Employee")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    // Enrichir avec les relations
    let profile = null;
    if (employee.profileId) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", employee.profileId)
        .single();
      profile = data;
    }

    let department = null;
    if (employee.departmentId) {
      const { data } = await supabase
        .from("Department")
        .select("*")
        .eq("id", employee.departmentId)
        .single();
      department = data;
    }

    const { data: assignmentsData } = await supabase
      .from("Assignment")
      .select("*")
      .eq("employeeId", employee.id);

    const assignments = await Promise.all(
      (assignmentsData || []).map(async (assignment) => {
        let project = null;
        if (assignment.projectId) {
          const { data } = await supabase
            .from("Project")
            .select("*")
            .eq("id", assignment.projectId)
            .single();
          project = data;
        }
        return { ...assignment, project };
      })
    );

    const { data: skillsData } = await supabase
      .from("EmployeeSkill")
      .select("*")
      .eq("employeeId", employee.id);

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

    const { data: certifications } = await supabase
      .from("EmployeeCertification")
      .select("*")
      .eq("employeeId", employee.id);

    const enrichedEmployee = {
      ...employee,
      profile,
      department,
      assignments: assignments || [],
      skills: skills || [],
      certifications: certifications || [],
    };

    return NextResponse.json(enrichedEmployee);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'employé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'employé" },
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
      .from("Employee")
      .update({ deletedAt: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'employé" },
      { status: 500 }
    );
  }
}
