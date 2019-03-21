const ethers = require("ethers");
const abi = require("../common/abi.json");

const NETWORK = "homestead";
const INFURA_API_KEY = "92c9a51428b946c1b8c1ac5a237616e4";

const provider = new ethers.providers.InfuraProvider(NETWORK, INFURA_API_KEY);

const issued = async (storeAddress, hash) => {
  const contract = new ethers.Contract(storeAddress, abi, provider);
  return contract.functions.isIssued(`0x${hash}`);
};

module.exports = issued;

describe.only("issued", () => {
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
