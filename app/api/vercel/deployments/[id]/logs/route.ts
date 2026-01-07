import { NextResponse } from "next/server";
import { getDeploymentEvents } from "@/lib/vercel";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = await getDeploymentEvents(id);

    console.log(`[LOGS] Deployment ${id}: Got ${events.length} events`);

    // Try multiple formats - Vercel API can return different structures
    const logs = events
      .map((e) => {
        // Handle different event formats
        const text = e.payload?.text || e.payload?.statusCode?.toString() || JSON.stringify(e.payload);
        return {
          timestamp: e.created,
          text: text,
          type: e.type,
        };
      })
      .filter((e) => e.text && e.text !== '{}' && e.text !== 'undefined');

    // If still no logs, return raw events for debugging
    if (logs.length === 0 && events.length > 0) {
      console.log(`[LOGS] Raw events sample:`, JSON.stringify(events.slice(0, 2)));
      return NextResponse.json({
        success: true,
        logs: [{
          timestamp: Date.now(),
          text: `Found ${events.length} events but no parseable log text. Event types: ${[...new Set(events.map(e => e.type))].join(', ')}`,
          type: 'info'
        }],
        rawEventCount: events.length,
        eventTypes: [...new Set(events.map(e => e.type))],
      });
    }

    return NextResponse.json({
      success: true,
      logs,
      note: logs.length === 0 ? "Logs may have expired (Hobby plan: 1 hour retention)" : undefined,
    });
  } catch (error) {
    console.error("[LOGS] Error fetching deployment logs:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch logs: ${errorMessage}` },
      { status: 500 }
    );
  }
}
