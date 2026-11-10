import Hero from "./components/Hero"
import RecentActivity from "./components/RecentActivity"
import ProjectsList from "./components/ProjectsList"
import {
  fetchProjects,
  getContributions,
  getRecentActivity,
  getRepoStats,
} from "../lib/contributions"

export const revalidate = 900

export default async function Home() {
  const [{ prs }, activities, projects] = await Promise.all([
    getContributions(),
    getRecentActivity(10),
    fetchProjects(6),
  ])

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 w-full space-y-12 sm:space-y-14">
      <Hero topRepos={getRepoStats(prs)} />

      <div className="section-divider" />
      <RecentActivity activities={activities} />

      <div className="section-divider" />
      <ProjectsList projects={projects} />
    </div>
  )
}
