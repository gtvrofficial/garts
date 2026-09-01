# Feed v2

This version uses a Facebook-style light feed and is responsive for phones and desktop.

1. Create a Supabase project.
2. Run `supabase.sql` after replacing `YOUR-ADMIN-USER-UUID` with your admin user's UUID.
3. Enable Email and Anonymous authentication in Supabase.
4. Copy `config.example.js` to `config.js` and add the Supabase URL + browser publishable/anon key.
5. Upload the files to GitHub Pages.
6. Open `/admin.html` for the editor.
7. Embed `/index.html` in Google Sites.

If the login button previously did nothing, this version displays the actual Supabase error instead of silently failing and also allows Enter in the password field.

Do not put a Supabase service_role/secret key in config.js.
