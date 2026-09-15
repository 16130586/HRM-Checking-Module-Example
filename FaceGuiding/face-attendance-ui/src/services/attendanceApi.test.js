import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { checkIn, registerFace } from "./attendanceApi.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("registerFace posts the five captured images", async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ message: "registered" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const images = ["one", "two", "three", "four", "five"];
  const result = await registerFace(7, images);

  assert.deepEqual(result, { message: "registered" });
  assert.equal(request.url, "/api/Attendance/register/7");
  assert.equal(request.options.method, "POST");
  assert.deepEqual(JSON.parse(request.options.body), { base64Images: images });
});

test("checkIn returns plain-text success responses", async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response("checked in", { status: 200 });
  };

  const result = await checkIn("image-data");

  assert.equal(result, "checked in");
  assert.equal(request.url, "/api/Attendance/check-in");
  assert.deepEqual(JSON.parse(request.options.body), { base64Image: "image-data" });
});

test("checkIn exposes an API error message", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ title: "Unknown face" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });

  await assert.rejects(checkIn("image-data"), { message: "Unknown face" });
});