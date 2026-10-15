const fetch = require("node-fetch").default;
const { URLSearchParams } = require("url");

const recaptcha =
  (secret, { allowedHostnames = [], action, minScore } = {}) =>
  async (response) => {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", response);
    const result = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: params
      }
    ).then((res) => res.json());

    if (!result.success) return false;
    // reject tokens solved on sites other than ours
    if (
      allowedHostnames.length > 0 &&
      !allowedHostnames.includes(result.hostname)
    ) {
      return false;
    }
    // action and score are only returned by reCAPTCHA v3
    if (action && result.action !== undefined && result.action !== action) {
      return false;
    }
    if (result.score !== undefined && result.score < minScore) return false;
    return true;
  };

module.exports = recaptcha;
