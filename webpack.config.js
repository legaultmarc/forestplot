var path = require('path');
var webpack = require('webpack');

module.exports = {
  /**
   * This is needed in order to help resolve the babel module since we are
   * running the express server from 'core'
   **/
  resolve: {
    alias: {
      "d3": "d3/build/d3.js"
    }
  },
  resolveLoader: {
    modulesDirectories: [
      path.join(__dirname, 'node_modules')
    ]
  },
  entry: [
    path.join(__dirname, 'forest-plot-app', 'index.js'),
    'webpack-hot-middleware/client'
  ],
  output: {
    /**
     * see bundled file here
     * http://localhost:3000/static/bundle.js
     **/
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  module: {
    loaders: [
      {
        /**
        * babel settings are in .babelrc
        **/
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
            presets: ['es2015']
        }
      },
    ],
  },
  plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
  ]
};
