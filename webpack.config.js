const path = require('path')
const { CheckerPlugin } = require('awesome-typescript-loader')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
  mode: "production",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
  context: path.resolve(__dirname, 'public'),
  // entry: './src/index.tsx',

  output: {
      filename: 'public/dist/main.js'
  },

  resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx"]
  },

  module: {
      rules: [
          {
              test: /\.ts|\.tsx$/,
              loader: "awesome-typescript-loader",
              options: {
                forceIsolatedModules: true,
                configFileName: "public.tsconfig.json",
              },
            //   include: __dirname,
          },
          // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
          {
              enforce: "pre",
              test: /\.js$/,
              loader: "source-map-loader"
          }
      ]
  },

  plugins: [
      new CheckerPlugin(),
      new HardSourceWebpackPlugin()
  ],
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
      "react": "React",
      "react-dom": "ReactDOM"
  }
};