const { promisifyClient } = require("./dynamoDb");

describe("promisifyClient", () => {
  it("should create a method that returns the res.Item on success", async () => {
    const data = {Item: "RETURNED_RESULTS"}
    const mockMethod = jest.fn((_param, callback) => callback(null, data));
    const mockClient = { methodName: mockMethod };

    const method = promisifyClient("methodName", mockClient);
    const callParams = {foo: "bar", sheep: "baa"}
    const results = await method(callParams);
    expect(results).toEqual(data.Item);
    expect(mockMethod.mock.calls[0][0]).toEqual(callParams);
  });

  it("should create a method that returns the res.Items on success", async () => {
    const data = {Items: "RETURNED_RESULTS"}
    const mockMethod = jest.fn((_param, callback) => callback(null, data));
    const mockClient = { methodName: mockMethod };

    const method = promisifyClient("methodName", mockClient);
    const callParams = {foo: "bar", sheep: "baa"}
    const results = await method(callParams);
    expect(results).toEqual(data.Items);
    expect(mockMethod.mock.calls[0][0]).toEqual(callParams);
  });

  it("should throw when the client returns error", async () => {
    const mockMethod = jest.fn((_param, callback) => callback(new Error("ERROR_OCCURED")));
    const mockClient = { methodName: mockMethod };
    const method = promisifyClient("methodName", mockClient);
    await expect(method()).rejects.toThrow("ERROR_OCCURED");
  });
});