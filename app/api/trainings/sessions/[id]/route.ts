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
    if (body.location !== undefined) updateData.location = body.location;
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;
    if (body.maxParticipants !== undefined) updateData.maxParticipants = body.maxParticipants;
    updateData.updatedAt = new Date().toISOString();

    const { data: trainingSession, error: updateError } = await supabase
      .from("TrainingSession")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    // Enrichir avec les enrollments
    const { data: enrollmentsData } = await supabase
      .from("TrainingEnrollment")
      .select("*")
      .eq("trainingSessionId", trainingSession.id);

    const enrollments = await Promise.all(
      (enrollmentsData || []).map(async (enrollment) => {
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
        return { ...enrollment, employee };
      })
    );

    const enrichedSession = {
      ...trainingSession,
      enrollments: enrollments || [],
    };

    return NextResponse.json(enrichedSession);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la session" },
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
      .from("TrainingSession")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de la session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la session" },
      { status: 500 }
    );
  }
}
