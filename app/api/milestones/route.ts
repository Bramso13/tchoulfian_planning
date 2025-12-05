import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: milestones, error: milestonesError } = await supabase
      .from("Milestone")
      .select("*")
      .order("dueDate", { ascending: true });

    if (milestonesError) throw milestonesError;

    // Enrichir avec les projets
    const enrichedMilestones = await Promise.all(
      (milestones || []).map(async (milestone) => {
        let project = null;
        if (milestone.projectId) {
          const { data } = await supabase
            .from("Project")
            .select("*")
            .eq("id", milestone.projectId)
            .single();
          project = data;
        }

        return {
          ...milestone,
          project,
        };
      })
    );

    return NextResponse.json(enrichedMilestones);
  } catch (error) {
    console.error("Erreur lors de la récupération des jalons:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des jalons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const milestoneData = {
      projectId: body.projectId,
      title: body.title,
      description: body.description || null,
      dueDate: body.dueDate || null,
      status: body.status,
      order: body.order || 0,
    };

    const { data: milestone, error: createError } = await supabase
      .from("Milestone")
      .insert(milestoneData)
      .select("*")
      .single();

    if (createError) throw createError;

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

    return NextResponse.json(enrichedMilestone, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du jalon:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du jalon" },
      { status: 500 }
    );
  }
}
