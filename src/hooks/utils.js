var path = require('path');
var fs = require('fs');
var os = require('os');

var PLUGIN_VERSION = '3.1.1';
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

function addOnPluginInstall (platformsDir) {
    var path = _getBuildGradlePath(platformsDir);
    if (buildGradleExists(platformsDir)) {
        addIfNecessary(platformsDir);
    }
}

function addIfNecessary (platformsDir) {
    _amendBuildGradle(platformsDir, function (pluginImported, pluginApplied, fileContents) {
        var newContents = fileContents;
        if (!pluginImported) {
            newContents = _addPluginImport(newContents);
        }

        if (!pluginApplied) {
            newContents = _addPluginApplication(newContents);
        }
        return newContents;
    });
}

function removeIfPresent (platformsDir) {
    _amendBuildGradle(platformsDir, function (pluginImported, pluginApplied, fileContents) {
        var newFileContents = fileContents;
        if (pluginImported) {
            newFileContents = _removePluginImport(newFileContents);
        }

        if (pluginApplied) {
            newFileContents = _removePluginApplication(newFileContents);
        }
        return newFileContents;
    });
}

function setLogger (logFunc) {
    _log = logFunc;
}

// ============= private

var _quotesRegExp = '["\']';
var _versionRegExp = '[^\'"]+';
var _pluginImportName = 'com.google.gms:google-services';
var _pluginApplicationName = 'com.google.gms.google-services';

function _amendBuildGradle (platformsDir, applyAmendment) {
    var path = _getBuildGradlePath(platformsDir);

    if (!buildGradleExists(platformsDir)) {
        return _log('build.gradle file not found');
    }

    var fileContents = fs.readFileSync(path, 'utf8');
    var pluginImported = _checkForImport(fileContents);
    var pluginApplied = _checkForApplication(fileContents);
    var newContents = applyAmendment(pluginImported, pluginApplied, fileContents);
    
    fs.writeFileSync(path, newContents, 'utf8');
}

function _removePluginImport (buildGradleContents) {
    var regExpStr = '\\s*classpath +' + _formNamePartOfRegExp(true) + '{0,0}:' + _versionRegExp + _quotesRegExp;
    var regExp = new RegExp(regExpStr, 'i');
    return buildGradleContents.replace(regExp, '');
}

function _removePluginApplication (buildGradleContents) {
    var regExpStr = '\\s*apply plugin: +' + _formNamePartOfRegExp(false);
    var regExp = new RegExp(regExpStr, 'i');
    return buildGradleContents.replace(regExp, '');
}

function _addPluginImport (buildGradleContents) {
    var androidGradle = 'com.android.tools.build:gradle';
    var insertBeforeDoubleQuotes = 'classpath "' + androidGradle;
    var insertBeforeSingleQoutes = 'classpath \'' + androidGradle;
    
    var ind = buildGradleContents.indexOf(insertBeforeDoubleQuotes);
    if (ind === -1) {
        ind = buildGradleContents.indexOf(insertBeforeSingleQoutes);
    }

    if (ind === -1) {
        _log('build.gradle has unexpected contents -- please check it manually');
        return buildGradleContents;
    }

    var result = buildGradleContents.substring(0, ind);
    result += 'classpath "' + _pluginImportName + ':' + PLUGIN_VERSION + '"' + os.EOL;
    result += '\t\t' + insertBeforeDoubleQuotes;
    result += buildGradleContents.substring(ind + ('classpath \'' + androidGradle).length);
    return result;
}

function _addPluginApplication (buildGradleContents) {
    buildGradleContents += os.EOL + 'apply plugin: "' + _pluginApplicationName + '"' + os.EOL;
    return buildGradleContents;
}

function _formNamePartOfRegExp (useImportName) {
    var name = useImportName ? _pluginImportName : _pluginApplicationName;
    return _quotesRegExp + name + _quotesRegExp;
}

function _checkForImport (buildGradleContents) {
    var re = new RegExp('classpath +' + _formNamePartOfRegExp(true) + '{0,0}', 'i');
    return re.test(buildGradleContents);
}

function _checkForApplication (buildGradleContents) {
    var re = new RegExp('apply plugin: +' + _formNamePartOfRegExp(false), 'i');
    return re.test(buildGradleContents);
}

function _getBuildGradlePath (platformsDir) {
    return path.join(platformsDir, 'android', 'build.gradle');
}

// ============= end private

module.exports = {
    removeIfPresent: removeIfPresent,
    setLogger: setLogger,
    addIfNecessary: addIfNecessary,
    targetsAndroid: targetsAndroid,
    buildGradleExists: buildGradleExists,
    addOnPluginInstall: addOnPluginInstall,
    checkForGoogleServicesJson: checkForGoogleServicesJson
};
