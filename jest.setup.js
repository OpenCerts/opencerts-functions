require("dotenv").config();

// Polyfill Web Streams API globals for Jest's VM sandbox (undici/jsonld-signatures require these)
const {
  ReadableStream,
  WritableStream,
  TransformStream
} = require("node:stream/web");

if (!global.ReadableStream) global.ReadableStream = ReadableStream;
if (!global.WritableStream) global.WritableStream = WritableStream;
if (!global.TransformStream) global.TransformStream = TransformStream;

// Jest runs each test file in its own vm context, which has no CryptoKey global. The data-integrity
// key libraries guard on `publicKey instanceof CryptoKey`, so without this every W3C signature
// check fails with "Right-hand side of 'instanceof' is not an object".
if (typeof global.CryptoKey === "undefined") {
  global.CryptoKey = {
    [Symbol.hasInstance]: (value) => value?.constructor?.name === "CryptoKey"
  };
}

jest.setTimeout(15000); // verify endpoint is a bit slow can take up to 10 seconds
