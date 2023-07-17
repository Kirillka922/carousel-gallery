let path = require("path");

let conf = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "main.js",
    //publicPath: "/dist/",
  },
  devServer: {
    //port: 3031,
    proxy: {
      "/": {
        target: "https://966e3a17bd14-817885256656399495.ngrok-free.app",
        secure: false,
        changeOrigin: true,
      },
    },
  },
};
module.exports = (env, options) => {
  let isProd = options.mode === "production";
  conf.devtool = isProd ? false : "eval-cheap-module-source-map";
  return conf;
};
