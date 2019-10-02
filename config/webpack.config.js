const path = require('path');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const { ROOT_PATH, PUBLIC_URL, DIST_DIR } = require('./app.config');

module.exports = {
    mode: 'production',
    entry: `${ROOT_PATH}/src/js/app.js`,
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
        new WorkboxWebpackPlugin.GenerateSW({
            clientsClaim: true,
            importWorkboxFrom: 'cdn',
            navigateFallback: PUBLIC_URL + '/index-offline.html',
            navigateFallbackBlacklist: [
                new RegExp('^/_'),
                new RegExp('/[^/]+\\.[^/]+$'),
            ]
        })
    ]
};
