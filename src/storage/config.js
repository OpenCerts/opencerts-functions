const config = () =>
  process.env.IS_OFFLINE
    ? {
        s3: {
          accessKeyId: "localAccessKeyID",
          secretAccessKey: "localAccessKey",
          region: "us-west-2",
          bucketName: "dlt-oa-doc-storage-stg"
        },
        network:
          process.env.NETWORK === "undefined"
            ? "homestead"
            : process.env.NETWORK
      }
    : {
        s3: {
          accessKeyId: process.env.SES_KEY_ID,
          secretAccessKey: process.env.SES_SECRET,
          region: process.env.SES_REGION || "us-west-2",
          bucketName: process.env.OA_DOC_STORAGE_TABLE
        },
        network:
          process.env.NETWORK === "undefined"
            ? "homestead"
            : process.env.NETWORK
      };

module.exports = config();
