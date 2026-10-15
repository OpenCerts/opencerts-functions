module.exports = {
  ses: {
    accessKeyId: process.env.SES_KEY_ID,
    secretAccessKey: process.env.SES_SECRET,
    region: process.env.SES_REGION || "us-west-2"
  },
  recaptchaSecret: process.env.RECAPTCHA_SECRET,
  recaptcha: {
    allowedHostnames: (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
    action: process.env.RECAPTCHA_ACTION,
    minScore: Number(process.env.RECAPTCHA_MIN_SCORE || 0.5)
  },
  emailApiKeys:
    (process.env.EMAIL_API_KEYS && process.env.EMAIL_API_KEYS.split(":")) || []
};
