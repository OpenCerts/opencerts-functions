const config = () => {
  return process.env.IS_OFFLINE
    ? {
        dynamodb: {
          accessKeyId: "localAccessKeyID",
          secretAccessKey: "localAccessKey",
          region: "us-west-2",
          storageTableName: 'dlt-oa-doc-storage-stg'
        },
        network:
          process.env.NETWORK === "undefined"
            ? "homestead"
            : process.env.NETWORK
      }
    : {
        dynamodb: {
          accessKeyId: process.env.SES_KEY_ID,
          secretAccessKey: process.env.SES_SECRET,
          region: process.env.SES_REGION || "us-west-2",
          storageTableName: process.env.OA_DOC_STORAGE_TABLE
        },
        network:
          process.env.NETWORK === "undefined"
            ? "homestead"
            : process.env.NETWORK
      };
};

module.exports = config();
