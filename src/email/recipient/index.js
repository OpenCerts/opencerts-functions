// RFC 5321 limits an address to 254 characters
const MAX_EMAIL_LENGTH = 254;
// a single bare address: no whitespace, no display names and no list separators,
// since nodemailer splits recipients on "," and ";" and parses "Name <address>"
const EMAIL_REGEX =
  /^[^\s@,;<>()[\]":\\]+@[^\s@,;<>()[\]":\\]+\.[^\s@,;<>()[\]":\\]+$/;

const isValidRecipient = (to) =>
  typeof to === "string" &&
  to.length <= MAX_EMAIL_LENGTH &&
  EMAIL_REGEX.test(to);

module.exports = { isValidRecipient };
