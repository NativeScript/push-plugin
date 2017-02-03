module.exports = (function () {
    var app = require('application');
    var registerLifecycleEvents = function () {
        com.telerik.pushplugin.PushLifecycleCallbacks.registerCallbacks(app.android.nativeApp);
    };

    // Hook on the application events
    if (app.android.nativeApp) {
        registerLifecycleEvents();
    } else {
        app.on(app.launchEvent, registerLifecycleEvents);
    }

    var pluginObject = {
        register: function (options, successCallback, errorCallback) {
            com.telerik.pushplugin.PushPlugin.register(app.android.context, options.senderID,
                new com.telerik.pushplugin.PushPluginListener(
                    {
                        success: successCallback,
                        error: errorCallback
                    })
            );
        },
        unregister: function (onSuccessCallback, onErrorCallback, options) {
            com.telerik.pushplugin.PushPlugin.unregister(app.android.context, options.senderID, new com.telerik.pushplugin.PushPluginListener(
                {
                    success: onSuccessCallback,
                    error: onErrorCallback
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
