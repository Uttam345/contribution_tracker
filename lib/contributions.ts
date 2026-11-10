import { cache } from "react"
import { SITE_CONFIG } from "./constants"

const API = "https://api.github.com"
const REVALIDATE_SECONDS = 900
const PER_PAGE = 100
// GitHub's search API never returns more than 1,000 results per query.
const MAX_PR_PAGES = 10

const username = SITE_CONFIG.githubUsername

// ---------- Types ----------

export interface PRItem {
  id: string
  title: string
  number: number
  html_url: string
  repo: string
  created_at: string
  merged_at: string | null
  state: "open" | "closed"
  isMerged: boolean
}

export interface ReviewItem {
  id: string
  title: string
  number: number
  html_url: string
  repo: string
  created_at: string
}

export interface IssueItem {
  id: string
  title: string
  number: number
  html_url: string
  repo: string
  created_at: string
}

export type ActivityType = "pr_merged" | "pr_opened" | "pr_closed" | "review" | "issue"

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  number: number
  html_url: string
  repo: string
  created_at: string
}

export interface RepoStat {
  repo: string
  merged: number
  open: number
  total: number
}

export interface ProjectItem {
  name: string
  html_url: string
  homepage: string | null
  description: string | null
  language: string | null
  stars: number
  pushed_at: string
}

interface SearchItem {
  id: number
  number: number
  title: string
  html_url: string
  state: string
  created_at: string
  updated_at: string
  repository_url: string
  pull_request?: { merged_at: string | null }
}

interface SearchResponse {
  total_count: number
  items: SearchItem[]
}

interface GitHubRepo {
  name: string
  full_name: string
  html_url: string
  homepage: string | null
  description: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
  archived: boolean
}

