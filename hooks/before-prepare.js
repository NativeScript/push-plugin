var utils = require('./utils');

module.exports = function ($logger, $projectData) {
    
    //    No need to check if file exists cause it's a before-prepare hook
    //    and if project targets Android, platforms dir is already created.
    //    If Android is not set up correctly, platform is not added and then we log an error
    
    utils.setLogger(_log);

    if (utils.targetsAndroid($projectData.projectDir)) {
        utils.parseAndAdd($projectData.platformsDir);
    }

    function _log (str) {
        $logger.info('nativescript-push-notifications -- ' + str);
    }
};

// function _printObj (obj) {
//     var str;
//     try {
//         str = JSON.stringify(obj);
//     } catch (ex) {
//         str = 'keys: ' + JSON.stringify(Object.keys(obj));
//     }

//     return str;
// }
