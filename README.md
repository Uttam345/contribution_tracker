# Open-source contributions

A small Next.js site that shows your public GitHub contributions: merged, opened and closed pull requests, a per-repo breakdown, issues you filed and PRs you reviewed. Data comes live from the GitHub API and refreshes about every 15 minutes.

Pages:

- `/` profile, recent activity, your top contributed repos, your own projects
- `/contributions` full dashboard with tabs, repo filter and load-more

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.

## Run locally

```bash
npm install
cp .env.example .env.local   # then edit it
npm run dev                  # http://localhost:3000
```

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

## Configuration

Environment variables (`.env.local` locally, project settings on Vercel):

| Variable                      | Required    | What it does                                           |
| ----------------------------- | ----------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_GITHUB_USERNAME` | yes         | Whose contributions to show                            |
| `GITHUB_TOKEN`                | recommended | Raises the search rate limit from 10 to 30 requests/min |
| `NEXT_PUBLIC_SITE_URL`        | no          | Custom domain, used for sitemap and metadata           |

Create the token under GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens. Choose "Public repositories (read-only)" and grant no other permissions. The app only queries public activity (`is:public`), so private repo work is never shown.

Profile text, links and filters live in `lib/constants.ts`:

- `name`, `tagline`, `bio`
- `SOCIAL_LINKS` (add LinkedIn, X, email, ...)
- `maintainerOf` shows a "maintainer" row on the home page
- `contributions.excludedRepos` hides repos as `"owner/repo"`

PRs, issues and reviews in repos under your own username are hidden automatically, so the dashboard only shows work on other people's projects.

## Deploy on Vercel

1. Push this folder to a new GitHub repo:

   ```bash
   git init && git add . && git commit -m "feat: contributions site"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. Go to vercel.com/new, import the repo. Vercel detects Next.js, so leave build settings alone.
3. Under Environment Variables add `NEXT_PUBLIC_GITHUB_USERNAME` and `GITHUB_TOKEN`.
4. Deploy. Every push to `main` redeploys.

`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

CLI alternative: `npx vercel` for a preview, `npx vercel --prod` for production.

## Other hosts

Any host that runs Node 22 works: Render, Railway, Fly.io, a VPS, or Docker.

```bash
npm ci && npm run build   # build command
npm start                 # start command, listens on $PORT
```

Don't use a static export (`output: "export"`): the data would freeze at build time. If you must use a static host, trigger a redeploy on a schedule (for example a GitHub Actions cron calling a deploy hook).

## Limits worth knowing

- GitHub search returns at most 1,000 results per query, so PR history is capped at your latest 1,000 PRs. Issues and reviews show the latest 100 each.
- Without `GITHUB_TOKEN` the search limit is 10 requests/min. A cold build can hit it and show an empty page until the next refresh (15 min), so set the token.
- Review dates are "last updated" dates, because search cannot sort by review time.

## Credit

Layout and design are adapted from [sheikhlimon/limon-portfolio](https://github.com/sheikhlimon/limon-portfolio) (MIT). The original license is kept in `LICENSE`.
