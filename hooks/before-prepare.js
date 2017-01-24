var utils = require('./utils');

module.exports = function ($logger, $projectData) {
    
    //    No need to check if file exists cause it's a before-prepare hook and
    //    if android cmd is run, it is added as a platform automatically
    
    utils.setLogger(_log);

    if (utils.targetsAndroid($projectData.projectDir)) {
        _log('parsing');
        utils.parseAndAdd($projectData.platformsDir);
    } else {
        _log('NOT parsing');
    }

    function _log (str) {
        $logger.info(str);
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
