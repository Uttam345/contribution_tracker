import { SITE_CONFIG, SOCIAL_LINKS } from "../../lib/constants"
import RepoBadge from "../../components/RepoBadge"
import type { RepoStat } from "../../lib/contributions"

function BadgeRow({ label, repos }: { label: string; repos: string[] }) {
  if (repos.length === 0) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
      <span className="text-gray-400 dark:text-gray-500 sm:w-28 shrink-0 font-medium">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {repos.map((repo) => (
          <RepoBadge key={repo} repo={repo} />
        ))}
      </div>
    </div>
  )
}

export default function Hero({ topRepos }: { topRepos: RepoStat[] }) {
  const [firstName, ...rest] = SITE_CONFIG.name.split(" ")
  const lastName = rest.join(" ")
  const contributed = topRepos
    .map((r) => r.repo)
    .slice(0, SITE_CONFIG.contributions.topReposOnHome)

  return (
    <section id="about" className="pt-8 sm:pt-10 space-y-6">
      <div className="flex items-center gap-4 sm:gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://github.com/${SITE_CONFIG.githubUsername}.png?size=128`}
          alt={SITE_CONFIG.name}
          width={64}
          height={64}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-gray-200 dark:border-gray-800 shrink-0 bg-gray-100 dark:bg-zinc-800 object-cover"
        />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {lastName ? (
              <>
                <span className="text-gray-400 dark:text-gray-500">{firstName}</span>{" "}
                <span className="text-gray-900 dark:text-white">{lastName}</span>
              </>
            ) : (
              <span className="text-gray-900 dark:text-white">{firstName}</span>
            )}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base">
            <a
              href={`https://github.com/${SITE_CONFIG.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              @{SITE_CONFIG.githubUsername}
            </a>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="text-gray-500 dark:text-gray-400">{SITE_CONFIG.tagline}</span>
          </div>
        </div>
      </div>

      <div className="text-gray-700 dark:text-gray-300 space-y-4">
        <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
          {SITE_CONFIG.bio}
        </p>

        <div className="space-y-2.5 text-sm sm:text-base pt-1">
          <BadgeRow label="maintainer" repos={SITE_CONFIG.maintainerOf} />
          <BadgeRow label="contributed" repos={contributed} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800/80 text-sm sm:text-base">
        <span className="font-medium text-gray-400 dark:text-gray-500">reach me:</span>
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {link.name.toLowerCase()}
          </a>
        ))}
      </div>
    </section>
  )
}
