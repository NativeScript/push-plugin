var path = require('path');
var utils = require('../hooks/utils');
var platformsDir = path.resolve(__dirname, '../../../platforms');
require('nativescript-hook')(path.resolve(__dirname, '../')).preuninstall();

utils.removeIfPresent(platformsDir);
