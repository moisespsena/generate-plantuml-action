// TODO logging.
import * as core from '@actions/core';
import * as github from '@actions/github';
import {Base64} from 'js-base64';
import {getCommitsFromPayload, retrieveCodes, updatedFiles} from './utils';
import {writeFileSync} from 'fs';

const axios = require('axios');
const path = require('path');
const plantumlEncoder = require('plantuml-encoder');

async function generateImage(imageType, code) {
    const encoded = plantumlEncoder.encode(code);
    const url = `http://www.plantuml.com/plantuml/${imageType}/${encoded}`;
    let config = {};
    if (imageType == 'png') {
        config = {responseType: 'arraybuffer'};
    }
    try {
        const res = await axios.get(url, config);
        return res.data;
    } catch(e) {
        // TODO
    }
}

const diagramPath = core.getInput('path');
const commitMessage = core.getInput('message');

if (!process.env.GITHUB_TOKEN) {
    core.setFailed('Please set GITHUB_TOKEN env var.');
    process.exit(1);
}

const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
const imageType = process.env.IMAGE_TYPE || "svg";

(async function main() {
    const payload = github.context.payload;
    const ref     = payload.ref;
    if (!payload.repository) {
        throw new Error();
    }
    const owner   = payload.repository.owner.login;
    const repo    = payload.repository.name;

    const commits = await getCommitsFromPayload(octokit, payload);
    const files = updatedFiles(commits);
    const plantumlCodes = retrieveCodes(files);

    let tree: any[] = [];
    for (const plantumlCode of plantumlCodes) {

        const imgTypeM = plantumlCode.name.match(/.+\.(png|svg)$/i)
        let imgType = imageType
        if (imgTypeM) {
            if (imgTypeM[1]) {
                imgType = imgTypeM[1].toLowerCase()
                plantumlCode.name = plantumlCode.name.replace(/\.(png|svg)$/i, '')
            }
        }


        console.log(`imgType:  ${imgType}, ${plantumlCode.name}`)
        const p = path.format({
            dir: (diagramPath === '.') ? plantumlCode.dir : diagramPath,
            name: plantumlCode.name,
            ext: '.' + imgType
        });

        let img = await generateImage(imgType, plantumlCode.code);

        writeFileSync(p, img)

        tree.push(p)
    }

    if (tree.length === 0) {
        console.log(`There are no files to be generated.`);
        return;
    }

    console.log(`${tree.map(t => t).join("\n")}\nAbove files are generated.`);
})().catch(e => {
    core.setFailed(e);
});
