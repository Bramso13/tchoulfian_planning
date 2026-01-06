import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: assignments, error: assignmentsError } = await supabase
      .from("Assignment")
      .select("*")
      .order("startDate", { ascending: true });

    if (assignmentsError) throw assignmentsError;

    // Enrichir avec les relations
    const enrichedAssignments = await Promise.all(
      (assignments || []).map(async (assignment) => {
        // Employee avec profile
        let employee = null;
        if (assignment.employeeId) {
          const { data: empData } = await supabase
            .from("Employee")
            .select("*")
            .eq("id", assignment.employeeId)
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
        if (assignment.projectId) {
          const { data } = await supabase
            .from("Project")
            .select("*")
            .eq("id", assignment.projectId)
            .single();
          project = data;
        }

        return {
          ...assignment,
          employee,
          project,
        };
      })
    );

    return NextResponse.json(enrichedAssignments);
  } catch (error) {
    console.error("Erreur lors de la récupération des affectations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des affectations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const assignmentData = {
      employeeId: body.employeeId,
      projectId: body.projectId,
      role: body.role || null,
      startDate: body.startDate,
      endDate: body.endDate || null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      status: body.status,
      plannedHours: body.plannedHours || null,
      notes: body.notes || null,
    };

    const { data: assignment, error: createError } = await supabase
      .from("Assignment")
      .insert(assignmentData)
      .select("*")
      .single();

    if (createError) throw createError;

    // Enrichir avec les relations
    let employee = null;
    if (assignment.employeeId) {
      const { data: empData } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", assignment.employeeId)
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
    if (assignment.projectId) {
      const { data } = await supabase
        .from("Project")
        .select("*")
        .eq("id", assignment.projectId)
        .single();
      project = data;
    }

    const enrichedAssignment = {
      ...assignment,
      employee,
      project,
    };

    return NextResponse.json(enrichedAssignment, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'affectation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'affectation" },
      { status: 500 }
    );
  }
}
