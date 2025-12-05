import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: trainingSessions, error: sessionsError } = await supabase
      .from("TrainingSession")
      .select("*")
      .order("startDate", { ascending: false });

    if (sessionsError) throw sessionsError;

    // Enrichir avec les enrollments
    const enrichedSessions = await Promise.all(
      (trainingSessions || []).map(async (session) => {
        const { data: enrollmentsData } = await supabase
          .from("TrainingEnrollment")
          .select("*")
          .eq("trainingSessionId", session.id);

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

        return {
          ...session,
          enrollments: enrollments || [],
        };
      })
    );

    return NextResponse.json(enrichedSessions);
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sessions de formation" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const sessionData = {
      name: body.name,
      description: body.description || null,
      location: body.location || null,
      provider: body.provider || null,
      startDate: body.startDate,
      endDate: body.endDate,
      maxParticipants: body.maxParticipants || null,
    };

    const { data: trainingSession, error: createError } = await supabase
      .from("TrainingSession")
      .insert(sessionData)
      .select("*")
      .single();

    if (createError) throw createError;

    const enrichedSession = {
      ...trainingSession,
      enrollments: [],
    };

    return NextResponse.json(enrichedSession, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de formation" },
      { status: 500 }
    );
  }
}
