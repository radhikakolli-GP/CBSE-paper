# Deploying so it's reachable from anywhere

This splits the app across two free hosts: **Render** runs the Python backend
(API + database), **Vercel** serves the single-file frontend. No code
rewrite is needed - the app was already built with this split in mind
(`window.API_BASE` in `frontend/index.html` and `PORT` env var support in
`backend/server.py` exist specifically for this).

The whole thing is already a git repo (`git log` shows one commit) - you
just need to push it to your own GitHub and point the two hosts at it.

## 1. Push to GitHub

Create a new empty repo on [github.com/new](https://github.com/new) (don't
initialize it with a README), then from this folder:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## 2. Deploy the backend on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) and sign in
   (GitHub login is easiest).
2. Click **New +** -> **Blueprint**, and select the repo you just pushed.
   Render will detect `render.yaml` in the repo root and pre-fill
   everything (build command, start command, Python version) - just click
   **Apply**.
3. Wait for the first deploy to finish, then copy the service's URL, e.g.
   `https://cbse-sst-backend.onrender.com`.
4. **Free tier note:** the free plan has no persistent disk, so a local
   SQLite database would reset whenever the service restarts, redeploys,
   or spins down from 15 minutes of inactivity (it also takes ~30-60s to
   "wake up" on the first request after sleeping). Step 2a below fixes
   this for free using Supabase; skip it if you don't mind history
   resetting occasionally.

## 2a. (Recommended) Make attempt history persist, for free, via Supabase

The backend already supports this - `backend/db.py` automatically switches
from local SQLite to a Postgres database the moment a `DATABASE_URL`
environment variable is present, with no other code changes needed.

1. Go to [supabase.com](https://supabase.com), sign in, and create a new
   project (pick any name/region; save the database password it asks you
   to set - you'll need it in a moment).
2. Once the project is ready, go to **Connect** (top of the project
   dashboard) and copy the **Session pooler** connection string - it looks
   like `postgresql://postgres.xxxxxxxx:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres`.
   Replace `[YOUR-PASSWORD]` with the database password from step 1.

   Use the **Session pooler** string specifically, not "Direct connection" -
   Supabase's direct connection is IPv6-only, and Render (like most hosts)
   doesn't support outbound IPv6, so it won't connect. The pooler string
   works over IPv4.
3. Back in Render, open your `cbse-sst-backend` service -> **Environment**
   tab -> **Add Environment Variable**. Key: `DATABASE_URL`, value: the
   connection string from step 2. Save - Render will automatically restart
   the service with the new variable.
4. That's it. On the next request, `db.py` creates the `papers` and
   `submissions` tables in Supabase automatically (same `init_db()` call
   as before, just pointed at Postgres now). Generated papers and attempt
   history now survive restarts and redeploys, for free.

   One caveat: Supabase pauses a free-tier project after 7 days with zero
   database activity (it resumes automatically on the next request, data
   is not lost - it just pauses). If the app sits completely unused for a
   week+, expect the first request after that to be a little slow while it
   wakes back up.

   (The other option - Render's paid Starter plan with a persistent disk,
   documented in the commented-out `disk:` block in `render.yaml` - still
   works too, if you'd rather pay for storage than deal with Supabase.
   Supabase is the free option; the disk is the simpler-but-paid one.)

## 3. Point the frontend at your backend

Open `frontend/index.html`, find this line near the top:

```html
<script>window.API_BASE = "http://localhost:8000";</script>
```

Change it to your Render URL from step 2:

```html
<script>window.API_BASE = "https://cbse-sst-backend.onrender.com";</script>
```

Commit and push that one-line change:

```bash
git add frontend/index.html
git commit -m "Point frontend at deployed backend"
git push
```

## 4. Deploy the frontend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. Import the same GitHub repo.
3. Vercel should pick up `vercel.json` (which sets the output directory to
   `frontend`) automatically. If it instead asks you to configure a
   framework, choose **Other**, and manually set **Root Directory** to
   `frontend` in the project settings - either approach works.
4. Click **Deploy**. You'll get a URL like
   `https://your-app.vercel.app` - that's the link to open from any
   device, anywhere.

## After deploying

Every time you push a change to either `backend/` or `frontend/` on the
`main` branch, both Render and Vercel auto-redeploy - no manual steps
needed after the first setup.

If you outgrow Render's free-tier sleep/reset behavior, Railway
([railway.com](https://railway.com)) is a drop-in alternative for the
backend - it has real persistent volumes on its Hobby plan and no
free/idle sleep, but (as of 2026) there's no permanently-free tier, so
it's a small monthly cost from the start rather than free-with-caveats.
