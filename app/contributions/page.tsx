import { Suspense } from "react"
import type { Metadata } from "next"
import ContributionsClient from "./ContributionsClient"
import Loading from "./loading"
import { getContributions, getRepoStats } from "../../lib/contributions"
import { SITE_CONFIG } from "../../lib/constants"

export const revalidate = 900

export const metadata: Metadata = {
  title: `contributions – ${SITE_CONFIG.name}`,
  description: `Open-source pull requests, reviews and issues by ${SITE_CONFIG.name}.`,
}

async function ContributionsContent() {
  const { prs, reviews, issues } = await getContributions()
  const repos = getRepoStats(prs)

  return (
    <ContributionsClient
      prs={prs}
      repos={repos}
      reviews={reviews}
      issues={issues}
      stats={{
        totalMerged: prs.filter((pr) => pr.isMerged).length,
        totalOpen: prs.filter((pr) => pr.state === "open" && !pr.isMerged).length,
        totalRepos: repos.length,
      }}
    />
  )
}

export default function ContributionsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ContributionsContent />
    </Suspense>
  )
}
