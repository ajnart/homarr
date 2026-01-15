import fs from "fs/promises";

const sources = {
  crowdin: [
    { projectId: 534422 },
    { projectId: 742587 },
  ],
  github: [
    { slug: "ajnart", repository: "homarr" },
    { slug: "homarr-labs", repository: "homarr" },
  ],
};

const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  CROWDIN_TOKEN: process.env.CROWDIN_TOKEN,
};

const fetchGithubContributors = async (slug, repository) => {
  const url = `https://api.github.com/repos/${slug}/${repository}/contributors?per_page=999`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };

  const response = await fetch(url, options);
  const data = await response.json();

  return data.map((contributor) => ({
    login: contributor.login,
    avatar_url: contributor.avatar_url,
  }));
};

const fetchCrowdinMembers = async (projectId) => {
  const url = `https://crowdin.com/api/v2/projects/${projectId}/members`;
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${env.CROWDIN_TOKEN}`,
    },
  };

  const response = await fetch(url, options);
  const data = await response.json();

  return data.data.flatMap((data) => data.data).map(contributor => ({
    username: contributor.username,
    avatarUrl: contributor.avatarUrl,
  }));
};

const distinctBy = (callback) => (value, index, self) => {
  return self.findIndex((item) => callback(item) === callback(value)) === index;
};

const githubContributors = [];
const crowdinContributors = [];

for (const { repository, slug } of sources.github) {
  githubContributors.push(...(await fetchGithubContributors(slug, repository)));
}
const distinctGithubContributors = githubContributors
  .filter(distinctBy((contributor) => contributor.login))
  .sort((a, b) => b.contributions - a.contributions)
  .map(({ contributions, ...props }) => props)
  .filter((contributor) => !contributor.login.includes("[bot]"));
await fs.writeFile("./static-data/contributors.json", JSON.stringify(distinctGithubContributors));

for (const { projectId } of sources.crowdin) {
  crowdinContributors.push(...(await fetchCrowdinMembers(projectId)));
}
const distinctCrowdinContributors = crowdinContributors.filter(distinctBy((contributor) => contributor.username));
await fs.writeFile("./static-data/translators.json", JSON.stringify(distinctCrowdinContributors));
