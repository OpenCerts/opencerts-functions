import middy from "@middy/core";
import cors from "@middy/http-cors";
import { isValidOpenCert } from "@trustvc/trustvc";

import { verifyRequestDocument } from "../shared/verify";
import { ClientError, errorResponse, parseBody } from "../shared/errors";

const { get } = require("lodash");

const recaptcha = require("./recaptcha");
const { isValidRecipient } = require("./recipient");
const certificateMailer = require("./mailer/mailerWithSESTransporter");
const config = require("./config");

const captchaValidator = recaptcha(config.recaptchaSecret, config.recaptcha);

const validateApiKey = (key) => {
  if (!key) return false;
  if (config.emailApiKeys.includes(key)) {
    return true;
  }
  throw new ClientError("Invalid API key");
};

const handleEmail = async (event, context) => {
  try {
    const { to, data, captcha } = parseBody(event);

    if (!isValidRecipient(to)) {
      throw new ClientError("Recipient must be a single valid email address");
    }

    // Validate captcha if api key is not present
    const apiKey = get(event, "headers['X-API-KEY']");

    if (!validateApiKey(apiKey)) {
      const valid = await captchaValidator(captcha);
      if (!valid) throw new ClientError("Invalid captcha or missing API key");
    }

    // Verify Certificate
    const fragments = await verifyRequestDocument(data);
    if (!isValidOpenCert(fragments)) {
      throw new ClientError("Invalid certificate");
    }

    // Send certificate out
    await certificateMailer({ to, certificate: data });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (e) {
    return errorResponse(e, context);
  }
};

export const handler = middy().use(cors()).handler(handleEmail);
