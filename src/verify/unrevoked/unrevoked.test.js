const unrevoked = require("./unrevoked");

describe("verify/unrevoked", () => {
  it("returns true for unrevoked certificates", async () => {
    const isUnrevoked = await unrevoked(
      "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
      "1a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"
    );
    expect(isUnrevoked).to.eql(true);
  }).timeout(5000);
  it("returns false for unrevoked certificates", async () => {
    const isUnrevoked = await unrevoked(
      "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
      "0000000000000000000000000000000000000000000000000000000000000001"
    );
    expect(isUnrevoked).to.eql(false);
  }).timeout(5000);
});
