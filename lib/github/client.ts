import "server-only";

type GitHubContentFile = {
  type: "file";
  sha: string;
  content: string;
  encoding: string;
};

function getGitHubConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "develop";
  const token = process.env.GITHUB_CONTENT_TOKEN;

  if (!owner || !repo || !token) {
    throw new Error("GitHub content writer env vars are missing.");
  }

  return { owner, repo, branch, token };
}

async function githubRequest<T>(path: string, init: RequestInit = {}) {
  const { owner, repo, token } = getGitHubConfig();
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

function encodeUtf8(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

export async function getGitHubFile(filePath: string) {
  const { branch } = getGitHubConfig();
  try {
    return await githubRequest<GitHubContentFile>(`/contents/${encodePath(filePath)}?ref=${encodeURIComponent(branch)}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("GitHub API error 404")) return null;
    throw error;
  }
}

export async function putGitHubTextFile(filePath: string, text: string, message: string) {
  const { branch } = getGitHubConfig();
  const current = await getGitHubFile(filePath);

  return githubRequest(`/contents/${encodePath(filePath)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      branch,
      content: encodeUtf8(text),
      sha: current?.sha
    })
  });
}

export async function putGitHubBase64File(filePath: string, content: string, message: string) {
  const { branch } = getGitHubConfig();
  const current = await getGitHubFile(filePath);

  return githubRequest(`/contents/${encodePath(filePath)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      branch,
      content,
      sha: current?.sha
    })
  });
}

export async function deleteGitHubFile(filePath: string, message: string) {
  const { branch } = getGitHubConfig();
  const current = await getGitHubFile(filePath);
  if (!current) return { deleted: false };

  return githubRequest(`/contents/${encodePath(filePath)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      branch,
      sha: current.sha
    })
  });
}

function encodePath(filePath: string) {
  return filePath.split("/").map(encodeURIComponent).join("/");
}
