const request = require("supertest");
const app = require("../../src/app");

describe("GeoFence API", () => {
  test("POST /api/v1/geofence/validate returns response structure", async () => {
    const res = await request(app)
      .post("/api/v1/geofence/validate")
      .send({
        latitude: 12.9,
        longitude: 77.6,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("insideGeoFence");
    expect(res.body).toHaveProperty("projects");
  });
});