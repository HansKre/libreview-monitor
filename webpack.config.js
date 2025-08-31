const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/extension/background/background.ts',
    popup: './src/extension/popup/popup.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.extension.json'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: 'extension/manifest.json', 
          to: 'manifest.json' 
        },
        { 
          from: 'extension/popup/popup.html', 
          to: 'popup/popup.html' 
        },
        {
          from: 'extension/icons',
          to: 'icons',
          noErrorOnMissing: true
        }
      ],
    }),
  ],
  optimization: {
    minimize: false, // Keep readable for debugging
  },
};