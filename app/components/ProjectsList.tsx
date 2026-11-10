import { ArrowUpRight, Star } from "@phosphor-icons/react/dist/ssr"
import type { ProjectItem } from "../../lib/contributions"

export default function ProjectsList({ projects }: { projects: ProjectItem[] }) {
  if (projects.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="section-heading text-gray-500 dark:text-gray-400">
        <span className="text-gray-300 dark:text-gray-700">## </span>projects
      </h2>

      <div className="flex flex-col">
        {projects.map((project, index) => (
          <div
            key={project.name}
            className={`py-3.5 ${index < projects.length - 1 ? "border-b border-dashed border-gray-200 dark:border-gray-800/80" : ""}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <h3 className="text-base sm:text-[17px] font-bold text-gray-900 dark:text-white">
                <a
                  href={project.homepage || project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mauve transition-colors"
                >
                  {project.name}
                </a>
              </h3>
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm sm:text-[15px] font-bold text-gray-500 dark:text-gray-400 hover:text-mauve transition-colors"
              >
                source
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {project.description && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                {project.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 font-mono text-xs sm:text-[13px] text-gray-400 dark:text-gray-500">
              {project.language && <span>{project.language.toLowerCase()}</span>}
              {project.stars > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3 h-3" weight="regular" />
                  {project.stars}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
