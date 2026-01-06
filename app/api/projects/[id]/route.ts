import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { id } = params;
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode;
    if (body.coordinates !== undefined) updateData.coordinates = body.coordinates;
    if (body.clientId !== undefined) updateData.clientId = body.clientId;
    if (body.budgetTotal !== undefined) updateData.budgetTotal = body.budgetTotal;
    if (body.budgetConsumed !== undefined) updateData.budgetConsumed = body.budgetConsumed;
    if (body.startDate !== undefined) updateData.startDate = body.startDate || null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate || null;
    if (body.actualEndDate !== undefined) updateData.actualEndDate = body.actualEndDate || null;
    if (body.progress !== undefined) updateData.progress = body.progress;
    if (body.projectManagerId !== undefined) updateData.projectManagerId = body.projectManagerId;
    updateData.updatedAt = new Date().toISOString();

    const { data: project, error: updateError } = await supabase
      .from("Project")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    // Enrichir avec les relations (même logique que GET)
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

    const { data: milestones } = await supabase
      .from("Milestone")
      .select("*")
      .eq("projectId", project.id);

    const { data: documents } = await supabase
      .from("Document")
      .select("*")
      .eq("projectId", project.id);

    const { data: activities } = await supabase
      .from("Activity")
      .select("*")
      .eq("projectId", project.id);

    const { data: alerts } = await supabase
      .from("Alert")
      .select("*")
      .eq("projectId", project.id);

    const enrichedProject = {
      ...project,
      client,
      projectManager,
      assignments: assignments || [],
      milestones: milestones || [],
      documents: documents || [],
      activities: activities || [],
      alerts: alerts || [],
    };

    return NextResponse.json(enrichedProject);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du projet" },
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
      .from("Project")
      .update({ deletedAt: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du projet" },
      { status: 500 }
    );
  }
}
