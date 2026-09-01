const { createClient } = window.supabase;
const supabase = createClient(FEED_CONFIG.SUPABASE_URL, FEED_CONFIG.SUPABASE_ANON_KEY);

const loginPanel = document.querySelector("#login-panel");
const editorPanel = document.querySelector("#editor-panel");
const loginStatus = document.querySelector("#login-status");
const editorStatus = document.querySelector("#editor-status");
const saveBtn = document.querySelector("#save");

const fields = {
  id: document.querySelector("#post-id"),
  profile: document.querySelector("#profile-id"),
  name: document.querySelector("#display-name"),
  username: document.querySelector("#username"),
  content: document.querySelector("#content"),
  image: document.querySelector("#image-url"),
  stars: document.querySelector("#stars")
};

function clearEditor() {
  Object.values(fields).forEach(x => x.value = "");
  fields.stars.value = "0";
  saveBtn.textContent = "Create post";
  document.querySelector("#editor-title").textContent = "Create post";
}

async function refreshPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, profile_id, display_name, username, content, stars, created_at")
    .order("created_at", { ascending: false });

  const list = document.querySelector("#post-list");
  list.replaceChildren();

  if (error) {
    editorStatus.textContent = error.message;
    return;
  }

  for (const post of data || []) {
    const row = document.createElement("div");
    row.className = "post-row";

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.textContent = `${post.display_name || "Unknown"} — ${post.id}`;
    const small = document.createElement("div");
    small.className = "small";
    small.textContent = `${post.stars} stars • ${post.username || ""}`;
    info.append(title, small);

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.addEventListener("click", () => {
      fields.id.value = post.id;
      fields.profile.value = post.profile_id || "";
      fields.name.value = post.display_name || "";
      fields.username.value = post.username || "";
      fields.content.value = post.content || "";
      fields.image.value = post.image_url || "";
      fields.stars.value = post.stars ?? 0;
      saveBtn.textContent = "Save changes";
      document.querySelector("#editor-title").textContent = "Edit post";
      window.scrollTo({top: 0, behavior: "smooth"});
    });

    row.append(info, edit);
    list.append(row);
  }
}

async function showEditor() {
  loginPanel.classList.add("hidden");
  editorPanel.classList.remove("hidden");
  await refreshPosts();
}

document.querySelector("#login").addEventListener("click", async () => {
  loginStatus.textContent = "Logging in…";
  const { error } = await supabase.auth.signInWithPassword({
    email: document.querySelector("#email").value,
    password: document.querySelector("#password").value
  });
  if (error) {
    loginStatus.textContent = error.message;
    return;
  }
  loginStatus.textContent = "";
  await showEditor();
});

document.querySelector("#logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  editorPanel.classList.add("hidden");
  loginPanel.classList.remove("hidden");
});

document.querySelector("#clear").addEventListener("click", clearEditor);

saveBtn.addEventListener("click", async () => {
  editorStatus.textContent = "Saving…";

  const payload = {
    profile_id: fields.profile.value.trim() || null,
    display_name: fields.name.value.trim(),
    username: fields.username.value.trim().replace(/^@/, ""),
    content: fields.content.value,
    image_url: fields.image.value.trim() || null,
    stars: Math.max(0, Number(fields.stars.value) || 0)
  };

  let result;
  if (fields.id.value.trim()) {
    result = await supabase.from("posts").update(payload).eq("id", fields.id.value.trim());
  } else {
    result = await supabase.from("posts").insert(payload);
  }

  if (result.error) {
    editorStatus.textContent = result.error.message;
    return;
  }

  editorStatus.textContent = "Saved.";
  clearEditor();
  await refreshPosts();
});

supabase.auth.getSession().then(({ data }) => {
  if (data.session && data.session.user.is_anonymous !== true) showEditor();
});
