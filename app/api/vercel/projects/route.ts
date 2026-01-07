import { NextResponse } from "next/server";
import { listProjects } from "@/lib/vercel";

// List all Vercel projects (for debugging/configuration)
export async function GET() {
  try {
    const { projects } = await listProjects();

    console.log(`[VERCEL PROJECTS] Found ${projects.length} projects`);

    return NextResponse.json({
      success: true,
      targetProject: process.env.TARGET_VERCEL_PROJECT,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        framework: p.framework,
      })),
    });
  } catch (error) {
    console.error("[VERCEL PROJECTS] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch projects: ${errorMessage}` },
      { status: 500 }
    );
  }
}
