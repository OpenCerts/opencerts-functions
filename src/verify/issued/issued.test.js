const issued = require("./issued");

describe("verify/issued", () => {
  it("returns true for issued certificates", async () => {
    const isIssued = await issued(
      "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
      "1a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"
    );
    expect(isIssued).to.eql(true);
  }).timeout(5000);
  it("returns flase for unissued certificates", async () => {
    const isIssued = await issued(
      "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
      "0000000000000000000000000000000000000000000000000000000000000000"
    );
    expect(isIssued).to.eql(false);
  }).timeout(5000);
});