// ---------- Low-level helpers ----------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function ghFetch<T>(path: string, retries = 1): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN

  const request = (withAuth: boolean) =>
    fetch(`${API}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(15000),
    })

  try {
    let res = await request(true)
    // A bad or expired token should not take the whole page down.
    if (res.status === 401 && token) {
      console.warn("[github] token rejected (401), retrying without it")
      res = await request(false)
    }
    if (res.ok) return (await res.json()) as T

    console.error(`[github] ${res.status} for ${path}`)
    // Only retry transient server errors.
    if (res.status < 500) return null
  } catch (err) {
    console.error(`[github] request failed for ${path}:`, err)
  }

  if (retries <= 0) return null
  await sleep(800)
  return ghFetch<T>(path, retries - 1)
}

async function searchIssues(
  query: string,
  sort: "created" | "updated",
  maxPages: number
): Promise<SearchItem[]> {
  const pagePath = (page: number) =>
    `/search/issues?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=${PER_PAGE}&page=${page}`

  const first = await ghFetch<SearchResponse>(pagePath(1))
  if (!first) return []

  const items = [...first.items]
  const totalPages = Math.min(maxPages, Math.ceil(first.total_count / PER_PAGE))

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => ghFetch<SearchResponse>(pagePath(i + 2)))
    )
    for (const page of rest) {
      if (page) items.push(...page.items)
    }
  }

  return items
}

const repoOf = (item: SearchItem) => item.repository_url.split("/").slice(-2).join("/")

function isExcluded(repo: string): boolean {
  const [owner] = repo.split("/")
  if (owner.toLowerCase() === username.toLowerCase()) return true
  return SITE_CONFIG.contributions.excludedRepos.some((ex) => ex.toLowerCase() === repo.toLowerCase())
}

const byNewest = <T extends { created_at: string }>(a: T, b: T) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

// ---------- Fetchers ----------
// `is:public` keeps private-repo activity out, even if the token can see it.

export async function fetchPRs(): Promise<PRItem[]> {
  const items = await searchIssues(`author:${username} type:pr is:public`, "created", MAX_PR_PAGES)

  return items
    .filter((pr) => !isExcluded(repoOf(pr)))
    .map((pr) => {
      const mergedAt = pr.pull_request?.merged_at ?? null
      return {
        id: `gh-${pr.id}`,
        title: pr.title,
        number: pr.number,
        html_url: pr.html_url,
        repo: repoOf(pr),
        created_at: pr.created_at,
        merged_at: mergedAt,
        state: pr.state === "open" ? ("open" as const) : ("closed" as const),
        isMerged: mergedAt !== null,
      }
    })
    .toSorted(byNewest)
}

export async function fetchReviews(): Promise<ReviewItem[]> {
  const items = await searchIssues(
    `reviewed-by:${username} -author:${username} type:pr is:public`,
    "updated",
    1
  )

  return items
    .filter((item) => !isExcluded(repoOf(item)))
    .map((item) => ({
      id: `gh-review-${item.id}`,
      title: item.title,
      number: item.number,
      html_url: item.html_url,
      repo: repoOf(item),
      // Search can only sort reviews by last update, so that is the date shown.
      created_at: item.updated_at,
    }))
    .toSorted(byNewest)
}

export async function fetchIssues(): Promise<IssueItem[]> {
  const items = await searchIssues(`author:${username} type:issue is:public`, "created", 1)

  return items
    .filter((item) => !isExcluded(repoOf(item)))
    .map((item) => ({
      id: `gh-issue-${item.id}`,
      title: item.title,
      number: item.number,
      html_url: item.html_url,
      repo: repoOf(item),
      created_at: item.created_at,
    }))
    .toSorted(byNewest)
}

// One round of requests per render, shared by the home page and /contributions.
export const getContributions = cache(async () => {
  const [prs, reviews, issues] = await Promise.all([fetchPRs(), fetchReviews(), fetchIssues()])
  return { prs, reviews, issues }
})

export function getRepoStats(prs: PRItem[]): RepoStat[] {
  const counts = new Map<string, { merged: number; open: number }>()

  for (const pr of prs) {
    const entry = counts.get(pr.repo) ?? { merged: 0, open: 0 }
    if (pr.isMerged) entry.merged++
    else if (pr.state === "open") entry.open++
    counts.set(pr.repo, entry)
  }

  return Array.from(counts, ([repo, c]) => ({
    repo,
    merged: c.merged,
    open: c.open,
    total: c.merged + c.open,
  }))
    .filter((r) => r.merged > 0)
    .toSorted((a, b) => b.merged - a.merged || b.total - a.total)
}

export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const { prs, reviews, issues } = await getContributions()

  const activity: ActivityItem[] = [
    ...prs.map((pr) => ({
      id: `act-${pr.id}`,
      type: (pr.isMerged
        ? "pr_merged"
        : pr.state === "open"
          ? "pr_opened"
          : "pr_closed") as ActivityType,
      title: pr.title,
      number: pr.number,
      html_url: pr.html_url,
      repo: pr.repo,
      created_at: pr.merged_at ?? pr.created_at,
    })),
    ...reviews.map((r) => ({
      id: `act-${r.id}`,
      type: "review" as const,
      title: r.title,
      number: r.number,
      html_url: r.html_url,
      repo: r.repo,
      created_at: r.created_at,
    })),
    ...issues.map((i) => ({
      id: `act-${i.id}`,
      type: "issue" as const,
      title: i.title,
      number: i.number,
      html_url: i.html_url,
      repo: i.repo,
      created_at: i.created_at,
    })),
  ]

  return activity.toSorted(byNewest).slice(0, limit)
}

// Your own public repos, most-starred first. Forks, archived repos and the
// profile README repo (username/username) are skipped.
export async function fetchProjects(limit = 6): Promise<ProjectItem[]> {
  const repos = await ghFetch<GitHubRepo[]>(
    `/users/${username}/repos?type=owner&sort=pushed&per_page=100`
  )
  if (!repos) return []

  const hidden = new Set(SITE_CONFIG.contributions.excludedRepos.map((r) => r.toLowerCase()))

  return repos
    .filter(
      (r) =>
        !r.fork &&
        !r.archived &&
        r.name.toLowerCase() !== username.toLowerCase() &&
        !hidden.has(r.full_name.toLowerCase())
    )
    .toSorted(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    )
    .slice(0, limit)
    .map((r) => ({
      name: r.name,
      html_url: r.html_url,
      homepage: r.homepage || null,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      pushed_at: r.pushed_at,
    }))
}
