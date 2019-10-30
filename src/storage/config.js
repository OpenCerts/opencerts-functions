const AWS = require("aws-sdk");

const config = () =>
  process.env.IS_OFFLINE
    ? {
        s3: {
          s3ForcePathStyle: true,
          accessKeyId: process.env.stg_IAM_KEY_ID,
          secretAccessKey: process.env.stg_IAM_KEY_SECRET,
          region: "us-west-2",
          endpoint: new AWS.Endpoint("http://localhost:8000")
        },
        bucketName: process.env.stg_BUCKET_NAME,
        network:
          process.env.stg_NETWORK === "undefined"
            ? "ropsten"
            : process.env.stg_NETWORK
      }
    : {
        s3: {
          accessKeyId: process.env.prd_IAM_KEY_ID,
          secretAccessKey: process.env.prd_IAM_KEY_SECRET,
          region: process.env.prd_SES_REGION || "us-west-2"
        },
        bucketName: process.env.prd_BUCKET_NAME,
        network:
          process.env.prd_NETWORK === "undefined"
            ? "homestead"
            : process.env.prd_NETWORK
      };

module.exports = config();
