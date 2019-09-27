const fs = require('fs');
const path = require('path');
const rsync = require('rsyncwrapper');

const { DEPLOY_KEY, DEPLOY_KEY_NAME, ARGS, SOURCE, TARGET, GITHUB_WORKSPACE, HOME } = process.env;
console.log('GITHUB_WORKSPACE', GITHUB_WORKSPACE);

const validateDir = (dir) => {
    if (!fs.existsSync(dir)){
        console.log('Creating `.ssh` dir in ', GITHUB_WORKSPACE);
        fs.mkdirSync(dir);
    }

    console.log('`.ssh` dir exist');
};

const addSshKey = (key, name) => {
    const sshDir = path.join(HOME, '.ssh');
    const filePath = path.join(sshDir, name);

    validateDir(sshDir);

    fs.writeFileSync(filePath, {
        encoding: 'utf8',
        mode: '0o600'
    });

    console.log('Ssh key added to `.ssh` dir ', filePath);

    return filePath;
};

const runRsync = (sshKeyPath) => {
    rsync({ src: GITHUB_WORKSPACE + '/' + SOURCE,
        dest: TARGET,
        args: ARGS || 'rltgoDzvO',
        ssh: true,
        privateKey: sshKeyPath,
        recursive: true,
    }, (error, stdout, stderr, cmd) => {
        console.log('end', stderr, cmd);
        if (error) {
            // failed
            console.log(error.message);
            throw error;
        } else {
            console.log('success', stdout);
        }
    });
};

const run = () => {
    const sshKeyPath = addSshKey(DEPLOY_KEY, DEPLOY_KEY_NAME ||'deployKey.pem');
    runRsync(sshKeyPath);
};

run();
