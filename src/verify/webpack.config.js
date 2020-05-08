const path = require("path");
const slsw = require("serverless-webpack");

module.exports = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  devtool: slsw.lib.webpack.isLocal
    ? "cheap-module-eval-source-map"
    : "source-map",
  entry: "./index.js",
  target: "node",
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, ".webpack"),
    filename: "index.js"
  }
};
