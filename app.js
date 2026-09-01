const {createClient}=window.supabase;
const supabase=createClient(FEED_CONFIG.SUPABASE_URL,FEED_CONFIG.SUPABASE_ANON_KEY);
const feed=document.querySelector("#feed"),statusEl=document.querySelector("#status");

async function ensureAnonymousUser(){
  const {data,error}=await supabase.auth.getSession();
  if(error) throw error;
  if(!data.session){
    const {error:e}=await supabase.auth.signInAnonymously();
    if(e) throw e;
  }
}
function renderPost(post,starred){
  const card=document.createElement("article");card.className="card";
  const author=document.createElement("div");author.className="author";
  const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=(post.display_name||post.username||"?").trim()[0]?.toUpperCase()||"?";
  const txt=document.createElement("div"),name=document.createElement("div"),user=document.createElement("div");
  name.className="author-name";name.textContent=post.display_name||"Unknown";
  user.className="username";user.textContent=post.username?`@${post.username.replace(/^@/,"")}`:"";
  txt.append(name,user);author.append(avatar,txt);card.append(author);
  const content=document.createElement("div");content.className="content";content.textContent=post.content||"";card.append(content);
  if(post.image_url){const img=document.createElement("img");img.className="post-image";img.src=post.image_url;img.alt="Post attachment";img.loading="lazy";card.append(img)}
  const footer=document.createElement("div");footer.className="post-footer";
  const btn=document.createElement("button");btn.className=`star-button ${starred?"starred":""}`;btn.textContent=starred?"⭐ Starred":"⭐ Star";
  const count=document.createElement("span");count.className="star-count";count.textContent=`${post.stars} ${post.stars===1?"star":"stars"}`;
  btn.onclick=async()=>{btn.disabled=true;const {data,error}=await supabase.rpc("toggle_post_star",{target_post_id:post.id});if(error){console.error(error);statusEl.textContent="Couldn't update the star. Please try again.";btn.disabled=false;return}btn.classList.toggle("starred",data.starred);btn.textContent=data.starred?"⭐ Starred":"⭐ Star";count.textContent=`${data.star_count} ${data.star_count===1?"star":"stars"}`;btn.disabled=false};
  footer.append(btn,count);card.append(footer);return card;
}
async function loadFeed(){
  try{
    await ensureAnonymousUser();
    const {data:posts,error}=await supabase.from("posts").select("id,profile_id,display_name,username,content,image_url,stars,created_at").order("created_at",{ascending:false});
    if(error)throw error;
    const {data:stars,error:se}=await supabase.from("post_stars").select("post_id");
    if(se)throw se;
    const ids=new Set((stars||[]).map(x=>x.post_id));feed.replaceChildren();
    (posts||[]).forEach(p=>feed.append(renderPost(p,ids.has(p.id))));
    if(!posts?.length)statusEl.textContent="No posts yet.";
  }catch(e){console.error(e);statusEl.textContent="Feed setup is incomplete. Check config.js and Supabase settings."}
}
loadFeed();