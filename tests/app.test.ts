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
          id: "share-launch",
          title: "share 已进入持续维护",
          body: "今天把 share.juren233.top 放进主站精选入口。",
          tags: ["share", "站点"],
          slug: "share-launch",
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
    expect(html).toContain("share.juren233.top");
    expect(html).toContain("Brand index");
    expect(html).toContain("Curated entries");
    expect(html).toContain("abstract-brand-mark");

    const feed = await app.request("/api/feed");
    const feedJson = (await feed.json()) as { items: unknown[] };
    expect(feedJson.items).toHaveLength(1);
  });
});
