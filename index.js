require("dotenv").config();
const cors = require("cors");
const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const recaptcha = require("./src/recaptcha");
const certificateMailer = require("./src/mailer/mailerWithSESTransporter");

const captchaValidator = recaptcha(process.env.RECAPTCHA_SECRET);
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.post("/", async (req, res) => {
  try {
    const { to, data, captcha } = req.body;

    // Validate captcha
    const valid = await captchaValidator(captcha);
    if (!valid) throw new Error("Invalid captcha");

    // Send certificate out
    const certificate = JSON.parse(data);
    await certificateMailer({ to, certificate });

    res.send("OK");
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
    res.status(500).send({ error: "Request failed" });
  }
});

module.exports.handler = serverless(app);
