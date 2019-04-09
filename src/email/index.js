const middy = require("middy");
const { cors } = require("middy/middlewares");
const verify = require("@govtechsg/oa-verify");

require("dotenv").config();
const recaptcha = require("./recaptcha");
const certificateMailer = require("./mailer/mailerWithSESTransporter");
const config = require("./config");

const captchaValidator = recaptcha(config.recaptchaSecret);

const email = async ({ to, data, captcha }) => {
  // Validate captcha
  const valid = await captchaValidator(captcha);
  if (!valid) throw new Error("Invalid captcha");

  const certificate = data;

  // Verify Certificate
  const verificationResults = await verify(certificate, config.network);
  if (!verificationResults || !verificationResults.valid)
    throw new Error("Invalid certificate");

  // Send certificate out
  await certificateMailer({ to, certificate });
};

const handleEmail = (event, _context, callback) => {
  const body = JSON.parse(event.body);
  email(body)
    .then(() => {
      callback(null, {
        statusCode: 200,
        body: "OK"
      });
    })
    .catch(e => {
      callback(null, {
        statusCode: 501,
        body: e.message
      });
    });
};

const handler = middy(handleEmail).use(cors());

module.exports = { handler };
