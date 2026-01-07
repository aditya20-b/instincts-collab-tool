import { NextResponse } from "next/server";
import { getDeploymentEvents } from "@/lib/vercel";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = await getDeploymentEvents(id);

    // Filter and format build logs
    const logs = events
      .filter((e) => e.payload?.text)
      .map((e) => ({
        timestamp: e.created,
        text: e.payload.text,
        type: e.type,
      }));

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Error fetching deployment logs:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch logs: ${errorMessage}` },
      { status: 500 }
    );
  }
}
