const path = require("path");
const slsw = require("serverless-webpack");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const coreJsFnStubs = path.resolve(__dirname, "../../_stubs_/core-js-fn");

module.exports = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  devtool: slsw.lib.webpack.isLocal
    ? "eval-cheap-module-source-map"
    : "source-map",
  entry: "./index.js",
  target: "node22",
  externals: [
    ({ request }, callback) => {
      if (/^@trustvc\//.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
      return callback();
    }
  ],
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, ".webpack"),
    filename: "index.js"
  },
  resolve: {
    alias: {
      "core-js/fn": coreJsFnStubs
    }
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^(bufferutil|utf-8-validate|rdf-canonize-native)$/
    })
  ],
  optimization: {
    minimize: !slsw.lib.webpack.isLocal,
    concatenateModules: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false
        }
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
        type: "javascript/auto"
      }
    ]
  }
};
