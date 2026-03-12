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

jest.setTimeout(15000); // verify endpoint is a bit slow can take up to 10 seconds
