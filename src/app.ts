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

const css = `:root{--bg:#09030f;--bg2:#160a22;--text:#fff6ea;--muted:rgba(255,246,234,.68);--line:rgba(255,255,255,.14);--panel:rgba(12,8,24,.58);--input:rgba(255,247,238,.08);--shadow:0 34px 90px rgba(0,0,0,.35);--radius-xl:40px;--radius-lg:28px;--radius-md:18px;--gutter:clamp(18px,4vw,60px);--content:1380px;--poster-shift:0px;--poster-tilt:0deg;--poster-blur:0px;--transition:320ms cubic-bezier(.22,1,.36,1)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font:16px/1.6 "Bahnschrift","Segoe UI Variable Text","PingFang SC","Microsoft YaHei UI",sans-serif;color:var(--text);background:radial-gradient(circle at 12% 14%,rgba(255,69,120,.34),transparent 28%),radial-gradient(circle at 82% 12%,rgba(94,118,255,.4),transparent 28%),radial-gradient(circle at 56% 78%,rgba(255,194,79,.22),transparent 28%),linear-gradient(140deg,#08020d,#14091f 40%,#05020a);min-height:100vh;overflow-x:hidden}body::before,body::after{content:"";position:fixed;pointer-events:none;z-index:-1;filter:blur(88px)}body::before{top:-10vw;left:-8vw;width:40vw;height:40vw;background:rgba(255,77,136,.2)}body::after{right:-10vw;bottom:-12vw;width:44vw;height:44vw;background:rgba(82,115,255,.18)}a{text-decoration:none;color:inherit}button,input,textarea,select{font:inherit}button{appearance:none;background:none}img,svg{display:block;max-width:100%}.page{width:min(100%,var(--content));margin:0 auto;padding:0 var(--gutter) 88px}.site-nav{position:fixed;top:16px;left:50%;transform:translateX(-50%);width:min(calc(100% - 24px),1100px);display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 18px;z-index:30;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(7,3,14,.34);backdrop-filter:blur(20px) saturate(138%);box-shadow:0 18px 50px rgba(0,0,0,.18)}.site-nav nav,.actions,.meta,.toolbar,.inline,.tags{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.mark,.eyebrow,.smallcaps{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}.site-nav a,.site-nav button,.ghost-link,.toolbar a,.toolbar button{border:0;background:none;color:var(--muted);padding:4px 0;transition:color var(--transition),transform var(--transition)}.site-nav a:hover,.site-nav button:hover,.ghost-link:hover,.toolbar a:hover,.toolbar button:hover{color:var(--text);transform:translateY(-1px)}.hero{position:relative;min-height:100svh;padding:112px 0 40px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(420px,1.1fr);gap:clamp(28px,5vw,96px);align-items:end}.hero-copy{position:relative;z-index:2;display:grid;gap:16px;padding-bottom:clamp(20px,4vw,54px)}.hero-copy h1,.section-title,.footer-title,.admin-pane h2,.login-panel h2,.modal-panel h2{font-family:Impact,Haettenschweiler,"Arial Narrow Bold","Segoe UI Black",sans-serif;letter-spacing:-.06em;line-height:.84;margin:0;text-transform:uppercase}.hero-copy h1{font-size:clamp(4.8rem,15vw,12rem);max-width:7ch}.hero-copy p{max-width:20rem;margin:0;color:var(--muted);font-size:clamp(1rem,1.3vw,1.12rem)}.actions{margin-top:6px}.hero-meta span,.pill,.tag{display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,246,234,.75)}.hero-visual{position:relative;min-height:calc(100svh - 156px);display:grid;align-items:stretch}.poster{position:relative;min-height:100%;overflow:hidden;border-radius:54px;background:linear-gradient(160deg,rgba(255,70,125,.16),rgba(68,48,148,.12) 42%,rgba(255,191,68,.12));border:1px solid rgba(255,255,255,.12);box-shadow:var(--shadow)}.poster::before{content:"";position:absolute;inset:0;background:linear-gradient(125deg,rgba(255,255,255,.08),transparent 32%,transparent 72%,rgba(255,255,255,.05))}.poster-grid,.poster-caption,.blob-a,.blob-b,.blob-c,.blade-a,.blade-b{position:absolute}.poster-grid{inset:18px;border:1px solid rgba(255,255,255,.08);border-radius:38px}.poster-grid::before,.poster-grid::after{content:"";position:absolute;left:7%;right:7%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.36),transparent)}.poster-grid::before{top:23%}.poster-grid::after{bottom:18%}.blob-a,.blob-b,.blob-c{border-radius:50%;filter:blur(calc(30px + var(--poster-blur)))}.blob-a{inset:8% 38% 38% 8%;background:radial-gradient(circle,rgba(255,61,124,.95),rgba(255,61,124,.08) 72%);transform:translateY(var(--poster-shift))}.blob-b{inset:24% 8% 10% 46%;background:radial-gradient(circle,rgba(88,122,255,.96),rgba(88,122,255,.08) 72%);transform:translateY(calc(var(--poster-shift) * -.4))}.blob-c{inset:48% 22% 4% 14%;background:radial-gradient(circle,rgba(255,196,76,.76),rgba(255,196,76,.06) 72%);filter:blur(calc(48px + var(--poster-blur)))}.blade-a,.blade-b{width:1px;border-radius:999px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.7),transparent);mix-blend-mode:screen}.blade-a{top:-6%;bottom:18%;left:48%;transform:rotate(17deg)}.blade-b{top:12%;bottom:-10%;left:62%;transform:rotate(-19deg)}.poster-caption{left:7%;right:7%;top:8%;bottom:8%;display:flex;flex-direction:column;justify-content:space-between;transform:translateY(calc(var(--poster-shift) * -.14)) rotate(var(--poster-tilt))}.poster-caption strong{display:block;max-width:6ch;font-family:Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif;font-size:clamp(4.8rem,12vw,9rem);line-height:.82;letter-spacing:-.07em;text-transform:uppercase}.poster-caption span{display:block;color:rgba(255,246,234,.72);font-size:.95rem;letter-spacing:.18em;text-transform:uppercase}.poster-caption em{max-width:280px;padding:16px 18px;border-radius:24px;background:rgba(9,4,18,.34);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(26px);font-style:normal}.section{padding:48px 0 0}.section[data-reveal]{opacity:.01;transform:translateY(32px);transition:transform 780ms cubic-bezier(.22,1,.36,1),opacity 780ms cubic-bezier(.22,1,.36,1)}.section.is-visible[data-reveal]{opacity:1;transform:none}.journal-shell{position:relative;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(260px,.56fr);gap:28px;align-items:end;padding:34px;border-radius:40px;background:linear-gradient(160deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.1);overflow:hidden}.journal-shell::before{content:"";position:absolute;inset:-12% 52% 34% -8%;background:radial-gradient(circle,rgba(255,73,132,.22),transparent 70%);filter:blur(42px)}.section-title{font-size:clamp(2.7rem,6vw,5.4rem)}.section-copy{max-width:19rem;margin:10px 0 0;color:var(--muted)}.journal-card{position:relative;padding:28px;border-radius:26px;background:rgba(8,4,18,.44);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(20px)}.journal-card::before{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,#ff5d7e,#7b8cff,#ffc34f)}.journal-card h3{margin:14px 0 8px;font-size:clamp(2rem,3.6vw,3.7rem);line-height:.88;letter-spacing:-.06em;text-transform:uppercase}.journal-card p{margin:0;max-width:38rem;color:rgba(255,246,234,.78)}.journal-aside{display:grid;gap:10px;align-content:end}.journal-date{font-family:Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif;font-size:clamp(2.5rem,5vw,4.2rem);letter-spacing:-.06em;line-height:.86;text-transform:uppercase}.cooperate{padding:34px 0 0;border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(0,.8fr) minmax(220px,.34fr);gap:24px;align-items:end}.cooperate p{max-width:20rem;margin:10px 0 0;color:var(--muted)}.btn,button.btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 22px;border-radius:999px;border:0;cursor:pointer;transition:transform var(--transition),background var(--transition),color var(--transition),box-shadow var(--transition)}.btn:hover,button.btn:hover{transform:translateY(-1px)}.btn-primary{background:linear-gradient(90deg,#ff5f7d,#ffb347 92%);color:#160913;box-shadow:0 20px 44px rgba(255,95,125,.24)}.btn-secondary{background:rgba(255,255,255,.08);color:var(--text);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);backdrop-filter:blur(18px)}.entry-trigger{justify-self:end;display:grid;gap:10px;padding:18px 18px 16px;border:1px solid rgba(255,255,255,.14);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03));backdrop-filter:blur(24px);min-width:220px}.entry-trigger:hover{transform:translateY(-2px) rotate(-1deg);border-color:rgba(255,255,255,.28)}.entry-trigger strong{font-size:1.16rem;letter-spacing:.08em;text-transform:uppercase}.entry-trigger span{color:rgba(255,246,234,.72);font-size:.95rem;line-height:1.4}.page-footer{padding-top:34px}.footer-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,.7fr);gap:18px}.footer-block,.admin-pane,.login-panel,.modal-panel{background:linear-gradient(180deg,rgba(18,10,32,.84),rgba(10,5,22,.72));border:1px solid rgba(255,255,255,.12);border-radius:var(--radius-lg);padding:clamp(22px,3vw,34px);box-shadow:var(--shadow);backdrop-filter:blur(22px) saturate(136%)}.footer-block p,.admin-pane p{margin:0;color:var(--muted)}.footer-title{font-size:clamp(2rem,4vw,3rem);margin-bottom:8px}form{display:grid;gap:14px}label{display:grid;gap:8px;font-size:14px}input,textarea,select{width:100%;padding:14px 16px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,.12);background:var(--input);color:var(--text)}textarea{min-height:140px;resize:vertical}.split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.msg{padding:12px 14px;border-radius:var(--radius-md);font-size:14px}.ok{background:rgba(92,118,255,.14);color:#dde4ff}.err{background:rgba(255,88,133,.14);color:#ffd9e4}.modal{position:fixed;inset:0;display:grid;place-items:center;padding:20px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity var(--transition),visibility var(--transition);z-index:60}.modal.is-open{opacity:1;visibility:visible;pointer-events:auto}.modal-backdrop{position:absolute;inset:0;background:rgba(7,3,14,.28);backdrop-filter:blur(32px) saturate(150%)}.modal-panel{position:relative;width:min(100%,760px);max-height:min(88vh,920px);overflow:auto}.modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:18px}.modal-head p{margin:10px 0 0;color:var(--muted)}.icon-btn{width:42px;height:42px;border-radius:999px;background:rgba(255,255,255,.08);color:var(--text);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16)}.admin-page,.login-page{min-height:100svh}.admin-top,.login-shell{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;padding:24px var(--gutter) 34px}.toolbar form{display:block}.workspace{display:grid;grid-template-columns:minmax(320px,.92fr) minmax(0,1.08fr);gap:20px}.stack,.list{display:grid;gap:18px}.admin-pane h2,.login-panel h2{font-size:clamp(2rem,4vw,3rem);margin-top:10px}.mini{padding:18px 0;border-top:1px solid var(--line)}.mini:first-child{padding-top:0;border-top:0}.mini p{margin:0 0 10px}.check{width:20px;height:20px}.login-panel{width:min(100%,520px);margin:0 var(--gutter)}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}@media (max-width:980px){.hero,.journal-shell,.workspace,.footer-grid,.cooperate{grid-template-columns:1fr}.hero{padding-top:102px;min-height:auto}.hero-visual{min-height:520px}.entry-trigger{justify-self:start}}@media (max-width:720px){.page{padding:0 18px 72px}.site-nav{top:12px;width:calc(100% - 18px);padding:14px 16px;border-radius:28px}.hero{grid-template-columns:1fr;padding-top:96px}.hero-copy h1{font-size:clamp(4.1rem,24vw,6.2rem)}.hero-visual{min-height:380px}.poster{border-radius:32px}.poster-grid{inset:14px;border-radius:24px}.poster-caption strong{font-size:clamp(3.8rem,21vw,5.6rem)}.poster-caption em{max-width:none}.cooperate{padding-top:24px}.split{grid-template-columns:1fr}.login-panel{margin:0 18px}}`;

