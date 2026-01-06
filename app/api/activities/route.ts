import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: activities, error: activitiesError } = await supabase
      .from("Activity")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(100);

    if (activitiesError) throw activitiesError;

    // Enrichir avec les relations
    const enrichedActivities = await Promise.all(
      (activities || []).map(async (activity) => {
        // Employee avec profile
        let employee = null;
        if (activity.employeeId) {
          const { data: empData } = await supabase
            .from("Employee")
            .select("*")
            .eq("id", activity.employeeId)
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

        // Project
        let project = null;
        if (activity.projectId) {
          const { data } = await supabase
            .from("Project")
            .select("*")
            .eq("id", activity.projectId)
            .single();
          project = data;
        }

        return {
          ...activity,
          employee,
          project,
        };
      })
    );

    return NextResponse.json(enrichedActivities);
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des activités" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const activityData = {
      type: body.type,
      title: body.title,
      description: body.description || null,
      employeeId: body.employeeId || null,
      projectId: body.projectId || null,
      userId: body.userId || null,
      metadata: body.metadata || null,
    };

    const { data: activity, error: createError } = await supabase
      .from("Activity")
      .insert(activityData)
      .select("*")
      .single();

    if (createError) throw createError;

    // Enrichir avec les relations
    let employee = null;
    if (activity.employeeId) {
      const { data: empData } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", activity.employeeId)
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

    let project = null;
    if (activity.projectId) {
      const { data } = await supabase
        .from("Project")
        .select("*")
        .eq("id", activity.projectId)
        .single();
      project = data;
    }

    const enrichedActivity = {
      ...activity,
      employee,
      project,
    };

    return NextResponse.json(enrichedActivity, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'activité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'activité" },
      { status: 500 }
    );
  }
}
