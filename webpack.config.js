import path from 'path';

export default {
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false
    }
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      }
    ]
  }
};
