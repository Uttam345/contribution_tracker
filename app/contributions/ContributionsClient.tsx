"use client"

import { useState, useMemo, useRef, useEffect, startTransition } from "react"
import Link from "next/link"
import { GitMerge, XCircle, ArrowUpRight, House, Funnel, CaretDown, X } from "@phosphor-icons/react"
import { SITE_CONFIG } from "../../lib/constants"
import type { PRItem, ReviewItem, IssueItem, RepoStat } from "../../lib/contributions"
import ThemeToggle from "../components/ThemeToggle"
import { PullRequestIcon, IssueIcon, ReviewIcon } from "../../components/icons"
import RepoBadge from "../../components/RepoBadge"

interface ContributionsClientProps {
  prs: PRItem[]
  repos: RepoStat[]
  reviews?: ReviewItem[]
  issues?: IssueItem[]
  stats: {
    totalMerged: number
    totalOpen: number
    totalRepos: number
  }
}

type TabType = "merged" | "open" | "closed"

const PR_PAGE_SIZE = 20
const REPO_PAGE_SIZE = 10
const SIDEBAR_PAGE_SIZE = 10
const EMPTY_LIST: [] = []

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function SidebarFeed({
  title,
  items,
  icon,
  visibleCount,
  onLoadMore,
}: {
  title: string
  items: (IssueItem | ReviewItem)[]
  icon: React.ReactNode
  visibleCount: number
  onLoadMore: () => void
}) {
  if (items.length === 0) return null

  const displayed = items.slice(0, visibleCount)

  return (
    <section className="overflow-hidden rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between px-5 pb-3.5 pt-5">
        <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
          {title}
        </span>
        <span className="text-sm font-bold text-gray-400 dark:text-gray-500">{items.length}</span>
      </div>

      <div className="border-t border-dashed border-gray-200 dark:border-gray-800/80">
        <div className="flex flex-col">
          {displayed.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3.5 px-5 py-2.5 border-t border-dashed border-gray-200 dark:border-gray-800/80 first:border-t-0"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-gray-100 dark:bg-zinc-900 border border-gray-200/80 dark:border-gray-800/80 text-gray-500 dark:text-gray-400">
                {icon}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <a
                  href={item.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 sm:truncate text-[13px] font-bold text-gray-900 dark:text-gray-100 hover:text-mauve transition-colors"
                >
                  {item.title}
                </a>

                <div className="flex items-center gap-2 min-w-0">
                  <RepoBadge repo={item.repo} />
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
                    #{item.number}
                  </span>
                </div>
              </div>

              <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0 hidden sm:inline">
                {formatDate(item.created_at)}
              </span>

              <a
                href={item.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-gray-400 hover:text-mauve transition-colors"
                aria-label="View on GitHub"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {visibleCount < items.length && (
          <button
            type="button"
            onClick={onLoadMore}
            className="w-full py-3 px-5 text-[13px] font-bold text-gray-400 dark:text-gray-500 hover:text-mauve border-t border-dashed border-gray-200 dark:border-gray-800/80 transition-colors text-center cursor-pointer"
          >
            Load more · {items.length - visibleCount} remaining
          </button>
        )}
      </div>
    </section>
  )
}

export default function ContributionsClient({
  prs,
  repos,
  reviews = EMPTY_LIST,
  issues = EMPTY_LIST,
  stats,
}: ContributionsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("merged")
  const [selectedRepo, setSelectedRepo] = useState<string>("all")
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [visiblePRCount, setVisiblePRCount] = useState<number>(PR_PAGE_SIZE)
  const [visibleRepoCount, setVisibleRepoCount] = useState<number>(REPO_PAGE_SIZE)
  const [visibleIssueCount, setVisibleIssueCount] = useState<number>(SIDEBAR_PAGE_SIZE)
  const [visibleReviewCount, setVisibleReviewCount] = useState<number>(SIDEBAR_PAGE_SIZE)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFilterOpen(false)
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isFilterOpen])

  const mergedPRs = prs.filter((pr) => pr.isMerged)
  const openPRs = prs.filter((pr) => pr.state === "open" && !pr.isMerged)
  const closedPRs = prs.filter((pr) => pr.state === "closed" && !pr.isMerged)

  const currentTabPRs =
    activeTab === "merged" ? mergedPRs : activeTab === "open" ? openPRs : closedPRs

  const repoOptions = useMemo(() => {
    const counts = new Map<string, number>()
    currentTabPRs.forEach((pr) => {
      counts.set(pr.repo, (counts.get(pr.repo) || 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [currentTabPRs])

  const tabFilteredPRs =
    selectedRepo === "all"
      ? currentTabPRs
      : currentTabPRs.filter((pr) => pr.repo.toLowerCase() === selectedRepo.toLowerCase())

  const displayedPRs = tabFilteredPRs.slice(0, visiblePRCount)
  const visibleRepos = repos.slice(0, visibleRepoCount)
  const maxMerges = repos[0]?.merged || 1

  const tabs: { key: TabType; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: "merged",
      label: "Merged",
      count: mergedPRs.length,
      icon: <GitMerge className="w-3.5 h-3.5 text-mauve" weight="regular" />,
    },
    {
      key: "open",
      label: "Opened",
      count: openPRs.length,
      icon: <PullRequestIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />,
    },
    {
      key: "closed",
      label: "Closed",
      count: closedPRs.length,
      icon: <XCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" weight="regular" />,
    },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 w-full flex flex-col gap-8 pt-6 sm:pt-8">
      {/* Top back navigation & controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <House className="w-5 h-5" weight="bold" />
          <span>home</span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`https://github.com/${SITE_CONFIG.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <span className="text-gray-300 dark:text-gray-700">## </span>open source contributions
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1.5">
            pull requests, code reviews, and issues across GitHub
          </p>
        </div>

        {/* Big numbers on right */}
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[48px] sm:text-[56px] font-bold leading-none tracking-[-0.05em] text-gray-900 dark:text-white">
              {stats.totalMerged}
            </span>
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500">
              merged prs
            </span>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-[48px] sm:text-[56px] font-bold leading-none tracking-[-0.05em] text-gray-400 dark:text-gray-500">
              {stats.totalOpen}
            </span>
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500">
              open
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Split Grid with 420px sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left Column: Pull Requests */}
        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 bg-white dark:bg-zinc-950">
            {/* Header row */}
            <div className="flex items-center justify-between px-5 pb-3.5 pt-5">
              <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                Pull requests
              </span>
              <span className="text-sm font-bold text-mauve">{mergedPRs.length} merged</span>
            </div>

            {/* Filter tabs & repo filter row */}
            <div className="flex items-center justify-between gap-2 px-5 pb-4 pt-1 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5">
                {tabs.map((t) => {
                  const isActive = activeTab === t.key
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        startTransition(() => {
                          setActiveTab(t.key)
                          setVisiblePRCount(PR_PAGE_SIZE)
                        })
                      }}
                      className={`h-9 px-3.5 rounded-full border text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                        isActive
                          ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-zinc-950"
                          : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <span>{t.label}</span>
                      {t.icon}
                      <span
                        className={
                          isActive
                            ? "opacity-75 font-mono text-xs"
                            : "text-gray-400 dark:text-gray-500 font-mono text-xs"
                        }
                      >
                        {t.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Repo filter dropdown */}
              <div className="relative shrink-0 ml-auto" ref={dropdownRef}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className={`h-9 px-3 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedRepo !== "all"
                        ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-zinc-950"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    aria-expanded={isFilterOpen}
                    aria-label="Filter pull requests by repository"
                  >
                    <Funnel className="w-3.5 h-3.5 shrink-0" weight="regular" />
                    <span className="font-mono text-xs max-w-[120px] sm:max-w-[160px] truncate">
                      {selectedRepo === "all" ? "all repos" : selectedRepo}
                    </span>
                    <CaretDown
                      className={`w-3 h-3 shrink-0 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {selectedRepo !== "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        startTransition(() => {
                          setSelectedRepo("all")
                          setVisiblePRCount(PR_PAGE_SIZE)
                        })
                      }}
                      className="ml-1 p-1 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Clear repo filter"
                      aria-label="Clear repo filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 z-20 w-64 max-h-72 overflow-y-auto rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 bg-white dark:bg-zinc-950 p-1.5 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        startTransition(() => {
                          setSelectedRepo("all")
                          setVisiblePRCount(PR_PAGE_SIZE)
                        })
                        setIsFilterOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                        selectedRepo === "all"
                          ? "bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white font-bold"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/60 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <span>all repositories</span>
                      <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
                        {currentTabPRs.length}
                      </span>
                    </button>

                    <div className="my-1 border-t border-dashed border-gray-200 dark:border-gray-800/80" />

                    {repoOptions.map(({ name, count }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          startTransition(() => {
                            setSelectedRepo(name)
                            setVisiblePRCount(PR_PAGE_SIZE)
                          })
                          setIsFilterOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-colors text-left cursor-pointer ${
                          selectedRepo === name
                            ? "bg-gray-100 dark:bg-zinc-900 text-mauve font-bold"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/60 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <span className="truncate mr-2">{name}</span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PR Rows */}
            <div className="border-t border-dashed border-gray-200 dark:border-gray-800/80">
              {displayedPRs.length > 0 ? (
                <div className="flex flex-col">
                  {displayedPRs.map((pr) => {
                    const isMerged = pr.isMerged
                    const isOpen = pr.state === "open"

                    return (
                      <div
                        key={pr.id}
                        className="flex items-center gap-3.5 px-5 py-3.5 border-t border-dashed border-gray-200 dark:border-gray-800/80 first:border-t-0"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gray-100 dark:bg-zinc-900 border border-gray-200/80 dark:border-gray-800/80">
                          {isMerged ? (
                            <GitMerge className="w-4 h-4 text-mauve" weight="regular" />
                          ) : isOpen ? (
                            <PullRequestIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle
                              className="w-4 h-4 text-gray-400 dark:text-gray-500"
                              weight="regular"
                            />
                          )}
                        </span>

                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="line-clamp-2 sm:truncate text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-mauve transition-colors"
                          >
                            {pr.title}
                          </a>

                          <div className="flex items-center gap-2 min-w-0">
                            <RepoBadge repo={pr.repo} />
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                              #{pr.number}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0 hidden sm:inline">
                          {formatDate(pr.created_at)}
                        </span>

                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-gray-400 hover:text-mauve transition-colors"
                          aria-label="View PR"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-5 py-8 text-center flex flex-col items-center gap-2">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No {activeTab} pull requests found
                    {selectedRepo !== "all" ? ` in ${selectedRepo}` : ""}.
                  </p>
                  {selectedRepo !== "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRepo("all")
                        setVisiblePRCount(PR_PAGE_SIZE)
                      }}
                      className="text-xs font-bold text-mauve hover:underline cursor-pointer"
                    >
                      clear filter
                    </button>
                  )}
                </div>
              )}

              {visiblePRCount < tabFilteredPRs.length && (
                <button
                  type="button"
                  onClick={() => setVisiblePRCount((c) => c + PR_PAGE_SIZE)}
                  className="w-full py-3 px-5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-mauve border-t border-dashed border-gray-200 dark:border-gray-800/80 transition-colors text-center cursor-pointer"
                >
                  Load more · {tabFilteredPRs.length - visiblePRCount} remaining
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Breakdown & Feeds */}
        <div className="flex flex-col gap-6">
          {/* Merged by Repo Box */}
          <section className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 bg-white dark:bg-zinc-950 p-5">
            <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
              Merged by repo
            </span>

            <div className="mt-3 flex flex-col gap-2.5">
              {visibleRepos.map((r) => {
                const percentage = Math.max(6, Math.round((r.merged / maxMerges) * 100))

                return (
                  <div key={r.repo} className="flex items-center gap-3">
                    <span className="flex min-w-0 flex-1">
                      <RepoBadge repo={r.repo} />
                    </span>

                    <div className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-mauve/80"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="text-[13px] font-bold text-gray-900 dark:text-white w-6 text-right shrink-0">
                      {r.merged}
                    </span>
                  </div>
                )
              })}

              {visibleRepoCount < repos.length && (
                <button
                  type="button"
                  onClick={() => setVisibleRepoCount((c) => c + REPO_PAGE_SIZE)}
                  className="self-start mt-2 text-[13px] font-bold text-gray-400 dark:text-gray-500 hover:text-mauve transition-colors cursor-pointer"
                >
                  Load more · {repos.length - visibleRepoCount} remaining
                </button>
              )}
            </div>
          </section>

          {/* Issues filed Box */}
          <SidebarFeed
            title="Issues filed"
            items={issues}
            icon={<IssueIcon className="w-3.5 h-3.5" />}
            visibleCount={visibleIssueCount}
            onLoadMore={() => setVisibleIssueCount((c) => c + SIDEBAR_PAGE_SIZE)}
          />

          {/* Reviews Box */}
          <SidebarFeed
            title="Reviews"
            items={reviews}
            icon={<ReviewIcon className="w-3.5 h-3.5" />}
            visibleCount={visibleReviewCount}
            onLoadMore={() => setVisibleReviewCount((c) => c + SIDEBAR_PAGE_SIZE)}
          />
        </div>
      </div>
    </div>
  )
}
