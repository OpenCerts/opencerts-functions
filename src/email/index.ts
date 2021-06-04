import { get } from "lodash";
import middy from "@middy/core";
import cors from "@middy/http-cors";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import {
  isValid,
  openAttestationVerifiers,
  verificationBuilder,
} from "@govtechsg/oa-verify";
import { recaptcha } from "./recaptcha";
import { certificateMailer } from "./mailer/mailerWithSESTransporter";
import { config } from "./config";
import { unknownErrorHandler } from "../unknownErrorHandler";
import { String } from "runtypes";
import createError from "http-errors";

const captchaValidator = recaptcha(config.recaptchaSecret ?? "");

const verify = verificationBuilder(openAttestationVerifiers, {
  network: config.network,
});

const validateApiKey = (key: string) => {
  if (!key) return false;
  if (config.emailApiKeys.includes(key)) {
    return true;
  }
  throw new createError.BadRequest("Invalid API key");
};

const handleEmail = async (event: { body: any }) => {
  const { to, data, captcha } = event.body ?? {};
  if (
    // using object.keys to make sure data is an object, it's a bit dump though
    Object.keys(data ?? {}).length < 1 ||
    !String.guard(to)
  ) {
    throw new createError.BadRequest(
      "Please provide the document and a recipient"
    );
  }

  // Validate captcha if api key is not present
  const apiKey = get(event, "headers['X-API-KEY']");

  // eslint-disable-next-line no-console
  console.log(`API: ${apiKey}`);
  // eslint-disable-next-line no-console
  console.log(`ENV: ${process.env.EMAIL_API_KEYS}`);
  // eslint-disable-next-line no-console
  console.log(`Config: ${JSON.stringify(config)}`);

  if (!validateApiKey(apiKey)) {
    const valid = await captchaValidator(captcha);
    // eslint-disable-next-line no-console
    console.log(`Captcha: ${captcha}`);
    // eslint-disable-next-line no-console
    console.log(`Captcha isValid: ${valid}`);
    if (!valid)
      throw new createError.BadRequest("Invalid captcha or missing API key");
  }

  // Verify Certificate
  const fragments = await verify(data);
  if (!isValid(fragments)) {
    throw new createError.BadRequest("Invalid certificate");
  }

  // Send certificate out
  await certificateMailer({ to, certificate: data });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};

const handler = middy(handleEmail)
  .use(jsonBodyParser())
  .use(unknownErrorHandler())
  .use(httpErrorHandler())
  .use(cors());

module.exports = { handler };
