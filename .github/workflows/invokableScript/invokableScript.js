module.exports = async ({github, context, core, exec}) => {
    if (!context.ref.includes("refs/heads/")) {
        throw new Error("Expected a branch!");
    }
    const baseBranchName = context.ref.replace("refs/heads/", "");
    const bumpBranchName = `bump/${ baseBranchName }`;

    const { data: existingPullRequests } = await github.rest.pulls.list({
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: "open",
        head: bumpBranchName,
        base: baseBranchName,
    });
    if (existingPullRequests.length > 0) {
        throw new Error(`Bump PR #${ existingPullRequests[0].number } is already open for branch ${ baseBranchName }, close it and try again.`);
    }

    const branchExists = (await exec.exec("git",  ["show-ref", "--quiet", `refs/heads/${ bumpBranchName }`], { ignoreReturnCode: true })) === 0;
    if (branchExists) {
        // Check out the existing bump branch and reset it to the latest head
        await exec.exec(`git checkout ${ bumpBranchName }`);
        await exec.exec(`git reset --hard ${ context.sha }`);
    } else {
        // Create the branch and check it out
        await exec.exec(`git checkout -b ${ bumpBranchName }`);
    }

    // Run version bumping command
    const currentTimestamp = Date.now();
    await exec.exec(`touch ${ currentTimestamp }.txt && echo ${ currentTimestamp } > ${ currentTimestamp }.txt`);

    // Commmit changes
    await exec.exec(`git add .`);
    await exec.exec(`git config --global user.name "github-actions[bot]"`);
    await exec.exec(`git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"`);
    await exec.exec(`git commit -m "Version bump on ${ baseBranchName }"`);

    // Push the branch.  Force in case we're updating the existing branch.
    await exec.exec(`git push origin -f ${ bumpBranchName }`);

    // Create a PR
    const { data: newPullRequest } = await github.rest.pulls.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        head: bumpBranchName,
        base: baseBranchName,
        title: `Version bump on ${ baseBranchName }`,
        draft: true,
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
