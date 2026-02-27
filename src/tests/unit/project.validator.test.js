const { validateProjectInput } = require("../../src/modules/project/project.validator");

describe("Project Validator", () => {
  test("passes valid project data", () => {
    const result = validateProjectInput({
      title: "Hospital Upgrade",
      department: "HOSPITAL",
      location: {
        type: "Point",
        coordinates: [77.6, 12.9],
      },
      radius: 200,
      status: "in-progress",
    });

    expect(result.isValid).toBe(true);
  });

  test("fails when location is invalid", () => {
    const result = validateProjectInput({
      title: "Invalid Project",
      department: "HOSPITAL",
      location: {
        type: "Point",
        coordinates: [200, 100], // invalid range
      },
      radius: 200,
    });

    expect(result.isValid).toBe(false);
  });
});