import request from "supertest";
import app from "../app.js";

describe("App health", () => {
  test("GET / returns ok", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });
});
