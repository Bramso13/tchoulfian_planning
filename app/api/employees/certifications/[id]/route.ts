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
    if (body.name !== undefined) updateData.name = body.name;
    if (body.issuer !== undefined) updateData.issuer = body.issuer;
    if (body.certNumber !== undefined) updateData.certNumber = body.certNumber;
    if (body.issueDate !== undefined) updateData.issueDate = body.issueDate || null;
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate || null;
    if (body.documentUrl !== undefined) updateData.documentUrl = body.documentUrl;
    updateData.updatedAt = new Date().toISOString();

    const { data: certification, error: updateError } = await supabase
      .from("EmployeeCertification")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    // Enrichir avec l'employé
    let employee = null;
    if (certification.employeeId) {
      const { data: empData } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", certification.employeeId)
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

    const enrichedCertification = {
      ...certification,
      employee,
    };

    return NextResponse.json(enrichedCertification);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la certification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la certification" },
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
      .from("EmployeeCertification")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de la certification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la certification" },
      { status: 500 }
    );
  }
}
