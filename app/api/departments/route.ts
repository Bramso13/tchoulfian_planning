import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: departments, error: departmentsError } = await supabase
      .from("Department")
      .select("*")
      .order("name", { ascending: true });

    if (departmentsError) throw departmentsError;

    // Enrichir avec les employés
    const enrichedDepartments = await Promise.all(
      (departments || []).map(async (department) => {
        const { data: employeesData } = await supabase
          .from("Employee")
          .select("*")
          .eq("departmentId", department.id)
          .is("deletedAt", null);

        const employees = await Promise.all(
          (employeesData || []).map(async (employee) => {
            let profile = null;
            if (employee.profileId) {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", employee.profileId)
                .single();
              profile = profileData;
            }
            return { ...employee, profile };
          })
        );

        return {
          ...department,
          employees: employees || [],
        };
      })
    );

    return NextResponse.json(enrichedDepartments);
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des départements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const departmentData = {
      name: body.name,
      description: body.description || null,
      code: body.code || null,
      managerId: body.managerId || null,
    };

    const { data: department, error: createError } = await supabase
      .from("Department")
      .insert(departmentData)
      .select("*")
      .single();

    if (createError) throw createError;

    // Enrichir avec les employés
    const { data: employeesData } = await supabase
      .from("Employee")
      .select("*")
      .eq("departmentId", department.id)
      .is("deletedAt", null);

    const employees = await Promise.all(
      (employeesData || []).map(async (employee) => {
        let profile = null;
        if (employee.profileId) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", employee.profileId)
            .single();
          profile = profileData;
        }
        return { ...employee, profile };
      })
    );

    const enrichedDepartment = {
      ...department,
      employees: employees || [],
    };

    return NextResponse.json(enrichedDepartment, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du département:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du département" },
      { status: 500 }
    );
  }
}
