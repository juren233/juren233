import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Hono } from "hono";

export type PostStatus = "draft" | "published";
export type ApplicationStatus = "new" | "reviewing" | "accepted" | "rejected";
export interface Post { id:string; title:string; body:string; slug:string; tags:string[]; status:PostStatus; pinned:boolean; createdAt:string; updatedAt:string; }
export interface Application { id:string; name:string; contact:string; projectSummary:string; requestedSubdomain:string; notes:string; status:ApplicationStatus; createdAt:string; updatedAt:string; }
export interface ApplicationInput { name:string; contact:string; projectSummary:string; requestedSubdomain:string; notes:string; }
export interface PostInput { id?:string; title:string; body:string; slug?:string; tags:string[]; status:PostStatus; pinned:boolean; }
export interface Repository {
  listPosts(): Promise<Post[]>; listApplications(): Promise<Application[]>; createApplication(input: ApplicationInput): Promise<void>;
  upsertPost(input: PostInput): Promise<void>; deletePost(id: string): Promise<void>; updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void>;
}
export interface AppEnv { Bindings: Env; }

const fallbackPosts: Post[] = [{
  id: "seed",
  title: "主站正在成形",
  body: "这里会持续发布站点更新、上线记录、实验想法与合作动态。它不是传统博客，更像我的品牌流与项目日志。",
  slug: "seed",
  tags: ["brand", "动态"],
  status: "published",
  pinned: true,
  createdAt: "2026-03-22T08:00:00.000Z",
  updatedAt: "2026-03-22T08:00:00.000Z",
}];

