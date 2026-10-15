// errors whose message is safe and useful to show to the caller
class ClientError extends Error {}

// requires a dotted domain and excludes "/" so module paths like node_modules/@scope/pkg are kept
const EMAIL_ADDRESS_REGEX =
  /[^\s@<>"',;:()[\]/]+@[^\s@<>"',;:()[\]/]+\.[a-z]{2,}/gi;

// errors from downstream services can contain recipient addresses, which must never be logged
const logError = (error) => {
  const details = (error && (error.stack || error.message)) || String(error);
  console.error(details.replace(EMAIL_ADDRESS_REGEX, "[email redacted]"));
};

// anything else may expose implementation details, so the caller only gets a generic
// message and the request id to correlate with the full error in the logs
const errorResponse = (error, { awsRequestId } = {}) => {
  if (error instanceof ClientError) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message, requestId: awsRequestId })
    };
  }
  logError(error);
  return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: "An unexpected error occurred",
      requestId: awsRequestId
    })
  };
};

const parseBody = (event) => {
  try {
    return JSON.parse(event.body);
  } catch (e) {
    throw new ClientError("Invalid request body");
  }
};

module.exports = { ClientError, errorResponse, logError, parseBody };
