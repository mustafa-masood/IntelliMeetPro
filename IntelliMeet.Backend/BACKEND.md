# IntelliMeet backend (Meeting BaaS v2)

ASP.NET Core 8 Web API with a **clean, persistence-ready layout**: domain entities and enums, application services/DTOs, infrastructure (HTTP client + in-memory repositories), and controllers. All state lives in **thread-safe in-memory** stores (`ConcurrentDictionary`) so you can run the UI against a real API without PostgreSQL. Replacing repositories with EF Core + Npgsql later should not require controller changes.

## Configuration

| Setting | Purpose |
|--------|---------|
| `MeetingBaas:BaseUrl` | Default `https://api.meetingbaas.com` |
| `MeetingBaas:ApiKey` | Meeting BaaS API key; sent as header `x-meeting-baas-api-key`. Use **user secrets** or environment variables (e.g. `MeetingBaas__ApiKey`). **Never commit keys.** |
| `MeetingBaas:WebhookSigningSecret` | SVIX signing secret from your Meeting BaaS webhook configuration. When set, `POST /api/webhooks/meetingbaas` verifies signatures. |
| `GoogleOAuth:ClientId` | Google OAuth 2.0 Web client ID (safe to expose to the SPA via `GET /api/auth/google/config`). |
| `GoogleOAuth:ClientSecret` | **Confidential.** Used only on the server to exchange the auth `code` and to call Meeting BaaS `list-raw` / `connect`. |
| `GoogleOAuth:RedirectUri` | Must exactly match an **Authorized redirect URI** in Google Cloud (default `http://localhost:5173/oauth/google/callback`). |
| `Runtime:SeedDemoData` | Seeds deterministic demo data into in-memory stores at startup when repositories are empty. |

```bash
dotnet user-secrets set "MeetingBaas:ApiKey" "YOUR_KEY"
dotnet user-secrets set "MeetingBaas:WebhookSigningSecret" "YOUR_SVIX_SECRET"
dotnet user-secrets set "GoogleOAuth:ClientId" "YOUR_GOOGLE_CLIENT_ID"
dotnet user-secrets set "GoogleOAuth:ClientSecret" "YOUR_GOOGLE_CLIENT_SECRET"
dotnet user-secrets set "GoogleOAuth:RedirectUri" "http://localhost:5173/oauth/google/callback"
```

### Google Calendar + SPA

1. In [Google Cloud Console](https://console.cloud.google.com/) → Credentials → your **Web client** → add **Authorized redirect URI**: `http://localhost:5173/oauth/google/callback`.
2. Run the backend with the secrets above. The Vite dev server proxies `/api` to the backend (`vite.config.ts`).
3. The SPA route `/oauth/google/callback` exchanges `?code=` via `POST /api/auth/google/token`, then stores the **refresh token** in `sessionStorage` for **list-raw** and **connect** flows on the Calendar page.
4. If Google does not return a `refresh_token`, revoke the app under [Google Account permissions](https://myaccount.google.com/permissions) and sign in again (the backend uses `prompt=consent` and `access_type=offline`).

## Main HTTP surface

- **Dashboard:** `GET /api/dashboard/upcoming-meetings`, `GET /api/dashboard/calendar`, `POST /api/dashboard/bots/join`
- **Meetings:** `GET /api/meetings`, `GET /api/meetings/{id}`, transcript/summary/action-items, assign task, convert action item to todo
- **Calendars:** connect (proxies `POST /v2/calendars`), list, events, `sync`, `schedule-bot`
- **Todos:** list/create/patch, `POST /api/todos/from-action-item`
- **Webhooks:** `POST /api/webhooks/meetingbaas` (raw JSON; optional SVIX verification)
- **Experimental (deferred):** `POST /api/experimental/meetings-transcription/analyzeWithTranscription`, `POST /api/experimental/meetings-transcription/analyze`

## Meeting BaaS integration

`IMeetingBaasClient` (`Infrastructure/MeetingBaas/MeetingBaasClient.cs`) wraps v2 endpoints (bots, calendars, sync, schedule bot). Application services call the client; **controllers do not**.

Webhooks are persisted as `WebhookEvent` rows for debugging; `MeetingBaasWebhookProcessor` updates meetings, bots, transcripts/recording URLs, and calendar events when payloads are recognized.

## Seed data

When `Runtime:SeedDemoData=true`, startup runs `InMemoryDataSeeder`, which adds a demo user, one completed meeting with transcript segments, summary, key points, an action item, and a sample todo (only if the user store is empty).

## Swagger

With `ASPNETCORE_ENVIRONMENT=Development`, Swagger UI is enabled at `/swagger`.
