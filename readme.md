# OpenAttestation Function

## Verify

This function will perform a 3 step check for documents issued under OpenAttestaion or OpenCerts format. The function checkes for

- document is issued on document store
- document is not revoked on document store
- document has not been tampered with

This function does not check the identity of the issuer as current implementations make use of centralised registries. A decentralised identity check is currently underway to check for the identity of the issuer.

Example:

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"document":"<OA_DOCUMENT_HERE>"}' \
  https://api.opencerts.io/verify
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

## Storage (TBD)

This function is currently being developed to transfer a OpenAttestation document via QR. There are two parts of the function to upload and then download the document. 

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
