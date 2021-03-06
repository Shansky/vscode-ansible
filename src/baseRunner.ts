"use strict";

import * as vscode from "vscode";
import { Constants } from "./constants";
import * as utilties from "./utilities";
import * as path from "path";
import { OutputChannel } from "vscode";

export enum Option {
    docker = "Docker",
    local = "Local"
}


export abstract class BaseRunner {
    protected _outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this._outputChannel = outputChannel;
    }

    protected output(label: string, message: string): void {
        this._outputChannel.append(`[${label}] ${message}`);
    }

    protected outputLine(label: string, message: string): void {
        this._outputChannel.appendLine(`[${label}] ${message}`);
    }

    protected isWindows(): boolean {
        return process.platform === 'win32';
    }

    public runPlaybook(playbook: string): void {

        if (!playbook) {
            playbook = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.fileName : null;
            vscode.window.showInputBox({ value: playbook, prompt: 'Please input playbook name', placeHolder: 'playbook', password: false })
                .then((input) => {
                    if (input != undefined && input != '') {
                        playbook = input;
                    }

                    if (this.validatePlaybook(playbook, this._outputChannel)) {
                        return this.runPlaybookInternal(playbook);
                    }
                })
        } else {
            if (this.validatePlaybook(playbook, this._outputChannel)) {
                return this.runPlaybookInternal(playbook);
            }
        }
    }

    protected validatePlaybook(playbook: string, outputChannel: OutputChannel): boolean {
        this._outputChannel.append('\n' + Constants.LineSeperator + '\nRun playbook: ' + playbook);
        this._outputChannel.show();

        if (!utilties.validatePlaybook(playbook, this._outputChannel)) {
            return false;
        }

        return true;
    }

    protected abstract runPlaybookInternal(playbook: string);
}

