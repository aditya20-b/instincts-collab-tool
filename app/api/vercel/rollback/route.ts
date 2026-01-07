import { NextResponse } from "next/server";
import { rollbackDeployment } from "@/lib/vercel";

export async function POST(request: Request) {
  try {
    const { deploymentId } = await request.json();

    if (!deploymentId) {
      return NextResponse.json(
        { error: "deploymentId is required" },
        { status: 400 }
      );
    }

    const deployment = await rollbackDeployment(deploymentId);

    return NextResponse.json({
      success: true,
      message: `Rollback initiated successfully!`,
      deployment: {
        id: deployment.uid,
        url: deployment.url,
        state: deployment.state,
      },
    });
  } catch (error) {
    console.error("Error rolling back:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to rollback: ${errorMessage}` },
      { status: 500 }
    );
  }
}
