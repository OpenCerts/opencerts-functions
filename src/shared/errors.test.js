const { ClientError, errorResponse, logError, parseBody } = require("./errors");

describe("errorResponse", () => {
  it("should return the message of a client error with the request id", () => {
    const response = errorResponse(new ClientError("Invalid certificate"), {
      awsRequestId: "REQUEST_ID"
    });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: "Invalid certificate",
      requestId: "REQUEST_ID"
    });
  });

  it("should hide the message of any other error and log it instead", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error(
      "Email address is not verified: someone@example.com"
    );
    const response = errorResponse(error, { awsRequestId: "REQUEST_ID" });
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      error: "An unexpected error occurred",
      requestId: "REQUEST_ID"
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("Email address is not verified");
    expect(spy.mock.calls[0][0]).toContain("[email redacted]");
    expect(spy.mock.calls[0][0]).not.toContain("someone@example.com");
    spy.mockRestore();
  });
});

describe("logError", () => {
  it("should redact email addresses but keep module paths", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Rejected: first.last+tag@sub.example.co");
    error.stack = `${error.message}\n    at verify (/var/task/node_modules/@trustvc/trustvc/dist/index.js:1:2)`;
    logError(error);
    expect(spy.mock.calls[0][0]).toBe(
      "Rejected: [email redacted]\n    at verify (/var/task/node_modules/@trustvc/trustvc/dist/index.js:1:2)"
    );
    spy.mockRestore();
  });
});

describe("parseBody", () => {
  it("should parse a json body", () => {
    expect(parseBody({ body: '{"to":"a@example.com"}' })).toEqual({
      to: "a@example.com"
    });
  });

  it("should throw a client error for an invalid body", () => {
    expect(() => parseBody({ body: "{" })).toThrow(ClientError);
    expect(() => parseBody({ body: "{" })).toThrow("Invalid request body");
  });
});
