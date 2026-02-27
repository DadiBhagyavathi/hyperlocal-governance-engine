const request = require("supertest");
const app = require("../../src/app");

describe("Health Check API", () => {
  test("GET /health should return UP status", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
  });
});