var path = require('path');
var utils = require('../hooks/utils');
var hook = require('nativescript-hook')(path.resolve(__dirname, '../'));
var projDir = hook.findProjectDir();

hook.postinstall();

if (projDir) {
    utils.checkForGoogleServicesJson(projDir, path.join(projDir, 'app', 'App_Resources'));
    utils.addOnPluginInstall(path.join(projDir, 'platforms'));
}
