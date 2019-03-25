const ethers = require("ethers");
const { every, values } = require("lodash");
const abi = require("../common/abi.json");

const NETWORK = "homestead";
const INFURA_API_KEY = "92c9a51428b946c1b8c1ac5a237616e4";

const provider = new ethers.providers.InfuraProvider(NETWORK, INFURA_API_KEY);

// TODO Possible to use a cache to speed up lookups
const getRevoked = async (storeAddress, hash) => {
  try {
    const contract = new ethers.Contract(storeAddress, abi, provider);
    const revoked = await contract.functions.isRevoked(`0x${hash}`);
    return revoked;
  } catch (e) {
    // If contract is not deployed, the function will throw. It should return false if there is errors.
    return false;
  }
};

const getRevokedOnAll = async (storeAddresses = [], hash) => {
  const revoked = {};
  for (const address of storeAddresses) {
    const isRevoked = await getRevoked(address, hash);
    revoked[address] = isRevoked;
  }
  return revoked;
};

const verifyRevoked = async (storeAddresses = [], hash) => {
  const revoked = await getRevokedOnAll(storeAddresses, hash);
  const revokedValues = values(revoked);
  const valid =
    every(revokedValues, isTrue => isTrue === false) &&
    revokedValues.length > 0;
  return {
    valid,
    revoked
  };
};

module.exports = {
  getRevoked,
  getRevokedOnAll,
  verifyRevoked
};
