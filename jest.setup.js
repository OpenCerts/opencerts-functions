process.env.BUCKET_NAME = "oa-functions-transfer-document-storage";

// this path runs for test:e2e:local and the ports are set in each API's serverless.yml
if (process.env.IS_OFFLINE === "true") {
  process.env.STORAGE_ENDPOINT = "http://localhost:5000/stg";
  process.env.VERIFY_ENDPOINT = "http://localhost:4000/stg";
  process.env.EMAIL_ENDPOINT = "http://localhost:3000/stg";
}

jest.setTimeout(15000); // verify endpoint is a bit slow can take up to 10 seconds
