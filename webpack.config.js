const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path'),
      join = path.join,
      resolve = path.resolve;

const root = resolve(__dirname);
const src = join(root, 'src');
const modules = join(root, 'node_modules');
const dest = join(root, 'dist');

//Get the environment value
const NODE_ENV = process.env.NODE_ENV;
const isDev  = NODE_ENV === 'development';
const isTest = NODE_ENV === 'test';

//Populates the environment variables
const dotEnvVars = dotenv.config();

const environmentEnv = dotenv.config({
  path: join(root, 'config', `${NODE_ENV}.config.js`),
  silent: true
});
const envVariables =
  Object.assign({}, dotEnvVars, environmentEnv);

const defines = 
  Object.keys(envVariables)
  .reduce((memo, key) => {
    const val = JSON.stringify(envVariables[key]);
    memo[`__${key.toUpperCase()}__`] = val;
    return memo;
  }, {
    __NODE_ENV__: JSON.stringify(NODE_ENV)
  });

const cssModulesNames = `${isDev ? '[path][name]__[local]__' : ''}[hash:base64:5]`;

var config = {
  entry: ['webpack-dev-server/client?http://localhost:8080/',  'webpack/hot/dev-server', join(src, 'app.js')],

  output: {
    path: dest,
    filename: 'bundle.js'
  },

  module: {
    loaders: [
      { 
        //Style Loader
        test: /\.module\.css$/,
        include: [src],
        loader: `style!css-loader?modules&localIdentName=${cssModulesNames}`
      },
      {
        test: /\.css$/,
        include: [modules],
        loader: 'style!css'
      },
      { //Babel Loader
        test: /\.(js|jsx|babel)$/, 
        exclude: [modules],
        loader: 'babel-loader'
      },
      { //JSON Loader
        test:/\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.otf(\?\S*)?$/,
        loader: 'url-loader?limit=10000'
      },
      {
        test: /\.eot(\?\S*)?$/,
        loader: 'url-loader?limit=10000'
      },
      {
        test: /\.svg(\?\S*)?$/,
        loader: 'url-loader?mimetype=image/svg+xml&limit=10000'
      },
      {
        test: /\.ttf(\?\S*)?$/,
        loader: 'url-loader?mimetype=application/octet-stream&limit=10000'
      },
      {
        test: /\.woff2?(\?\S*)?$/,
        loader: 'url-loader?mimetype=application/font-woff&limit=10000'
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        loader: 'url-loader?limit=10000'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin(defines),
    new webpack.HotModuleReplacementPlugin()
  ],

  postcss: function () {
    return [
            require('autoprefixer'), 
            require('precss'), 
            require('cssnano')
            ];
  },

  resolve: {
    root: [src, module],
    alias: {
      'css': join(src, 'styles'),
      'containers': join(src, 'containers'),
      'components': join(src, 'components'),
      'utils': join(src, 'utils')
    }
  },

  devServer: {
    contentBase: './dist',
    hot: true
  },

  devtool: 'inline-source-map'
};

if (isTest) {
  config.externals = {
    'react/lib/ReactContext': true,
    'react/lib/ExecutionEnvironment': true,
    'react/addons': true
  };
}

module.exports = config;