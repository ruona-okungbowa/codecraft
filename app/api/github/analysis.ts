import { Octokit } from "octokit";

export interface CommitAnalysis {
  totalCommits: number;
  lastCommitDate: Date;
  commitFrequency: number;
  contributors: number;
  isActive: boolean;
}

export async function analyseCommitHistory(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<CommitAnalysis> {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since: oneYearAgo.toISOString(),
      per_page: 100,
    });

    const totalCommits = commits.length;
    const lastCommitDate = commits[0]?.commit.author?.date
      ? new Date(commits[0].commit.author.date)
      : new Date();
    const contributors = new Set(
      commits.map((c) => c.author?.login).filter(Boolean)
    ).size;

    const monthsActive = 12;
    const commitFrequency = totalCommits / monthsActive;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const isActive = lastCommitDate > threeMonthsAgo;

    return {
      totalCommits,
      lastCommitDate,
      commitFrequency,
      contributors,
      isActive,
    };
  } catch (error) {
    console.error(`Error analysing commits for ${repo}:`, error);
    return {
      totalCommits: 0,
      lastCommitDate: new Date(),
      commitFrequency: 0,
      contributors: 0,
      isActive: false,
    };
  }
}
