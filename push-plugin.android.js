module.exports = (function () {
    var app = require('application');
    var context = app.android.context;

    (function() {
        //debugger;
        // Hook on the application events
        com.telerik.pushplugin.PushLifecycleCallbacks.registerCallbacks(app.android.nativeApp);
    })();

    var pluginObject = {
        register: function (options, successCallback, errorCallback) {
            com.telerik.pushplugin.PushPlugin.register(context, options.senderID,
                //Success
                new com.telerik.pushplugin.PushPluginListener(
                    {
                        success: successCallback,
                        error: errorCallback
                    })
            );
        },
        unregister: function (onSuccessCallback, onErrorCallback, options) {
            com.telerik.pushplugin.PushPlugin.unregister(context, options.senderID, new com.telerik.pushplugin.PushPluginListener(
                {
                    success: onSuccessCallback
                }
            ));
        },
        onMessageReceived: function (callback) {
            com.telerik.pushplugin.PushPlugin.setOnMessageReceivedCallback(
                new com.telerik.pushplugin.PushPluginListener(
                    {
                        success: callback
                    })
            );
        },
        onTokenRefresh : function (callback) {
            com.telerik.pushplugin.PushPlugin.setOnTokenRefreshCallback(
                new com.telerik.pushplugin.PushPluginListener(
                    {
                        success: callback
                    })
            );
        },
        areNotificationsEnabled : function (callback) {
            var bool = com.telerik.pushplugin.PushPlugin.areNotificationsEnabled();
            callback(bool);
        }
    };
    return pluginObject;
})();