const publicStageCss = `
.landing{min-height:100vh;padding:0 0 64px}
.landing-nav{position:fixed;top:18px;left:50%;transform:translateX(-50%);width:min(calc(100% - 28px),1180px);display:flex;justify-content:space-between;align-items:center;gap:18px;padding:14px 18px;z-index:40;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(9,5,18,.3);backdrop-filter:blur(22px) saturate(140%)}
.landing-nav nav{display:flex;gap:18px;align-items:center}
.landing-wrap{position:relative;min-height:100vh;padding:120px clamp(18px,4vw,44px) 48px;overflow:hidden}
.landing-wrap::before,.landing-wrap::after{content:"";position:absolute;inset:auto;pointer-events:none;filter:blur(110px);opacity:.9}
.landing-wrap::before{top:2%;left:-8%;width:38vw;height:38vw;background:rgba(255,68,126,.22)}
.landing-wrap::after{right:-10%;top:10%;width:42vw;height:42vw;background:rgba(92,118,255,.2)}
.stage-grid{position:relative;display:grid;grid-template-columns:minmax(0,1.12fr) minmax(280px,.44fr);grid-template-areas:"brand entry" "brand broadcast";gap:22px;min-height:calc(100vh - 168px)}
.brand-stage{grid-area:brand;position:relative;display:grid;align-items:end;min-height:720px;padding:clamp(26px,4vw,44px);border-radius:42px;background:linear-gradient(145deg,rgba(20,8,28,.76),rgba(10,5,20,.58));border:1px solid rgba(255,255,255,.08);overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.28)}
.brand-stage::before{content:"";position:absolute;inset:-10% 46% 26% -12%;background:radial-gradient(circle,rgba(255,80,136,.3),transparent 72%);filter:blur(46px)}
.brand-stage::after{content:"";position:absolute;inset:18% -8% -8% 58%;background:radial-gradient(circle,rgba(102,123,255,.28),transparent 72%);filter:blur(54px)}
.fog{position:absolute;border-radius:50%;filter:blur(calc(28px + var(--stage-blur, 0px)));pointer-events:none}
.fog-a{inset:4% 40% 44% 4%;background:radial-gradient(circle,rgba(255,74,136,.94),rgba(255,74,136,.08) 72%);transform:translate3d(0,var(--stage-shift,0px),0)}
.fog-b{inset:18% 6% 12% 56%;background:radial-gradient(circle,rgba(90,123,255,.94),rgba(90,123,255,.08) 72%);transform:translate3d(0,calc(var(--stage-shift,0px) * -.35),0)}
.fog-c{inset:58% 16% -8% 24%;background:radial-gradient(circle,rgba(255,192,78,.72),rgba(255,192,78,.06) 72%);filter:blur(calc(48px + var(--stage-blur, 0px)))}
.grid-lines,.grid-lines::before,.grid-lines::after,.signal,.signal::before{position:absolute;content:""}
.grid-lines{inset:18px;border:1px solid rgba(255,255,255,.08);border-radius:34px}
.grid-lines::before{left:8%;right:8%;top:18%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.38),transparent)}
.grid-lines::after{left:12%;right:12%;bottom:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)}
.signal{top:8%;bottom:8%;left:72%;width:1px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.6),transparent);transform:rotate(16deg)}
.signal::before{top:22%;bottom:-4%;left:110px;width:1px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.42),transparent);transform:rotate(-20deg)}
.brand-copy{position:relative;z-index:2;display:grid;gap:18px;align-self:end}
.brand-kicker{font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,246,234,.72)}
.brand-title{font-family:Impact,Haettenschweiler,"Arial Narrow Bold","Segoe UI Black",sans-serif;font-size:clamp(5.4rem,16vw,13rem);line-height:.76;letter-spacing:-.08em;text-transform:uppercase;max-width:8ch;margin:0}
.brand-title span{display:block}
.brand-copy p{max-width:18rem;margin:0;color:rgba(255,246,234,.76);font-size:clamp(1rem,1.25vw,1.08rem)}
.brand-meta{display:flex;gap:10px;flex-wrap:wrap}
.brand-meta span{display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);backdrop-filter:blur(16px);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,246,234,.76)}
.entry-rail{grid-area:entry;position:relative;display:grid;align-content:start;gap:18px;padding:24px;border-radius:30px;background:rgba(13,8,24,.48);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(18px)}
.entry-rail .eyebrow,.broadcast-band .eyebrow{color:rgba(255,246,234,.64)}
.entry-title{font-family:Impact,Haettenschweiler,"Arial Narrow Bold","Segoe UI Black",sans-serif;font-size:clamp(2rem,3.6vw,3.6rem);line-height:.84;letter-spacing:-.05em;text-transform:uppercase;margin:0}
.entry-rail p{margin:0;color:rgba(255,246,234,.74);max-width:16rem}
.entry-trigger-rail{display:grid;gap:10px;padding:18px;border-radius:24px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03));text-align:left}
.entry-trigger-rail:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.26)}
.entry-trigger-rail strong{font-size:1.1rem;letter-spacing:.08em;text-transform:uppercase}
.entry-trigger-rail span{color:rgba(255,246,234,.74)}
.broadcast-band{grid-area:broadcast;display:grid;gap:14px;align-content:end;padding:24px;border-radius:30px;background:rgba(11,7,22,.44);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(18px)}
.broadcast-band h2{font-family:Impact,Haettenschweiler,"Arial Narrow Bold","Segoe UI Black",sans-serif;font-size:clamp(2rem,3vw,3.4rem);line-height:.84;letter-spacing:-.05em;text-transform:uppercase;margin:0}
.broadcast-band p{margin:0;color:rgba(255,246,234,.74)}
.update-ticket{position:relative;padding:18px 18px 20px;border-radius:22px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
.update-ticket::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,#ff5c7e,#7d8bff,#ffc24f)}
.update-ticket h3{margin:12px 0 8px;font-size:clamp(1.6rem,2.4vw,2.4rem);line-height:.9;letter-spacing:-.04em;text-transform:uppercase}
.update-ticket p{max-width:28rem}
.footer-line{display:flex;justify-content:space-between;gap:16px;align-items:end;padding:26px clamp(18px,4vw,44px) 0;color:rgba(255,246,234,.58);font-size:.95rem}
@media (prefers-reduced-motion:reduce){.entry-trigger-rail,.landing-nav a,.landing-nav button{transition:none}}
@media (max-width:980px){.stage-grid{grid-template-columns:1fr;grid-template-areas:"brand" "entry" "broadcast";min-height:auto}.brand-stage{min-height:560px}}
@media (max-width:720px){.landing-wrap{padding:104px 16px 40px}.brand-stage,.entry-rail,.broadcast-band{padding:18px;border-radius:24px}.brand-title{font-size:clamp(4.2rem,24vw,6.2rem)}.brand-copy p{max-width:14rem}.footer-line{padding:22px 16px 0;flex-direction:column;align-items:flex-start}.grid-lines{inset:12px;border-radius:22px}}
`;

