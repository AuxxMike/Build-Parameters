module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(621);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 621:
/***/ (function() {

const core = required('@actions/core');
const github = required('@actions/github');

core.setOutput("version", "76.76.76");

core.run(async tools =>{
    const pkg = tools.getPackageJSON();
    console.log('The pkg: ${pkg}');
    const event = tools.context.payload
    console.log('The event : ${event}');
    const eventPayload = JSON.stringify(github.context.payload, undefined, 2);
    console.log('The event payload: ${eventPayload}');

    const messages = event.commits.map(commit => commit.message + '\n' + commit.body);

    const commitMessage = 'version bump to';
    const isVersionBump = messages.map(message => message.toLowerCase().includes(commitMessage)).includes(true);
    if (isVersionBump){
        tools.exit.success('No action necessary!')
        return
    }

    let version = 'patch'
    if (messages.map(message => message.includes('MAJORVERSION')).includes(true)){
        version = 'major'
    } else if (messages.map(message => message.toLowerCase().startsWith('feat')).includes(true)) {
        version = 'minor'
    }

    try{
        const projectName = core.getInput('project-name');
        const currentVersion = core.getInput('current-version');

        const current = pkg.version.toString()
        // set git user
        //await tools.runInWorkspace('git', ['config', 'user.name', '"Automated Version Bump"'])
        //await tools.runInWorkspace('git', ['config', 'user.email', '"gh-action-bump-version@users.noreply.github.com"'])
    
        const currentBranch = /refs\/[a-zA-Z]+\/(.*)/.exec(process.env.GITHUB_REF)[1]
        console.log('currentBranch:', currentBranch)
    
        // do it in the current checked out github branch (DETACHED HEAD)
        // important for further usage of the package.json version
        await tools.runInWorkspace('npm',
          ['version', '--allow-same-version=true', '--git-tag-version=false', current])
        console.log('current:', current, '/', 'version:', version)
        let newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
        await tools.runInWorkspace('git', ['commit', '-a', '-m', `"ci: ${commitMessage} ${newVersion}"`])
    
        // now go to the actual branch to perform the same versioning
        await tools.runInWorkspace('git', ['checkout', currentBranch])
        await tools.runInWorkspace('npm',
          ['version', '--allow-same-version=true', '--git-tag-version=false', current])
        console.log('current:', current, '/', 'version:', version)
        newVersion = execSync(`npm version --git-tag-version=false ${version}`).toString().trim()
        newVersion = `${process.env['INPUT_TAG-PREFIX']}${newVersion}`
        console.log('new version:', newVersion)
        await tools.runInWorkspace('git', ['commit', '-a', '-m', `"ci: ${commitMessage} ${newVersion}"`])
    
        const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
        // console.log(Buffer.from(remoteRepo).toString('base64'))
        await tools.runInWorkspace('git', ['tag', newVersion])
        await tools.runInWorkspace('git', ['push', remoteRepo, '--follow-tags'])
        await tools.runInWorkspace('git', ['push', remoteRepo, '--tags'])
      } catch (e) {
        tools.log.fatal(e)
        tools.exit.failure('Failed to bump version...')
      }
      tools.exit.success('Version bumped!')
})


/***/ })

/******/ });