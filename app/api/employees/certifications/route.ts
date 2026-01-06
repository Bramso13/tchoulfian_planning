import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: certifications, error: certificationsError } = await supabase
      .from("EmployeeCertification")
      .select("*")
      .order("createdAt", { ascending: false });

    if (certificationsError) throw certificationsError;

    // Enrichir avec les employés
    const enrichedCertifications = await Promise.all(
      (certifications || []).map(async (certification) => {
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

        return {
          ...certification,
          employee,
        };
      })
    );

    return NextResponse.json(enrichedCertifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des certifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des certifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const certificationData = {
      employeeId: body.employeeId,
      name: body.name,
      issuer: body.issuer || null,
      certNumber: body.certNumber || null,
      issueDate: body.issueDate || null,
      expiryDate: body.expiryDate || null,
      documentUrl: body.documentUrl || null,
    };

    const { data: certification, error: createError } = await supabase
      .from("EmployeeCertification")
      .insert(certificationData)
      .select("*")
      .single();

    if (createError) throw createError;

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

    return NextResponse.json(enrichedCertification, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la certification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la certification" },
      { status: 500 }
    );
  }
}
