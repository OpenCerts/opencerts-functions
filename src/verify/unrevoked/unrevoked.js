const ethers = require("ethers");
const abi = require("../common/abi.json");

const NETWORK = "homestead";
const INFURA_API_KEY = "92c9a51428b946c1b8c1ac5a237616e4";

const provider = new ethers.providers.InfuraProvider(NETWORK, INFURA_API_KEY);

const unrevoked = async (storeAddress, hash) => {
  const contract = new ethers.Contract(storeAddress, abi, provider);
  const revoked = await contract.functions.isRevoked(`0x${hash}`);
  return !revoked;
};

module.exports = unrevoked;