import Link from "next/link"
import { GitMerge, XCircle, ArrowUpRight } from "@phosphor-icons/react/dist/ssr"
import type { ActivityItem, ActivityType } from "../../lib/contributions"
import { PullRequestIcon, IssueIcon, ReviewIcon } from "../../components/icons"
import RepoBadge from "../../components/RepoBadge"

const TYPE_VERB: Record<ActivityType, string> = {
  pr_merged: "merged",
  pr_opened: "opened",
  pr_closed: "closed",
  review: "reviewed",
  issue: "filed issue",
}

function ActivityIcon({ type }: { type: ActivityType }) {
  switch (type) {
    case "pr_merged":
      return <GitMerge className="w-3.5 h-3.5 text-mauve" weight="regular" />
    case "pr_opened":
      return <PullRequestIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
    case "pr_closed":
      return <XCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" weight="regular" />
    case "review":
      return <ReviewIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
    case "issue":
      return <IssueIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
  }
}

export default function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading text-gray-500 dark:text-gray-400">
          <span className="text-gray-300 dark:text-gray-700">## </span>recent activity
        </h2>
        <Link
          href="/contributions"
          className="text-sm font-mono text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
        >
          view all →
        </Link>
      </div>

      <div className="flex flex-col">
        {activities.map((item, index) => (
          <div
            key={item.id}
            className={`group flex items-center gap-3.5 py-3.5 transition-colors ${
              index < activities.length - 1
                ? "border-b border-dashed border-gray-200 dark:border-gray-800/80"
                : ""
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-gray-100 dark:bg-zinc-900 border border-gray-200/80 dark:border-gray-800/80">
              <ActivityIcon type={item.type} />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <a
                href={item.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-2 sm:truncate text-base sm:text-[17px] font-medium text-gray-900 dark:text-white hover:text-mauve transition-colors"
              >
                {item.title}
              </a>

              <div className="flex min-w-0 items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
                  {TYPE_VERB[item.type]}
                </span>
                <span className="text-gray-300 dark:text-gray-700 text-xs">·</span>
                <RepoBadge repo={item.repo} />
                <span className="shrink-0 font-mono text-xs text-gray-400 dark:text-gray-500">
                  #{item.number}
                </span>
              </div>
            </div>

            <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0 hidden sm:inline">
              {new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}
            </span>

            <a
              href={item.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-mauve"
              aria-label="View on GitHub"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
