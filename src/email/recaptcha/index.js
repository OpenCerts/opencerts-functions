const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

const recaptcha = secret => async response => {
  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", response);
  return fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: params
  })
    .then(res => res.json())
    .then(res => res.success);
};

module.exports = recaptcha;
