import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: projects, error: projectsError } = await supabase
      .from("Project")
      .select("*")
      .is("deletedAt", null)
      .order("createdAt", { ascending: false });

    if (projectsError) throw projectsError;

    // Enrichir avec les relations
    const enrichedProjects = await Promise.all(
      (projects || []).map(async (project) => {
        // Client
        let client = null;
        if (project.clientId) {
          const { data } = await supabase
            .from("Client")
            .select("*")
            .eq("id", project.clientId)
            .single();
          client = data;
        }

        // Project Manager avec profil
        let projectManager = null;
        if (project.projectManagerId) {
          const { data: managerData } = await supabase
            .from("Employee")
            .select("*")
            .eq("id", project.projectManagerId)
            .single();
          
          if (managerData) {
            let profile = null;
            if (managerData.profileId) {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", managerData.profileId)
                .single();
              profile = profileData;
            }
            projectManager = { ...managerData, profile };
          }
        }

        // Assignments avec employees
        const { data: assignmentsData } = await supabase
          .from("Assignment")
          .select("*")
          .eq("projectId", project.id);

        const assignments = await Promise.all(
          (assignmentsData || []).map(async (assignment) => {
            let employee = null;
            if (assignment.employeeId) {
              const { data: empData } = await supabase
                .from("Employee")
                .select("*")
                .eq("id", assignment.employeeId)
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
            return { ...assignment, employee, project };
          })
        );

        // Milestones
        const { data: milestones } = await supabase
          .from("Milestone")
          .select("*")
          .eq("projectId", project.id);

        // Documents
        const { data: documents } = await supabase
          .from("Document")
          .select("*")
          .eq("projectId", project.id);

        // Activities
        const { data: activities } = await supabase
          .from("Activity")
          .select("*")
          .eq("projectId", project.id);

        // Alerts
        const { data: alerts } = await supabase
          .from("Alert")
          .select("*")
          .eq("projectId", project.id);

        return {
          ...project,
          client,
          projectManager,
          assignments: assignments || [],
          milestones: milestones || [],
          documents: documents || [],
          activities: activities || [],
          alerts: alerts || [],
        };
      })
    );

    return NextResponse.json(enrichedProjects);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const isValidUuid = (value: unknown) =>
      typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value);

    const projectData = {
      name: body.name,
      description: body.description || null,
      type: body.type,
      status: body.status,
      address: body.address || null,
      city: body.city || null,
      postalCode: body.postalCode || null,
      coordinates: body.coordinates || null,
      // Si l'ID client ou chef de projet n'est pas un UUID valide,
      // on l'ignore pour éviter les erreurs côté base.
      clientId: isValidUuid(body.clientId) ? body.clientId : null,
      budgetTotal: body.budgetTotal || null,
      budgetConsumed: body.budgetConsumed || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      progress: body.progress || 0,
      projectManagerId: isValidUuid(body.projectManagerId)
        ? body.projectManagerId
        : null,
    };

    const { data: project, error: createError } = await supabase
      .from("Project")
      .insert(projectData)
      .select("*")
      .single();

    if (createError) throw createError;

    // Enrichir avec les relations
    let client = null;
    if (project.clientId) {
      const { data } = await supabase
        .from("Client")
        .select("*")
        .eq("id", project.clientId)
        .single();
      client = data;
    }

    let projectManager = null;
    if (project.projectManagerId) {
      const { data: managerData } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", project.projectManagerId)
        .single();
      
      if (managerData) {
        let profile = null;
        if (managerData.profileId) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", managerData.profileId)
            .single();
          profile = profileData;
        }
        projectManager = { ...managerData, profile };
      }
    }

    const enrichedProject = {
      ...project,
      client,
      projectManager,
      assignments: [],
      milestones: [],
      documents: [],
      activities: [],
      alerts: [],
    };

    return NextResponse.json(enrichedProject, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    );
  }
}
