import * as github from '@actions/github';
import { exec } from '@actions/exec';
import editJsonFile from 'edit-json-file';
import { VersionPattern } from './Types';
import PackageUtils from './PackageUtils';

async function run() {
    // package.json file
    const file = editJsonFile('./package.json');
    // package.json version
    let version = file.get('version');
    console.log(`Current package version: ${version}`);

    const pullRequest = github.context.payload.pull_request;
    const push = github.context.payload;
    if (pullRequest) {
        const pullRequestTitle = `${pullRequest.title}`;
        console.log(`Pull request title is : ${pullRequestTitle}`);

        // Pull request type (patch, minor or major)
        const pullRequestType = PackageUtils.getPullRequestTypeFromTitle(
            pullRequestTitle
        );
        console.log(`Pull request type is : ${pullRequestType}`);

        // Update the package version  number
        const newVersion = PackageUtils.getIncrementedVersionNumber(
            version,
            pullRequestType
        );

        version = version.replace(VersionPattern.VERSION_NUMBER, newVersion);
    }

    let targetBranch;

    if (pullRequest) {
        targetBranch = pullRequest.base.ref;
        console.log(`Pull request target branch: ${targetBranch}`);
    } else if (push && push.ref) {
        targetBranch = push.ref.split('/').pop();
        console.log(`Direct push to branch: ${targetBranch}`);
    } else {
        console.log('No pull request or push event detected');
    }

    if (version.includes('-')) {
        version = version.replace(VersionPattern.TAG, `-${PackageUtils.getVersionTag(targetBranch)}`);
    } else {
        version = `${version}-${PackageUtils.getVersionTag(targetBranch)}`;
    }

    console.log(`Updated new version : ${version}`);
    file.set('version', version);

    // Save the updated package json
    file.save();

    await exec('git config --global user.name automatic-version-bump');
    await exec('git config --global user.email wawa27.pro@gmail.com');
    await exec('git add package.json');
    await exec('git pull');
    // Update last commit instead a creating a new commit
    await exec('git commit --amend --no-edit');
    await exec('git push origin -f');
}

try {
    run().then((r) => console.log('Finished job !'));
} catch (e) {
    console.error(e);
}
