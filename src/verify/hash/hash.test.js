const verify = require("./hash");
const certificate = require("../../../test/fixtures/certificate.json");
const certificateTampered = require("../../../test/fixtures/tampered-certificate.json");

describe("verify/hash", () => {
  it("should return true for untampered certificate", () => {
    expect(verify(certificate)).to.eql(true);
  });
  it("should return false for tampered certificate", () => {
    expect(verify(certificateTampered)).to.eql(false);
  });
});
