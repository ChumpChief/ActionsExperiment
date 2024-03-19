module.exports = async ({github, context, core, exec}) => {
    // const baseBranchName = context.ref.replace("refs/heads/", "");
    // TODO: Temporary for testing
    const baseBranchName = context.ref.replace("refs/pull/9/", "");
    if (baseBranchName.includes("-bump")) {
        throw new Error("Can't bump a bump branch!");
    }
    const bumpBranchName = `${ baseBranchName }-bump`;

    const branchExists = (await exec.exec("git",  ["show-ref", "--quiet", `refs/heads/${ bumpBranchName }`], { ignoreReturnCode: true })) === 0;
    if (!branchExists) {
        // Create the branch and check it out
        await exec.exec(`git checkout -b ${ bumpBranchName }`);
    } else {
        // Just check it out?  Reset?  Delete it?
    }

    // Run version bumping command
    await exec.exec(`touch ${ Date.now() }.txt`);

    // Commmit changes
    await exec.exec(`git add .`);
    await exec.exec(`git config --global user.name "github-actions[bot]"`);
    await exec.exec(`git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"`);
    await exec.exec(`git commit -m "Version bump"`);

    // Push the branch
    await exec.exec(`git push origin ${ bumpBranchName }`);

    // Create a PR
    const { data: newPullRequest } = await github.rest.pulls.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        head: bumpBranchName,
        // base: baseBranchName,
        // TODO: Temporary for testing
        base: "main",
        title: "Version bump",
    });

    console.log(`Opened PR #${newPullRequest.number}`);

    // Wait for the PR to be merged (maybe a separate step/script)
    console.log(`${new Date().toLocaleString()}: taking a break...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${new Date().toLocaleString()}: ok that's long enough`);
            resolve();
        }, 3000);
    });
}
