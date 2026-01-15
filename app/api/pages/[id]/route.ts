import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPagesConfig, updatePagesConfig } from "@/lib/github";

/**
 * PATCH /api/pages/[id] - Update a page
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, owners } = body;

    // Get current config
    const config = await getPagesConfig();

    // Find page
    const pageIndex = config.pages.findIndex((p) => p.id === id);
    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Update fields
    const page = config.pages[pageIndex];
    if (name && typeof name === "string") {
      page.name = name;
    }
    if (description !== undefined) {
      page.description = description || undefined;
    }
    if (Array.isArray(owners)) {
      page.owners = owners;
    }
    page.updatedAt = new Date().toISOString();

    // Save to GitHub
    await updatePagesConfig(
      config,
      `Update page: ${page.name} (by ${session.user.name || session.user.email})`
    );

    console.log(`[PAGES] Updated page: ${page.name} (${id})`);

    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error) {
    console.error("[PAGES] Error updating page:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update page: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pages/[id] - Delete a page
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get current config
    const config = await getPagesConfig();

    // Find page
    const pageIndex = config.pages.findIndex((p) => p.id === id);
    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const pageName = config.pages[pageIndex].name;

    // Remove page
    config.pages.splice(pageIndex, 1);

    // Save to GitHub
    await updatePagesConfig(
      config,
      `Delete page: ${pageName} (by ${session.user.name || session.user.email})`
    );

    console.log(`[PAGES] Deleted page: ${pageName} (${id})`);

    return NextResponse.json({
      success: true,
      message: `Page "${pageName}" deleted successfully`,
    });
  } catch (error) {
    console.error("[PAGES] Error deleting page:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete page: ${errorMessage}` },
      { status: 500 }
    );
  }
}
