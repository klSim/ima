import path from 'path';

import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

const rootDir = path.resolve(__dirname);
const isProduction = process.env.NODE_ENV === 'production';

const baseConfig: Configuration = {
  output: {
    path: path.join(rootDir, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: !isProduction ? 'eval-cheap-source-map' : false,
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  }
};

module.exports = [
  merge<Configuration>(baseConfig, {
    entry: { imaHmrClient: './src/imaHmrClient.ts' },
    module: {
      rules: [
        {
          test: /\.html$/i,
          use: 'raw-loader'
        }
      ]
    },
    resolve: {
      alias: {
        '#': path.resolve(rootDir, './src/')
      }
    }
  }),
  merge<Configuration>(baseConfig, {
    entry: { fastRefreshClient: './src/fastRefreshClient.ts' },
    target: 'node',
    output: {
      library: { type: 'commonjs2' }
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          use: 'raw-loader'
        }
      ]
    },
    resolve: {
      alias: {
        '#': path.resolve(rootDir, './src/')
      }
    }
  })
];