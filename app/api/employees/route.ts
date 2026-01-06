import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Récupérer les employés de base
    const { data: employees, error: employeesError } = await supabase
      .from("Employee")
      .select("*")
      .is("deletedAt", null)
      .order("createdAt", { ascending: false });

    if (employeesError) throw employeesError;

    // Enrichir avec les relations
    const enrichedEmployees = await Promise.all(
      (employees || []).map(async (employee) => {
        // Récupérer le profil
        let profile = null;
        if (employee.profileId) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", employee.profileId)
            .single();
          profile = data;
        }

        // Récupérer le département
        let department = null;
        if (employee.departmentId) {
          const { data } = await supabase
            .from("Department")
            .select("*")
            .eq("id", employee.departmentId)
            .single();
          department = data;
        }

        // Récupérer les affectations avec projets
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

        // Récupérer les compétences avec skill
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

        // Récupérer les certifications
        const { data: certifications } = await supabase
          .from("EmployeeCertification")
          .select("*")
          .eq("employeeId", employee.id);

        return {
          ...employee,
          profile,
          department,
          assignments: assignments || [],
          skills: skills || [],
          certifications: certifications || [],
        };
      })
    );

    return NextResponse.json(enrichedEmployees);
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des employés" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const employeeData = {
      profileId: body.profileId || null,
      name: body.name || null,
      jobTitle: body.jobTitle,
      contractType: body.contractType,
      status: body.status,
      departmentId: body.departmentId || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      postalCode: body.postalCode || null,
      imageUrl: body.imageUrl || null,
      hireDate: body.hireDate || null,
      terminationDate: body.terminationDate || null,
      birthDate: body.birthDate || null,
      availableFrom: body.availableFrom || null,
      notes: body.notes || null,
    };

    const { data: employee, error: createError } = await supabase
      .from("Employee")
      .insert(employeeData)
      .select("*")
      .single();

    if (createError) throw createError;

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

    const enrichedEmployee = {
      ...employee,
      profile,
      department,
      assignments: [],
      skills: [],
      certifications: [],
    };

    return NextResponse.json(enrichedEmployee, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'employé" },
      { status: 500 }
    );
  }
}
