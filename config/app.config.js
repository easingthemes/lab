const path = require('path');
const envPublicUrl = process.env.PUBLIC_URL;
const pkg = require('../package.json');

const config = {
    ROOT_REL: '..'
};

const { GITHUB_REPOSITORY } = process.env;

module.exports = {
    ROOT_PATH: path.resolve(__dirname, config.ROOT_REL),
    PUBLIC_URL: envPublicUrl || pkg.homepage,
    REPO_URL: `https://github.com/${GITHUB_REPOSITORY}`,
    DIST_DIR: 'dist'
};