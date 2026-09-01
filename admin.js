const {createClient}=window.supabase;
const supabase=createClient(FEED_CONFIG.SUPABASE_URL,FEED_CONFIG.SUPABASE_ANON_KEY);
const loginPanel=document.querySelector("#login-panel"),editorPanel=document.querySelector("#editor-panel"),loginStatus=document.querySelector("#login-status"),editorStatus=document.querySelector("#editor-status"),saveBtn=document.querySelector("#save");
const f={id:document.querySelector("#post-id"),profile:document.querySelector("#profile-id"),name:document.querySelector("#display-name"),username:document.querySelector("#username"),content:document.querySelector("#content"),image:document.querySelector("#image-url"),stars:document.querySelector("#stars")};
function clearEditor(){Object.values(f).forEach(x=>x.value="");f.stars.value="0";saveBtn.textContent="Create post";document.querySelector("#editor-title").textContent="Create post"}
async function refreshPosts(){
 const {data,error}=await supabase.from("posts").select("id,profile_id,display_name,username,content,image_url,stars,created_at").order("created_at",{ascending:false});
 const list=document.querySelector("#post-list");list.replaceChildren();if(error){editorStatus.textContent=error.message;return}
 (data||[]).forEach(p=>{const row=document.createElement("div");row.className="post-row";const info=document.createElement("div"),title=document.createElement("div"),small=document.createElement("div");title.textContent=`${p.display_name||"Unknown"} — ${p.id}`;small.className="small";small.textContent=`${p.stars} stars • ${p.username||""}`;info.append(title,small);const edit=document.createElement("button");edit.textContent="Edit";edit.onclick=()=>{f.id.value=p.id;f.profile.value=p.profile_id||"";f.name.value=p.display_name||"";f.username.value=p.username||"";f.content.value=p.content||"";f.image.value=p.image_url||"";f.stars.value=p.stars??0;saveBtn.textContent="Save changes";document.querySelector("#editor-title").textContent="Edit post";scrollTo({top:0,behavior:"smooth"})};row.append(info,edit);list.append(row)})
}
async function showEditor(){loginPanel.classList.add("hidden");editorPanel.classList.remove("hidden");await refreshPosts()}
document.querySelector("#login").onclick=async()=>{
 loginStatus.textContent="Logging in…";
 const email=document.querySelector("#email").value.trim(),password=document.querySelector("#password").value;
 if(!email||!password){loginStatus.textContent="Enter both email and password.";return}
 const {error}=await supabase.auth.signInWithPassword({email,password});
 if(error){loginStatus.textContent=error.message;return}
 loginStatus.textContent="";await showEditor()
};
document.querySelector("#password").addEventListener("keydown",e=>{if(e.key==="Enter")document.querySelector("#login").click()});
document.querySelector("#logout").onclick=async()=>{await supabase.auth.signOut();editorPanel.classList.add("hidden");loginPanel.classList.remove("hidden")};
document.querySelector("#clear").onclick=clearEditor;
saveBtn.onclick=async()=>{
 editorStatus.textContent="Saving…";
 const payload={profile_id:f.profile.value.trim()||null,display_name:f.name.value.trim(),username:f.username.value.trim().replace(/^@/,""),content:f.content.value,image_url:f.image.value.trim()||null,stars:Math.max(0,Number(f.stars.value)||0)};
 let r=f.id.value.trim()?await supabase.from("posts").update(payload).eq("id",f.id.value.trim()):await supabase.from("posts").insert(payload);
 if(r.error){editorStatus.textContent=r.error.message;return}editorStatus.textContent="Saved.";clearEditor();await refreshPosts()
};
supabase.auth.getSession().then(({data})=>{if(data.session&&!data.session.user.is_anonymous)showEditor()});