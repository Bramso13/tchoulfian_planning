import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate || null;
    if (body.completedAt !== undefined) updateData.completedAt = body.completedAt || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.order !== undefined) updateData.order = body.order;
    updateData.updatedAt = new Date().toISOString();

    const { data: milestone, error: updateError } = await supabase
      .from("Milestone")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    // Enrichir avec le projet
    let project = null;
    if (milestone.projectId) {
      const { data } = await supabase
        .from("Project")
        .select("*")
        .eq("id", milestone.projectId)
        .single();
      project = data;
    }

    const enrichedMilestone = {
      ...milestone,
      project,
    };

    return NextResponse.json(enrichedMilestone);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du jalon:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du jalon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();

    const { error: deleteError } = await supabase
      .from("Milestone")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression du jalon:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du jalon" },
      { status: 500 }
    );
  }
}
