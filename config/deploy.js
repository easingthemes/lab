const fs = require('fs');
const path = require('path');
const Rsync = require('rsync');

const { DEPLOY_KEY, ARGS, SOURCE, TARGET, GITHUB_WORKSPACE, HOME } = process.env;
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

const configureRsync = (sshKeyPath) => {
    return new Rsync()
        .shell('ssh')
        .flags(ARGS || 'rltgoDzvO')
        .set('e', `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no`)
        .source(GITHUB_WORKSPACE + '/' + SOURCE)
        .destination(TARGET);
};

const run = () => {
    const sshKeyPath = addSshKey(DEPLOY_KEY, 'deployKey');
    const rsync = configureRsync(sshKeyPath);
    console.log('Rsync command: ', rsync.command());

    rsync.execute((error, code, cmd) => {
        console.log('done', code, error, cmd);
    });
};

run();
