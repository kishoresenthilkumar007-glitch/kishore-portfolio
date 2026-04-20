Vercel deployment instructions

- Ensure `public/` contains the final site (index.html, styles.css, script.js, admin/ etc.).
- In Vercel project settings, set the Environment Variables:
  - `SUPABASE_URL` = your Supabase URL
  - `SUPABASE_ANON_KEY` = your Supabase anon/public key

- Option A (recommended): Use a small build step to inject env vars into `public/supabase-client.js`.
- Option B: Manually edit `public/supabase-client.js` to replace placeholders with your keys.

- The included `vercel.json` rewrites requests to the `public/` folder.
- Deploy by connecting this repo to Vercel and clicking Deploy.
