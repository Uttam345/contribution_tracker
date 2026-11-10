import { SITE_CONFIG } from "../lib/constants"

export default function Footer() {
  return (
    <footer className="max-w-4xl mx-auto px-5 sm:px-8 pb-8 w-full">
      <div className="border-t border-dashed border-gray-200 dark:border-gray-800/80 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {SITE_CONFIG.name.toLowerCase()}</p>
      </div>
    </footer>
  )
}
