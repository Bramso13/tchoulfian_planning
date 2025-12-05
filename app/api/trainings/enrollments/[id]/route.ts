import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { id } = params;
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.completedAt !== undefined) updateData.completedAt = body.completedAt || null;
    if (body.certificateUrl !== undefined) updateData.certificateUrl = body.certificateUrl;
    updateData.updatedAt = new Date().toISOString();

    const { data: enrollment, error: updateError } = await supabase
      .from("TrainingEnrollment")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    // Enrichir avec les relations
    let employee = null;
    if (enrollment.employeeId) {
      const { data: empData } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", enrollment.employeeId)
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

    let trainingSession = null;
    if (enrollment.trainingSessionId) {
      const { data } = await supabase
        .from("TrainingSession")
        .select("*")
        .eq("id", enrollment.trainingSessionId)
        .single();
      trainingSession = data;
    }

    const enrichedEnrollment = {
      ...enrollment,
      employee,
      trainingSession,
    };

    return NextResponse.json(enrichedEnrollment);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'inscription" },
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
      .from("TrainingEnrollment")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'inscription" },
      { status: 500 }
    );
  }
}
