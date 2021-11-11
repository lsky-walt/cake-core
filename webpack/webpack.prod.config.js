const { merge } = require("webpack-merge")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const path = require("path")
const base = require("./webpack.base.config")

module.exports = merge(
  {},
  {
    entry: {
      cake: "./src/index.jsx",
      tools: "./src/tools.js",
    },
    output: {
      filename: "[name].core.min.js",
      libraryTarget: "umd",
      path: path.resolve(__dirname, "../dist/"),
    },
    mode: "production",
    resolve: {
      extensions: [".", ".js", ".jsx", ".json"],
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    externals: {
      react: {
        root: "React",
        commonjs2: "react",
        commonjs: "react",
        amd: "react",
      },
      "react-dom": {
        root: "ReactDOM",
        commonjs2: "react-dom",
        commonjs: "react-dom",
        amd: "react-dom",
      },
      "prop-types": {
        root: "PropTypes",
        commonjs2: "prop-types",
        commonjs: "prop-types",
        amd: "prop-types",
      },
      axios: {
        root: "axios",
        commonjs2: "axios",
        commonjs: "axios",
        amd: "axios",
      },
    },
    plugins: [new CleanWebpackPlugin()],
  },
  base
)
