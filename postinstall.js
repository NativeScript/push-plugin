require('nativescript-hook')(__dirname).postinstall();
var path = require('path');
var utils = require('./hooks/utils');
var projDir = path.resolve(__dirname, '../../');

utils.checkForGoogleServicesJson(projDir, path.join(projDir, 'app', 'App_Resources'));
utils.addOnPluginInstall(path.join(projDir, 'platforms'));
