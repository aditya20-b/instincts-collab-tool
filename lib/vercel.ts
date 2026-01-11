const VERCEL_API_BASE = "https://api.vercel.com";

interface VercelRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function vercelApi<T>(
  endpoint: string,
  options: VercelRequestOptions = {}
): Promise<T> {
  const { method = "GET", body } = options;

  console.log(`[VERCEL API] ${method} ${endpoint}`);

  const response = await fetch(`${VERCEL_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error(`[VERCEL API] Error: ${response.status}`, error);
    throw new Error(
      error.error?.message || `Vercel API error: ${response.status}`
    );
  }

  return response.json();
}

// List all projects (for debugging/finding correct project name)
export async function listProjects(): Promise<{ projects: Project[] }> {
  return vercelApi<{ projects: Project[] }>(`/v9/projects?limit=100`);
}

export interface Deployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED";
  meta?: {
    githubCommitRef?: string;
    githubCommitSha?: string;
    githubCommitMessage?: string;
  };
  creator?: {
    username: string;
  };
  target?: "production" | "preview" | null;
}

export interface DeploymentEvent {
  type: string;
  created: number;
  payload: {
    text?: string;
    statusCode?: number;
    deploymentId?: string;
  };
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  target: ("production" | "preview" | "development")[];
  type: "encrypted" | "plain" | "secret" | "sensitive";
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  framework: string | null;
  latestDeployments?: Deployment[];
}

// Get project details
export async function getProject(): Promise<Project> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;
  return vercelApi<Project>(`/v9/projects/${projectName}`);
}

// List deployments
export async function listDeployments(
  limit: number = 10
): Promise<{ deployments: Deployment[] }> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;
  return vercelApi<{ deployments: Deployment[] }>(
    `/v6/deployments?projectId=${projectName}&limit=${limit}`
  );
}

// Get deployment details
export async function getDeployment(deploymentId: string): Promise<Deployment> {
  return vercelApi<Deployment>(`/v13/deployments/${deploymentId}`);
}

// Get deployment events/logs
export async function getDeploymentEvents(
  deploymentId: string
): Promise<DeploymentEvent[]> {
  return vercelApi<DeploymentEvent[]>(
    `/v3/deployments/${deploymentId}/events`
  );
}

// Trigger redeploy by creating a new deployment from the latest
export async function triggerRedeploy(): Promise<Deployment> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;

  // Get the latest production deployment
  const { deployments } = await listDeployments(1);
  const latestDeployment = deployments.find(d => d.target === "production") || deployments[0];

  if (!latestDeployment) {
    throw new Error("No deployments found to redeploy");
  }

  // Create a new deployment from the same source
  return vercelApi<Deployment>(`/v13/deployments`, {
    method: "POST",
    body: {
      name: projectName,
      deploymentId: latestDeployment.uid,
      target: "production",
    },
  });
}

// Cancel a deployment
export async function cancelDeployment(deploymentId: string): Promise<void> {
  await vercelApi(`/v12/deployments/${deploymentId}/cancel`, {
    method: "PATCH",
  });
}

// Rollback to a specific deployment
export async function rollbackDeployment(
  deploymentId: string
): Promise<Deployment> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;

  return vercelApi<Deployment>(`/v13/deployments`, {
    method: "POST",
    body: {
      name: projectName,
      deploymentId: deploymentId,
      target: "production",
    },
  });
}

// List environment variables
export async function listEnvVariables(): Promise<{ envs: EnvVariable[] }> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;
  return vercelApi<{ envs: EnvVariable[] }>(
    `/v10/projects/${projectName}/env`
  );
}

// Get a single environment variable (with decrypted value)
export async function getEnvVariable(envId: string): Promise<EnvVariable> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;
  return vercelApi<EnvVariable>(
    `/v1/projects/${projectName}/env/${envId}`
  );
}

// Create environment variable
export async function createEnvVariable(
  key: string,
  value: string,
  target: ("production" | "preview" | "development")[] = ["production", "preview", "development"],
  type: "encrypted" | "plain" = "encrypted"
): Promise<EnvVariable> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;
  return vercelApi<EnvVariable>(`/v10/projects/${projectName}/env`, {
    method: "POST",
    body: { key, value, target, type },
  });
}

// Update environment variable
export async function updateEnvVariable(
  envId: string,
  value: string,
  target?: ("production" | "preview" | "development")[]
): Promise<EnvVariable> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;
  const body: { value: string; target?: string[] } = { value };
  if (target) body.target = target;

  return vercelApi<EnvVariable>(
    `/v9/projects/${projectName}/env/${envId}`,
    { method: "PATCH", body }
  );
}

// Delete environment variable
export async function deleteEnvVariable(envId: string): Promise<void> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;
  await vercelApi(`/v9/projects/${projectName}/env/${envId}`, {
    method: "DELETE",
  });
}

// Deploy from a specific branch using gitSource
export async function deployBranch(
  branch: string,
  repoId: number
): Promise<Deployment> {
  const projectName = process.env.TARGET_VERCEL_PROJECT;

  console.log(`[VERCEL API] Deploying branch: ${branch} (repoId: ${repoId})`);

  return vercelApi<Deployment>(`/v13/deployments`, {
    method: "POST",
    body: {
      name: projectName,
      gitSource: {
        type: "github",
        ref: branch,
        repoId: repoId,
      },
      target: "preview",
    },
  });
}
