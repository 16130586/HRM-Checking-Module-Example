import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { getEmployees } from "./employeeApi.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("getEmployees fetches and returns the employee list", async () => {
  globalThis.fetch = async (url) => {
    assert.equal(url, "/api/User");
    return new Response(JSON.stringify([{ id: 1, fullName: "Ada" }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  assert.deepEqual(await getEmployees(), [{ id: 1, fullName: "Ada" }]);
});

test("getEmployees uses the fallback for failed responses", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "unavailable" }), {
    status: 503,
    headers: { "content-type": "application/json" },
  });

  await assert.rejects(getEmployees(), { message: "Không thể lấy danh sách nhân viên" });
});