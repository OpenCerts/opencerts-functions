const middy = require("middy");
const { get } = require("lodash");
const { cors } = require("middy/middlewares");
const verify = require("@govtechsg/oa-verify");

require("dotenv").config();
const recaptcha = require("./recaptcha");
const certificateMailer = require("./mailer/mailerWithSESTransporter");
const config = require("./config");

const captchaValidator = recaptcha(config.recaptchaSecret);

const validateApiKey = key => {
  if (!key) return false;
  if (config.emailApiKeys.includes(key)) {
    return true;
  }
  throw new Error("Invalid API key");
};

const handleEmail = async (event, _context, callback) => {
  try {
    const { to, data, captcha } = JSON.parse(event.body);

    // Validate captcha if api key is not present
    const apiKey = get(event, "headers['X-API-KEY']");
    if (!validateApiKey(apiKey)) {
      const valid = await captchaValidator(captcha);
      if (!valid) throw new Error("Invalid captcha or missing API key");
    }

    // Verify Certificate
    const verificationResults = await verify(data, config.network);
    if (!verificationResults || !verificationResults.valid) {
      throw new Error("Invalid certificate");
    }

    // Send certificate out
    await certificateMailer({ to, certificate: data });

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    });
  } catch (e) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ error: e.message })
    });
  }
};

const handler = middy(handleEmail).use(cors());

module.exports = { handler };
