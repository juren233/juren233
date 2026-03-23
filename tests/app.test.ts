import { describe, expect, it } from "vitest";

import {
  createApplicationInput,
  createApp,
  sortPublishedPosts,
  verifyAdminAccess,
} from "../src/app";

describe("sortPublishedPosts", () => {
  it("prioritizes pinned posts and excludes drafts", () => {
    const result = sortPublishedPosts([
      {
        id: "1",
        title: "draft",
        body: "draft",
        tags: [],
        slug: "draft",
        status: "draft",
        pinned: false,
        createdAt: "2026-03-22T08:00:00.000Z",
        updatedAt: "2026-03-22T08:00:00.000Z",
      },
      {
        id: "2",
        title: "old pinned",
        body: "pinned",
        tags: ["share"],
        slug: "old-pinned",
        status: "published",
        pinned: true,
        createdAt: "2026-03-20T08:00:00.000Z",
        updatedAt: "2026-03-20T08:00:00.000Z",
      },
      {
        id: "3",
        title: "new post",
        body: "new",
        tags: [],
        slug: "new-post",
        status: "published",
        pinned: false,
        createdAt: "2026-03-22T10:00:00.000Z",
        updatedAt: "2026-03-22T10:00:00.000Z",
      },
    ]);

    expect(result.map((post) => post.id)).toEqual(["2", "3"]);
  });
});

describe("createApplicationInput", () => {
  it("rejects incomplete cooperation submissions", () => {
    expect(() =>
      createApplicationInput({
        name: "",
        contact: "",
        projectSummary: "",
        requestedSubdomain: "",
        notes: "",
      }),
    ).toThrowError(/申请人名称/);
  });
});

describe("verifyAdminAccess", () => {
  it("accepts matching Cloudflare Access email", () => {
    const access = verifyAdminAccess(
      {
        emailHeader: "owner@juren233.top",
        cookieToken: null,
      },
      {
        ADMIN_EMAIL: "owner@juren233.top",
        ADMIN_TOKEN: "secret",
      },
    );

    expect(access).toBe(true);
  });

  it("accepts matching local admin token", () => {
    const access = verifyAdminAccess(
      {
        emailHeader: null,
        cookieToken: "secret",
      },
      {
        ADMIN_EMAIL: "owner@juren233.top",
        ADMIN_TOKEN: "secret",
      },
    );

    expect(access).toBe(true);
  });
});

describe("createApp", () => {
  it("renders the brand homepage and public feed", async () => {
    const app = createApp({
      listPosts: async () => [
        {
          id: "older-note",
          title: "更早的动态",
          body: "这条动态不应该出现在首页首条展示里。",
          tags: ["archive"],
          slug: "older-note",
          status: "published",
          pinned: false,
          createdAt: "2026-03-21T08:00:00.000Z",
          updatedAt: "2026-03-21T08:00:00.000Z",
        },
        {
          id: "latest-note",
          title: "最新公告",
          body: "这是首页唯一展示的一条动态。",
          tags: ["brand", "update"],
          slug: "latest-note",
          status: "published",
          pinned: true,
          createdAt: "2026-03-22T08:00:00.000Z",
          updatedAt: "2026-03-22T08:00:00.000Z",
        },
      ],
      listApplications: async () => [],
      createApplication: async () => undefined,
      upsertPost: async () => undefined,
      deletePost: async () => undefined,
      updateApplicationStatus: async () => undefined,
    });

    const home = await app.request("/");
    const html = await home.text();
    expect(home.status).toBe(200);
    expect(html).toContain("juren233.top");
    expect(html).toContain("cooperation-modal");
    expect(html).toContain("最新动态");
    expect(html).toContain("最新公告");
    expect(html).not.toContain("更早的动态");
    expect(html).toContain("easeInOutCubic");
    expect(html).toContain("home-track");
    expect(html).toContain("closing-glyph-reveal");
    expect(html).toContain("filter:blur(18px)");
    expect(html).not.toContain("home-panel");
    expect(html).not.toContain("home-grid");
    expect(html).not.toContain("apple green");
    expect(html).not.toContain("打开合作申请");
    expect(html).not.toContain("single update");
    expect(html).toContain('data-page-index="0"');
    expect(html).toContain('data-page-index="1"');
    expect(html).toContain('data-page-index="2"');
    expect(html).toContain('data-page-index="3"');
    expect(html.indexOf('data-page-index="0"')).toBeLessThan(html.indexOf('data-page-index="1"'));
    expect(html.indexOf('data-page-index="1"')).toBeLessThan(html.indexOf('data-page-index="2"'));

    const feed = await app.request("/api/feed");
    const feedJson = (await feed.json()) as { items: unknown[] };
    expect(feedJson.items).toHaveLength(2);
  });

  it("renders a scrollable admin dashboard with quick stats and collapsible post editors", async () => {
    const app = createApp({
      listPosts: async () => [
        {
          id: "post-1",
          title: "置顶动态",
          body: "这是一条需要被编辑和管理的后台动态。",
          tags: ["brand", "update"],
          slug: "post-1",
          status: "published",
          pinned: true,
          createdAt: "2026-03-22T08:00:00.000Z",
          updatedAt: "2026-03-22T08:00:00.000Z",
        },
        {
          id: "post-2",
          title: "草稿动态",
          body: "这是一条草稿动态。",
          tags: ["draft"],
          slug: "post-2",
          status: "draft",
          pinned: false,
          createdAt: "2026-03-21T08:00:00.000Z",
          updatedAt: "2026-03-21T08:00:00.000Z",
        },
      ],
      listApplications: async () => [
        {
          id: "app-1",
          name: "申请人 A",
          contact: "a@example.com",
          projectSummary: "希望挂载一个展示页。",
          requestedSubdomain: "demo-a",
          notes: "希望本周内处理",
          status: "new",
          createdAt: "2026-03-22T08:00:00.000Z",
          updatedAt: "2026-03-22T08:00:00.000Z",
        },
        {
          id: "app-2",
          name: "申请人 B",
          contact: "b@example.com",
          projectSummary: "已有上线内容，希望补一个下载入口。",
          requestedSubdomain: "share-b",
          notes: "",
          status: "reviewing",
          createdAt: "2026-03-21T08:00:00.000Z",
          updatedAt: "2026-03-21T08:00:00.000Z",
        },
      ],
      createApplication: async () => undefined,
      upsertPost: async () => undefined,
      deletePost: async () => undefined,
      updateApplicationStatus: async () => undefined,
    });

    const admin = await app.request(
      new Request("https://example.com/admin", {
        headers: {
          "CF-Access-Authenticated-User-Email": "owner@juren233.top",
        },
      }),
      {},
      {
        ADMIN_EMAIL: "owner@juren233.top",
        ADMIN_TOKEN: "secret",
      },
    );
    const html = await admin.text();

    expect(admin.status).toBe(200);
    expect(html).toContain('class="admin-body"');
    expect(html).toContain(".admin-body{");
    expect(html).toContain("overflow-y:auto");
    expect(html).not.toContain('class="admin-top"');
    expect(html).not.toContain("后台工作台");
    expect(html).not.toContain("返回主站");
    expect(html).not.toContain("退出");
    expect(html).toContain("待处理申请");
    expect(html).toContain("已发布");
    expect(html).toContain("草稿");
    expect(html).toContain('<details class="record-card"');
    expect(html).toContain("继续编辑");
  });
});

