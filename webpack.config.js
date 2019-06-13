const path = require('path');

module.exports = {
    entry: ['core-js/modules/es.object.assign', "./index.js"],
    output:{
        path: path.resolve(__dirname, "dist"),
         filename: "cordova.js",
         libraryTarget: 'umd'
    },
    module:{
      rules:[
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, "lib"),
          path.resolve(__dirname, "index.js")
        ],
        exclude:/node_modules/,
        loader: "babel-loader",
        // the loader which should be applied, it'll be resolved relative to the context
        // -loader suffix is no longer optional in webpack2 for clarity reasons
        // see webpack 1 upgrade guide

      },
      ]
    }
}
