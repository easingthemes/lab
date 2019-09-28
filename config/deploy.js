#!/usr/bin/env node
const nodeSsh = require('node-ssh');
const nodeRsync = require('rsyncwrapper');

const { REMOTE_HOST, REMOTE_USER, DEPLOY_KEY, SOURCE, TARGET, ARGS, GITHUB_WORKSPACE, HOME } = process.env;
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

    const rsync = async ({ ssh, src, dest, args }) => {
        console.log(`Starting Rsync Action: ${src} to ${dest}`);

        try {
            // RSYNC COMMAND
            nodeRsync({ src, dest, args, ssh: true, recursive: true }, (error, stdout, stderr, cmd) => {
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
        privateKey,
        port = 22,
        password,
        passphrase
    }) => {
        const ssh = await connect({
            host,
            username,
            privateKey,
            port,
            password,
            passphrase
        });

        const remoteDest = username + '@' + host + ':' + dest;

        await rsync({ ssh, src, dest: remoteDest, args });

        ssh.dispose();
    };

    return {
        init
    }
})();

sshDeploy.init({
    src: GITHUB_WORKSPACE + '/' + SOURCE || '',
    dest: TARGET || './dest',
    args: [ARGS] || ['-rltgoDzvO'],
    host: REMOTE_HOST,
    username: REMOTE_USER,
    privateKey: DEPLOY_KEY,
});
