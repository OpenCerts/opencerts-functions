const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./index.js",
  target: "node",
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, ".webpack"),
    filename: "index.js"
  },
  plugins: [new CopyPlugin([{ from: "static", to: "static" }])],
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
