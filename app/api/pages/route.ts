import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPagesConfig, updatePagesConfig } from "@/lib/github";
import { Page } from "@/types/pages";

/**
 * GET /api/pages - List all pages with ownership info
 */
export async function GET() {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getPagesConfig();

    console.log(`[PAGES] Found ${config.pages.length} pages`);

    return NextResponse.json({
      success: true,
      pages: config.pages,
    });
  } catch (error) {
    console.error("[PAGES] Error fetching pages:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch pages: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pages - Create a new page
 */
export async function POST(request: Request) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, owners } = body;

    // Validate required fields
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Page name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(owners)) {
      return NextResponse.json(
        { error: "Owners must be an array" },
        { status: 400 }
      );
    }

    // Get current config
    const config = await getPagesConfig();

    // Generate ID from name (lowercase, hyphens)
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if page with this ID already exists
    if (config.pages.some((p) => p.id === id)) {
      return NextResponse.json(
        { error: "A page with this name already exists" },
        { status: 400 }
      );
    }

    // Create new page
    const now = new Date().toISOString();
    const newPage: Page = {
      id,
      name,
      description: description || undefined,
      owners,
      createdAt: now,
      updatedAt: now,
    };

    // Add to config
    config.pages.push(newPage);

    // Save to GitHub
    await updatePagesConfig(
      config,
      `Add page: ${name} (by ${session.user.name || session.user.email})`
    );

    console.log(`[PAGES] Created page: ${name} (${id})`);

    return NextResponse.json({
      success: true,
      page: newPage,
    });
  } catch (error) {
    console.error("[PAGES] Error creating page:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create page: ${errorMessage}` },
      { status: 500 }
    );
  }
}
