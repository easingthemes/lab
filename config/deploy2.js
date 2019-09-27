const https = require('https');
const { REPO_URL, PUBLIC_URL, DIST_DIR } = require('./app.config');

const { DEPLOY_TOKEN, DEPLOY_URL, GITHUB_WORKSPACE } = process.env;
const url = PUBLIC_URL + '/' + DEPLOY_URL + '?token=' + DEPLOY_TOKEN + '&repo=' + REPO_URL + '/trunk/' + DIST_DIR;

console.log('GITHUB_WORKSPACE', GITHUB_WORKSPACE);

https.get(url, (resp) => {
    console.log('statusCode:', resp.statusCode);
    console.log('headers:', resp.headers);

    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        console.log(data);
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
