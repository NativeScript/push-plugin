var path = require('path');
var fs = require('fs');
var os = require('os');

var PLUGIN_VERSION = '3.1.1';
var _log = console.log.bind(console);

function targetsAndroid(projectDir) {
    var pkg = require(path.join(projectDir, 'package.json'));
    if (!pkg.nativescript) {
        throw new Error('Not a NativeScript project');
    }

    return ('tns-android' in pkg.nativescript);
}

function buildGradleExists(platformsDir) {
    return fs.existsSync(_getProjectBuildGradlePath(platformsDir));
}

function checkForGoogleServicesJson(projectDir, resourcesDir) {
    var androidIsTargeted = targetsAndroid(projectDir);
    var resourcesPath = path.join(resourcesDir, 'Android', 'google-services.json');

    if (androidIsTargeted && !fs.existsSync(resourcesPath)) {
        _log('|!| google-services.json appears to be missing. Please make sure it is present in the "app/App_Resources/Android" folder, in order to use FCM push notifications |!|');
    }
}

function addOnPluginInstall(platformsDir) {
    if (buildGradleExists(platformsDir)) {
        addIfNecessary(platformsDir);
    }
}

function addIfNecessary(platformsDir) {
    _amendBuildGradle(platformsDir, function(pluginImported, pluginApplied, fileContents) {
        if (!pluginImported) {
            fileContents.projectFileContents = _addPluginImport(fileContents.projectFileContents);
        }

        if (!pluginApplied) {
            if (fileContents.appFileContents) {
                fileContents.appFileContents = _addPluginApplication(fileContents.appFileContents);
            } else {
                fileContents.projectFileContents = _addPluginApplication(fileContents.projectFileContents);
            }
        }
        return fileContents;
    });

    _copyGoogleServices(platformsDir);
}

function removeIfPresent(platformsDir) {
    _amendBuildGradle(platformsDir, function(pluginImported, pluginApplied, fileContents) {
        if (pluginImported) {
            fileContents.projectFileContents = _removePluginImport(fileContents.projectFileContents);
        }

        if (pluginApplied) {
            if (fileContents.appFileContents) {
                fileContents.appFileContents = _removePluginApplication(fileContents.appFileContents);
            } else {
                fileContents.projectFileContents = _removePluginApplication(fileContents.projectFileContents);
            }
        }
        return fileContents;
    });
}

function setLogger(logFunc) {
    _log = logFunc;
}
 
// ============= private

var _quotesRegExp = '["\']';
var _versionRegExp = '[^\'"]+';
var _pluginImportName = 'com.google.gms:google-services';
var _pluginApplicationName = 'com.google.gms.google-services';

function _copyGoogleServices(platformsDir) {
    var srcServicesFile = path.join(platformsDir, '..', 'app', 'App_Resources', 'Android', 'google-services.json');
    var dstServicesFile = path.join(platformsDir, 'android', 'app', 'google-services.json');
    if (fs.existsSync(srcServicesFile) && !fs.existsSync(dstServicesFile) && fs.existsSync(path.join(platformsDir, 'android', 'app'))) {
        // try to copy google-services config file to platform app directory
        fs.writeFileSync(dstServicesFile, fs.readFileSync(srcServicesFile, 'utf-8'));
    }
}

function _amendBuildGradle(platformsDir, applyAmendment) {
    if (!buildGradleExists(platformsDir)) {
        return _log('build.gradle file not found');
    }

    var projectPath = _getProjectBuildGradlePath(platformsDir);
    var appPath = _getAppBuildGradlePath(platformsDir);

    if (!fs.existsSync(appPath)) {
        // NativeScript <= 3.3.1
        appPath = null;
    }
    var fileContents = {
        projectFileContents: fs.readFileSync(projectPath, 'utf8'),
        appFileContents: appPath ? fs.readFileSync(appPath, 'utf8') : null
    };
    var pluginImported = _checkForImport(fileContents.projectFileContents);
    var pluginApplied = _checkForApplication(fileContents.appFileContents ? fileContents.appFileContents : fileContents.projectFileContents);
    var newContents = applyAmendment(pluginImported, pluginApplied, fileContents);

    fs.writeFileSync(projectPath, newContents.projectFileContents, 'utf8');
    if (appPath) {
        fs.writeFileSync(appPath, newContents.appFileContents, 'utf8');
    }
}

function _removePluginImport(buildGradleContents) {
    var regExpStr = '\\s*classpath +' + _formNamePartOfRegExp(true) + '{0,0}:' + _versionRegExp + _quotesRegExp;
    var regExp = new RegExp(regExpStr, 'i');
    return buildGradleContents.replace(regExp, '');
}

function _removePluginApplication(buildGradleContents) {
    var regExpStr = '\\s*apply plugin: +' + _formNamePartOfRegExp(false);
    var regExp = new RegExp(regExpStr, 'i');
    return buildGradleContents.replace(regExp, '');
}

function _addPluginImport(buildGradleContents) {
    var androidGradle = 'com.android.tools.build:gradle';
    var insertBeforeDoubleQuotes = 'classpath "' + androidGradle;
    var insertBeforeSingleQoutes = 'classpath \'' + androidGradle;
    var quoteToInsert = '"'
    var matchedString = insertBeforeDoubleQuotes;
    var ind = buildGradleContents.indexOf(insertBeforeDoubleQuotes);

    if (ind === -1) {
        ind = buildGradleContents.indexOf(insertBeforeSingleQoutes);
        quoteToInsert = '\'';
        matchedString = insertBeforeSingleQoutes;
    }

    if (ind === -1) {
        _log('build.gradle has unexpected contents -- please check it manually');
        return buildGradleContents;
    }

    var result = buildGradleContents.substring(0, ind);
    result += 'classpath ' + quoteToInsert + _pluginImportName + ':' + PLUGIN_VERSION + quoteToInsert + os.EOL;
    result += '\t\t' + matchedString;
    result += buildGradleContents.substring(ind + matchedString.length);
    return result;
}

function _addPluginApplication(buildGradleContents) {
    buildGradleContents += os.EOL + 'apply plugin: "' + _pluginApplicationName + '"' + os.EOL;
    return buildGradleContents;
}

function _formNamePartOfRegExp(useImportName) {
    var name = useImportName ? _pluginImportName : _pluginApplicationName;
    return _quotesRegExp + name + _quotesRegExp;
}

function _checkForImport(buildGradleContents) {
    var re = new RegExp('classpath +' + _formNamePartOfRegExp(true) + '{0,0}', 'i');
    return re.test(buildGradleContents);
}

function _checkForApplication(buildGradleContents) {
    var re = new RegExp('apply plugin: +' + _formNamePartOfRegExp(false), 'i');
    return re.test(buildGradleContents);
}

function _getProjectBuildGradlePath(platformsDir) {
    return path.join(platformsDir, 'android', 'build.gradle');
}

function _getAppBuildGradlePath(platformsDir) {
    return path.join(platformsDir, 'android', 'app', 'build.gradle');
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