
jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@google/genai", () => {
  const embedContent = jest.fn();
  return {
    GoogleGenAI: jest.fn(() => ({ models: { embedContent } })),
    __embedContent: embedContent,
  };
});

const okFor = async ({ contents }: { contents: string[] }) => ({
  embeddings: contents.map(() => ({ values: [1, 0] })),
});

let sleeps: number[];

// fresh module per test
function load(tokensPerMinute?: string) {
  if (tokensPerMinute) process.env.EMBED_TOKENS_PER_MINUTE = tokensPerMinute;
  let mod: any;
  let embedContent: jest.Mock;
  jest.isolateModules(() => {
    mod = require("./embeddings");
    embedContent = require("@google/genai").__embedContent;
  });
  embedContent!.mockImplementation(okFor);
  return { ...mod, embedContent: embedContent! };
}

beforeEach(() => {
  sleeps = [];
  jest.spyOn(global, "setTimeout").mockImplementation(((fn: () => void, ms?: number) => {
    sleeps.push(ms ?? 0);
    fn();
    return 0;
  }) as unknown as typeof setTimeout);
});

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.EMBED_TOKENS_PER_MINUTE;
});

describe("toVector", () => {
  it("formats a vector for pgvector", () => {
    const { toVector } = load();
    expect(toVector([0.1, 0.2, 0.3])).toBe("[0.1,0.2,0.3]");
  });
});

describe("embedTexts", () => {
  it("normalizes each vector to unit length", async () => {
    const { embedTexts, embedContent } = load();
    embedContent.mockResolvedValueOnce({ embeddings: [{ values: [3, 4] }] });
    const [v] = await embedTexts(["hello"], "RETRIEVAL_QUERY");
    expect(v[0]).toBeCloseTo(0.6);
    expect(v[1]).toBeCloseTo(0.8);
  });

  it("batches 25 texts into 3 calls of up to 10, keeping order", async () => {
    const { embedTexts, embedContent } = load();
    const texts = Array.from({ length: 25 }, (_, i) => `t${i}`);
    const out = await embedTexts(texts, "RETRIEVAL_QUERY");
    expect(out).toHaveLength(25);
    expect(embedContent).toHaveBeenCalledTimes(3);
    expect(embedContent.mock.calls[0][0].contents).toHaveLength(10);
    expect(embedContent.mock.calls[2][0].contents).toEqual(texts.slice(20));
  });

  it("requests 768 dimensions with the given task type", async () => {
    const { embedTexts, embedContent } = load();
    await embedTexts(["a"], "RETRIEVAL_DOCUMENT");
    expect(embedContent.mock.calls[0][0]).toMatchObject({
      model: "gemini-embedding-001",
      config: { outputDimensionality: 768, taskType: "RETRIEVAL_DOCUMENT" },
    });
  });

  it("retries after a failure and then succeeds", async () => {
    const { embedTexts, embedContent } = load();
    embedContent.mockRejectedValueOnce(new Error("429"));
    const out = await embedTexts(["a"], "RETRIEVAL_QUERY");
    expect(out).toHaveLength(1);
    expect(embedContent).toHaveBeenCalledTimes(2);
  });

  it("throws the last error after 4 failed attempts", async () => {
    const { embedTexts, embedContent } = load();
    embedContent.mockRejectedValue(new Error("quota exceeded"));
    await expect(embedTexts(["a"], "RETRIEVAL_QUERY")).rejects.toThrow("quota exceeded");
    expect(embedContent).toHaveBeenCalledTimes(4);
  });

  it("rejects when the API returns the wrong number of embeddings", async () => {
    const { embedTexts, embedContent } = load();
    embedContent.mockResolvedValue({ embeddings: [{ values: [1, 0] }] });
    await expect(embedTexts(["a", "b"], "RETRIEVAL_QUERY")).rejects.toThrow(
      "Embedding count mismatch",
    );
  });

  it("paces document indexing once the per-minute token budget is used", async () => {
    const { embedTexts } = load("100");
    const text = "x".repeat(350); // 100 tokens
    await embedTexts([text], "RETRIEVAL_DOCUMENT");
    expect(sleeps.some((ms) => ms > 50_000)).toBe(false);
    await embedTexts([text], "RETRIEVAL_DOCUMENT");
    expect(sleeps.some((ms) => ms > 50_000)).toBe(true);
  });

  it("does not pace single queries", async () => {
    const { embedTexts } = load("100");
    const text = "x".repeat(350);
    await embedTexts([text], "RETRIEVAL_QUERY");
    await embedTexts([text], "RETRIEVAL_QUERY");
    expect(sleeps.some((ms) => ms > 50_000)).toBe(false);
  });
});