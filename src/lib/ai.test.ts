jest.mock("server-only", () => ({}), { virtual: true });

import { aiSummariseCommit } from "./ai";

const ok = (content: string | null) => ({
  ok: true,
  json: async () => ({ choices: [{ message: { content } }] }),
});
const fail = (status: number) => ({
  ok: false,
  status,
  text: async () => "rate limited",
});

const GOOD = "<summary>\n* Added login (auth.ts)\n* Fixed typo (README.md)\n</summary>";

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  // make retry backoff instant
  jest.spyOn(global, "setTimeout").mockImplementation(((fn: () => void) => {
    fn();
    return 0;
  }) as unknown as typeof setTimeout);
});

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.OPENROUTER_MODEL;
});

describe("aiSummariseCommit", () => {
  it("returns bullets from the <summary> block", async () => {
    fetchMock.mockResolvedValue(ok(GOOD));
    await expect(aiSummariseCommit("diff")).resolves.toBe(
      "* Added login (auth.ts)\n* Fixed typo (README.md)",
    );
  });

  it("uses the last <summary> block when the model emits several", async () => {
    const raw = `<summary>\n* old one\n* old two\n</summary>\n${GOOD}`;
    fetchMock.mockResolvedValue(ok(raw));
    const out = await aiSummariseCommit("diff");
    expect(out).toContain("Added login");
    expect(out).not.toContain("old one");
  });

  it("drops bullets where the model talks about its task", async () => {
    const raw =
      "<summary>\n* I need to describe the diff\n* Added login (auth.ts)\n* Fixed typo (README.md)\n</summary>";
    fetchMock.mockResolvedValue(ok(raw));
    const out = await aiSummariseCommit("diff");
    expect(out).not.toMatch(/I need to/);
    expect(out.split("\n")).toHaveLength(2);
  });

  it("retries after an HTTP error and then succeeds", async () => {
    fetchMock.mockResolvedValueOnce(fail(429)).mockResolvedValueOnce(ok(GOOD));
    await expect(aiSummariseCommit("diff")).resolves.toContain("Added login");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws after 3 failed attempts", async () => {
    fetchMock.mockResolvedValue(fail(429));
    await expect(aiSummariseCommit("diff")).rejects.toThrow("OpenRouter 429");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("rejects an empty model response", async () => {
    fetchMock.mockResolvedValue(ok(null));
    await expect(aiSummariseCommit("diff")).rejects.toThrow("empty summary");
  });

  it("rejects an unusable summary (fewer than 2 bullets)", async () => {
    fetchMock.mockResolvedValue(ok("<summary>\n* only one\n</summary>"));
    await expect(aiSummariseCommit("diff")).rejects.toThrow("unusable summary");
  });

  it("truncates the diff to 20,000 characters", async () => {
    fetchMock.mockResolvedValue(ok(GOOD));
    await aiSummariseCommit("§".repeat(30_000));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages[0].content.split("§").length - 1).toBe(20_000);
  });

  it("defaults the model and honours OPENROUTER_MODEL", async () => {
    fetchMock.mockResolvedValue(ok(GOOD));
    await aiSummariseCommit("diff");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe("openrouter/free");

    process.env.OPENROUTER_MODEL = "some/model";
    await aiSummariseCommit("diff");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).model).toBe("some/model");
  });
});