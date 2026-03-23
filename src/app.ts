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

const css = `
:root{
  color-scheme: light dark;
  --bg: #f4f1ea;
  --text: #16181d;
  --muted: #5d6472;
  --line: rgba(16,18,24,.12);
  --accent: #111318;
  --accent-text: #f7f4ed;
  --gutter: clamp(20px,4vw,56px);
  --content: 1200px;
  --transition: 280ms cubic-bezier(.22,1,.36,1);
  --section-gap: clamp(28px,5vw,64px);
  --fluid-a: rgba(112,138,255,.38);
  --fluid-b: rgba(255,118,174,.34);
  --fluid-c: rgba(88,202,186,.32);
  --fluid-d: rgba(255,184,112,.28);
  --fluid-e: rgba(176,132,255,.26);
  --fluid-glow: rgba(255,255,255,.14);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  font:16px/1.65 "Segoe UI Variable Text","PingFang SC","Microsoft YaHei UI",sans-serif;
  color:var(--text);
  background:var(--bg);
  min-height:100vh;
  overflow:hidden;
  user-select:none;
  -webkit-user-select:none;
}
.admin-body{
  overflow-x:hidden;
  overflow-y:auto;
  overscroll-behavior-y:contain;
  user-select:text;
  -webkit-user-select:text;
}
.login-body{
  overflow-x:hidden;
  overflow-y:auto;
  overscroll-behavior-y:contain;
  user-select:text;
  -webkit-user-select:text;
}
a{text-decoration:none;color:inherit}
button,input,textarea,select{font:inherit}
button{appearance:none;background:none}
input,textarea,select,[contenteditable="true"]{
  user-select:text;
  -webkit-user-select:text;
}
img,svg{display:block;max-width:100%}
.page{
  width:min(100%,var(--content));
  margin:0 auto;
  padding:0 var(--gutter) 88px;
}
.meta,.toolbar,.inline,.tags{
  display:flex;
  gap:12px;
  align-items:center;
  flex-wrap:wrap;
}
.mark,.eyebrow,.smallcaps{
  font-size:12px;
  letter-spacing:.18em;
  text-transform:uppercase;
  color:var(--muted);
}
.ghost-link,.toolbar a,.toolbar button{
  border:0;
  background:none;
  color:var(--muted);
  padding:4px 0;
  transition:color var(--transition),transform var(--transition);
}
.ghost-link:hover,.toolbar a:hover,.toolbar button:hover{
  color:var(--text);
  transform:translateY(-1px);
}
.pill,.tag{
  display:inline-flex;
  align-items:center;
  min-height:28px;
  padding:0 11px;
  border-radius:999px;
  border:1px solid var(--line);
  font-size:11px;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:var(--muted);
}
.btn,button.btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:50px;
  padding:0 22px;
  border-radius:999px;
  border:1px solid transparent;
  cursor:pointer;
  transition:transform var(--transition),background var(--transition),color var(--transition),border-color var(--transition),box-shadow var(--transition);
}
.btn:hover,button.btn:hover{transform:translateY(-1px)}
.btn-primary{
  background:var(--accent);
  color:var(--accent-text);
  box-shadow:0 12px 32px rgba(15,20,30,.14);
}
.btn-secondary{
  background:transparent;
  color:var(--text);
  border-color:var(--line);
}
.admin-pane,.login-panel,.modal-panel{
  background:rgba(255,255,255,.76);
  border:1px solid var(--line);
  border-radius:24px;
  padding:clamp(22px,3vw,34px);
  box-shadow:0 18px 48px rgba(15,20,30,.08);
}
form{display:grid;gap:14px}
label{display:grid;gap:8px;font-size:14px}
input,textarea,select{
  width:100%;
  padding:14px 16px;
  border-radius:16px;
  border:1px solid var(--line);
  background:rgba(255,255,255,.86);
  color:var(--text);
}
textarea{min-height:140px;resize:vertical}
.split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.msg{padding:12px 14px;border-radius:16px;font-size:14px}
.ok{background:rgba(32,98,255,.08);color:#2447a8}
.err{background:rgba(198,43,43,.08);color:#9d2c2c}
.modal{
  position:fixed;
  inset:0;
  display:grid;
  place-items:center;
  padding:20px;
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transition:opacity var(--transition),visibility var(--transition);
  z-index:60;
}
.modal.is-open{opacity:1;visibility:visible;pointer-events:auto}
.modal-backdrop{position:absolute;inset:0;background:rgba(17,19,24,.4)}
.modal-panel{
  position:relative;
  width:min(100%,760px);
  max-height:min(88vh,920px);
  overflow:auto;
}
.modal-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:18px;
  margin-bottom:18px;
}
.modal-head p{margin:10px 0 0;color:var(--muted)}
.icon-btn{
  width:42px;
  height:42px;
  border-radius:999px;
  background:rgba(255,255,255,.86);
  color:var(--text);
  border:1px solid var(--line);
}
.admin-page,.login-page{min-height:100svh}
.admin-page{
  width:min(100%,calc(var(--content) + 120px));
  display:grid;
  gap:20px;
  padding-top:28px;
}
.admin-top,.login-shell{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:16px;
  flex-wrap:wrap;
  padding:24px var(--gutter) 34px;
}
.toolbar form{display:block}
.workspace{display:grid;grid-template-columns:minmax(320px,.92fr) minmax(0,1.08fr);gap:20px;align-items:start}
.stack,.list{display:grid;gap:18px}
.admin-summary{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:14px;
  margin-bottom:6px;
}
.metric{
  padding:18px 20px;
  border-radius:20px;
  border:1px solid var(--line);
  background:linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.56));
  box-shadow:0 12px 30px rgba(15,20,30,.05);
}
.metric strong{
  display:block;
  margin-top:10px;
  font-size:clamp(1.8rem,3vw,2.6rem);
  line-height:.9;
  letter-spacing:-.05em;
}
.metric span{
  display:block;
  margin-top:6px;
  color:var(--muted);
  font-size:14px;
}
.admin-pane h2,.login-panel h2,.modal-panel h2{
  font-family:"Segoe UI Variable Display","Segoe UI","PingFang SC","Microsoft YaHei UI",sans-serif;
  letter-spacing:-.04em;
  line-height:.95;
  margin:0;
}
.admin-pane h2,.login-panel h2{font-size:clamp(2rem,4vw,3rem);margin-top:10px}
.mini{padding:18px 0;border-top:1px solid var(--line)}
.mini:first-child{padding-top:0;border-top:0}
.mini p{margin:0 0 10px}
.record-card{
  border:1px solid var(--line);
  border-radius:22px;
  background:rgba(255,255,255,.5);
  overflow:hidden;
}
.record-card + .record-card{margin-top:12px}
.record-summary{
  list-style:none;
  display:grid;
  gap:14px;
  padding:18px 20px;
  cursor:pointer;
}
.record-summary::-webkit-details-marker{display:none}
.record-summary-head,.record-summary-meta,.record-actions{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
}
.record-summary h3,.record-card h3{
  margin:0;
  font-size:1.1rem;
  line-height:1.2;
}
.record-summary p,.record-card p{margin:0;color:var(--muted)}
.record-summary .meta{gap:8px}
.record-actions{
  justify-content:flex-start;
  color:var(--muted);
  font-size:13px;
}
.record-body{
  display:grid;
  gap:18px;
  padding:0 20px 20px;
}
.record-body > p{margin:0}
.record-toolbar{
  display:flex;
  gap:12px;
  align-items:center;
  flex-wrap:wrap;
}
.post-form{
  padding-top:14px;
  border-top:1px solid var(--line);
}
.admin-pane .list{gap:12px}
.check{width:20px;height:20px}
.login-panel{width:min(100%,520px);margin:0 var(--gutter)}
.paged-home{
  position:relative;
  height:100svh;
  overflow:hidden;
  isolation:isolate;
  touch-action:none;
  overscroll-behavior:none;
}
.paged-home::before{
  content:"";
  position:absolute;
  inset:-12%;
  z-index:0;
  pointer-events:none;
  background:
    radial-gradient(circle at 18% 16%, rgba(255,255,255,.18), transparent 34%),
    radial-gradient(circle at 76% 22%, rgba(255,255,255,.08), transparent 28%),
    linear-gradient(180deg, rgba(255,255,255,.04), transparent 32%, transparent 72%, rgba(17,19,24,.04));
  opacity:.54;
}
.paged-home::after{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  background:radial-gradient(circle at center, transparent 46%, rgba(17,19,24,.1) 100%);
  opacity:.24;
  mix-blend-mode:soft-light;
}
.fluid-bg{
  position:absolute;
  inset:-16%;
  z-index:0;
  pointer-events:none;
  overflow:hidden;
  filter:saturate(118%) contrast(102%);
}
.fluid-canvas-el{
  position:absolute;
  inset:-10%;
  width:120%;
  height:120%;
  display:block;
  opacity:.62;
  filter:blur(30px) saturate(124%) contrast(104%);
  transform:translate3d(0,0,0);
  will-change:transform;
}
.home-track{
  position:relative;
  height:100%;
  will-change:transform;
  z-index:1;
}
.home-screen{
  position:relative;
  height:100svh;
  padding:clamp(32px,7vw,84px) var(--gutter);
  display:grid;
  align-items:end;
  overflow:hidden;
  background:transparent;
}
.home-inner{
  position:relative;
  z-index:1;
  width:min(100%,var(--content));
  margin:0 auto;
  display:grid;
  gap:var(--section-gap);
}
.brand-screen .home-inner,.closing-screen .home-inner{align-content:end}
.brand-title{
  margin:0;
  max-width:8ch;
  font-family:"Segoe UI Variable Display","Segoe UI","PingFang SC","Microsoft YaHei UI",sans-serif;
  font-size:clamp(4.4rem,15vw,10rem);
  line-height:.84;
  letter-spacing:-.08em;
}
.brand-copy,.entry-copy,.update-copy{
  max-width:32rem;
  margin:0;
  color:var(--muted);
  font-size:clamp(1rem,1.4vw,1.12rem);
}
.entry-line,.update-line{
  display:flex;
  justify-content:space-between;
  gap:24px;
  align-items:flex-end;
  flex-wrap:wrap;
  padding-bottom:14px;
  border-bottom:1px solid var(--line);
}
.entry-title,.update-title{
  margin:0;
  font-family:"Segoe UI Variable Display","Segoe UI","PingFang SC","Microsoft YaHei UI",sans-serif;
  font-size:clamp(2.2rem,5vw,4rem);
  line-height:.92;
  letter-spacing:-.06em;
}
.entry-actions{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.entry-actions span{color:var(--muted);max-width:18rem}
.update-focus{display:grid;gap:18px;align-content:end}
.update-meta{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.update-focus h3{
  margin:0;
  max-width:10ch;
  font-size:clamp(2.8rem,8vw,5.4rem);
  line-height:.9;
  letter-spacing:-.06em;
}
.update-focus p{
  max-width:36rem;
  margin:0;
  color:var(--muted);
  font-size:clamp(1rem,1.5vw,1.14rem);
}
.closing-screen{align-items:center}
.closing-screen .home-inner{
  width:100%;
  max-width:none;
  min-height:100%;
  place-content:center;
}
.closing-brand{
  margin:0;
  display:flex;
  justify-content:center;
  align-items:flex-end;
  flex-wrap:wrap;
  gap:clamp(.02em,.18vw,.08em);
  font-family:"Segoe UI Variable Display","Segoe UI","PingFang SC","Microsoft YaHei UI",sans-serif;
  font-size:clamp(4rem,16vw,13rem);
  line-height:.78;
  letter-spacing:-.06em;
  font-stretch:74%;
  font-variation-settings:"wdth" 74;
}
.closing-char{
  display:inline-block;
  padding-inline:var(--char-space,0px);
  transform:scale(var(--char-scale,1));
  transform-origin:center 72%;
  transition:transform 220ms cubic-bezier(.2,.8,.2,1),padding 220ms cubic-bezier(.2,.8,.2,1);
  will-change:transform,padding;
}
.closing-screen.is-pointer-active .closing-char{transition:none}
.closing-glyph{
  display:block;
}
.closing-brand.is-hidden .closing-glyph{
  opacity:0;
  filter:blur(18px);
  transform:translateY(12px) scale(1.72);
}
.closing-brand.is-revealing .closing-glyph{
  animation:closing-glyph-reveal 980ms cubic-bezier(.12,.82,.18,1) both;
  animation-delay:calc(var(--char-order,0) * 82ms);
}
@keyframes closing-glyph-reveal{
  0%{
    opacity:0;
    filter:blur(18px);
    transform:translateY(12px) scale(1.72);
  }
  100%{
    opacity:1;
    filter:blur(0);
    transform:translateY(0) scale(1);
  }
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#101217;
    --text:#f2efe8;
    --muted:#a8adba;
    --line:rgba(255,255,255,.1);
    --accent:#f3efe7;
    --accent-text:#111318;
    --fluid-a: rgba(98,128,255,.34);
    --fluid-b: rgba(255,102,164,.3);
    --fluid-c: rgba(62,198,178,.28);
    --fluid-d: rgba(255,174,96,.24);
    --fluid-e: rgba(168,126,255,.22);
    --fluid-glow: rgba(255,255,255,.08);
  }
  .paged-home::before{
    background:
      radial-gradient(circle at 18% 18%, rgba(122,148,255,.1), transparent 34%),
      radial-gradient(circle at 78% 22%, rgba(255,140,198,.08), transparent 28%),
      linear-gradient(180deg, rgba(255,255,255,.02), transparent 32%, transparent 72%, rgba(255,255,255,.03));
    opacity:.64;
  }
  .paged-home::after{
    background:radial-gradient(circle at center, transparent 48%, rgba(0,0,0,.24) 100%);
    opacity:.28;
  }
  .admin-pane,.login-panel,.modal-panel{background:rgba(23,26,33,.78);box-shadow:0 24px 60px rgba(0,0,0,.22)}
  .metric,.record-card{background:rgba(255,255,255,.04)}
  input,textarea,select,.icon-btn{background:rgba(28,32,40,.9)}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important}
}
@media (max-width:980px){
  .admin-summary{grid-template-columns:1fr}
  .workspace{grid-template-columns:1fr}
  .home-screen{align-items:center}
  .entry-line,.update-line{display:grid;justify-content:stretch}
}
@media (max-width:720px){
  .page{padding-left:18px;padding-right:18px}
  .admin-page{width:100%;padding-top:18px}
  .home-screen{padding-left:18px;padding-right:18px}
  .split{grid-template-columns:1fr}
  .login-panel{margin:0 18px}
  .brand-title{font-size:clamp(3.4rem,19vw,5.8rem)}
  .update-focus h3{font-size:clamp(2.4rem,13vw,4rem)}
  .closing-brand{font-size:clamp(3.2rem,18vw,5.8rem)}
}
`;

