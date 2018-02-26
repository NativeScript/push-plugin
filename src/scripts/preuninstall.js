var path = require('path');
var utils = require('../hooks/utils');
var hook = require('nativescript-hook')(path.resolve(__dirname, '../'));
var projDir = hook.findProjectDir();

hook.preuninstall();

if (projDir) {
    utils.removeIfPresent(path.join(projDir, 'platforms'));
}