const verify = require('./verify');

const certificateTampered = require("../../test/fixtures/tampered-certificate.json");

describe("verify", () => {
  it("returns a summary of all 4 test", async () => {
    const results = await verify(certificateTampered);

    expect(results).to.be.eql({
      hash: { valid: false },
      identity: { valid: false, identities: [undefined] },
      issued: {
        valid: false,
        issued: { "0x20bc9C354A18C8178A713B9BcCFFaC2152b53990": false }
      },
      revoked: {
        valid: true,
        revoked: { "0x20bc9C354A18C8178A713B9BcCFFaC2152b53990": false }
      },
      valid: false
    });
  }).timeout(5000);
});
