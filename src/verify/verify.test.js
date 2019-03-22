const {get} = require("lodash");
const { certificateData } = require("@govtechsg/open-certificate");
const hash = require("./hash/hash");
const identity = require("./identity/identity");
const issued = require("./issued/issued");
const unrevoked = require("./unrevoked/unrevoked");

const certificateTampered = require("../../test/fixtures/tampered-certificate.json");


describe.skip("verify", () => {
  it("works", () => {
    const verify = certificate => {
        const validHash = hash(certificate);

        const data = certificateData(certificate);
        const identity = get(data, "issuers")
    };

    verify(certificateTampered);
  });
});
