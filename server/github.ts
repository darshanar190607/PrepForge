import { Octokit } from '@octokit/rest';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const rawOwner = process.env.GITHUB_OWNER || '';
const rawRepo  = process.env.GITHUB_REPO  || '';

// Support full Git URLs like https://github.com/user/repo.git
const GITHUB_OWNER = rawOwner.includes('github.com')
  ? rawOwner.replace(/\.git$/, '').split('/').slice(-2, -1)[0]
  : rawOwner;

const GITHUB_REPO = rawRepo.includes('github.com')
  ? rawRepo.replace(/\.git$/, '').split('/').pop()!
  : rawRepo;

// Create Octokit instance with the PAT
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Convert string to base64 encoding (UTF-8 safe)
function toBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function isConfigured(): boolean {
  if (!process.env.GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.warn('[GitHub Sync] GitHub variables are not fully configured in .env. Skipping operation.');
    return false;
  }
  return true;
}

/**
 * Creates a new branch from 'main' (falls back to 'master')
 * @param branchName - e.g. 'cohort/darshan-ar'
 */
export async function createBranch(branchName: string): Promise<boolean> {
  if (!isConfigured()) return false;

  const sanitized = branchName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\/]/g, '');
  console.log(`[GitHub Sync] Creating branch refs/heads/${sanitized}...`);

  // 1. Resolve the SHA of main or master
  let sha: string | null = null;
  for (const base of ['main', 'master']) {
    try {
      const { data } = await octokit.git.getRef({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        ref: `heads/${base}`,
      });
      sha = data.object.sha;
      break;
    } catch (err: any) {
      if (err?.status === 401) {
        console.error('[GitHub Sync Error] ❌ BAD TOKEN — Your GITHUB_TOKEN in .env is invalid or revoked. Please generate a new token at https://github.com/settings/personal-access-tokens/new and update your .env file.');
        return false;
      }
      // 404 means branch doesn't exist — try next branch name
      console.warn(`[GitHub Sync] Base branch "${base}" not found in repo, trying next...`);
    }
  }

  if (!sha) {
    console.error('[GitHub Sync] Could not fetch SHA of main or master branch.');
    return false;
  }

  // 2. Create the new branch ref
  try {
    await octokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `refs/heads/${sanitized}`,
      sha,
    });
    console.log(`[GitHub Sync] Branch "${sanitized}" created successfully.`);
    return true;
  } catch (err: any) {
    // Branch might already exist — that's fine
    if (err?.status === 422) {
      console.log(`[GitHub Sync] Branch "${sanitized}" already exists. Skipping.`);
      return true;
    }
    console.error(`[GitHub Sync Error] Failed to create branch "${sanitized}":`, err?.message);
    return false;
  }
}

/**
 * Commits a file to a specific branch on GitHub
 */
export async function commitFile(
  branchName: string,
  filePath: string,
  content: string,
  commitMessage: string
): Promise<boolean> {
  if (!isConfigured()) return false;

  const sanitized = branchName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\/]/g, '');
  console.log(`[GitHub Sync] Committing "${filePath}" to branch "${sanitized}"...`);

  // 1. Check if file already exists to get its SHA (required for updates)
  let fileSha: string | undefined = undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      ref: sanitized,
    });
    if (!Array.isArray(data) && data.type === 'file') {
      fileSha = data.sha;
    }
  } catch {
    // File doesn't exist yet — that's fine, we'll create it
  }

  // 2. Create or update the file
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: commitMessage,
      content: toBase64(content),
      branch: sanitized,
      sha: fileSha,
    });
    console.log(`[GitHub Sync] Committed "${filePath}" to "${sanitized}" successfully.`);
    return true;
  } catch (err: any) {
    console.error(`[GitHub Sync Error] Failed to commit "${filePath}":`, err?.message);
    return false;
  }
}
