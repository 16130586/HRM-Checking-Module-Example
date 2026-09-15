import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { apiRequest } from "./api.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("apiRequest sends JSON requests and returns parsed data", async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const result = await apiRequest("/User", {
    method: "POST",
    headers: { Authorization: "Bearer test-token" },
    body: JSON.stringify({ name: "Ada" }),
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(request.url, "/api/User");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers["Content-Type"], "application/json");
  assert.equal(request.options.headers.Authorization, "Bearer test-token");
});

test("apiRequest uses API error messages for failed JSON responses", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "Denied" }), {
    status: 403,
    headers: { "content-type": "application/json" },
  });

  await assert.rejects(apiRequest("/private"), { message: "Denied" });
});