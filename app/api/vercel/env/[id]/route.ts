import { NextResponse } from "next/server";
import { updateEnvVariable, deleteEnvVariable } from "@/lib/vercel";

// Update an environment variable
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { value, target } = await request.json();

    if (!value) {
      return NextResponse.json(
        { error: "value is required" },
        { status: 400 }
      );
    }

    const env = await updateEnvVariable(id, value, target);

    return NextResponse.json({
      success: true,
      message: `Environment variable updated successfully!`,
      env: {
        id: env.id,
        key: env.key,
        target: env.target,
      },
    });
  } catch (error) {
    console.error("Error updating env variable:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update env variable: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Delete an environment variable
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteEnvVariable(id);

    return NextResponse.json({
      success: true,
      message: "Environment variable deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting env variable:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete env variable: ${errorMessage}` },
      { status: 500 }
    );
  }
}
