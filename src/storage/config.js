module.exports = {
  dynamodb: {
    accessKeyId: process.env.SES_KEY_ID,
    secretAccessKey: process.env.SES_SECRET,
    region: process.env.SES_REGION || "us-west-2",
    storageTableName: process.env.OA_DOC_STORAGE_TABLE
  }
};
