require("dotenv").config();
const recaptcha = require("./recaptcha");
const certificateMailer = require("./mailer/mailerWithSESTransporter");

const captchaValidator = recaptcha(process.env.RECAPTCHA_SECRET);

const email = async ({ to, data, captcha }) => {
  // Validate captcha
  const valid = await captchaValidator(captcha);
  if (!valid) throw new Error("Invalid captcha");

  // Send certificate out
  const certificate = JSON.parse(data);
  await certificateMailer({ to, certificate });
};

module.exports.handler = (event, _context, callback) => {
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