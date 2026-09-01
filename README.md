# Google Sites Community Feed

This is a GitHub Pages frontend that can be embedded into Google Sites.

## 1. Create the backend

Create a free Supabase project.

In Supabase:
1. Open SQL Editor.
2. Run `supabase.sql`.
3. Enable Anonymous Sign-Ins under Authentication -> Providers.
4. Create an admin email/password user under Authentication -> Users.
5. Copy that admin user's UUID.
6. Replace `YOUR-ADMIN-USER-UUID` in `supabase.sql` with the UUID.
7. Run the three admin policies again (or rerun the edited SQL after removing the old policies if Supabase reports that they already exist).

## 2. Configure the website

Copy:

`config.example.js` -> `config.js`

Put your Supabase project URL and browser-safe publishable/anon key in it.

Do NOT put a `service_role` or secret key in `config.js`.

## 3. Publish with GitHub Pages

Upload the files to a GitHub repository. Enable GitHub Pages for the repository.

Important: `config.js` contains a public browser key. That is normal for Supabase's anon/publishable key, but keep your service/secret key private.

## 4. Use the editor

Open:

`https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/admin.html`

Log in with your admin account.

You can create and edit posts.

## 5. Embed in Google Sites

In Google Sites, use Embed -> URL and enter the GitHub Pages URL for `index.html`.

### Stars

The site uses Supabase Anonymous Auth. Each browser gets a persistent anonymous account/session, and `post_stars` has a unique `(post_id, user_id)` constraint.

Clicking Star adds one star. Clicking it again removes it.

This prevents duplicate stars from the same anonymous account. It is intentionally device/browser oriented, not an identity system. Clearing browser data or switching devices creates a different anonymous account.

For stronger anti-abuse protection later, add real user accounts/login and optional rate limiting.