const css = `:root{color-scheme:light dark;--bg:#f4f1ea;--panel:#fbf8f2;--panel-strong:#ffffff;--line:rgba(16,18,24,.12);--text:#16181d;--muted:#5d6472;--accent:#111318;--accent-text:#f7f4ed;--shadow:0 18px 48px rgba(15,20,30,.08);--radius-xl:34px;--radius-lg:24px;--radius-md:16px;--gutter:clamp(20px,4vw,56px);--content:1200px;--transition:220ms ease}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font:16px/1.65 "Segoe UI Variable Text","PingFang SC","Microsoft YaHei UI",sans-serif;color:var(--text);background:var(--bg);min-height:100vh}a{text-decoration:none;color:inherit}button,input,textarea,select{font:inherit}button{appearance:none;background:none}img,svg{display:block;max-width:100%}.page{width:min(100%,var(--content));margin:0 auto;padding:0 var(--gutter) 88px}.meta,.toolbar,.inline,.tags{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.mark,.eyebrow,.smallcaps{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}.ghost-link,.toolbar a,.toolbar button{border:0;background:none;color:var(--muted);padding:4px 0;transition:color var(--transition),transform var(--transition)}.ghost-link:hover,.toolbar a:hover,.toolbar button:hover{color:var(--text);transform:translateY(-1px)}.pill,.tag{display:inline-flex;align-items:center;min-height:28px;padding:0 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}.btn,button.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 22px;border-radius:999px;border:1px solid transparent;cursor:pointer;transition:transform var(--transition),background var(--transition),color var(--transition),border-color var(--transition),box-shadow var(--transition)}.btn:hover,button.btn:hover{transform:translateY(-1px)}.btn-primary{background:var(--accent);color:var(--accent-text);box-shadow:0 12px 32px rgba(15,20,30,.14)}.btn-secondary{background:var(--panel);color:var(--text);border-color:var(--line)}.footer-block,.admin-pane,.login-panel,.modal-panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius-lg);padding:clamp(22px,3vw,34px);box-shadow:var(--shadow)}.footer-block p,.admin-pane p{margin:0;color:var(--muted)}.footer-title,.admin-pane h2,.login-panel h2,.modal-panel h2{font-family:"Segoe UI Variable Display","Segoe UI","PingFang SC","Microsoft YaHei UI",sans-serif;letter-spacing:-.04em;line-height:.95;margin:0}.footer-title{font-size:clamp(1.8rem,4vw,2.8rem);margin-bottom:8px}form{display:grid;gap:14px}label{display:grid;gap:8px;font-size:14px}input,textarea,select{width:100%;padding:14px 16px;border-radius:var(--radius-md);border:1px solid var(--line);background:var(--panel-strong);color:var(--text)}textarea{min-height:140px;resize:vertical}.split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.msg{padding:12px 14px;border-radius:var(--radius-md);font-size:14px}.ok{background:rgba(32,98,255,.08);color:#2447a8}.err{background:rgba(198,43,43,.08);color:#9d2c2c}.modal{position:fixed;inset:0;display:grid;place-items:center;padding:20px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity var(--transition),visibility var(--transition);z-index:60}.modal.is-open{opacity:1;visibility:visible;pointer-events:auto}.modal-backdrop{position:absolute;inset:0;background:rgba(17,19,24,.4)}.modal-panel{position:relative;width:min(100%,760px);max-height:min(88vh,920px);overflow:auto}.modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:18px}.modal-head p{margin:10px 0 0;color:var(--muted)}.icon-btn{width:42px;height:42px;border-radius:999px;background:var(--panel-strong);color:var(--text);border:1px solid var(--line)}.admin-page,.login-page{min-height:100svh}.admin-top,.login-shell{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;padding:24px var(--gutter) 34px}.toolbar form{display:block}.workspace{display:grid;grid-template-columns:minmax(320px,.92fr) minmax(0,1.08fr);gap:20px}.stack,.list{display:grid;gap:18px}.admin-pane h2,.login-panel h2{font-size:clamp(2rem,4vw,3rem);margin-top:10px}.mini{padding:18px 0;border-top:1px solid var(--line)}.mini:first-child{padding-top:0;border-top:0}.mini p{margin:0 0 10px}.check{width:20px;height:20px}.login-panel{width:min(100%,520px);margin:0 var(--gutter)}.home-shell{width:min(100%,var(--content));margin:0 auto;padding:clamp(28px,6vw,72px) var(--gutter) 84px}.home-stack{display:grid;gap:18px}.home-panel{position:relative;padding:clamp(24px,4vw,40px);border-radius:calc(var(--radius-xl) + 6px);border:1px solid var(--line);background:var(--panel);box-shadow:var(--shadow)}.home-intro{min-height:min(78svh,760px);display:grid;align-content:end}.home-intro::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(17,19,24,.03),transparent 42%,rgba(17,19,24,.06));pointer-events:none}.home-intro>*{position:relative;z-index:1}.home-kicker{margin-bottom:clamp(36px,10vw,120px)}.home-title{max-width:9ch;margin:0;font-family:"Segoe UI Variable Display","Segoe UI","PingFang SC","Microsoft YaHei UI",sans-serif;font-size:clamp(3.8rem,12vw,8.6rem);line-height:.88;letter-spacing:-.07em}.home-summary{max-width:32rem;margin:18px 0 0;color:var(--muted);font-size:clamp(1rem,1.4vw,1.12rem)}.home-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(280px,.64fr);gap:18px}.home-section-title{margin:0;font-family:"Segoe UI Variable Display","Segoe UI","PingFang SC","Microsoft YaHei UI",sans-serif;font-size:clamp(2rem,4vw,3.2rem);line-height:.94;letter-spacing:-.05em}.home-copy{max-width:32rem;margin:14px 0 0;color:var(--muted)}.entry-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:28px}.entry-note{padding:16px 18px;border-radius:20px;border:1px solid var(--line);background:var(--panel-strong);color:var(--muted)}.update-rail{display:grid;gap:18px}.update-item{padding-top:18px;border-top:1px solid var(--line)}.update-item:first-of-type{padding-top:0;border-top:0}.update-item h3{margin:10px 0 10px;font-size:clamp(1.6rem,3vw,2.5rem);line-height:1.02;letter-spacing:-.04em}.update-item p{margin:0;color:var(--muted)}.home-closing{display:flex;justify-content:space-between;gap:18px;align-items:flex-end}.home-closing p{max-width:26rem;margin:0;color:var(--muted)}@media (prefers-color-scheme:dark){:root{--bg:#101217;--panel:#171a21;--panel-strong:#1c2028;--line:rgba(255,255,255,.1);--text:#f2efe8;--muted:#a8adba;--accent:#f3efe7;--accent-text:#111318;--shadow:0 24px 60px rgba(0,0,0,.22)}}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}@media (max-width:980px){.workspace,.home-grid,.home-closing{grid-template-columns:1fr;display:grid}.home-intro{min-height:auto}}@media (max-width:720px){.page,.home-shell{padding-left:18px;padding-right:18px}.split{grid-template-columns:1fr}.login-panel{margin:0 18px}.home-panel{padding:20px;border-radius:24px}.home-title{font-size:clamp(3rem,18vw,4.8rem)}}`;

