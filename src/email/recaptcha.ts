import fetch from "node-fetch";
import { URLSearchParams } from "url";

export const recaptcha = (secret: string) => async (response: string) => {
  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", response);
  return fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: params,
  })
    .then((res) => res.json())
    .then((res) => res.success);
};
