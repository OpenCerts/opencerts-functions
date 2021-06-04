/* eslint-disable @typescript-eslint/ban-ts-comment */
import middy from "@middy/core";

// catch error not created with http-error and add a status code so that's it's correctly handled by http-error-handler
const onError: middy.MiddlewareFn = async (request) => {
  // @ts-ignore
  if (request.error && !request.error.statusCode) {
    // @ts-ignore
    request.error.statusCode = 400;
    request.error.message = `Something wrong happened: ${request.error.message}`;
  }
};

export const unknownErrorHandler = () => ({
  onError,
});
