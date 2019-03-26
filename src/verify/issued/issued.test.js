const sinon = require("sinon");
const proxyquire = require("proxyquire");
const documentStore = sinon.stub();
const {
  getIssued,
  getIssuedOnAll,
  getIssuedSummary,
  verifyIssued
} = proxyquire("./issued", {
  "../common/documentStore": documentStore
});
const certificateTampered = require("../../../test/fixtures/tampered-certificate.json");

describe.only("verify/issued", () => {
  beforeEach(() => {
    documentStore.reset();
  });
  describe("getIssued", () => {
    it("returns true if certificate is issued", async () => {
      documentStore.resolves(true);
      const isIssued = await getIssued("DocumentStoreAdd", "MerkleRoot");
      expect(documentStore.args[0]).to.eql([
        "DocumentStoreAdd",
        "isIssued",
        "0xMerkleRoot"
      ]);
      expect(isIssued).to.eql(true);
    });

    it("returns false if certificate is not issued", async () => {
      documentStore.resolves(false);
      const isIssued = await getIssued("DocumentStoreAdd", "MerkleRoot");
      expect(documentStore.args[0]).to.eql([
        "DocumentStoreAdd",
        "isIssued",
        "0xMerkleRoot"
      ]);
      expect(isIssued).to.eql(false);
    });

    it("returns false if documentStore throws", async () => {
      documentStore.rejects(new Error("An Error"));
      const isIssued = await getIssued("DocumentStoreAdd", "MerkleRoot");
      expect(documentStore.args[0]).to.eql([
        "DocumentStoreAdd",
        "isIssued",
        "0xMerkleRoot"
      ]);
      expect(isIssued).to.eql(false);
    });
  });

  describe("getIssuedOnAll", () => {
    it("returns issued status for all store", async () => {
      documentStore.onCall(0).resolves(true);
      documentStore.onCall(1).resolves(false);

      const isIssued = await getIssuedOnAll(["Store1", "Store2"], "MerkleRoot");
      expect(isIssued).to.eql({
        Store1: true,
        Store2: false
      });
    });
  });

  describe("getIssuedSummary", () => {
    it("returns true for certificates issued on all stores", async () => {
      documentStore.resolves(true);
      const isIssued = await getIssuedSummary(
        ["Store1", "Store2"],
        "MerkleRoot"
      );
      expect(isIssued).to.eql({
        valid: true,
        issued: {
          Store1: true,
          Store2: true
        }
      });
    });

    it("returns false when certificates is not issued on any stores", async () => {
      documentStore.onCall(0).resolves(false);
      documentStore.onCall(1).resolves(true);
      const isIssued = await getIssuedSummary(
        ["Store1", "Store2"],
        "MerkleRoot"
      );
      expect(isIssued).to.eql({
        valid: false,
        issued: {
          Store1: false,
          Store2: true
        }
      });
    });
  });

  describe("verifyIssued", () => {
    it("returns the summary of the issued check, given a certificate", async () => {
      documentStore.resolves(true);
      const verifySummary = await verifyIssued(certificateTampered);
      expect(verifySummary).to.eql({
        valid: true,
        issued: {
          "0x20bc9C354A18C8178A713B9BcCFFaC2152b53990": true
        }
      });
    });
  });
});
