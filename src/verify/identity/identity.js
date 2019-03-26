const { get, every, values, zipObject } = require("lodash");
const { getIdentity } = require("../common/identityRegistry");

const getIdentities = async (addresses = []) => {
  const identities = {};
  for (const address of addresses) {
    const id = await getIdentity(address);
    identities[address] = id;
  }
  return identities;
};

const isAllIdentityValid = (identities = {}) => {
  const identityValues = values(identities);
  const valid =
    every(identityValues, isTrue => isTrue) &&
    identityValues.length > 0;
  return valid;
};

const getIdentitySummary = async (addresses = []) => {
  const identities = await getIdentities(addresses);
  const valid = isAllIdentityValid(identities);
  return {
    valid,
    identities
  };
};

module.exports = {
  getIdentities,
  isAllIdentityValid,
  getIdentitySummary
};