const esc = (v:string) => v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
const slugify = (v:string) => v.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"") || `post-${Math.random().toString(36).slice(2,8)}`;
const tags = (v:string|string[]) => (Array.isArray(v)?v:v.split(",")).map((x)=>x.trim()).filter(Boolean).slice(0,6);
const shell = (title:string, body:string) => `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><meta name="description" content="juren233.top 的主域名入口与联络通道。"/><style>${css}${publicStageCss}</style></head><body>${body}</body></html>`;
const brandArtwork = () => `<div class="grid-lines"></div><div class="fog fog-a"></div><div class="fog fog-b"></div><div class="fog fog-c"></div><div class="signal"></div>`;

function home(posts: Post[]) {
  const lead = (posts.length ? posts : fallbackPosts)[0];
  const leadDate = new Date(lead.createdAt).toLocaleDateString("zh-CN");
  const leadHtml = `<article class="update-ticket"><div class="meta">${lead.pinned ? '<span class="pill">Pinned</span>' : ""}<span>${leadDate}</span></div><h3>${esc(lead.title || "未命名动态")}</h3><p>${esc(lead.body)}</p><div class="tags">${lead.tags.map((t)=>`<span class="tag">${esc(t)}</span>`).join("")}</div></article>`;
  return shell("juren233.top | Stage Poster", `<main class="landing"><header class="landing-nav"><div><div class="mark">stage poster</div><div class="smallcaps">juren233</div></div><nav><button type="button" data-open-modal="cooperation-modal">打开入口</button><a href="#broadcast">动态</a><a href="/admin">后台</a></nav></header><section class="landing-wrap"><div class="stage-grid"><section class="brand-stage" aria-labelledby="brand-title">${brandArtwork()}<div class="brand-copy"><div class="brand-kicker">poster / blur / current signal</div><h1 id="brand-title" class="brand-title"><span>juren233</span><span>.top</span></h1><p>品牌先出现，入口第二个被看见，播报层退到第三层。</p><div class="brand-meta"><span>poster</span><span>blur</span><span>open channel</span></div></div></section><section class="entry-rail" data-reveal><div class="eyebrow">Contact slice</div><h2 class="entry-title">留下一条消息</h2><p>联络入口被做成舞台里的动作点，不是商业化 CTA。你可以把提案、项目链接或合作想法直接送进来。</p><button class="entry-trigger-rail" type="button" data-open-modal="cooperation-modal"><div class="mark">open entry</div><strong>打开入口</strong><span>把用途、内容和联系方式留在这里。</span></button></section><section class="broadcast-band" id="broadcast" data-reveal><div class="eyebrow">Current broadcast</div><h2>最新动态</h2><p>这一层不再主导首页，只负责播报当前一条真正需要被看到的更新。</p>${leadHtml}</section></div><footer class="footer-line"><div>juren233.top / stage poster system</div><div>入口先于动态，动态退成播报层</div></footer></section></main><div class="modal" id="cooperation-modal" aria-hidden="true"><div class="modal-backdrop" data-close-modal></div><section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="cooperation-title"><div class="modal-head"><div><div class="eyebrow">Message entry</div><h2 id="cooperation-title">打开入口</h2><p>背景退成一整张 blur 舞台，前景只保留清晰表单。</p></div><button class="icon-btn" type="button" aria-label="关闭联络入口" data-close-modal>×</button></div><form id="cooperation-form"><label>申请人名称<input name="name" placeholder="怎么称呼你" required/></label><label>联系方式<input name="contact" placeholder="邮箱 / QQ / Telegram / 微信" required/></label><label>项目说明<textarea name="projectSummary" placeholder="介绍你的内容、用途和展示方式" required></textarea></label><div class="split"><label>预期子域名 / 用途说明<input name="requestedSubdomain" placeholder="例如 demo、lab、share-guest"/></label><label>备注<input name="notes" placeholder="可填写时效、风格或其他说明"/></label></div><button class="btn btn-primary" type="submit">提交内容</button><div id="form-message" class="mark" style="letter-spacing:.08em;text-transform:none;">内容会直接进入后台列表。</div></form></section></div><script>const root=document.documentElement;const modal=document.getElementById("cooperation-modal");const openers=document.querySelectorAll('[data-open-modal="cooperation-modal"]');const closers=document.querySelectorAll("[data-close-modal]");const form=document.getElementById("cooperation-form");const message=document.getElementById("form-message");const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const setModal=(open)=>{if(!modal)return;modal.classList.toggle("is-open",open);modal.setAttribute("aria-hidden",String(!open));document.body.style.overflow=open?"hidden":"";};openers.forEach((node)=>node.addEventListener("click",()=>setModal(true)));closers.forEach((node)=>node.addEventListener("click",()=>setModal(false)));window.addEventListener("keydown",(event)=>{if(event.key==="Escape")setModal(false);});if(!reduced){const onScroll=()=>{const progress=Math.min(window.scrollY/960,1);root.style.setProperty("--stage-shift",String(progress*52)+'px');root.style.setProperty("--stage-blur",String(progress*10)+'px');};onScroll();window.addEventListener("scroll",onScroll,{passive:true});const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting)entry.target.classList.add("is-visible");});},{threshold:.22});document.querySelectorAll("[data-reveal]").forEach((node)=>observer.observe(node));}else{document.querySelectorAll("[data-reveal]").forEach((node)=>node.classList.add("is-visible"));}form?.addEventListener("submit",async(event)=>{event.preventDefault();if(!message)return;const data=new FormData(form);const payload=Object.fromEntries(data.entries());message.textContent='正在提交内容...';try{const response=await fetch('/api/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const json=await response.json();if(!response.ok)throw new Error(json.error||'提交失败');form.reset();message.textContent='内容已送达，我会在后台查看并跟进。';}catch(error){message.textContent=error instanceof Error?error.message:'提交失败，请稍后重试。';}});</script>`);
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
