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
