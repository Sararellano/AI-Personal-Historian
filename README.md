# Personal Historian

Personal Historian is a private, responsive memory journal. It offers one reflective question each day, tracks writing consistency and emotional themes, identifies recurring people, creates memoir chapters and a full biography, and exports the finished story as PDF.

## Features

- Email/password authentication and private user archives
- Daily prompts across childhood, adolescence, adulthood, and curiosity
- Offline answer queue with automatic reconnection sync
- Structured memory analysis: people, emotions, lessons, and milestones
- Streak, calendar heatmap, emotional landscape, and recurring themes
- Memoir chapter and first-person biography generation
- Markdown reading view, PDF biography export, and JSON archive export
- Shareable lesson cards, responsive navigation, dark mode, and accessible controls
- Installable web app shell with basic offline caching

## Stack

- React 19, Vite, TypeScript, Tailwind CSS
- TanStack Start file-based routing and server functions
- Lovable Cloud database, authentication, and row-level access policies
- Lovable AI through the Vercel AI SDK
- date-fns, Recharts, React Markdown, html2pdf.js, canvas-confetti, react-hot-toast

## Local setup

1. Install [Bun](https://bun.sh/) or Node.js 20+.
2. Install dependencies:

   ```bash
   bun install
   ```

3. The connected Lovable Cloud environment supplies the database and public client configuration. For a self-hosted environment, configure equivalent public database URL/key variables and a server-only `LOVABLE_API_KEY`.
4. Start the development server:

   ```bash
   bun run dev
   ```

<!-- 5. Open the displayed local URL, create an account, confirm the email, and begin writing.

## Environment variables

| Variable                        | Scope          | Purpose                                                                  |
| ------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `VITE_SUPABASE_URL`             | Public/browser | Connected backend URL; managed automatically in Lovable                  |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public/browser | Publishable backend key; managed automatically in Lovable                |
| `LOVABLE_API_KEY`               | Server only    | Authenticates requests to Lovable AI; never expose with a `VITE_` prefix |

The app intentionally keeps AI calls in authenticated server functions. Provider credentials and prompts are not shipped to browsers.

## About Ollama

The production app uses Lovable AI because a deployed server cannot reach `localhost` on a visitor’s computer. If you want to experiment with Ollama locally:

1. Install Ollama from [ollama.com](https://ollama.com/).
2. Pull and run the requested model:

   ```bash
   ollama pull qwen2.5-coder:7b-instruct-q4_K_M
   ollama serve
   ```

3. Point a local, server-side adapter at `http://localhost:11434/api/generate`. Do not call it directly from browser code: that approach exposes requests to CORS restrictions and cannot work after deployment. Keep the same prompts and `temperature: 0.15` when swapping providers.

## Data and security

Every user-owned table has row-level policies. A signed-in person can access only their own profile, answers, analyses, recurring topics, and generated writing. The public questions library is read-only for signed-in users. Authentication is revalidated before protected server functions run.

## Production

Publish from Lovable to deploy the frontend and server runtime. Database migrations and server-side configuration are managed by Lovable Cloud. Before launch, verify your production auth redirect URLs, email delivery, AI usage limits, and site visibility.

## Available scripts

```bash
bun run dev       # local development
bun run build     # production bundle
bun run preview   # preview the bundle
bun run lint      # lint source files
bun run format    # format the project
``` -->
