import { NextResponse } from "next/server";
import { listEnvVariables, createEnvVariable } from "@/lib/vercel";

// List all environment variables (keys only for security)
export async function GET() {
  try {
    const { envs } = await listEnvVariables();

    return NextResponse.json({
      success: true,
      envs: envs.map((e) => ({
        id: e.id,
        key: e.key,
        target: e.target,
        type: e.type,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        // Don't expose actual values for security
      })),
    });
  } catch (error) {
    console.error("Error fetching env variables:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch env variables: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Create a new environment variable
export async function POST(request: Request) {
  try {
    const { key, value, target, type } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: "key and value are required" },
        { status: 400 }
      );
    }

    // Validate key format (alphanumeric and underscores only)
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
      return NextResponse.json(
        {
          error:
            "Invalid key format. Use uppercase letters, numbers, and underscores. Must start with a letter.",
        },
        { status: 400 }
      );
    }

    const env = await createEnvVariable(
      key,
      value,
      target || ["production", "preview", "development"],
      type || "encrypted"
    );

    return NextResponse.json({
      success: true,
      message: `Environment variable ${key} created successfully!`,
      env: {
        id: env.id,
        key: env.key,
        target: env.target,
        type: env.type,
      },
    });
  } catch (error) {
    console.error("Error creating env variable:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create env variable: ${errorMessage}` },
      { status: 500 }
    );
  }
}
