import { describe, expect, it } from "bun:test";
import { app } from "../src/main";

describe("Health check", () => {
  it("should return ok", async () => {
    const res = await app.request("/health");
    expect(await res.text()).toEqual("ok");
  });
});