const esc = (v:string) => v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const slugify = (v:string) => v.trim().toLowerCase().replace(/[^a-z0-9一-龥\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"") || `post-${Math.random().toString(36).slice(2,8)}`;
const tags = (v:string|string[]) => (Array.isArray(v)?v:v.split(",")).map((x)=>x.trim()).filter(Boolean).slice(0,6);
const shell = (title:string, body:string, bodyClass = "") => `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><meta name="description" content="juren233.top 的主域名入口与联络通道。"/><style>${css}</style></head><body${bodyClass ? ` class="${bodyClass}"` : ""}>${body}</body></html>`;

function home(posts: Post[]) {
  const lead = (posts.length ? posts : fallbackPosts)[0];
  const leadDate = new Date(lead.createdAt).toLocaleDateString("zh-CN");
  const leadHtml = `<div class="update-meta">${lead.pinned ? '<span class="pill">置顶</span>' : ""}<span class="smallcaps">${leadDate}</span>${lead.tags.map((t)=>`<span class="tag">${esc(t)}</span>`).join("")}</div><h3>${esc(lead.title || "未命名动态")}</h3><p>${esc(lead.body)}</p>`;
  const closingText = "juren233.top";
  const closingChars = Array.from(closingText).map((char, index)=>`<span class="closing-char" data-char-index="${index}" style="--char-order:${index}" aria-hidden="true"><span class="closing-glyph">${esc(char)}</span></span>`).join("");
  return shell(
    "juren233.top",
    `<main class="paged-home" aria-label="homepage pages">
      <div class="fluid-bg" aria-hidden="true">
        <canvas class="fluid-canvas-el"></canvas>
      </div>
      <div class="home-track">
        <section class="home-screen brand-screen" aria-labelledby="brand-title" data-page-index="0">
          <div class="home-inner">
            <div class="mark">juren233.top</div>
            <h1 id="brand-title" class="brand-title">juren233.top</h1>
            <p class="brand-copy">一个持续更新的个人主站，用来放置当前项目、公开入口和最新一条值得被看到的站点更新。</p>
          </div>
        </section>
        <section class="home-screen entry-screen" data-page-index="1">
          <div class="home-inner">
            <div class="entry-line">
              <div>
                <div class="eyebrow">entry</div>
                <h2 class="entry-title">留下一条消息</h2>
              </div>
              <div class="smallcaps">page 02</div>
            </div>
            <p class="entry-copy">联络入口单独占一整屏。它不做商业化包装，只负责把提案、协作想法和项目链接安静地接进来。</p>
            <div class="entry-actions">
              <button class="btn btn-primary" type="button" data-open-modal="cooperation-modal">打开入口</button>
              <span>如果你已经准备好内容，可以直接写清用途、联系方式和时间要求。</span>
            </div>
          </div>
        </section>
        <section class="home-screen update-screen" data-page-index="2">
          <div class="home-inner">
            <div class="update-line">
              <div>
                <div class="eyebrow">current note</div>
                <h2 class="update-title">最新动态</h2>
              </div>
              <div class="smallcaps">当前更新</div>
            </div>
            <div class="update-focus">${leadHtml}</div>
          </div>
        </section>
        <section class="home-screen closing-screen" aria-label="closing brand page" data-page-index="3">
          <div class="home-inner">
            <h2 class="closing-brand is-hidden" aria-label="juren233.top">${closingChars}</h2>
          </div>
        </section>
      </div>
    </main>
    <div class="modal" id="cooperation-modal" aria-hidden="true">
      <div class="modal-backdrop" data-close-modal></div>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="cooperation-title">
        <div class="modal-head">
          <div>
            <div class="eyebrow">message</div>
            <h2 id="cooperation-title">打开入口</h2>
            <p>把用途、背景、项目链接和联系方式留在这里，我会在后台查看。</p>
          </div>
          <button class="icon-btn" type="button" aria-label="关闭联络入口" data-close-modal>×</button>
        </div>
        <form id="cooperation-form">
          <label>申请人名称<input name="name" placeholder="怎么称呼你" required/></label>
          <label>联系方式<input name="contact" placeholder="邮箱 / QQ / Telegram / 微信" required/></label>
          <label>项目说明<textarea name="projectSummary" placeholder="介绍你的内容、用途和展示方式" required></textarea></label>
          <div class="split">
            <label>预期子域名 / 用途说明<input name="requestedSubdomain" placeholder="例如 demo、lab、share-guest"/></label>
            <label>备注<input name="notes" placeholder="可填写时效、风格或其他说明"/></label>
          </div>
          <button class="btn btn-primary" type="submit">提交内容</button>
          <div id="form-message" class="mark" style="letter-spacing:.08em;text-transform:none;">内容会直接进入后台列表。</div>
        </form>
      </section>
    </div>
    <script>
      const homeScroller=document.querySelector(".paged-home");
      const homeTrack=document.querySelector(".home-track");
      const modal=document.getElementById("cooperation-modal");
      const fluidCanvas=document.querySelector(".fluid-canvas-el");
      const openers=document.querySelectorAll('[data-open-modal="cooperation-modal"]');
      const closers=document.querySelectorAll("[data-close-modal]");
      const form=document.getElementById("cooperation-form");
      const message=document.getElementById("form-message");
      const screens=homeTrack instanceof HTMLElement?Array.from(homeTrack.querySelectorAll(".home-screen")):[];
      const closingScreen=homeTrack instanceof HTMLElement?homeTrack.querySelector(".closing-screen"):null;
      const closingBrand=closingScreen instanceof HTMLElement?closingScreen.querySelector(".closing-brand"):null;
      const closingChars=closingScreen instanceof HTMLElement?Array.from(closingScreen.querySelectorAll(".closing-char")):[];
      let currentIndex=0;
      let currentOffset=0;
      let animationFrame=0;
      let lastWheelAt=0;
      let closingRevealTimer=0;
      let closingRevealStartTimer=0;
      let touchStartY=null;
      let touchCurrentY=null;
      let touchStartedAt=0;
      const prefersReducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
      const prefersDark=window.matchMedia("(prefers-color-scheme: dark)");
      const easeInOutCubic=(t)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      const clampIndex=(value)=>Math.max(0,Math.min(screens.length-1,value));
      const initFluid=()=>{
        if(!(fluidCanvas instanceof HTMLCanvasElement))return;
        const ctx=fluidCanvas.getContext("2d");
        if(!ctx)return;
        let width=1;
        let height=1;
        let dpr=1;
        let fluidFrame=0;
        let fieldCanvas=null;
        let fieldCtx=null;
        let fieldWidth=0;
        let fieldHeight=0;
        let fieldImage=null;
        let palette=[];
        let veils=[];
        let seed=Math.random()*1000;
        let phaseOffsets=[0,0,0,0,0,0];
        let warpScaleX=1;
        let warpScaleY=1;
        let speedA=1;
        let speedB=1;
        let isMobile=window.matchMedia("(max-width: 720px)").matches;
        let lastRenderAt=0;
        let pendingWidth=window.innerWidth||1;
        let pendingHeight=window.innerHeight||1;
        let pendingDpr=Math.min(window.devicePixelRatio||1,1.5);
        let resizeTimer=0;
        let glowColor=[255,255,255];
        const styleOf=(name)=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        const parseColor=(value)=>{
          const parts=value.match(/[\\d.]+/g);
          return parts && parts.length>=3 ? [Number(parts[0]),Number(parts[1]),Number(parts[2])] : [255,255,255];
        };
        const rebuildFluidBuffers=()=>{
          dpr=pendingDpr;
          width=pendingWidth;
          height=pendingHeight;
          fluidCanvas.width=Math.round(width*dpr);
          fluidCanvas.height=Math.round(height*dpr);
          ctx.setTransform(dpr,0,0,dpr,0,0);
          ctx.imageSmoothingEnabled=true;
          fieldWidth=Math.max(isMobile?88:148,Math.round(width/(isMobile?14:10)));
          fieldHeight=Math.max(isMobile?64:104,Math.round(height/(isMobile?14:10)));
          if(!(fieldCanvas instanceof HTMLCanvasElement))fieldCanvas=document.createElement("canvas");
          fieldCanvas.width=fieldWidth;
          fieldCanvas.height=fieldHeight;
          fieldCtx=fieldCanvas.getContext("2d");
          fieldImage=fieldCtx?fieldCtx.createImageData(fieldWidth,fieldHeight):null;
          lastRenderAt=0;
        };
        const resizeFluid=(forcePalette=false)=>{
          pendingDpr=Math.min(window.devicePixelRatio||1,1.5);
          pendingWidth=Math.max(window.innerWidth,1);
          pendingHeight=Math.max(window.innerHeight,1);
          isMobile=window.matchMedia("(max-width: 720px)").matches;
          width=pendingWidth;
          height=pendingHeight;
          if(!palette.length){
            palette=[styleOf("--fluid-a"),styleOf("--fluid-b"),styleOf("--fluid-c"),styleOf("--fluid-d"),styleOf("--fluid-e")].map(parseColor);
            glowColor=parseColor(styleOf("--fluid-glow"));
            veils=Array.from({length:4},()=>({
              offset:Math.random()*2-1,
              width:.42+Math.random()*.18,
            }));
            seed=Math.random()*1000;
            phaseOffsets=Array.from({length:6},()=>Math.random()*Math.PI*2+seed);
            warpScaleX=.92+Math.random()*.22;
            warpScaleY=.9+Math.random()*.24;
            speedA=.82+Math.random()*.18;
            speedB=.84+Math.random()*.16;
          }
          if(forcePalette){
            rebuildFluidBuffers();
            return;
          }
          if(resizeTimer)clearTimeout(resizeTimer);
          resizeTimer=window.setTimeout(()=>{
            rebuildFluidBuffers();
            resizeTimer=0;
          },160);
        };
        const smoothstep=(edge0,edge1,value)=>{
          const t=Math.max(0,Math.min(1,(value-edge0)/(edge1-edge0||1)));
          return t*t*(3-2*t);
        };
        const veilCurve=(value,width)=>Math.exp(-Math.pow(value/Math.max(width,.001),2));
        const renderField=(time)=>{
          if(!fieldCtx || !fieldCanvas || !fieldImage)return;
          const data=fieldImage.data;
          const t=time*0.00013;
          const threshold=.2;
          const falloff=.78;
          for(let y=0;y<fieldHeight;y++){
            for(let x=0;x<fieldWidth;x++){
              const i=(y*fieldWidth+x)*4;
              const nx=x/fieldWidth*2-1;
              const ny=y/fieldHeight*2-1;
              const warpA=Math.sin((nx*1.9+ny*.42)*warpScaleX+t*speedA+phaseOffsets[0])+Math.cos((ny*1.36-nx*.58)*warpScaleY-t*.84*speedB+phaseOffsets[1]);
              const warpB=Math.cos((nx*1.18-ny*1.62)*warpScaleY-t*.72*speedB+phaseOffsets[2])+Math.sin((nx*.86+ny*1.54)*warpScaleX+t*.96*speedA+phaseOffsets[3]);
              const ux=nx+warpA*.12+Math.sin(ny*1.72+t*.9+phaseOffsets[4])*.06;
              const uy=ny+warpB*.1+Math.cos(nx*1.56-t*.72+phaseOffsets[5])*.05;
              const bandA=.5+.5*Math.sin(ux*2.6+uy*1.9+t*1.08+phaseOffsets[0]);
              const bandB=.5+.5*Math.cos(ux*2.1-uy*2.4-t*.94+phaseOffsets[1]);
              const bandC=.5+.5*Math.sin((ux+uy)*1.8+t*.86+phaseOffsets[2]);
              const bandD=.5+.5*Math.cos((ux-uy)*2.2-t*.78+phaseOffsets[3]);
              const veilA=veilCurve(uy+.22*Math.sin(ux*1.6+t*1.02+phaseOffsets[0])-veils[0].offset*.26,veils[0].width)*(.7+.3*bandA);
              const veilB=veilCurve(ux-.2*Math.cos(uy*1.7-t*.88+phaseOffsets[1])-veils[1].offset*.24,veils[1].width)*(.7+.3*bandB);
              const veilC=veilCurve((uy-ux*.34)+.16*Math.sin((ux+uy)*1.5+t*.92+phaseOffsets[2])-veils[2].offset*.22,veils[2].width)*(.68+.32*bandC);
              const veilD=veilCurve((uy+ux*.26)+.14*Math.cos((ux-uy)*1.7-t*.98+phaseOffsets[3])-veils[3].offset*.2,veils[3].width)*(.66+.34*bandD);
              const sheen=Math.pow(.5+.5*Math.sin(ux*2.3-uy*1.5+t*1.4+phaseOffsets[4]),4)*Math.max(veilA,veilB,veilC,veilD);
              const density=Math.max(veilA,veilB,veilC,veilD)*.84+sheen*.24;
              const alpha=smoothstep(threshold,falloff,density);
              if(alpha<=.001){
                data[i]=0; data[i+1]=0; data[i+2]=0; data[i+3]=0;
                continue;
              }
              const edge=1-Math.pow(1-alpha,1.22);
              const weights=[veilA,veilB,veilC,veilD];
              let primaryIndex=0;
              let secondaryIndex=1;
              for(let index=0;index<weights.length;index++){
                if(weights[index]>weights[primaryIndex]){
                  secondaryIndex=primaryIndex;
                  primaryIndex=index;
                }else if(index!==primaryIndex && weights[index]>weights[secondaryIndex]){
                  secondaryIndex=index;
                }
              }
              const primaryWeight=weights[primaryIndex];
              const secondaryWeight=weights[secondaryIndex];
              const blend=Math.min(.16,secondaryWeight/(primaryWeight+secondaryWeight+0.0001)*.16);
              const primary=palette[primaryIndex];
              const secondary=palette[secondaryIndex];
              const warmLift=.035+sheen*.08;
              const r=Math.min(255,primary[0]*(1-blend)+secondary[0]*blend+palette[4][0]*sheen*.18+glowColor[0]*warmLift);
              const g=Math.min(255,primary[1]*(1-blend)+secondary[1]*blend+palette[4][1]*sheen*.12+glowColor[1]*warmLift*.78);
              const b=Math.min(255,primary[2]*(1-blend)+secondary[2]*blend+palette[4][2]*sheen*.16+glowColor[2]*warmLift*.72);
              const colorPresence=Math.min(1,(primaryWeight+secondaryWeight*.3+sheen*.24)/1.06);
              data[i]=Math.round(r);
              data[i+1]=Math.round(g);
              data[i+2]=Math.round(b);
              data[i+3]=Math.round(edge*colorPresence*(prefersDark.matches?124:108));
            }
          }
          fieldCtx.putImageData(fieldImage,0,0);
        };
        const frameFluid=(time)=>{
          fluidFrame=requestAnimationFrame(frameFluid);
          const frameBudget=isMobile?1000/16:1000/24;
          if(time-lastRenderAt<frameBudget)return;
          lastRenderAt=time;
          ctx.clearRect(0,0,width,height);
          renderField(time);
          if(fieldCanvas){
            ctx.globalCompositeOperation="source-over";
            ctx.globalAlpha=prefersDark.matches ? .68 : .58;
            ctx.imageSmoothingEnabled=true;
            ctx.drawImage(fieldCanvas,0,0,fieldWidth,fieldHeight,0,0,width,height);
            ctx.globalAlpha=1;
          }
        };
        resizeFluid(true);
        frameFluid(performance.now());
        window.addEventListener("resize",resizeFluid);
        prefersDark.addEventListener?.("change",()=>{
          palette=[];
          resizeFluid(true);
        });
      };
      const clearClosingReveal=(hide=true)=>{
        if(closingRevealStartTimer){
          clearTimeout(closingRevealStartTimer);
          closingRevealStartTimer=0;
        }
        if(closingRevealTimer){
          clearTimeout(closingRevealTimer);
          closingRevealTimer=0;
        }
        if(closingBrand instanceof HTMLElement){
          closingBrand.classList.remove("is-revealing");
          if(hide){
            closingBrand.classList.add("is-hidden");
          }else{
            closingBrand.classList.remove("is-hidden");
          }
        }
      };
      const triggerClosingReveal=()=>{
        if(!(closingBrand instanceof HTMLElement)||!closingChars.length)return;
        clearClosingReveal(true);
        closingRevealStartTimer=window.setTimeout(()=>{
          closingBrand.classList.remove("is-hidden");
          closingBrand.classList.remove("is-revealing");
          void closingBrand.offsetWidth;
          closingBrand.classList.add("is-revealing");
          const totalDuration=closingChars.length*82+1120;
          closingRevealTimer=window.setTimeout(()=>{
            closingBrand.classList.remove("is-revealing");
            closingRevealTimer=0;
          },totalDuration);
          closingRevealStartTimer=0;
        },500);
      };
      const resetClosingChars=()=>{
        if(closingScreen instanceof HTMLElement)closingScreen.classList.remove("is-pointer-active");
        closingChars.forEach((char)=>{
          char.style.setProperty("--char-scale","1");
          char.style.setProperty("--char-space","0px");
        });
      };
      const updateClosingChars=(clientX,clientY)=>{
        if(!closingChars.length)return;
        if(closingScreen instanceof HTMLElement)closingScreen.classList.add("is-pointer-active");
        const radius=Math.max(window.innerWidth*.14,140);
        closingChars.forEach((char,index)=>{
          const rect=char.getBoundingClientRect();
          const centerX=rect.left+rect.width/2;
          const centerY=rect.top+rect.height*.56;
          const distance=Math.hypot(centerX-clientX,centerY-clientY);
          const influence=Math.max(0,1-distance/radius);
          const scale=1+Math.pow(influence,1.85)*1.45;
          const spacing=Math.max(0,(scale-1)*34+Math.pow(influence,1.15)*16);
          char.style.setProperty("--char-scale",scale.toFixed(3));
          char.style.setProperty("--char-space",spacing.toFixed(2)+"px");
        });
      };
      const paintOffset=(offsetY)=>{
        currentOffset=offsetY;
        if(homeTrack instanceof HTMLElement)homeTrack.style.transform="translate3d(0,"+(-offsetY).toFixed(2)+"px,0)";
      };
      const syncPage=()=>{
        const viewport=window.innerHeight||document.documentElement.clientHeight||1;
        paintOffset(currentIndex*viewport);
      };
      const animateTo=(index)=>{
        if(!screens.length)return;
        currentIndex=clampIndex(index);
        const viewport=window.innerHeight||document.documentElement.clientHeight||1;
        const startOffset=currentOffset;
        const nextOffset=currentIndex*viewport;
        if(currentIndex===screens.length-1){
          triggerClosingReveal();
        }else{
          clearClosingReveal(false);
        }
        if(prefersReducedMotion.matches){
          if(animationFrame)cancelAnimationFrame(animationFrame);
          paintOffset(nextOffset);
          return;
        }
        const startTime=performance.now();
        const duration=920;
        if(animationFrame)cancelAnimationFrame(animationFrame);
        const tick=(now)=>{
          const progress=Math.min((now-startTime)/duration,1);
          const eased=easeInOutCubic(progress);
          paintOffset(startOffset+(nextOffset-startOffset)*eased);
          if(progress<1){
            animationFrame=requestAnimationFrame(tick);
          }else{
            animationFrame=0;
            paintOffset(nextOffset);
          }
        };
        animationFrame=requestAnimationFrame(tick);
      };
      const setModal=(open)=>{
        if(!modal)return;
        modal.classList.toggle("is-open",open);
        modal.setAttribute("aria-hidden",String(!open));
        if(homeScroller instanceof HTMLElement)homeScroller.style.pointerEvents=open?"none":"auto";
        if(homeTrack instanceof HTMLElement)homeTrack.style.pointerEvents=open?"none":"auto";
      };
      const goToDelta=(delta)=>{
        if(!screens.length||modal?.classList.contains("is-open"))return;
        const nextIndex=clampIndex(currentIndex+delta);
        if(nextIndex===currentIndex)return;
        animateTo(nextIndex);
      };
      const onWheel=(event)=>{
        if(!(homeScroller instanceof HTMLElement)||modal?.classList.contains("is-open"))return;
        event.preventDefault();
        if(Math.abs(event.deltaY)<18)return;
        const now=performance.now();
        if(now-lastWheelAt<640)return;
        lastWheelAt=now;
        goToDelta(event.deltaY>0?1:-1);
      };
      const onTouchStart=(event)=>{
        if(modal?.classList.contains("is-open")||event.touches.length!==1)return;
        touchStartY=event.touches[0].clientY;
        touchCurrentY=touchStartY;
        touchStartedAt=performance.now();
      };
      const onTouchMove=(event)=>{
        if(touchStartY===null||modal?.classList.contains("is-open"))return;
        touchCurrentY=event.touches[0].clientY;
        event.preventDefault();
      };
      const onTouchEnd=()=>{
        if(touchStartY===null||touchCurrentY===null)return;
        const deltaY=touchStartY-touchCurrentY;
        const elapsed=Math.max(performance.now()-touchStartedAt,1);
        const velocity=Math.abs(deltaY)/elapsed;
        if(Math.abs(deltaY)>54||velocity>.38){
          goToDelta(deltaY>0?1:-1);
        }
        touchStartY=null;
        touchCurrentY=null;
        touchStartedAt=0;
      };
      syncPage();
      initFluid();
      homeScroller?.addEventListener("wheel",onWheel,{passive:false});
      window.addEventListener("wheel",onWheel,{passive:false});
      document.addEventListener("wheel",onWheel,{passive:false});
      homeScroller?.addEventListener("touchstart",onTouchStart,{passive:true});
      homeScroller?.addEventListener("touchmove",onTouchMove,{passive:false});
      homeScroller?.addEventListener("touchend",onTouchEnd,{passive:true});
      homeScroller?.addEventListener("touchcancel",onTouchEnd,{passive:true});
      window.addEventListener("resize",()=>{
        syncPage();
        resetClosingChars();
        clearClosingReveal();
      });
      if(closingScreen instanceof HTMLElement){
        closingScreen.addEventListener("mousemove",(event)=>updateClosingChars(event.clientX,event.clientY));
        closingScreen.addEventListener("mouseleave",resetClosingChars);
      }
      window.addEventListener("keydown",(event)=>{
        if(event.key==="Escape"){
          setModal(false);
          return;
        }
        if(modal?.classList.contains("is-open"))return;
        if(["ArrowDown","PageDown"," "].includes(event.key)){
          event.preventDefault();
          goToDelta(1);
        }
        if(["ArrowUp","PageUp"].includes(event.key)){
          event.preventDefault();
          goToDelta(-1);
        }
        if(event.key==="Home"){
          event.preventDefault();
          animateTo(0);
        }
        if(event.key==="End"){
          event.preventDefault();
          animateTo(screens.length-1);
        }
      });
      openers.forEach((node)=>node.addEventListener("click",()=>setModal(true)));
      closers.forEach((node)=>node.addEventListener("click",()=>setModal(false)));
      form?.addEventListener("submit",async(event)=>{
        event.preventDefault();
        if(!message)return;
        const data=new FormData(form);
        const payload=Object.fromEntries(data.entries());
        message.textContent="正在提交内容...";
        try{
          const response=await fetch("/api/applications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
          const json=await response.json();
          if(!response.ok)throw new Error(json.error||"提交失败");
          form.reset();
          message.textContent="内容已送达，我会在后台查看并跟进。";
        }catch(error){
          message.textContent=error instanceof Error?error.message:"提交失败，请稍后重试。";
        }
      });
    </script>`,
  );
}

function login(error?: string) {
  return shell("Admin Login", `<main class="page login-page"><header class="login-shell"><div><div class="mark">Admin access</div><div class="smallcaps">juren233 / backstage</div></div><a class="ghost-link" href="/">返回主站</a></header><section class="login-panel"><div class="eyebrow">Private editing entry</div><h2>后台登录</h2><p class="mark" style="letter-spacing:.08em;text-transform:none;">Cloudflare Access 可直接放行；本地预览时使用管理员令牌。</p>${error?`<div class="msg err">${esc(error)}</div>`:""}<form method="post" action="/admin/login"><label>管理员令牌<input type="password" name="token" placeholder="输入 ADMIN_TOKEN"/></label><button class="btn btn-primary" type="submit">进入后台</button></form></section></main>`, "login-body");
}

function admin(posts: Post[], apps: Application[], flash?: string) {
  const pendingApps = apps.filter((a)=>a.status==="new").length;
  const publishedPosts = posts.filter((p)=>p.status==="published").length;
  const draftPosts = posts.filter((p)=>p.status==="draft").length;
  const postCards = posts.map((p, index)=>`<details class="record-card" ${index===0 ? "open" : ""}><summary class="record-summary"><div class="record-summary-head"><div><div class="meta"><span class="pill">${esc(p.status)}</span>${p.pinned?'<span class="pill">Pinned</span>':""}<span>${new Date(p.updatedAt).toLocaleDateString("zh-CN")}</span></div><h3>${esc(p.title||"未命名动态")}</h3></div><div class="record-actions"><span>继续编辑</span><span>Slug: ${esc(p.slug)}</span></div></div><p>${esc(p.body.slice(0, 96))}${p.body.length>96?"...":""}</p></summary><div class="record-body"><div class="record-toolbar"><span class="pill">标签 ${p.tags.length}</span>${p.tags.map((tag)=>`<span class="tag">${esc(tag)}</span>`).join("")}</div><form class="post-form" method="post" action="/admin/posts"><input type="hidden" name="id" value="${esc(p.id)}"/><label>标题<input name="title" value="${esc(p.title)}"/></label><label>Slug<input name="slug" value="${esc(p.slug)}"/></label><label>标签<input name="tags" value="${esc(p.tags.join(", "))}"/></label><label>正文<textarea name="body">${esc(p.body)}</textarea></label><div class="split"><label>状态<select name="status"><option value="draft" ${p.status==="draft"?"selected":""}>draft</option><option value="published" ${p.status==="published"?"selected":""}>published</option></select></label><label>置顶<input class="check" type="checkbox" name="pinned" ${p.pinned?"checked":""}/></label></div><button class="btn btn-primary" type="submit">保存动态</button></form><form method="post" action="/admin/posts/${esc(p.id)}/delete"><button class="btn btn-secondary" type="submit">删除</button></form></div></details>`).join("");
  const appCards = apps.map((a)=>`<article class="record-card"><div class="record-body"><div class="record-summary-meta"><div class="meta"><span class="pill">${esc(a.status)}</span><span>${new Date(a.createdAt).toLocaleDateString("zh-CN")}</span></div><span class="smallcaps">${esc(a.requestedSubdomain||"未填写用途")}</span></div><h3>${esc(a.name)}</h3><p>${esc(a.projectSummary)}</p><div class="record-toolbar"><span><strong>联系：</strong>${esc(a.contact)}</span>${a.notes?`<span><strong>备注：</strong>${esc(a.notes)}</span>`:""}</div><form class="inline" method="post" action="/admin/applications/${esc(a.id)}/status"><select name="status">${["new","reviewing","accepted","rejected"].map((s)=>`<option value="${s}" ${a.status===s?"selected":""}>${s}</option>`).join("")}</select><button class="btn btn-primary" type="submit">更新状态</button></form></div></article>`).join("");
  return shell("Admin Dashboard", `<main class="page admin-page">${flash?`<div class="msg ok">${esc(flash)}</div>`:""}<section class="admin-summary"><article class="metric"><div class="mark">待处理申请</div><strong>${pendingApps}</strong><span>${apps.length ? `共 ${apps.length} 条合作申请` : "当前收件箱为空"}</span></article><article class="metric"><div class="mark">已发布</div><strong>${publishedPosts}</strong><span>当前对外可见的动态数量</span></article><article class="metric"><div class="mark">草稿</div><strong>${draftPosts}</strong><span>还可以继续整理后再发布</span></article></section><section class="workspace"><div class="stack"><article class="admin-pane"><div class="eyebrow">Publish short updates</div><h2>发布新动态</h2><p class="mark" style="letter-spacing:.08em;text-transform:none;">集中维护上线记录、站点更新和阶段性判断。</p><form method="post" action="/admin/posts"><label>标题<input name="title" placeholder="可选标题，比如上线记录"/></label><label>Slug<input name="slug" placeholder="可留空，系统会自动生成"/></label><label>标签<input name="tags" placeholder="用逗号分隔，例如 brand, 上线, 公告"/></label><label>正文<textarea name="body" placeholder="写下近况、更新、想法或上线播报" required></textarea></label><div class="split"><label>状态<select name="status"><option value="draft">draft</option><option value="published">published</option></select></label><label>置顶显示<input class="check" type="checkbox" name="pinned"/></label></div><button class="btn btn-primary" type="submit">保存动态</button></form></article><article class="admin-pane"><div class="eyebrow">Inbox</div><h2>合作申请</h2><div class="list">${appCards||'<p class="mark" style="letter-spacing:.08em;text-transform:none;">目前还没有新的合作申请。</p>'}</div></article></div><article class="admin-pane"><div class="eyebrow">Existing posts</div><h2>已发布与草稿动态</h2><div class="list">${postCards||'<p class="mark" style="letter-spacing:.08em;text-transform:none;">目前还没有动态记录。</p>'}</div></article></section></main>`, "admin-body");
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
