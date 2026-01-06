import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: documents, error: documentsError } = await supabase
      .from("Document")
      .select("*")
      .order("createdAt", { ascending: false });

    if (documentsError) throw documentsError;

    // Enrichir avec les relations
    const enrichedDocuments = await Promise.all(
      (documents || []).map(async (document) => {
        // Employee avec profile
        let employee = null;
        if (document.employeeId) {
          const { data: empData } = await supabase
            .from("Employee")
            .select("*")
            .eq("id", document.employeeId)
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
        if (document.projectId) {
          const { data } = await supabase
            .from("Project")
            .select("*")
            .eq("id", document.projectId)
            .single();
          project = data;
        }

        return {
          ...document,
          employee,
          project,
        };
      })
    );

    return NextResponse.json(enrichedDocuments);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const documentData = {
      name: body.name,
      description: body.description || null,
      category: body.category,
      fileUrl: body.fileUrl,
      fileSize: body.fileSize || null,
      mimeType: body.mimeType || null,
      employeeId: body.employeeId || null,
      projectId: body.projectId || null,
      uploadedBy: body.uploadedBy || null,
    };

    const { data: document, error: createError } = await supabase
      .from("Document")
      .insert(documentData)
      .select("*")
      .single();

    if (createError) throw createError;

    // Enrichir avec les relations
    let employee = null;
    if (document.employeeId) {
      const { data: empData } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", document.employeeId)
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
    if (document.projectId) {
      const { data } = await supabase
        .from("Project")
        .select("*")
        .eq("id", document.projectId)
        .single();
      project = data;
    }

    const enrichedDocument = {
      ...document,
      employee,
      project,
    };

    return NextResponse.json(enrichedDocument, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du document:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du document" },
      { status: 500 }
    );
  }
}
