module.exports = {
  ses: {
    accessKeyId: process.env.SES_KEY_ID,
    secretAccessKey: process.env.SES_SECRET,
    region: process.env.SES_REGION || "us-west-2"
  },
  recaptchaSecret: process.env.RECAPTCHA_SECRET,
  emailApiKeys:
    (process.env.EMAIL_API_KEYS && process.env.EMAIL_API_KEYS.split(":")) || []
};
