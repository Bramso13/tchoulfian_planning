import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (body.role !== undefined) updateData.role = body.role;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate || null;
    if (body.startTime !== undefined)
      updateData.startTime = body.startTime || null;
    if (body.endTime !== undefined) updateData.endTime = body.endTime || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.plannedHours !== undefined)
      updateData.plannedHours = body.plannedHours;
    if (body.notes !== undefined) updateData.notes = body.notes;
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
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'affectation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'affectation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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
