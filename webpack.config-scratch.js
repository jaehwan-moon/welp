require('babel-register');

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
const isTest = NDOE_ENV === 'test';

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

var config = {
  entry: join(src, 'app.js'),

  output: {
    path: dest,
    filename: 'bundle.js'
  },

  module: {
    loaders: [
      { 
        //Style Loader
        test:/\.css$/, 
        loader: 'style!css!postcss'
      },
      { //Babel Loader
        test:/\.js$}/, 
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin(defines)
  ],

  postcss: function () {
    return [require('autoprefixer'), require('precss')];
  },

  resolve: {
    root: [src, module],
    alias: {
      'css': join(src, 'styles'),
      'containers': join(src, 'containers'),
      'components': join(src, 'components'),
      'utils': join(src, 'utils')
    }
  }
}

if (isTest) {
  config.externals = {
    'react/lib/ReactContext': true,
    'react/lib/ExcutionEnvironment': true,
    'react/addons': true
  };

  config.plugins = config.plugins.filter(p => {
    const name = p.constructor.toString();
    const fnName = name.match(/^function (.*)\((.*)\)/);

    const idx = [
      'DedupePlugin',
      'UglifyJsPlugin'
    ].indexOf(fnName[1]);
    return idx < 0;
  });
}

module.exports = config;