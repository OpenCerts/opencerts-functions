/**
 * @jest-environment node
 */
const { isValidOpenCert } = require("@trustvc/trustvc");
const { verify, verifyRequestDocument } = require("./verify");
const { ClientError } = require("./errors");

const singleCredential = require("../../test/fixtures/presentations/valid/single_credential.json");
const twoCredentials = require("../../test/fixtures/presentations/valid/two_credentials.json");
const mixedSuites = require("../../test/fixtures/presentations/valid/mixed_suites.json");
const credentialExpired = require("../../test/fixtures/presentations/invalid/credential_expired.json");
const presentationExpired = require("../../test/fixtures/presentations/invalid/presentation_expired.json");
const tamperedCredential = require("../../test/fixtures/presentations/invalid/tampered_credential.json");
const unsigned = require("../../test/fixtures/presentations/invalid/unsigned.json");
const holderMismatch = require("../../test/fixtures/presentations/invalid/holder_mismatch.json");

const VP_FRAGMENT_NAMES = [
  "W3CVpSignatureIntegrity",
  "W3CVpCredentialStatus",
  "W3CVpIssuerIdentity"
];

// These fixtures are signed with did:key, so verification resolves locally and makes no chain call.
jest.setTimeout(60000);

describe("verify - verifiable presentation", () => {
  describe.each([
    ["single_credential", singleCredential],
    ["two_credentials", twoCredentials],
    ["mixed_suites", mixedSuites]
  ])("%s", (_name, fixture) => {
    it("should be verified by the presentation verifiers and pass", async () => {
      const fragments = await verify(fixture);

      const vpFragments = fragments.filter((fragment) =>
        VP_FRAGMENT_NAMES.includes(fragment.name)
      );
      expect(vpFragments.map((fragment) => fragment.status)).toEqual([
        "VALID",
        "VALID",
        "VALID"
      ]);
      expect(isValidOpenCert(fragments)).toBe(true);
    });
  });

  describe.each([
    ["credential_expired", credentialExpired, "DOCUMENT_STATUS"],
    ["presentation_expired", presentationExpired, "DOCUMENT_STATUS"],
    ["tampered_credential", tamperedCredential, "DOCUMENT_INTEGRITY"],
    ["unsigned", unsigned, "DOCUMENT_INTEGRITY"],
    ["holder_mismatch", holderMismatch, "DOCUMENT_INTEGRITY"]
  ])("%s", (_name, fixture, failingType) => {
    it(`should fail on ${failingType}`, async () => {
      const fragments = await verify(fixture);

      expect(isValidOpenCert(fragments)).toBe(false);
      expect(isValidOpenCert(fragments, [failingType])).toBe(false);
    });
  });
});

describe("verifyRequestDocument", () => {
  it.each([undefined, null, "document"])(
    "should throw a client error for a missing document %p",
    async (document) => {
      await expect(verifyRequestDocument(document)).rejects.toThrow(
        new ClientError("Missing document")
      );
    }
  );

  it("should replace a library error with a generic client error", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const document = {
      get network() {
        throw new Error("internal library details");
      }
    };
    const error = verifyRequestDocument(document);
    await expect(error).rejects.toBeInstanceOf(ClientError);
    await expect(error).rejects.toThrow("Invalid document");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("should return the fragments of a valid document", async () => {
    const fragments = await verifyRequestDocument(singleCredential);
    expect(isValidOpenCert(fragments)).toBe(true);
  });
});
