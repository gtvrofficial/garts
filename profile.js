
const id=new URLSearchParams(location.search).get("id") || location.pathname.match(/users\/([^/]+)/)?.[1] || "1234567";
const base=window.SITE_CONFIG?.DATA_PATH||"./data";
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const $=s=>document.querySelector(s);
function openImage(src){$("#lightbox-img").src=src;$("#lightbox").classList.add("open")}
async function load(){
  const p=await fetch(`${base}/profiles/${encodeURIComponent(id)}.json`).then(r=>{if(!r.ok)throw Error("Profile not found");return r.json()});
  document.title=`${p.display_name} — Profile`;
  $("#header").style.setProperty("--bg-image",`url("${p.background}")`);
  $("#avatar").src=p.avatar; $("#avatar").alt=`${p.display_name} profile picture`;
  $("#name").textContent=p.display_name; $("#username").textContent="@"+p.username;
  $("#description").textContent=p.description||"";
  $("#badges").innerHTML=(p.badges||[]).map(b=>`<span class="badge">${esc(b.symbol||"✓")}</span>`).join("");
  $("#posts").innerHTML=(p.posts||[]).map(post=>postCard(post,p)).join("") || '<div class="empty">No posts yet.</div>';
  document.querySelectorAll(".post-image").forEach(x=>x.onclick=()=>openImage(x.src));
  document.querySelectorAll("[data-star]").forEach(x=>x.onclick=()=>rate(x.dataset.star));
}
function postCard(post,p){
  const key=`starred:${id}:${post.id}`;
  const active=localStorage.getItem(key)==="1";
  return `<article class="post"><img class="post-image" src="${esc(post.image)}" alt="Post by ${esc(p.display_name)}"><div class="post-body"><div class="post-meta">@${esc(p.username)}</div><div class="caption">${esc(post.caption||"")}</div><div class="stars"><button class="star-button ${active?"active":""}" data-star="${esc(post.id)}">${active?"★":"☆"}</button><span class="star-count">${Number(post.stars||0)+(active?1:0)} stars</span></div></div></article>`;
}
async function rate(postId){
  const key=`starred:${id}:${postId}`, active=localStorage.getItem(key)==="1";
  if(window.SITE_CONFIG?.RATING_API){
    const r=await fetch(window.SITE_CONFIG.RATING_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile_id:id,post_id:postId,action:active?"remove":"add"})});
    if(!r.ok){alert("The rating could not be saved.");return}
    location.reload(); return;
  }
  localStorage.setItem(key,active?"0":"1");
  load();
}
$("#lightbox").onclick=e=>{if(e.target.id==="lightbox"||e.target.id==="lightbox-img")$("#lightbox").classList.remove("open")};
load().catch(()=>{$(".posts").innerHTML='<div class="empty">This profile could not be loaded.</div>'});
