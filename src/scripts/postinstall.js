var path = require('path');
var utils = require('../hooks/utils');
var hook = require('nativescript-hook')(path.resolve(__dirname, '../'));
var projDir = hook.findProjectDir();

hook.postinstall();

if (projDir) {
    var resourcesDir;

    try {
        var globalPath = require('child_process').execSync('npm root -g').toString().trim();
        var tns = require(path.join(globalPath, 'nativescript'));
        var project = tns.projectDataService.getProjectData(projDir);
        resourcesDir = project.appResourcesDirectoryPath;
    } catch (exc) {
        console.log('Push plugin cannot find project root. Project will be initialized during build.');
    }
    if (resourcesDir) {
        utils.checkForGoogleServicesJson(projDir, resourcesDir);
        utils.addOnPluginInstall(path.join(projDir, 'platforms'), resourcesDir);
    }
}
