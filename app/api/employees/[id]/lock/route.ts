import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const { id: employeeId } = params;
    const { projectId, isLocked, assignmentId } = body;

    if (!employeeId || !projectId || typeof isLocked !== "boolean") {
      return NextResponse.json(
        { error: "employeeId, projectId et isLocked sont requis" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let assignment;

    if (assignmentId) {
      const { data: updated, error: updateError } = await supabase
        .from("Assignment")
        .update({ isLocked, updatedAt: new Date().toISOString() })
        .eq("id", assignmentId)
        .eq("employeeId", employeeId)
        .select("*")
        .single();

      if (updateError) throw updateError;
      if (!updated) {
        return NextResponse.json(
          { error: "Affectation non trouvée" },
          { status: 404 }
        );
      }
      assignment = updated;
    } else {
      const { data: existingAssignments, error: findError } = await supabase
        .from("Assignment")
        .select("*")
        .eq("employeeId", employeeId)
        .eq("projectId", projectId)
        .order("createdAt", { ascending: false })
        .limit(1);

      if (findError) throw findError;

      if (existingAssignments && existingAssignments.length > 0) {
        const { data: updated, error: updateError } = await supabase
          .from("Assignment")
          .update({ isLocked, updatedAt: new Date().toISOString() })
          .eq("id", existingAssignments[0].id)
          .select("*")
          .single();

        if (updateError) throw updateError;
        assignment = updated;
      } else {
        const today = new Date().toISOString().split("T")[0];
        const { data: created, error: createError } = await supabase
          .from("Assignment")
          .insert({
            employeeId,
            projectId,
            startDate: today,
            status: "SCHEDULED",
            isLocked: true,
          })
          .select("*")
          .single();

        if (createError) throw createError;
        assignment = created;
      }
    }

    return NextResponse.json({
      success: true,
      assignment,
      message: isLocked ? "Employé verrouillé" : "Employé déverrouillé",
    });
  } catch (error: any) {
    console.error("Erreur lors du verrouillage/déverrouillage:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors du verrouillage/déverrouillage" },
      { status: 500 }
    );
  }
}

