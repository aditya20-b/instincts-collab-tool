import { NextResponse } from "next/server";
import { triggerRedeploy } from "@/lib/vercel";

export async function POST() {
  try {
    const deployment = await triggerRedeploy();

    return NextResponse.json({
      success: true,
      message: `Redeploy triggered successfully!`,
      deployment: {
        id: deployment.uid,
        url: deployment.url,
        state: deployment.state,
      },
    });
  } catch (error) {
    console.error("Error triggering redeploy:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to trigger redeploy: ${errorMessage}` },
      { status: 500 }
    );
  }
}
