const https = require('https');
const pkg = require('../package.json');

const { TOKEN } = process.NODE_ENV;
const home = pkg.homepage;
const git = pkg.repository.url;
const trunk = git.replace('.git', '/trunk/');
const url = home + 'deploy.php?token=' + TOKEN + '&repo=' + trunk + 'sw';



https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        console.log(JSON.parse(data).explanation);
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});