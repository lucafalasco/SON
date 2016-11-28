import path from 'path'
import webpack from 'webpack'

const PROD = (process.env.NODE_ENV === 'production')

const entryDevelopment = [
  'webpack-dev-server/client?http://localhost:8080/', // Inlines auto-refresh code
  'webpack/hot/dev-server',                           // Hot Module Replacement
]

module.exports = {
  entry : {
    app : ['./src/index.js'].concat(PROD ? [] : entryDevelopment),
  },
  output : {
    path     : path.resolve('./dist'),
    filename : 'bundle.js',
  },
  devtool   : PROD ? undefined : '#eval-source-map',
  devServer : {
    hot         : true,
    contentBase : path.resolve('./src/static'),
    host        : '0.0.0.0',
  },
  plugins : [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV' : JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ].concat(PROD ? [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress : {
        warnings   : false,
        pure_funcs : ['console.log', 'console.info'],
        unused     : true,
      },
      mangle : {
        except : ['DevTools'],
      },
    }),
  ] : [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]),
  module : {
    loaders : [
      {
        test    : [/\.js$/, /\.es6$/],
        exclude : /node_modules/,
        loader  : 'babel-loader',
        query   : {
          presets : ['es2015', 'stage-0'],
        },
      },
    ],
  },
  resolve : {
    extensions : ['', '.js', '.es6'],
  },
}
