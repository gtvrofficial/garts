# GitHub Pages site

The bot publishes:
- `data/profiles/<profile_id>.json`
- `data/feed.json`
- `assets/avatars/...`
- `assets/backgrounds/...`
- `assets/posts/<profile_id>/...`

The profile page is `profile.html`, but GitHub Pages does not automatically route `/users/123` to it. For clean `/users/123` URLs, create a generated `users/<id>/index.html` for each approved profile, or use a GitHub Pages-compatible static routing approach.

The bot in this package currently publishes the data/assets and the existing site pages. A next production step is to have the bot copy `profile.html` into `users/<id>/index.html` whenever a profile is created/updated.
