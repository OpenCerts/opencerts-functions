const {
  getIdentity,
  getIdentities,
  isAllIdentityValid,
  verifyAddresses
} = require("./identity");

describe("verify/getIdentity", () => {
  it("returns getIdentity for identified issuer address", async () => {
    const address = "0x007d40224f6562461633ccfbaffd359ebb2fc9ba";
    const identified = await getIdentity(address);
    expect(identified).to.eql(
      "Government Technology Agency of Singapore (GovTech)"
    );
  });

  it("returns getIdentity for identified issuer address in other cases", async () => {
    const address = "0X007D40224F6562461633CCFBAFFD359EBB2FC9BA";
    const identified = await getIdentity(address);
    expect(identified).to.eql(
      "Government Technology Agency of Singapore (GovTech)"
    );
  });

  it("returns undefined for unidentified issuers", async () => {
    const address = "0x0000000000000000000000000000000000000000";
    const identified = await getIdentity(address);
    expect(identified).to.eql(undefined);
  });
});

describe("verify/getIdentities", () => {
  it("returns getIdentity for identified issuer address", async () => {
    const addresses = [
      "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
      "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
      "0x897E224a6a8b72535D67940B3B8CE53f9B596800"
    ];
    const identities = await getIdentities(addresses);
    expect(identities).to.eql([
      "Government Technology Agency of Singapore (GovTech)",
      "ROPSTEN: Ngee Ann Polytechnic",
      "ROPSTEN: Singapore Institute of Technology"
    ]);
  });

  it("returns undefined for any unidentified issuers", async () => {
    const addresses = [
      "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
      "0xc36484efa1544c32ffed2e80a1ea9f0dfc517496",
      "0x897E224a6a8b72535D67940B3B8CE53f9B596800"
    ];
    const identities = await getIdentities(addresses);
    expect(identities).to.eql([
      "Government Technology Agency of Singapore (GovTech)",
      undefined,
      "ROPSTEN: Singapore Institute of Technology"
    ]);
  });
});

describe("verify/isAllIdentityValid", () => {
  it("return true if all issuers are identified", async () => {
    const verified = isAllIdentityValid([
      "Government Technology Agency of Singapore (GovTech)",
      "ROPSTEN: Ngee Ann Polytechnic",
      "ROPSTEN: Singapore Institute of Technology"
    ]);
    expect(verified).to.eql(true);
  });

  it("should return false if any issuers are not identified", async () => {
    const verified = isAllIdentityValid([
      "Government Technology Agency of Singapore (GovTech)",
      undefined,
      "ROPSTEN: Singapore Institute of Technology"
    ]);
    expect(verified).to.eql(false);
  });

  it("should return false if no identities are provided", async () => {
    const verified = isAllIdentityValid([]);
    expect(verified).to.eql(false);
  });
});

describe("verify/verifyAddresses", () => {
  it("returns summary of check on multiple address", async () => {
    const addresses = [
      "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
      "0xc36484efa1544c32ffed2e80a1ea9f0dfc517495",
      "0x897E224a6a8b72535D67940B3B8CE53f9B596800"
    ];
    const { valid, identities } = await verifyAddresses(addresses);
    expect(identities).to.eql([
      "Government Technology Agency of Singapore (GovTech)",
      "ROPSTEN: Ngee Ann Polytechnic",
      "ROPSTEN: Singapore Institute of Technology"
    ]);
    expect(valid).to.eql(true);
  });

  it("returns summary of check on multiple address", async () => {
    const addresses = [
      "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
      "0xc36484efa1544c32ffed2e80a1ea9f0dfc517496",
      "0x897E224a6a8b72535D67940B3B8CE53f9B596800"
    ];
    const { valid, identities } = await verifyAddresses(addresses);
    expect(identities).to.eql([
      "Government Technology Agency of Singapore (GovTech)",
      undefined,
      "ROPSTEN: Singapore Institute of Technology"
    ]);
    expect(valid).to.eql(false);
  });
});
