const CopyPlugin = require("copy-webpack-plugin");
const { buildConfig } = require("../../webpack.helper");

const webpackConfig = buildConfig({ root: __dirname });

module.exports = {
  ...webpackConfig,
  plugins: [
    ...webpackConfig.plugins,
    new CopyPlugin({
      patterns: [{ from: "static", to: "static" }],
    }),
  ],
  module: {
    rules: [
      ...webpackConfig.module.rules,
      {
        test: /(\.txt|\.html|\.subject)$/i,
        use: [
          {
            loader: "raw-loader",
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};
