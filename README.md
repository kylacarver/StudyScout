# StudyScout

StudyScout helps students find study spaces by combining:

- **Our rating**: internal estimated quality score from spot amenities.
- **Student rating**: live community ratings + reviews (Supabase-backed).
- **Busyness estimate**: dynamic estimate using time-of-day, day-of-week, and school-phase (start, midterm, finals, break).

## Local setup

1. Create a Supabase project.
2. Run `db/schema.sql` in the Supabase SQL editor.
3. Run `db/seed.sql`.
4. Set browser globals before loading `app.js`:

```html
<script>
  window.STUDYSCOUT_SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
  window.STUDYSCOUT_SUPABASE_ANON_KEY = "YOUR-ANON-KEY";
</script>
```

If globals are not set, the app still works in fallback mode using local hardcoded spots, but auth and student ratings are disabled.

Apply the same `window.STUDYSCOUT_*` script block in both `index.html` and `login.html` (or inject at build time for both files).

## Google sign-in (Supabase)

1. In [Google Cloud Console](https://console.cloud.google.com/), create an OAuth **Web application** client.
2. Under **Authorized redirect URIs**, add your Supabase callback (shown in Supabase as something like `https://YOUR-PROJECT.supabase.co/auth/v1/callback`).
3. Copy the Google **Client ID** and **Client secret**.
4. In Supabase: **Authentication → Sign In / Providers → Google** — enable and paste the client ID and secret.
5. In Supabase: **Authentication → URL Configuration**:
   - **Site URL**: your live site root, e.g. `https://your-project.vercel.app`
   - **Redirect URLs**: add `https://your-project.vercel.app/login.html` and `http://localhost:PORT/login.html` for local testing.

After that, **Continue with Google** on `login.html` will complete the OAuth flow and return users to the same page, then redirect them to the home page when a session exists.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import repo into Vercel.
3. In Vercel project settings, add env vars:
   - `STUDYSCOUT_SUPABASE_URL`
   - `STUDYSCOUT_SUPABASE_ANON_KEY`
4. Redeploy.

### Inject env vars in the frontend

For static hosting, expose vars via an inline script in `index.html` during your build/deploy step (or generate a config script). Example:

```html
<script>
  window.STUDYSCOUT_SUPABASE_URL = "%%STUDYSCOUT_SUPABASE_URL%%";
  window.STUDYSCOUT_SUPABASE_ANON_KEY = "%%STUDYSCOUT_SUPABASE_ANON_KEY%%";
</script>
```

## Search indexing checklist

- Keep `sitemap.xml` and `robots.txt` deployed at the root.
- Verify your domain in [Google Search Console](https://search.google.com/search-console/about).
- Submit `https://your-domain/sitemap.xml` in Search Console.
- Keep title/meta description accurate per page.
