var path = require('path');
var fs = require('fs');
var os = require('os');

var PLUGIN_VERSION = '3.0.0';
var _log = console.log.bind(console);

function targetsAndroid (projectDir) {
    var pkg = require(path.join(projectDir, 'package.json'));
    if (!pkg.nativescript) {
        throw new Error('Not a NativeScript project');
    }

    return ('tns-android' in pkg.nativescript);
}

function buildGradleExists (platformsDir) {
    return fs.existsSync(_getBuildGradlePath(platformsDir));
}

function checkForGoogleServicesJson (projectDir, resourcesDir) {
    var androidIsTargeted = targetsAndroid(projectDir);
    var resourcesPath = path.join(resourcesDir, 'Android', 'google-services.json');

    if (androidIsTargeted && !fs.existsSync(resourcesPath)) {
        _log('|!| google-services.json appears to be missing. Please make sure it is present in the "app/App_Resources/Android" folder, in order to use FCM push notifications |!|');
    }
}

function parseAndAdd (platformsDir) {
    var path = _getBuildGradlePath(platformsDir);
    
    if (!fs.existsSync(path)) {
        return _log('build.gradle file not found');
    }

    var fileContents = fs.readFileSync(path, 'utf8');
    var pluginImported = _checkForImport(fileContents);
    var pluginApplied = _checkForApplication(fileContents);
    
    var newContents = fileContents;

    if (!pluginImported) {
        newContents = _addPluginImport(fileContents);
    }

    if (!pluginApplied) {
        newContents = _addPluginApplication(newContents);
    }

    fs.writeFileSync(path, newContents, 'utf8');
}

function setLogger (logFunc) {
    _log = logFunc;
}

// ============= private

function _addPluginImport (buildGradleContents) {
    var importStatement = 'classpath "com.android.tools.build:gradle';
    
    var ind = buildGradleContents.indexOf(importStatement);
    if (ind === -1) {
        ind = buildGradleContents.indexOf('classpath \'com.android.tools.build:gradle'); // with single quote
    }

    if (ind === -1) {
        _log('build.gradle has unexpected contents -- please check it manually');
        return buildGradleContents;
    }

    var result = buildGradleContents.substring(0, ind);
    result += 'classpath "com.google.gms:google-services:' + PLUGIN_VERSION + '"' + os.EOL;
    result += '\t\t' + importStatement;
    result += buildGradleContents.substring(ind + 'classpath "com.android.tools.build:gradle'.length);
    return result;
}

function _addPluginApplication (buildGradleContents) {
    buildGradleContents += os.EOL + 'apply plugin: "com.google.gms.google-services"' + os.EOL;   
    return buildGradleContents;
}

function _formNamePartOfRegExp () {
    var pluginName = 'com.google.gms.google-services';
    return '[\'"]' + pluginName;
}

function _checkForImport (buildGradleContents) {
    var re = new RegExp('classpath +' + _formNamePartOfRegExp(), 'i');
    return re.test(buildGradleContents);
}

function _checkForApplication (buildGradleContents) {
    var re = new RegExp('apply plugin: +' + _formNamePartOfRegExp(), 'i');
    return re.test(buildGradleContents);
}

function _getBuildGradlePath (platformsDir) {
    return path.join(platformsDir, 'android', 'build.gradle');
}

// ============= end private

module.exports = {
    setLogger: setLogger,
    parseAndAdd: parseAndAdd,
    targetsAndroid: targetsAndroid,
    buildGradleExists: buildGradleExists,
    checkForGoogleServicesJson: checkForGoogleServicesJson
};



// TODO: remove

// function _printObj (obj) {
//     var str;
//     try {
//         str = JSON.str(obj);
//     } catch (ex) {
//         str = JSON.stringify(Object.keys(obj));
//     }

//     return str;
// }



// parseAndAdd('./', function (str) {console.log(str)});

