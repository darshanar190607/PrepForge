import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";

dotenv.config();

console.log("Token Exists:", !!process.env.GITHUB_TOKEN);
console.log("Owner:", process.env.GITHUB_OWNER);
console.log("Repo:", process.env.GITHUB_REPO);

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

async function test() {
    try {
        const user = await octokit.rest.users.getAuthenticated();
        console.log("✅ Authenticated as:", user.data.login);

        const repo = await octokit.rest.repos.get({
            owner: process.env.GITHUB_OWNER!,
            repo: process.env.GITHUB_REPO!,
        });

        console.log("✅ Repository Found:", repo.data.full_name);

        const ref = await octokit.rest.git.getRef({
            owner: process.env.GITHUB_OWNER!,
            repo: process.env.GITHUB_REPO!,
            ref: "heads/main",
        });

        console.log("✅ Main Branch SHA:", ref.data.object.sha);

    } catch (err: any) {
        console.error("❌ Error:");
        console.error(err.status);
        console.error(err.message);
        console.error(err.response?.data);
    }
}

test();