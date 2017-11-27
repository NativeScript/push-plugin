debugger;
var path = require('path');
var utils = require('../hooks/utils');
var projDir = path.resolve(__dirname, '../../../');
require('nativescript-hook')(path.resolve(__dirname, '../')).postinstall();

utils.checkForGoogleServicesJson(projDir, path.join(projDir, 'app', 'App_Resources'));
utils.addOnPluginInstall(path.join(projDir, 'platforms'));