const esc = (v:string) => v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const slugify = (v:string) => v.trim().toLowerCase().replace(/[^a-z0-9一-龥\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"") || `post-${Math.random().toString(36).slice(2,8)}`;
const tags = (v:string|string[]) => (Array.isArray(v)?v:v.split(",")).map((x)=>x.trim()).filter(Boolean).slice(0,6);
const shell = (title:string, body:string) => `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><meta name="description" content="juren233.top 的主域名入口与联络通道。"/><style>${css}</style></head><body>${body}</body></html>`;

function home(posts: Post[]) {
  const lead = (posts.length ? posts : fallbackPosts)[0];
  const leadDate = new Date(lead.createdAt).toLocaleDateString("zh-CN");
  const leadHtml = `<article class="update-item"><div class="meta">${lead.pinned ? '<span class="pill">置顶</span>' : ""}<span class="smallcaps">${leadDate}</span></div><h3>${esc(lead.title || "未命名动态")}</h3><p>${esc(lead.body)}</p><div class="tags">${lead.tags.map((t)=>`<span class="tag">${esc(t)}</span>`).join("")}</div></article>`;
  return shell("juren233.top", `<main class="home-shell"><div class="home-stack"><section class="home-panel home-intro" aria-labelledby="brand-title"><div class="home-kicker"><div class="mark">juren233.top</div><div class="smallcaps">main domain</div></div><div><h1 id="brand-title" class="home-title">juren233.top</h1><p class="home-summary">一个持续更新的个人主站，用来放置当前项目、公开入口和最新一条值得被看到的站点更新。</p></div></section><section class="home-grid"><section class="home-panel"><div class="eyebrow">entry</div><h2 class="home-section-title">留下一条消息</h2><p class="home-copy">联络入口单独留在这一段。它不做商业化包装，只负责把提案、协作想法和项目链接安静地接进来。</p><div class="entry-actions"><button class="btn btn-primary" type="button" data-open-modal="cooperation-modal">打开入口</button><div class="entry-note">如果你已经准备好内容，可以直接写清用途、联系方式和时间要求。</div></div></section><section class="home-panel update-rail"><div><div class="eyebrow">current note</div><h2 class="home-section-title">最新动态</h2><p class="home-copy">当前更新只保留一条，避免首页重新变回资讯列表。</p></div>${leadHtml}</section></section><section class="home-panel home-closing"><div><div class="eyebrow">closing</div><h2 class="home-section-title">当前更新，持续推进。</h2></div><p>主站会继续围绕品牌、作品、实验和联络方式慢慢长出来。后台入口仍然保留在 <a href="/admin">/admin</a>。</p></section></div></main><div class="modal" id="cooperation-modal" aria-hidden="true"><div class="modal-backdrop" data-close-modal></div><section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="cooperation-title"><div class="modal-head"><div><div class="eyebrow">message</div><h2 id="cooperation-title">打开入口</h2><p>把用途、背景、项目链接和联系方式留在这里，我会在后台查看。</p></div><button class="icon-btn" type="button" aria-label="关闭联络入口" data-close-modal>×</button></div><form id="cooperation-form"><label>申请人名称<input name="name" placeholder="怎么称呼你" required/></label><label>联系方式<input name="contact" placeholder="邮箱 / QQ / Telegram / 微信" required/></label><label>项目说明<textarea name="projectSummary" placeholder="介绍你的内容、用途和展示方式" required></textarea></label><div class="split"><label>预期子域名 / 用途说明<input name="requestedSubdomain" placeholder="例如 demo、lab、share-guest"/></label><label>备注<input name="notes" placeholder="可填写时效、风格或其他说明"/></label></div><button class="btn btn-primary" type="submit">提交内容</button><div id="form-message" class="mark" style="letter-spacing:.08em;text-transform:none;">内容会直接进入后台列表。</div></form></section></div><script>const modal=document.getElementById("cooperation-modal");const openers=document.querySelectorAll('[data-open-modal="cooperation-modal"]');const closers=document.querySelectorAll("[data-close-modal]");const form=document.getElementById("cooperation-form");const message=document.getElementById("form-message");const setModal=(open)=>{if(!modal)return;modal.classList.toggle("is-open",open);modal.setAttribute("aria-hidden",String(!open));document.body.style.overflow=open?"hidden":"";};openers.forEach((node)=>node.addEventListener("click",()=>setModal(true)));closers.forEach((node)=>node.addEventListener("click",()=>setModal(false)));window.addEventListener("keydown",(event)=>{if(event.key==="Escape")setModal(false);});form?.addEventListener("submit",async(event)=>{event.preventDefault();if(!message)return;const data=new FormData(form);const payload=Object.fromEntries(data.entries());message.textContent='正在提交内容...';try{const response=await fetch('/api/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const json=await response.json();if(!response.ok)throw new Error(json.error||'提交失败');form.reset();message.textContent='内容已送达，我会在后台查看并跟进。';}catch(error){message.textContent=error instanceof Error?error.message:'提交失败，请稍后重试。';}});</script>`);
}

function login(error?: string) {
  return shell("Admin Login", `<main class="page login-page"><header class="login-shell"><div><div class="mark">Admin access</div><div class="smallcaps">juren233 / backstage</div></div><a class="ghost-link" href="/">返回主站</a></header><section class="login-panel"><div class="eyebrow">Private editing entry</div><h2>后台登录</h2><p class="mark" style="letter-spacing:.08em;text-transform:none;">Cloudflare Access 可直接放行；本地预览时使用管理员令牌。</p>${error?`<div class="msg err">${esc(error)}</div>`:""}<form method="post" action="/admin/login"><label>管理员令牌<input type="password" name="token" placeholder="输入 ADMIN_TOKEN"/></label><button class="btn btn-primary" type="submit">进入后台</button></form></section></main>`);
}

function admin(posts: Post[], apps: Application[], flash?: string) {
  const postCards = posts.map((p)=>`<article class="mini"><div class="meta"><span class="pill">${esc(p.status)}</span>${p.pinned?'<span class="pill">Pinned</span>':''}<span>${new Date(p.createdAt).toLocaleDateString("zh-CN")}</span></div><h3>${esc(p.title||"未命名动态")}</h3><p>${esc(p.body)}</p><form method="post" action="/admin/posts"><input type="hidden" name="id" value="${esc(p.id)}"/><label>标题<input name="title" value="${esc(p.title)}"/></label><label>Slug<input name="slug" value="${esc(p.slug)}"/></label><label>标签<input name="tags" value="${esc(p.tags.join(", "))}"/></label><label>正文<textarea name="body">${esc(p.body)}</textarea></label><div class="split"><label>状态<select name="status"><option value="draft" ${p.status==="draft"?"selected":""}>draft</option><option value="published" ${p.status==="published"?"selected":""}>published</option></select></label><label>置顶<input class="check" type="checkbox" name="pinned" ${p.pinned?"checked":""}/></label></div><button class="btn btn-primary" type="submit">保存动态</button></form><form method="post" action="/admin/posts/${esc(p.id)}/delete"><button class="btn btn-secondary" type="submit">删除</button></form></article>`).join("");
  const appCards = apps.map((a)=>`<article class="mini"><div class="meta"><span class="pill">${esc(a.status)}</span><span>${new Date(a.createdAt).toLocaleDateString("zh-CN")}</span></div><h3>${esc(a.name)}</h3><p><strong>联系：</strong>${esc(a.contact)}</p><p><strong>用途：</strong>${esc(a.requestedSubdomain||"未填写")}</p><p>${esc(a.projectSummary)}</p>${a.notes?`<p><strong>备注：</strong>${esc(a.notes)}</p>`:""}<form class="inline" method="post" action="/admin/applications/${esc(a.id)}/status"><select name="status">${["new","reviewing","accepted","rejected"].map((s)=>`<option value="${s}" ${a.status===s?"selected":""}>${s}</option>`).join("")}</select><button class="btn btn-primary" type="submit">更新状态</button></form></article>`).join("");
  return shell("Admin Dashboard", `<main class="page admin-page"><header class="admin-top"><div><div class="mark">Editing workspace</div><div class="smallcaps">juren233.top / admin</div></div><nav class="toolbar"><a href="/">返回主站</a><form method="post" action="/admin/logout"><button class="ghost-link" type="submit">退出</button></form></nav></header>${flash?`<div class="msg ok">${esc(flash)}</div>`:""}<section class="workspace"><div class="stack"><article class="admin-pane"><div class="eyebrow">Publish short updates</div><h2>发布新动态</h2><p class="mark" style="letter-spacing:.08em;text-transform:none;">集中维护上线记录、站点更新和阶段性判断。</p><form method="post" action="/admin/posts"><label>标题<input name="title" placeholder="可选标题，比如上线记录"/></label><label>Slug<input name="slug" placeholder="可留空，系统会自动生成"/></label><label>标签<input name="tags" placeholder="用逗号分隔，例如 brand, 上线, 公告"/></label><label>正文<textarea name="body" placeholder="写下近况、更新、想法或上线播报" required></textarea></label><div class="split"><label>状态<select name="status"><option value="draft">draft</option><option value="published">published</option></select></label><label>置顶显示<input class="check" type="checkbox" name="pinned"/></label></div><button class="btn btn-primary" type="submit">保存动态</button></form></article><article class="admin-pane"><div class="eyebrow">Inbox</div><h2>合作申请</h2><div class="list">${appCards||'<p class="mark" style="letter-spacing:.08em;text-transform:none;">目前还没有新的合作申请。</p>'}</div></article></div><article class="admin-pane"><div class="eyebrow">Existing posts</div><h2>已发布与草稿动态</h2><div class="list">${postCards||'<p class="mark" style="letter-spacing:.08em;text-transform:none;">目前还没有动态记录。</p>'}</div></article></section></main>`);
}

export function sortPublishedPosts(posts: Post[]): Post[] { return posts.filter((p)=>p.status==="published").sort((a,b)=>pinnedOrder(a,b) || new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); }
function pinnedOrder(a: Post, b: Post): number { return a.pinned===b.pinned ? 0 : a.pinned ? -1 : 1; }
export function createApplicationInput(input: ApplicationInput): ApplicationInput { const x={name:input.name.trim(),contact:input.contact.trim(),projectSummary:input.projectSummary.trim(),requestedSubdomain:input.requestedSubdomain.trim(),notes:input.notes.trim()}; if(!x.name) throw new Error("申请人名称不能为空"); if(!x.contact) throw new Error("联系方式不能为空"); if(!x.projectSummary) throw new Error("项目说明不能为空"); return x; }
export function verifyAdminAccess(auth:{emailHeader:string|null;cookieToken:string|null}, env:{ADMIN_EMAIL?:string;ADMIN_TOKEN?:string}): boolean { return Boolean((auth.emailHeader&&env.ADMIN_EMAIL&&auth.emailHeader.toLowerCase()===env.ADMIN_EMAIL.toLowerCase())||(auth.cookieToken&&env.ADMIN_TOKEN&&auth.cookieToken===env.ADMIN_TOKEN)); }

function postInput(fd: FormData): PostInput {
  const body=String(fd.get("body")??"").trim();
  if(!body) throw new Error("动态正文不能为空");
  return {
    id:String(fd.get("id")??"").trim()||undefined,
    title:String(fd.get("title")??"").trim(),
    body,
    slug:String(fd.get("slug")??"").trim()||undefined,
    tags:tags(String(fd.get("tags")??"")),
    status:String(fd.get("status")??"draft")==="published"?"published":"draft",
    pinned:["on","true","1"].includes(String(fd.get("pinned")??"")),
  };
}

async function appInput(req: Request): Promise<ApplicationInput> {
  const ct=req.headers.get("content-type")||"";
  if(ct.includes("application/json")) return createApplicationInput(await req.json() as ApplicationInput);
  const f=await req.formData();
  return createApplicationInput({
    name:String(f.get("name")??""),
    contact:String(f.get("contact")??""),
    projectSummary:String(f.get("projectSummary")??""),
    requestedSubdomain:String(f.get("requestedSubdomain")??""),
    notes:String(f.get("notes")??""),
  });
}

const id = (p:string) => `${p}_${crypto.randomUUID()}`;

export function createApp(repo: Repository) {
  const app = new Hono<AppEnv>();
  app.get("/", async (c) => c.html(home(sortPublishedPosts(await repo.listPosts()))));
  app.get("/api/feed", async (c) => c.json({ items: sortPublishedPosts(await repo.listPosts()) }));
  app.post("/api/applications", async (c) => {
    try {
      await repo.createApplication(await appInput(c.req.raw));
      return c.json({ ok:true }, 201);
    } catch (e) {
      return c.json({ error:e instanceof Error?e.message:"提交失败，请稍后重试。" }, 400);
    }
  });
  app.get("/admin/login", (c) => c.html(login()));
  app.post("/admin/login", async (c) => {
    const token=String((await c.req.formData()).get("token")??"");
    if(!c.env.ADMIN_TOKEN || token!==c.env.ADMIN_TOKEN) return c.html(login("令牌不正确，请检查 ADMIN_TOKEN。"), 401);
    setCookie(c,"admin_token",token,{httpOnly:true,sameSite:"Lax",secure:true,path:"/",maxAge:60*60*24*14});
    return c.redirect("/admin");
  });
  app.use("/admin/*", async (c,next) => {
    if(c.req.path==="/admin/login") return next();
    const ok=verifyAdminAccess({ emailHeader:c.req.header("CF-Access-Authenticated-User-Email")??null, cookieToken:getCookie(c,"admin_token")??null }, c.env);
    if(!ok) return c.redirect("/admin/login");
    return next();
  });
  app.get("/admin", async (c) => c.html(admin((await repo.listPosts()).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()), (await repo.listApplications()).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()), c.req.query("flash")||undefined)));
  app.post("/admin/posts", async (c) => {
    try {
      await repo.upsertPost(postInput(await c.req.formData()));
      return c.redirect("/admin?flash=动态已保存");
    } catch (e) {
      return c.html(login(e instanceof Error?e.message:"保存失败"), 400);
    }
  });
  app.post("/admin/posts/:id/delete", async (c) => { await repo.deletePost(c.req.param("id")); return c.redirect("/admin?flash=动态已删除"); });
  app.post("/admin/applications/:id/status", async (c) => {
    const status=String((await c.req.formData()).get("status")??"new") as ApplicationStatus;
    await repo.updateApplicationStatus(c.req.param("id"), status);
    return c.redirect("/admin?flash=申请状态已更新");
  });
  app.post("/admin/logout", (c) => { deleteCookie(c,"admin_token",{path:"/"}); return c.redirect("/"); });
  return app;
}

