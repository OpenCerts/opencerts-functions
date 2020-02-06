# OpenAttestation Function

## Verify

The function invokes [@govtechsg/opencerts-verify](https://github.com/OpenCerts/verify) library and returns the result of the verifications performed on the provided document.

To get more information, please refer to:

- [ADR about OpenAttestation verifications](https://github.com/Open-Attestation/adr/blob/master/verifier.md): The ADR explains in details the whole process for the verification as well as the different terms used.
- [@govtechsg/oa-verify](https://github.com/Open-Attestation/oa-verify): Implementation of OpenAttestation verifier ADR. [@govtechsg/opencerts-verify](https://github.com/OpenCerts/verify) is built on top of this library.
- [@govtechsg/opencerts-verify](https://github.com/OpenCerts/verify): Extension of [@govtechsg/oa-verify](https://github.com/Open-Attestation/oa-verify) providing a new verifier checking issuer identity upon Opencerts registry.

### Usage

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"document":"<OA_DOCUMENT_HERE>"}' \
  https://api.opencerts.io/verify
```

### Response

- `summary` is an object containing the verification for each fragment types as well as the consolidated result.
  - `summary.all` is a boolean indicating whether the document is valid for all fragment types.
  - `summary.documentStatus` is a boolean indicating whether the document is valid for fragment with `DOCUMENT_STATUS` type.
  - `summary.documentIntegrity` is a boolean indicating whether the document is valid for fragment with `DOCUMENT_INTEGRITY` type.
  - `summary.issuerIdentity` is a boolean indicating whether the document is valid for fragment with `ISSUER_IDENTITY` type.
- `data` is an array containing the fragments returned by all the verifiers that ran over the provided document.

Example:

```json
{
  "summary": {
    "all": true,
    "documentStatus": true,
    "documentIntegrity": true,
    "issuerIdentity": true
  },
  "data": [
    {
      "type": "DOCUMENT_INTEGRITY",
      "name": "OpenAttestationHash",
      "data": true,
      "status": "VALID"
    },
    {
      "name": "OpenAttestationEthereumDocumentStoreIssued",
      "type": "DOCUMENT_STATUS",
      "data": {
        "issuedOnAll": true,
        "details": [
          {
            "address": "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
            "issued": true
          }
        ]
      },
      "status": "VALID"
    },
    {
      "status": "SKIPPED",
      "type": "DOCUMENT_STATUS",
      "name": "OpenAttestationEthereumTokenRegistryMinted",
      "reason": {
        "code": 4,
        "codeString": "SKIPPED",
        "message": "Document issuers doesn't have \"tokenRegistry\" property or TOKEN_REGISTRY method"
      }
    },
    {
      "name": "OpenAttestationEthereumDocumentStoreRevoked",
      "type": "DOCUMENT_STATUS",
      "data": {
        "revokedOnAny": false,
        "details": [
          {
            "address": "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
            "revoked": false
          }
        ]
      },
      "status": "VALID"
    },
    {
      "status": "SKIPPED",
      "type": "ISSUER_IDENTITY",
      "name": "OpenAttestationDnsTxt",
      "reason": {
        "code": 2,
        "codeString": "SKIPPED",
        "message": "Document issuers doesn't have \"documentStore\" / \"tokenRegistry\" property or doesn't use DNS-TXT type"
      }
    },
    {
      "type": "ISSUER_IDENTITY",
      "name": "OpencertsRegistryVerifier",
      "status": "VALID",
      "data": [
        {
          "status": "VALID",
          "value": "0x007d40224f6562461633ccfbaffd359ebb2fc9ba",
          "name": "Government Technology Agency of Singapore (GovTech)",
          "displayCard": true,
          "website": "https://www.tech.gov.sg",
          "email": "info@tech.gov.sg",
          "phone": "+65 6211 2100",
          "logo": "/static/images/GOVTECH_logo.png",
          "id": "govtech-registry"
        }
      ]
    }
  ]
}
```

## Email

This function sends email on behalf of OpenCerts user to another recipient. This function is for OpenCerts documents only.

Example (with captcha):

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"to": "someone@example.com", "captcha": "<CAPTCHA_SECRET>", "certificate":"<OA_DOCUMENT_HERE>"}' \
  https://api.opencerts.io/email
```

Example (with API KEY):

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"to": "someone@example.com", "X-API-KEY": "<API_KEY>", "certificate":"<OA_DOCUMENT_HERE>"}' \
  https://api.opencerts.io/email
```

# Development

Copy `.env` from a co-worker or insert own credentials to get started. A copy of the .env file is available at `.env.example`

```
npm run dev
```

To run local tests against dynamodb-local, run commands

`npm run dev` to start the local database

`npm run integration:local` to run the tests

## Dynamodb

The development environment uses [serverless-dynamodb-local](https://www.npmjs.com/package/serverless-dynamodb-local) to emulate the dynamodb in AWS.

Install dynamodb locally

```
sls dynamodb install
```

Start dynamodb

```
sls dynamodb start
```
