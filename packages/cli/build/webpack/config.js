const path = require('path');
const webpack = require('webpack');

const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RunImaServerPlugin = require('./plugins/RunImaServerPlugin');

function resolveEnvironment(rootDir) {
  const envSource = require(path.resolve(rootDir, './app/environment.js'));
  const envConfig = require(path.resolve(
    rootDir,
    './node_modules/@ima/server/lib/environment.js'
  ))(envSource);

  return envConfig;
}

module.exports = async ({
  rootDir,
  isProduction,
  isServer,
  isWatch,
  publicPath
}) => {
  const imaEnvironment = resolveEnvironment(rootDir);
  const entries = {
    server: [path.resolve(rootDir, './app/main.js')],
    client: [
      ...(isWatch
        ? [
            `webpack-hot-middleware/client?name=client&path=//localhost:${imaEnvironment.$Server.port}/__webpack_hmr&timeout=20000&reload=true`
          ]
        : []),
      path.resolve(rootDir, './app/main.js')
    ]
  };

  return {
    name: isServer ? 'server' : 'client',
    mode: isProduction ? 'production' : 'development',
    ...(isServer ? undefined : { target: 'web' }),
    entry: isServer ? entries.server : entries.client,
    output: {
      publicPath,
      filename: 'ima/app.server.js',
      path: path.resolve(rootDir, './build'),
      clean: isProduction,
      ...(isServer ? { libraryTarget: 'commonjs2' } : undefined)
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react'],
              plugins: []
            }
          }
        },
        {
          test: /\.(js|jsx)$/,
          use: [
            {
              loader: path.resolve(__dirname, './loaders/pluginLoader.js'),
              options: {}
            }
          ]
        },
        {
          test: /\.less$/,
          sideEffects: true,
          exclude: /node_modules/,
          use: isServer
            ? 'null-loader'
            : [
                {
                  loader: MiniCssExtractPlugin.loader
                },
                {
                  loader: 'css-loader'
                },
                {
                  loader: 'less-loader',
                  options: {
                    lessOptions: {
                      strictMath: true
                    }
                  }
                }
              ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        ['app']: path.resolve(rootDir, '/app'),
        '@ima/core': `@ima/core/dist/ima.${
          isServer ? 'server' : 'client'
        }.cjs.js`
      }
    },
    plugins: isServer
      ? [
          new CopyPlugin({
            patterns: [
              { from: 'app/assets/static', to: 'static' },
              { from: 'app/environment.js', to: 'ima/config/environment.js' },
              'server/server.js'
            ]
          })
        ]
      : [
          new MiniCssExtractPlugin({
            filename: './static/css/app.css'
          }),
          new HtmlWebpackPlugin({
            template: path.resolve(
              rootDir,
              './app/assets/static/html/spa.html'
            ),
            filename: 'index.html',
            templateParameters: {
              $Debug: imaEnvironment.$Debug,
              $Env: imaEnvironment.$Env,
              $App: JSON.stringify(imaEnvironment.$App || {}),
              $Language: Object.values(imaEnvironment.$Language)[0]
            }
          }),
          new webpack.HotModuleReplacementPlugin(),
          ...(isWatch ? [new RunImaServerPlugin({ rootDir })] : [])
        ],
    ...(isServer
      ? {
          externalsPresets: {
            node: true
          }
        }
      : undefined),
    ...(isServer
      ? {
          node: {
            __dirname: false,
            __filename: false
          }
        }
      : undefined)
  };
};
