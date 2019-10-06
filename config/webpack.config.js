const path = require('path');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const { ROOT_PATH, SRC_DIR, DIST_DIR } = require('./app.config');

module.exports = {
    mode: 'production',
    entry: `${ROOT_PATH}/${SRC_DIR}/js/app.js`,
    output: {
        filename: 'js/app.min.js',
        path: path.resolve(ROOT_PATH, DIST_DIR)
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-object-rest-spread']
                    }
                }
            }
        ]
    },
    plugins: [
        new WorkboxWebpackPlugin.InjectManifest({
            swSrc: path.join(ROOT_PATH, SRC_DIR, 'service-worker.js'),
            globDirectory: `./${DIST_DIR}/`,
            globPatterns: ['**/*.{png,ico,html,css}']
        })
    ]
};
