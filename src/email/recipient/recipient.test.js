const { isValidRecipient } = require(".");

describe("isValidRecipient", () => {
  it.each([
    "someone@example.com",
    "first.last+tag@sub.example.co",
    "o'brien@example.com"
  ])("should accept %p", (to) => {
    expect(isValidRecipient(to)).toBe(true);
  });

  it.each([
    ["a list", ["a@example.com", "b@example.com"]],
    ["comma separated addresses", "a@example.com,b@example.com"],
    ["semicolon separated addresses", "a@example.com;b@example.com"],
    ["space separated addresses", "a@example.com b@example.com"],
    ["a display name", "Someone <a@example.com>"],
    ["a header injection", "a@example.com\r\nBcc: b@example.com"],
    ["a group", "group:a@example.com,b@example.com;"],
    ["an object", { address: "a@example.com" }],
    ["a missing domain", "someone@"],
    ["a missing tld", "someone@example"],
    ["a too long address", `${"a".repeat(250)}@example.com`],
    ["undefined", undefined]
  ])("should reject %s", (_, to) => {
    expect(isValidRecipient(to)).toBe(false);
  });
});
