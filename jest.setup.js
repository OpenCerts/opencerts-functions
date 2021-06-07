process.env.BUCKET_NAME = "oa-functions-transfer-document-storage";

// Please note that the `test:e2e:local` will automatically setup the endpoint for the different API for you. Indeed the command set the environment variable `OFFLINE` to true and here we automatically set the endpoint address when the `OFFLINE` variable is set.
if (process.env.IS_OFFLINE === "true") {
  process.env.STORAGE_ENDPOINT = "http://localhost:5000/stg";
  process.env.VERIFY_ENDPOINT = "http://localhost:4000/stg";
  process.env.EMAIL_ENDPOINT = "http://localhost:3000/stg";
}

jest.setTimeout(15000); // verify endpoint is a bit slow can take up to 10 seconds
