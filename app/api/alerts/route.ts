import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: alerts, error: alertsError } = await supabase
      .from("Alert")
      .select("*")
      .order("createdAt", { ascending: false });

    if (alertsError) throw alertsError;

    // Enrichir avec les projets
    const enrichedAlerts = await Promise.all(
      (alerts || []).map(async (alert) => {
        let project = null;
        if (alert.projectId) {
          const { data } = await supabase
            .from("Project")
            .select("*")
            .eq("id", alert.projectId)
            .single();
          project = data;
        }

        return {
          ...alert,
          project,
        };
      })
    );

    return NextResponse.json(enrichedAlerts);
  } catch (error) {
    console.error("Erreur lors de la récupération des alertes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des alertes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const alertData = {
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      severity: body.severity,
    };

    const { data: alert, error: createError } = await supabase
      .from("Alert")
      .insert(alertData)
      .select("*")
      .single();

    if (createError) throw createError;

    // Enrichir avec le projet
    let project = null;
    if (alert.projectId) {
      const { data } = await supabase
        .from("Project")
        .select("*")
        .eq("id", alert.projectId)
        .single();
      project = data;
    }

    const enrichedAlert = {
      ...alert,
      project,
    };

    return NextResponse.json(enrichedAlert, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'alerte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'alerte" },
      { status: 500 }
    );
  }
}
