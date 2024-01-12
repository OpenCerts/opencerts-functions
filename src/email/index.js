import middy from "@middy/core";
import cors from "@middy/http-cors";

const { get } = require("lodash");
const { isValid, verify } = require("@govtechsg/opencerts-verify");

const recaptcha = require("./recaptcha");
const certificateMailer = require("./mailer/mailerWithSESTransporter");
const config = require("./config");

const captchaValidator = recaptcha(config.recaptchaSecret);

const validateApiKey = (key) => {
  if (!key) return false;
  if (config.emailApiKeys.includes(key)) {
    return true;
  }
  throw new Error("Invalid API key");
};

const handleEmail = async (event) => {
  try {
    const { to, data, captcha } = JSON.parse(event.body);

    // Validate captcha if api key is not present
    const apiKey = get(event, "headers['X-API-KEY']");

    if (!validateApiKey(apiKey)) {
      const valid = await captchaValidator(captcha);
      if (!valid) throw new Error("Invalid captcha or missing API key");
    }

    // Verify Certificate
    const fragments = await verify({ network: config.network })(data);
    if (!isValid(fragments)) {
      throw new Error("Invalid certificate");
    }

    // Send certificate out
    await certificateMailer({ to, certificate: data });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message })
    };
  }
};

export const handler = middy().use(cors()).handler(handleEmail);
