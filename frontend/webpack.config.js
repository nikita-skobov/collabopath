const path = require('path')
// const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['whatwg-fetch', './src/entry.js'],
  watch: false,
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  // optimization: {
  //   runtimeChunk: 'single',
  //   splitChunks: {
  //     chunks: 'all',
  //     maxInitialRequests: Infinity,
  //     minSize: 0,
  //     cacheGroups: {
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name(module) {
  //           // get the name. E.g. node_modules/packageName/not/this/part.js
  //           // or node_modules/packageName
  //           const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
  //           // npm package names are URL-safe, but some servers don't like @ symbols
  //           return `${packageName.replace('@', '')}`;
  //         },
  //       },
  //     },
  //   },
  // },
  // plugins: [
  //   new webpack.HashedModuleIdsPlugin(),
  // ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'scripts/bundle.[hash].js',
    // chunkFileName: 'bundle.[contenthash].js',
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
  }
};