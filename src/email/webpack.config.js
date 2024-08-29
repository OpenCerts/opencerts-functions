const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const slsw = require("serverless-webpack");
const webpack = require("webpack");

module.exports = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  devtool: slsw.lib.webpack.isLocal
    ? "eval-cheap-module-source-map"
    : "source-map",
  entry: "./index.js",
  target: "node",
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, ".webpack"),
    filename: "index.js"
  },
  plugins: [
    new CopyPlugin({ patterns: [{ from: "static", to: "static" }] }),
    new webpack.ProvidePlugin({
      fetch: path.resolve(path.join(__dirname, "..", "lol"))
    })
  ],
  module: {
    rules: [
      {
        test: /(\.txt|\.html|\.subject)$/i,
        use: [
          {
            loader: "raw-loader",
            options: {
              esModule: false
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  }
};
