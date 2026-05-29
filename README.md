# IntelliMeet Pro

IntelliMeet Pro is an AI-powered meeting assistant. It joins your online meetings (Zoom, Google Meet, Microsoft Teams), records them, transcribes the conversation, and turns it into summaries, key points, and action items — so you do not have to take notes.

This guide walks you through installing and running the project on your computer, step by step. You do not need to be a programmer to follow it, but you will need to copy a few files, run a few commands, and sign up for some free developer accounts.

---

## Table of contents

1. [What you are installing](#what-you-are-installing)
2. [Before you start — checklist](#before-you-start--checklist)
3. [Step 1 — Install required software](#step-1--install-required-software)
4. [Step 2 — Download the project](#step-2--download-the-project)
5. [Step 3 — Set up the database (PostgreSQL)](#step-3--set-up-the-database-postgresql)
6. [Step 4 — Set up AI locally (Ollama)](#step-4--set-up-ai-locally-ollama)
7. [Step 5 — Configure your secret keys](#step-5--configure-your-secret-keys)
8. [Step 6 — Start the backend (API server)](#step-6--start-the-backend-api-server)
9. [Step 7 — Start the frontend (web app)](#step-7--start-the-frontend-web-app)
10. [Step 8 — Open the app in your browser](#step-8--open-the-app-in-your-browser)
11. [Optional features](#optional-features)
12. [Troubleshooting](#troubleshooting)
13. [Security — important](#security--important)

---

## What you are installing

The project has two main parts:

| Part | Folder | What it does |
|------|--------|--------------|
| **Backend** | `IntelliMeet.Backend` | The server that stores meetings, talks to external services, and runs AI analysis |
| **Frontend** | `IntelliMeet.Frontend` | The website you see in your browser |

There is also an optional Azure Functions project (`IntelliMeet.Sync.Functions`) for background sync jobs. You can skip it for a basic local setup.

---

## Before you start — checklist

Make sure you have:

- [ ] A Windows, macOS, or Linux computer with at least **8 GB RAM** (16 GB recommended for AI)
- [ ] An internet connection
- [ ] About **30–60 minutes** for first-time setup
- [ ] Administrator access to install software

You will install:

| Software | Why you need it | Download |
|----------|-----------------|----------|
| **.NET 8 SDK** | Runs the backend | [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download/dotnet/8.0) |
| **Node.js 20+** | Runs the frontend | [nodejs.org](https://nodejs.org/) |
| **PostgreSQL 15+** | Stores your data | [postgresql.org/download](https://www.postgresql.org/download/) |
| **Ollama** | Runs AI models locally (summaries, chat) | [ollama.com/download](https://ollama.com/download) |
| **Git** | Downloads the project | [git-scm.com/downloads](https://git-scm.com/downloads) |

---

## Step 1 — Install required software

### 1a. Install .NET 8

1. Go to [https://dotnet.microsoft.com/download/dotnet/8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
2. Download the **SDK** (not just the Runtime) for your operating system
3. Run the installer and accept the defaults
4. Open a **terminal** (Command Prompt, PowerShell, or Terminal) and verify:

```bash
dotnet --version
```

You should see a version starting with `8.`.

### 1b. Install Node.js

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS** version
3. Run the installer
4. Verify:

```bash
node --version
npm --version
```

### 1c. Install PostgreSQL

1. Go to [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. Download and install PostgreSQL for your OS
3. During setup, choose a **password** for the `postgres` user — remember it; you will need it later
4. Keep the default port **5432**

### 1d. Install Ollama

1. Go to [https://ollama.com/download](https://ollama.com/download)
2. Install Ollama
3. Open a terminal and pull the AI model the app uses:

```bash
ollama pull qwen3:8b
```

4. Verify Ollama is running:

```bash
ollama list
```

You should see `qwen3:8b` in the list.

### 1e. Install Git

1. Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Install Git
3. Verify:

```bash
git --version
```

---

## Step 2 — Download the project

Open a terminal and run:

```bash
git clone https://github.com/mustafa-masood/IntelliMeetPro.git
cd IntelliMeetPro
```

If you already have the folder, just `cd` into it.

---

## Step 3 — Set up the database (PostgreSQL)

The backend needs a PostgreSQL database. You only do this once.

### Option A — Using pgAdmin (easier for beginners)

1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to your local server (password = what you chose during install)
3. Right-click **Databases** → **Create** → **Database**
4. Name it `intellimeet_dev`
5. Click **Save**

### Option B — Using the command line

```bash
psql -U postgres -c "CREATE DATABASE intellimeet_dev;"
```

When prompted, enter your PostgreSQL password.

> The backend automatically creates tables the first time it starts. You do not need to run migrations manually.

---

## Step 4 — Set up AI locally (Ollama)

Ollama must be running whenever you use meeting summaries or Ask AI features.

1. Start the Ollama app (or run `ollama serve` in a terminal)
2. Confirm the model is available:

```bash
ollama run qwen3:8b "Hello"
```

If you get a response, Ollama is working.

---

## Step 5 — Configure your secret keys

**Never commit API keys or passwords to Git.** The project keeps secrets in local files that are ignored by Git.

### 5a. Backend secrets

1. Go to the backend folder:

```bash
cd IntelliMeet.Backend
```

2. Copy the example secrets file:

```bash
# Windows (PowerShell)
Copy-Item appsettings.local.example.json appsettings.local.json

# macOS / Linux
cp appsettings.local.example.json appsettings.local.json
```

3. Open `appsettings.local.json` in any text editor (Notepad, VS Code, etc.)
4. Replace every `YOUR_...` placeholder with your real values (see [Where to get API keys](#where-to-get-api-keys) below)
5. Update the PostgreSQL password in `ConnectionStrings:Postgres` if yours is not `postgres`

> **Tip:** `appsettings.local.json` is loaded automatically and overrides empty values in `appsettings.json`. This file stays on your computer only.

#### Alternative: .NET User Secrets (advanced)

If you prefer not to use a JSON file, you can store secrets with the .NET CLI:

```bash
cd IntelliMeet.Backend
dotnet user-secrets set "Google:ClientId" "YOUR_GOOGLE_CLIENT_ID"
dotnet user-secrets set "Google:ClientSecret" "YOUR_GOOGLE_CLIENT_SECRET"
dotnet user-secrets set "MeetingBaas:ApiKey" "YOUR_MEETINGBAAS_API_KEY"
```

See `IntelliMeet.Backend/BACKEND.md` for the full list of settings.

### 5b. Frontend secrets

1. Go to the frontend folder:

```bash
cd ../IntelliMeet.Frontend
```

2. Copy the example environment file:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

3. Open `.env.local` and set your Clerk publishable key:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

4. Save the file

> **Important:** Only put the **publishable** key (`pk_test_...`) in the frontend. Never put secret keys (`sk_test_...`) in frontend files.

### Where to get API keys

| Service | Required for | Where to sign up | What to copy |
|---------|--------------|------------------|--------------|
| **Clerk** | Sign-in / sign-up | [clerk.com](https://clerk.com) → Create app → API Keys | Publishable key → frontend `.env.local`; Authority URL → backend `Clerk:Authority` |
| **Meeting BaaS** | Bot joins meetings | [meetingbaas.com](https://meetingbaas.com) | API key + webhook signing secret |
| **Google Cloud** | Calendar sync | [console.cloud.google.com](https://console.cloud.google.com) → Credentials → OAuth 2.0 | Client ID + Client Secret |
| **Stripe** | Billing (optional) | [stripe.com](https://stripe.com) → Developers → API keys | Publishable + Secret keys, webhook secret, Price IDs |
| **Voyage AI** | RAG / semantic search (optional) | [voyageai.com](https://www.voyageai.com) | API key |
| **Pinecone** | Vector search (optional) | [pinecone.io](https://www.pinecone.io) | API key, environment host, index name |
| **Asana / Jira / Trello** | Task integrations (optional) | Each provider's developer portal | OAuth client ID + secret (or API key for Trello) |

For a **minimal first run**, you only need:

- PostgreSQL connection (local, no signup)
- Ollama (local, no signup)
- **Clerk** publishable key (free tier) if you want login screens to work

Meeting bots, calendar, billing, and integrations can be added later.

---

## Step 6 — Start the backend (API server)

Open a **new terminal** window:

```bash
cd IntelliMeet.Backend
dotnet restore
dotnet run --launch-profile http
```

Wait until you see something like:

```
Now listening on: http://localhost:5172
```

Leave this terminal open. The backend is running.

- **Swagger API docs:** [http://localhost:5172/swagger](http://localhost:5172/swagger)
- On first start, the database is migrated and demo data may be seeded automatically

---

## Step 7 — Start the frontend (web app)

Open a **second terminal** window:

```bash
cd IntelliMeet.Frontend
npm install
npm run dev
```

Wait until you see:

```
Local:   http://localhost:5173/
```

Leave this terminal open too.

---

## Step 8 — Open the app in your browser

1. Open your web browser
2. Go to [http://localhost:5173](http://localhost:5173)
3. You should see the IntelliMeet dashboard

**Both terminals must stay open** while you use the app (backend + frontend).

---

## Optional features

### Google Calendar

1. In Google Cloud Console, create an OAuth **Web application** client
2. Add authorized redirect URI: `http://localhost:5172/api/auth/google/callback`
3. Put Client ID and Secret in `appsettings.local.json` under `Google`
4. Restart the backend
5. In the app, go to **Calendar** and connect your Google account

### Meeting bots (Zoom / Meet / Teams)

1. Sign up at [meetingbaas.com](https://meetingbaas.com)
2. Add your API key to `appsettings.local.json` under `MeetingBaas:ApiKey`
3. Configure a webhook pointing to your backend (for local dev, use a tunnel like [ngrok](https://ngrok.com))
4. Restart the backend

### Ask AI / semantic search (RAG)

Requires **Voyage AI** (embeddings) and **Pinecone** (vector store). Add keys to `appsettings.local.json`. Without them, the app still works — RAG features are simply disabled.

### Billing (Stripe)

Add Stripe keys and price IDs to `appsettings.local.json`. Use Stripe test mode (`pk_test_`, `sk_test_`) for local development.

---

## Troubleshooting

### "Cannot connect to database"

- Is PostgreSQL running? (Check pgAdmin or Services on Windows)
- Does the database `intellimeet_dev` exist?
- Does the password in `appsettings.local.json` match your PostgreSQL password?

### "Clerk is not configured"

- Copy `.env.example` to `.env.local` in `IntelliMeet.Frontend`
- Add `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`
- Restart `npm run dev` (frontend must restart to pick up env changes)

### Frontend loads but API calls fail

- Is the backend running on port **5172**?
- Check [http://localhost:5172/swagger](http://localhost:5172/swagger) — if this does not load, the backend is not running

### AI summaries not generating

- Is Ollama running? Run `ollama list` in a terminal
- Is the model pulled? Run `ollama pull qwen3:8b`
- Check backend logs for Ollama connection errors

### Port already in use

Another program may be using port 5172 or 5173. Close other dev servers or change ports in:

- Backend: `IntelliMeet.Backend/Properties/launchSettings.json`
- Frontend: `IntelliMeet.Frontend/vite.config.ts` (and update proxy target)

### `dotnet` or `npm` not found

Close and reopen your terminal after installing .NET or Node.js so PATH updates take effect.

---

## Security — important

1. **Never commit secrets.** Use `appsettings.local.json` and `.env.local` only — both are gitignored.
2. **If keys were ever pushed to GitHub, rotate them immediately** in each provider's dashboard (Stripe, Google, Clerk, etc.). Old keys in git history may still be visible until history is rewritten.
3. **Frontend = publishable keys only.** Secret keys belong in backend config or user secrets, never in React env files.
4. **Use test keys locally.** Stripe `sk_test_`, Clerk `pk_test_`, etc.

---

## Project structure (reference)

```
IntelliMeetPro/
├── IntelliMeet.Backend/          # ASP.NET Core 8 API
│   ├── appsettings.json          # Default config (no secrets)
│   ├── appsettings.local.json    # YOUR secrets (create from example, gitignored)
│   └── BACKEND.md                # API & config reference for developers
├── IntelliMeet.Frontend/         # React + Vite web app
│   ├── .env.local                # YOUR frontend keys (create from example, gitignored)
│   └── .env.example              # Template
├── IntelliMeet.Sync.Functions/   # Optional Azure Functions
└── README.md                     # This file
```

---

## Getting help

- Backend API details: see `IntelliMeet.Backend/BACKEND.md`
- Product overview: see `APP_BRIEF.md`

If something in this guide does not match your screen, check that you are on the latest code from the repository and that all prerequisites are installed.
