// Everything personal lives here. This file is imported by client components,
// so only put public values in it (never tokens).

const githubUsername = process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim() || "hokagesama"

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return "http://localhost:3000"
}

const name = "Uttam"
const tagline = "data engineer"

export const SITE_CONFIG = {
  name,
  tagline,
  githubUsername,
  bio: "Hey, I'm Uttam. I build ELT pipelines with Spark and Databricks, and contribute to open-source projects.",
  siteUrl: resolveSiteUrl(),
  siteTitle: `${name} – ${tagline}`,
  siteDescription: `${name}'s open-source contributions: merged pull requests, code reviews and issues on GitHub.`,
  lang: "en",

  // Optional rows on the home page. Leave empty to hide a row.
  // Repos you maintain, e.g. ["your-org/your-repo"].
  maintainerOf: [] as string[],

  contributions: {
    // Repos to hide from the dashboard, as "owner/repo".
    // Repos under your own username are always hidden automatically.
    excludedRepos: [] as string[],
    // How many repos to show in the "contributed" row on the home page.
    topReposOnHome: 5,
  },
}

// Add more links here, e.g. { name: "LinkedIn", href: "https://linkedin.com/in/..." }
export const SOCIAL_LINKS: { name: string; href: string }[] = [
  { name: "GitHub", href: `https://github.com/${githubUsername}` },
]
