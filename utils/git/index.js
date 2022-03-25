//https://www.npmjs.com/package/simple-git
/*
    git: path to git binary; default: git (expected to be in your $PATH)
    shallow: when true, clone with depth 1
    checkout: revision/branch/tag to check out after clone
    args: additional array of arguments to pass to git clone
 */
const simpleGit = require('simple-git');

const git = simpleGit();

module.exports = git;