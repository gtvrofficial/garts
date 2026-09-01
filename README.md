# GitHub Pages profile site

This is a static frontend designed for the Discord profile bot.

## Pages

- `/` — Facebook-style home feed
- `/profile.html?id=1234567` — profile page
- `/users/1234567` can be added with a GitHub Pages-compatible folder/redirect setup later.

## Bot data

The bot should publish JSON files into:

`data/profiles/<profile_id>.json`

and the home feed into:

`data/feed.json`.

The profile page reads the profile JSON at runtime, so changing the JSON changes what the site displays without editing the HTML.

## Images

Keep images in the repository or use a proper image host/CDN. Do not put private Discord CDN links in permanent public data; Discord attachment URLs can expire.

## Star ratings

GitHub Pages itself cannot securely receive POST requests or maintain a shared rating counter. During beta this frontend stores a user's star locally in their browser.

For real shared ratings, deploy a tiny API (for example a free serverless endpoint) and put its URL in `config.js`:

`RATING_API: "https://your-api.example/rate"`

The API should accept `{post_id, profile_id, action}` and return the updated count.

## Updating from the bot

Because GitHub Pages is static, the bot cannot directly update the live site by changing a local SQLite database. The bot needs to publish the approved profile/post JSON into the website repository, normally by committing/pushing generated JSON through a GitHub token/deploy key or by triggering a GitHub Actions workflow.

Never put a GitHub write token in the website JavaScript.
