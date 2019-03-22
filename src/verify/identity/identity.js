const axios = require("axios");
const { mapKeys } = require("lodash");

const REGISTRY_URL = "https://opencerts.io/static/registry.json";
const CACHE_TTL = 30 * 60 * 1000; // 30 min

let cachedRegistryResponse;
let cachedRegistryBestBefore;

const setCache = (res, expiry) => {
  cachedRegistryResponse = res;
  cachedRegistryBestBefore = expiry;
};

const isValidData = () =>
  !!cachedRegistryResponse && Date.now() < cachedRegistryBestBefore;

const fetchData = async () => {
  if (isValidData()) return;
  const res = await axios.get(REGISTRY_URL);
  setCache(res, Date.now() + CACHE_TTL);
};

const getIdentity = async (address = "") => {
  await fetchData();
  const {
    data: { issuers }
  } = cachedRegistryResponse;
  const lowercaseAddress = mapKeys(issuers, (_val, key) => key.toLowerCase());
  const getIdentity = lowercaseAddress[address.toLowerCase()];
  return getIdentity;
};

const getIdentities = async (addresses = []) => {
  const identities = [];
  for (const address of addresses) {
    const id = await getIdentity(address);
    identities.push(id);
  }
  return identities;
};

const isAllIdentityValid = (identities = []) => {
  return identities.reduce((prev, curr) => {
    return prev && !!curr;
  }, identities.length > 0 && true);
};

const verifyAddresses = async (addresses = []) => {
  const identities = await getIdentities(addresses);
  const valid = isAllIdentityValid(identities);
  return {
    valid,
    identities
  };
};

module.exports = {
  setCache,
  isValidData,
  getIdentity,
  getIdentities,
  isAllIdentityValid,
  verifyAddresses
};
