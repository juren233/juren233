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
    expect(html).toContain("打开入口");
    expect(html).toContain("留下一条消息");
    expect(html).toContain("cooperation-modal");
    expect(html).toContain("最新动态");
    expect(html).toContain("最新公告");
    expect(html).not.toContain("更早的动态");
    expect(html).toContain("当前更新");
    expect(html).not.toContain("stage poster");
    expect(html).not.toContain("poster");
    expect(html).not.toContain("blur");
    expect(html).not.toContain("Current broadcast");
    expect(html).not.toContain("Contact slice");
    expect(html).not.toContain("apple green");
    expect(html).not.toContain("打开合作申请");
    expect(html).not.toContain("single update");
    expect(html.indexOf("juren233.top")).toBeLessThan(html.indexOf("留下一条消息"));
    expect(html.indexOf("留下一条消息")).toBeLessThan(html.indexOf("最新动态"));

    const feed = await app.request("/api/feed");
    const feedJson = (await feed.json()) as { items: unknown[] };
    expect(feedJson.items).toHaveLength(2);
  });
});

