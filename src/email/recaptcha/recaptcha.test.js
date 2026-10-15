jest.mock("node-fetch");
const fetch = require("node-fetch").default;
const recaptcha = require(".");

const mockResponse = (body) =>
  fetch.mockResolvedValue({ json: () => Promise.resolve(body) });

describe("recaptcha", () => {
  const options = {
    allowedHostnames: ["opencerts.io"],
    action: "email",
    minScore: 0.5
  };

  it("should accept a successful v2 response from an allowed hostname", async () => {
    mockResponse({ success: true, hostname: "opencerts.io" });
    await expect(recaptcha("SECRET", options)("TOKEN")).resolves.toBe(true);
  });

  it("should reject an unsuccessful response", async () => {
    mockResponse({ success: false, hostname: "opencerts.io" });
    await expect(recaptcha("SECRET", options)("TOKEN")).resolves.toBe(false);
  });

  it("should reject a response from another hostname", async () => {
    mockResponse({ success: true, hostname: "evil.example.com" });
    await expect(recaptcha("SECRET", options)("TOKEN")).resolves.toBe(false);
  });

  it("should skip the hostname check when no hostnames are configured", async () => {
    mockResponse({ success: true, hostname: "evil.example.com" });
    await expect(recaptcha("SECRET")("TOKEN")).resolves.toBe(true);
  });

  it("should reject a v3 response with a different action", async () => {
    mockResponse({
      success: true,
      hostname: "opencerts.io",
      action: "login",
      score: 0.9
    });
    await expect(recaptcha("SECRET", options)("TOKEN")).resolves.toBe(false);
  });

  it("should reject a v3 response with a low score", async () => {
    mockResponse({
      success: true,
      hostname: "opencerts.io",
      action: "email",
      score: 0.1
    });
    await expect(recaptcha("SECRET", options)("TOKEN")).resolves.toBe(false);
  });

  it("should accept a v3 response with the right action and a high score", async () => {
    mockResponse({
      success: true,
      hostname: "opencerts.io",
      action: "email",
      score: 0.9
    });
    await expect(recaptcha("SECRET", options)("TOKEN")).resolves.toBe(true);
  });
});
