const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  buildConfig: ({ root }) => {
    console.log(__dirname);
    return {
      context: root,
      entry: "./index.ts",
      mode: slsw.lib.webpack.isLocal ? "development" : "production",
      devtool: slsw.lib.webpack.isLocal
        ? "eval-cheap-module-source-map"
        : "source-map",
      resolve: {
        extensions: [".json", ".ts", ".js"],
        symlinks: false,
        cacheWithContext: false,
      },
      output: {
        libraryTarget: "commonjs",
        path: path.join(root, ".webpack"),
        filename: "index.js",
      },
      target: "node",
      externals: [
        nodeExternals({
          allowlist: ["rdf-canonize-native"],
        }),
      ],
      module: {
        rules: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          {
            test: /\.(tsx?)$/,
            loader: "ts-loader",
            exclude: [
              [
                path.resolve(__dirname, "node_modules"),
                path.resolve(root, ".serverless"),
                path.resolve(root, ".webpack"),
              ],
            ],
            options: {
              configFile: path.resolve(root, "tsconfig.json"),
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
      },
      plugins: [
        new ForkTsCheckerWebpackPlugin({
          typescript: { configFile: path.resolve(root, "tsconfig.json") },
        }),
        new webpack.IgnorePlugin({ resourceRegExp: /^rdf-canonize-native$/ }), // optional dependency loaded by rdf-canonize
        new webpack.IgnorePlugin({ resourceRegExp: /^web-streams-polyfill\/ponyfill\/es2018$/ }), // optional dependency loaded by ky-universal
      ],
    };
  },
};
