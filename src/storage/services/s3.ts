import AWS, { S3 } from "aws-sdk";
import { config } from "../config";
import createError from "http-errors";

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
      throw new createError.BadRequest("No Document Found");
    })
    .catch((error) => {
      // locally the error is slightly different, so we catch it and make it consistent
      if (error.message === "The specified key does not exist.") {
        throw new createError.BadRequest("Access Denied");
      }
      throw error;
    });

export const remove = (params: S3.Types.DeleteObjectRequest) =>
  s3bucket.deleteObject(params).promise();
