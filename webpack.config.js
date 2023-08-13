const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const mode = process.env.NODE_ENV || "development";
const devMode = mode === "development";
const devtool = devMode ? "source-map" : undefined;

module.exports = {
  mode: "development",
  devtool,
  entry: path.resolve(__dirname, "src", "index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
    filename: "index.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.(gif|png|jpeg|svg|jpg)$/i,
        type: "asset/resource",
      },
    ],
  },
  devServer: {
    port: 8090,
    static: "./dist",
    hot: true,
  },
};
