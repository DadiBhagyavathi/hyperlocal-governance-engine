const { calculateDistance, isInsideGeoFence } = require("../../src/utils/geoMath");

describe("GeoMath Utility", () => {
  test("calculates zero distance for same coordinates", () => {
    const d = calculateDistance(10, 10, 10, 10);
    expect(d).toBe(0);
  });

  test("detects point inside geo-fence", () => {
    const inside = isInsideGeoFence(10, 10, 10, 10, 100);
    expect(inside).toBe(true);
  });

  test("detects point outside geo-fence", () => {
    const outside = isInsideGeoFence(10, 10, 11, 11, 100);
    expect(outside).toBe(false);
  });
});