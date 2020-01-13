const { calculateAbsoluteTtl } = require("./documentService");

jest.spyOn(Date, "now").mockImplementation(() => 1578897000000);

describe("calculateAbsoluteTtl", () => {
  it("should return the absolute timestamp given a relative ttl", () => {
    expect(calculateAbsoluteTtl(24 * 60 * 60 * 1000)).toBe(1578983400000);
  });
});
