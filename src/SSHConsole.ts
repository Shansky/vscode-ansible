'use strict';

import * as vscode from 'vscode';
import { SSHServer } from './interfaces';
import { OutputChannel } from 'vscode';
import * as path from 'path';
import { Constants } from './constants';

export function openSSHConsole(outputChannel: OutputChannel, server: SSHServer) {
	return (async function retry(): Promise<any> {
		const isWindows = process.platform === 'win32';

		let shellPath = path.join(__dirname, `../bin/node.${isWindows ? 'bat' : 'sh'}`);
		let modulePath = path.join(__dirname, 'SSHLauncher');
		if (isWindows) {
			modulePath = modulePath.replace(/\\/g, '\\\\');
		}
		const shellArgs = [
			process.argv0,
			'-e',
			`require('${modulePath}').main()`,
		];

		if (isWindows) {
			// Work around https://github.com/electron/electron/issues/4218 https://github.com/nodejs/node/issues/11656
			shellPath = 'node.exe';
			shellArgs.shift();
		}

		var envs = {
			SSH_HOST: server.host,
			SSH_PORT: String(server.port),
			SSH_USER: server.user,
			NODE_TLS_REJECT_UNAUTHORIZED: "0",
			SSH_PASSWORD: server.password,
			SSH_KEY: server.key
		};

		const terminal = vscode.window.createTerminal({
			name: 'SSH ' + server.host,
			shellPath,
			shellArgs,
			env: envs
		});

		terminal.show();
		return terminal;
	})().catch(err => {
		outputChannel.append('\nConnecting to SSH failed with error: \n' + err);
		outputChannel.show();
		throw err;
	});
}