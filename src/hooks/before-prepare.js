var utils = require('./utils');

module.exports = function ($logger, $projectData) {
    
    //    No need to check if file exists cause it's a before-prepare hook
    //    and if project targets Android, platforms dir is already created.
    //    If Android is not set up correctly, platform is not added and we log an error
    
    utils.setLogger(_log);

    if (utils.targetsAndroid($projectData.projectDir)) {
        utils.addIfNecessary($projectData.platformsDir, $projectData.appResourcesDirectoryPath);
    }

    function _log (str) {
        $logger.info('nativescript-push-notifications -- ' + str);
    }
};
