# Hypnotiic Media — Internal App

Your private web app. Access it from any device at your Vercel URL.

---

## How to deploy (one time, ~20 minutes)

### Step 1 — GitHub (free)
1. Go to github.com and create a free account
2. Click the + icon top right → New repository
3. Name it `hypnotiic-app`
4. Leave everything else as default → click Create repository
5. Follow the instructions GitHub shows you to upload this folder

### Step 2 — Supabase (free login system)
1. Go to supabase.com → Sign up free
2. Click New project → name it `hypnotiic`
3. Once created, go to Settings → API
4. Copy the Project URL and the anon public key — you'll need these in Step 4
5. Go to Authentication → Users → Add user
6. Add yourself (max@...), Kathya, and any VA with email + password

### Step 3 — Vercel (free hosting)
1. Go to vercel.com → Sign up with GitHub
2. Click Add New → Project
3. Find your `hypnotiic-app` repository → click Import
4. Click Deploy — Vercel builds it automatically

### Step 4 — Add your API keys to Vercel
1. In Vercel, go to your project → Settings → Environment Variables
2. Add each key from the .env.example file one by one:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - ANTHROPIC_API_KEY
   - APIFY_API_TOKEN
   - GMAIL_ADDRESS
   - GMAIL_APP_PASSWORD
   - MAX_EMAIL
   - KATHYA_EMAIL
3. Click Save → then Deployments → Redeploy

### Step 5 — Open your app
Vercel gives you a URL like `hypnotiic-app.vercel.app`
Bookmark it. Open it on your phone. Log in with the credentials you set in Supabase.

---

## Adding a new client
Open `lib/clients.js` and add a new entry following the existing pattern.
Push the change to GitHub → Vercel redeploys automatically.

---

## How to use it day to day

1. Open the URL on any device
2. Click a client
3. Competitor discovery → click Run → wait 15 mins → results appear
4. SortFeed analysis → drop CSV → click Run → brief hits your inbox in 3 mins
5. Weekly report → add notes → click Generate → sent automatically
