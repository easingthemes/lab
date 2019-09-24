const https = require('https');
const { REPO_URL, PUBLIC_URL, DIST_DIR } = require('./app.config');

const { TOKEN, URL } = process.env;
const trunk = REPO_URL.replace('.git', '/trunk/');
const url = PUBLIC_URL + '/' + URL + '?token=' + TOKEN + '&repo=' + trunk + DIST_DIR;

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
