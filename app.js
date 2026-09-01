const { createClient } = window.supabase;
const supabase = createClient(FEED_CONFIG.SUPABASE_URL, FEED_CONFIG.SUPABASE_ANON_KEY);
const feed = document.querySelector("#feed");
const statusEl = document.querySelector("#status");

function profileUrl(profileId) {
  return `https://${location.host}/users/${encodeURIComponent(profileId)}`;
}

async function ensureAnonymousUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
}

function renderPost(post, starred) {
  const card = document.createElement("article");
  card.className = "card";

  const author = document.createElement("div");
  author.className = "author";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = (post.display_name || post.username || "?").trim().charAt(0).toUpperCase();

  const authorText = document.createElement("div");
  const name = document.createElement("div");
  name.className = "author-name";
  name.textContent = post.display_name || "Unknown";
  const username = document.createElement("div");
  username.className = "username";
  username.textContent = post.username ? `@${post.username.replace(/^@/, "")}` : "";
  authorText.append(name, username);
  author.append(avatar, authorText);

  const content = document.createElement("div");
  content.className = "content";
  content.textContent = post.content || "";

  card.append(author, content);

  if (post.image_url) {
    const img = document.createElement("img");
    img.className = "post-image";
    img.src = post.image_url;
    img.alt = "Post attachment";
    img.loading = "lazy";
    card.append(img);
  }

  const footer = document.createElement("div");
  footer.className = "post-footer";

  const button = document.createElement("button");
  button.className = `star-button ${starred ? "starred" : ""}`;
  button.textContent = starred ? "⭐ Starred" : "⭐ Star";

  const count = document.createElement("span");
  count.className = "star-count";
  count.textContent = `${post.stars} ${post.stars === 1 ? "star" : "stars"}`;

  button.addEventListener("click", async () => {
    button.disabled = true;
    const { data, error } = await supabase.rpc("toggle_post_star", { target_post_id: post.id });
    if (error) {
      console.error(error);
      statusEl.textContent = "Couldn't update the star. Try again.";
      button.disabled = false;
      return;
    }

    // RPC returns the new state and count.
    button.classList.toggle("starred", data.starred);
    button.textContent = data.starred ? "⭐ Starred" : "⭐ Star";
    count.textContent = `${data.star_count} ${data.star_count === 1 ? "star" : "stars"}`;
    button.disabled = false;
  });

  footer.append(button, count);
  card.append(footer);
  return card;
}

async function loadFeed() {
  try {
    await ensureAnonymousUser();

    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, profile_id, display_name, username, content, image_url, stars, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: myStars, error: starError } = await supabase
      .from("post_stars")
      .select("post_id");

    if (starError) throw starError;

    const starredIds = new Set((myStars || []).map(x => x.post_id));
    feed.replaceChildren();

    for (const post of (posts || [])) {
      feed.append(renderPost(post, starredIds.has(post.id)));
    }

    if (!posts?.length) statusEl.textContent = "No posts yet.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Feed setup isn't complete yet. Check config.js and Supabase.";
  }
}

loadFeed();
