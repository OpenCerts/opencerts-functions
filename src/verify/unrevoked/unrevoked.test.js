const {
  getRevoked,
  getRevokedOnAll,
  verifyRevoked
} = require("./unrevoked");

describe.skip("verify/revoked", () => {
  describe("getRevoked", () => {
    it("returns true for revoked certificates", async () => {
      const isRevoked = await getRevoked(
        "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
        "0000000000000000000000000000000000000000000000000000000000000001"
      );
      expect(isRevoked).to.eql(true);
    }).timeout(5000);
    it("returns false for unrevoked certificates", async () => {
      const isRevoked = await getRevoked(
        "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
        "0000000000000000000000000000000000000000000000000000000000000000"
      );
      expect(isRevoked).to.eql(false);
    }).timeout(5000);
  });

  describe("getRevokedOnAll", () => {
    it("returns revoked status for all store", async () => {
      const isRevoked = await getRevokedOnAll(
        [
          "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
          "0x0000000000000000000000000000000000000000"
        ],
        "0000000000000000000000000000000000000000000000000000000000000001"
      );
      expect(isRevoked).to.eql({
        "0x007d40224f6562461633ccfbaffd359ebb2fc9ba": true,
        "0x0000000000000000000000000000000000000000": false
      });
    }).timeout(5000);
  });

  describe("verifyRevoked", () => {
    it("returns true for certificates not revoked on any store", async () => {
      const isRevoked = await verifyRevoked(
        [
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000001"
        ],
        "0000000000000000000000000000000000000000000000000000000000000001"
      );
      expect(isRevoked).to.eql({
        valid: true,
        revoked: {
          "0x0000000000000000000000000000000000000000": false,
          "0x0000000000000000000000000000000000000001": false
        }
      });
    }).timeout(5000);

    it("returns false for certificates revoked on all stores", async () => {
      const isRevoked = await verifyRevoked(
        ["0x007d40224f6562461633ccfbaffd359ebb2fc9ba"],
        "0000000000000000000000000000000000000000000000000000000000000001"
      );
      expect(isRevoked).to.eql({
        valid: false,
        revoked: {
          "0x007d40224f6562461633ccfbaffd359ebb2fc9ba": true
        }
      });
    }).timeout(5000);

    it("returns false for certificates not revoked on all stores", async () => {
      const isRevoked = await verifyRevoked(
        [
          "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
          "0x0000000000000000000000000000000000000000"
        ],
        "0000000000000000000000000000000000000000000000000000000000000001"
      );
      expect(isRevoked).to.eql({
        valid: false,
        revoked: {
          "0x0000000000000000000000000000000000000000": false,
          "0x007d40224f6562461633ccfbaffd359ebb2fc9ba": true
        }
      });
    }).timeout(5000);
  });
});
