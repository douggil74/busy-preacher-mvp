# Busy Preacher (MVP)

A minimal Next.js + Tailwind app that turns a scripture or theme into a concise sermon/lesson outline using OpenAI's Responses API with Structured Outputs.

## 1) Install

```bash
npm i
```

## 2) Environment
Create `.env.local` at project root (do **not** commit it):

```
OPENAI_API_KEY=sk-...your_key_here
# Optional
OPENAI_MODEL=gpt-4.1-mini
```

## 3) Run locally
```bash
npm run dev
```

Open http://localhost:3000

## 4) Deploy (Vercel)
```bash
vercel
```
Then set `OPENAI_API_KEY` in Vercel → Project → Settings → Environment Variables.

## Notes
- API route uses **Node** runtime to avoid Edge bundling issues with the `openai` package.
- Structured Outputs enforce a consistent JSON shape (title, bigIdea, passageSummary, 3–4 points, historicalContext, modernApplication).
- Temperature kept low (0.4) for focus.
