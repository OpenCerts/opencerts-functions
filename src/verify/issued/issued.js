const ethers = require("ethers");
const { every, values } = require("lodash");
const abi = require("../common/abi.json");

const NETWORK = "homestead";
const INFURA_API_KEY = "92c9a51428b946c1b8c1ac5a237616e4";

const provider = new ethers.providers.InfuraProvider(NETWORK, INFURA_API_KEY);

// TODO Possible to use a cache to speed up lookups
const getIssued = async (storeAddress, hash) => {
  try {
    const contract = new ethers.Contract(storeAddress, abi, provider);
    const issued = await contract.functions.isIssued(`0x${hash}`);
    return issued;
  } catch (e) {
    // If contract is not deployed, the function will throw. It should return false if there is errors.
    return false;
  }
};

const getIssuedOnAll = async (storeAddresses = [], hash) => {
  const issued = {};
  for (const address of storeAddresses) {
    const isIssued = await getIssued(address, hash);
    issued[address] = isIssued;
  }
  return issued;
};

const verifyIssued = async (storeAddresses = [], hash) => {
  const issued = await getIssuedOnAll(storeAddresses, hash);
  const issuedValues = values(issued);
  const valid =
    every(issuedValues, isTrue => isTrue === true) && issuedValues.length > 0;
  return {
    valid,
    issued
  };
};

module.exports = {
  getIssued,
  getIssuedOnAll,
  verifyIssued
};
