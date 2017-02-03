require('nativescript-hook')(__dirname).preuninstall();
var path = require('path');
var utils = require('./hooks/utils');
var platformsDir = path.resolve(__dirname, '../../platforms');

utils.removeIfPresent(platformsDir);
