import AWS, { S3 } from "aws-sdk";
import { config } from "../config";
import createError from "http-errors";
import { getLogger } from "../../logger";

const { error } = getLogger("storage");

const s3bucket = new AWS.S3(config.s3);

export const put = (params: S3.Types.PutObjectRequest) =>
  s3bucket.upload(params).promise();

export const get = (params: S3.Types.GetObjectRequest) =>
  s3bucket
    .getObject(params)
    .promise()
    .then((results) => {
      if (results && results.Body) {
        return JSON.parse(results.Body.toString());
      }
      error(`No Document Found: ${JSON.stringify({ params })}`);
      throw new createError.BadRequest("No Document Found");
    })
    .catch((err) => {
      // locally the error is slightly different, so we catch it and make it consistent
      error(
        `Error with S3 get: ${JSON.stringify({ params, message: err.message })}`
      );
      if (err.message === "The specified key does not exist.") {
        throw new createError.BadRequest("Access Denied");
      }
      throw err;
    });

export const remove = (params: S3.Types.DeleteObjectRequest) =>
  s3bucket.deleteObject(params).promise();
