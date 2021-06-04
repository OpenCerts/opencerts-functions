import aws from "aws-sdk";
import nodemailer from "nodemailer";
import { mailer } from "./mailer";
import { config } from "../config";

const SES = new aws.SES({
  apiVersion: "2010-12-01",
  accessKeyId: config.ses.accessKeyId,
  secretAccessKey: config.ses.secretAccessKey,
  region: config.ses.region,
});

const sesTransporter = nodemailer.createTransport({ SES });
export const certificateMailer = mailer(sesTransporter);