export function createD1Repository(db: D1Database): Repository {
  return {
    async listPosts() {
      const r=await db.prepare("SELECT id,title,body,slug,tags,status,pinned,created_at,updated_at FROM posts ORDER BY datetime(created_at) DESC").all<{id:string;title:string;body:string;slug:string;tags:string;status:PostStatus;pinned:number;created_at:string;updated_at:string}>();
      return (r.results??[]).map((x)=>({ id:x.id,title:x.title,body:x.body,slug:x.slug,tags:x.tags?JSON.parse(x.tags):[],status:x.status,pinned:Boolean(x.pinned),createdAt:x.created_at,updatedAt:x.updated_at }));
    },
    async listApplications() {
      const r=await db.prepare("SELECT id,name,contact,project_summary,requested_subdomain,notes,status,created_at,updated_at FROM applications ORDER BY datetime(created_at) DESC").all<{id:string;name:string;contact:string;project_summary:string;requested_subdomain:string;notes:string;status:ApplicationStatus;created_at:string;updated_at:string}>();
      return (r.results??[]).map((x)=>({ id:x.id,name:x.name,contact:x.contact,projectSummary:x.project_summary,requestedSubdomain:x.requested_subdomain,notes:x.notes,status:x.status,createdAt:x.created_at,updatedAt:x.updated_at }));
    },
    async createApplication(input) {
      const now=new Date().toISOString();
      await db.prepare("INSERT INTO applications (id,name,contact,project_summary,requested_subdomain,notes,status,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)").bind(id("app"), input.name, input.contact, input.projectSummary, input.requestedSubdomain, input.notes, now, now).run();
    },
    async upsertPost(input) {
      const now=new Date().toISOString(), pid=input.id||id("post"), slug=slugify(input.slug||input.title||pid);
      await db.prepare(`INSERT INTO posts (id,title,body,slug,tags,status,pinned,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM posts WHERE id = ?), ?), ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, body=excluded.body, slug=excluded.slug, tags=excluded.tags, status=excluded.status, pinned=excluded.pinned, updated_at=excluded.updated_at`).bind(pid, input.title, input.body, slug, JSON.stringify(input.tags), input.status, input.pinned ? 1 : 0, pid, now, now).run();
    },
    async deletePost(pid) { await db.prepare("DELETE FROM posts WHERE id = ?").bind(pid).run(); },
    async updateApplicationStatus(pid, status) { await db.prepare("UPDATE applications SET status = ?, updated_at = ? WHERE id = ?").bind(status, new Date().toISOString(), pid).run(); },
  };
}
