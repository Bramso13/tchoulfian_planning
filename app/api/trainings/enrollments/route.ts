import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("TrainingEnrollment")
      .select("*")
      .order("enrolledAt", { ascending: false });

    if (enrollmentsError) throw enrollmentsError;

    // Enrichir avec les relations
    const enrichedEnrollments = await Promise.all(
      (enrollments || []).map(async (enrollment) => {
        // Employee avec profile
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

        // TrainingSession
        let trainingSession = null;
        if (enrollment.trainingSessionId) {
          const { data } = await supabase
            .from("TrainingSession")
            .select("*")
            .eq("id", enrollment.trainingSessionId)
            .single();
          trainingSession = data;
        }

        return {
          ...enrollment,
          employee,
          trainingSession,
        };
      })
    );

    return NextResponse.json(enrichedEnrollments);
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des inscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const enrollmentData = {
      employeeId: body.employeeId,
      trainingSessionId: body.trainingSessionId,
      status: body.status || "ENROLLED",
      certificateUrl: body.certificateUrl || null,
    };

    const { data: enrollment, error: createError } = await supabase
      .from("TrainingEnrollment")
      .insert(enrollmentData)
      .select("*")
      .single();

    if (createError) throw createError;

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

    return NextResponse.json(enrichedEnrollment, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'inscription" },
      { status: 500 }
    );
  }
}
