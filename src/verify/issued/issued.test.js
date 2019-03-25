const { getIssued, getIssuedOnAll, verifyIssued } = require("./issued");

describe("verify/issued", () => {
  describe("getIssued", () => {
    it("returns true for issued certificates", async () => {
      const isIssued = await getIssued(
        "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
        "1a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"
      );
      expect(isIssued).to.eql(true);
    }).timeout(5000);
    it("returns false for unissued certificates", async () => {
      const isIssued = await getIssued(
        "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
        "0000000000000000000000000000000000000000000000000000000000000000"
      );
      expect(isIssued).to.eql(false);
    }).timeout(5000);
  });

  describe("getIssuedOnAll", () => {
    it("returns issued status for all store", async () => {
      const isIssued = await getIssuedOnAll(
        [
          "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
          "0x0000000000000000000000000000000000000000"
        ],
        "1a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"
      );
      expect(isIssued).to.eql({
        "0x007d40224f6562461633ccfbaffd359ebb2fc9ba": true,
        "0x0000000000000000000000000000000000000000": false
      });
    }).timeout(5000);
  });

  describe("verifyIssued", () => {
    it("returns true for certificates issued on all stores", async () => {
      const isIssued = await verifyIssued(
        ["0x007d40224f6562461633ccfbaffd359ebb2fc9ba"],
        "1a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"
      );
      expect(isIssued).to.eql({
        valid: true,
        issued: {
          "0x007d40224f6562461633ccfbaffd359ebb2fc9ba": true
        }
      });
    }).timeout(5000);

    it("returns false for certificates not issued on all stores", async () => {
      const isIssued = await verifyIssued(
        [
          "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
          "0x0000000000000000000000000000000000000000"
        ],
        "1a040999254caaf7a33cba67ec6a9b862da1dacf8a0d1e3bb76347060fc615d6"
      );
      expect(isIssued).to.eql({
        valid: false,
        issued: {
          "0x0000000000000000000000000000000000000000": false,
          "0x007d40224f6562461633ccfbaffd359ebb2fc9ba": true
        }
      });
    }).timeout(5000);
  });
});
