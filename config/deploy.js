#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const nodeSsh = require('node-ssh');
const nodeRsync = require('rsyncwrapper');

const { REMOTE_HOST, REMOTE_USER, SSH_PRIVATE_KEY, DEPLOY_KEY_NAME, SOURCE, TARGET, ARGS, GITHUB_WORKSPACE, HOME } = process.env;
console.log('GITHUB_WORKSPACE', GITHUB_WORKSPACE);

const sshDeploy = (() => {
    const connect = async ({
        host = "localhost",
        username,
        privateKey,
        port = 22,
        password,
        passphrase
    }) => {
        const ssh = new nodeSsh();
        console.log(`Establishing a SSH connection to ${host}.`);

        try {
            await ssh.connect({
                host,
                username,
                privateKey,
                port,
                password,
                passphrase
            });
            console.log(`🤝 Connected to ${host}.`);
        } catch (err) {
            console.error(`⚠️ The GitHub Action couldn't connect to ${host}.`, err);
            process.abort();
        }

        return ssh;
    };

    const rsync = async ({ ssh, privateKey, src, dest, args }) => {
        console.log(`Starting Rsync Action: ${src} to ${dest}`);

        try {
            // RSYNC COMMAND
            nodeRsync({ src, dest, args, privateKey, ssh: true, recursive: true }, (error, stdout, stderr, cmd) => {
                console.log('Rsync end', stderr, cmd);
                if (error) {
                    // failed
                    console.log('Rsync error', error.message);
                    throw error;
                } else {
                    console.log('Rsync successful', stdout);
                }
            });

            ssh.dispose();
            console.log("✅ Rsync Action finished.");
        } catch (err) {
            console.error(`⚠️ An error happened:(.`, err.message, err.stack);
            ssh.dispose();
            process.abort();
        }
    };

    const init = async ({
        src,
        dest,
        args,
        host = 'localhost',
        username,
        privateKeyContent,
        port = 22,
        password,
        passphrase
    }) => {

        const privateKey = addSshKey(privateKeyContent, DEPLOY_KEY_NAME ||'deploy_key');

        const ssh = await connect({
            host,
            username,
            privateKey,
            port,
            password,
            passphrase
        });

        const remoteDest = username + '@' + host + ':' + dest;

        await rsync({ ssh, privateKey, src, dest: remoteDest, args });

        ssh.dispose();
    };

    const validateDir = (dir) => {
        if (!fs.existsSync(dir)){
            console.log(`Creating ${dir} dir in `, GITHUB_WORKSPACE);
            fs.mkdirSync(dir);
        } else {
            console.log(`${dir} dir exist`);
        }
    };

    const validateFile = (filePath) => {
        if (!fs.existsSync(filePath)){
            console.log(`Creating ${filePath} file in `, GITHUB_WORKSPACE);
            fs.writeFileSync(filePath, '', {
                encoding: 'utf8',
                mode: '0o600'
            });
        } else {
            console.log(`${filePath} file exist`);
        }
    };

    const addSshKey = (key, name) => {
        const sshDir = path.join(HOME || __dirname, '.ssh');
        const filePath = path.join(sshDir, name);

        validateDir(sshDir);
        validateFile(sshDir + '/known_hosts');

        fs.writeFileSync(filePath, key, {
            encoding: 'utf8',
            mode: '0o600'
        });

        console.log('Ssh key added to `.ssh` dir ', filePath);

        return filePath;
    };

    return {
        init
    }
})();

const run = () => {
    if (!SSH_PRIVATE_KEY) {
        throw new Error('SSH_PRIVATE_KEY is mandatory');
    }

    sshDeploy.init({
        src: GITHUB_WORKSPACE + '/' + SOURCE || '',
        dest: TARGET || './dest',
        args: [ARGS] || ['-rltgoDzvO'],
        host: REMOTE_HOST,
        username: REMOTE_USER,
        privateKeyContent: SSH_PRIVATE_KEY,
    });
};

run();


