const path = require("path");
const slsw = require("serverless-webpack");
const webpack = require("webpack");

module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  devtool: slsw.lib.webpack.isLocal ? "eval-cheap-module-source-map" : "source-map",
  entry: "./index.js",
  target: "node",
  plugins: [
    new webpack.ProvidePlugin({
      fetch: path.resolve(path.join(__dirname, "../", "fetch-shim"))
    })
  ],
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, ".webpack"),
    filename: "index.js"
  }
};
