module.exports = (function () {
    var app = require('application');
    var utils = require("utils/types");

    (function() {
        // Hook on the application events
        com.telerik.pushplugin.PushLifecycleCallbacks.registerCallbacks(app.android.nativeApp);
    })();

    var pluginObject = {
        register: function (options, successCallback, errorCallback) {
            var that = this;

            com.telerik.pushplugin.PushPlugin.register(app.android.context, options.senderID,
                //Success
                new com.telerik.pushplugin.PushPluginListener(
                    {
                        success: function (data) {
                            if (utils.isFunction(options.notificationCallbackAndroid)) {
                                that.onMessageReceived(options.notificationCallbackAndroid);
                            }
                            if (utils.isFunction(successCallback)) {
                                successCallback(data);
                            }
                        },
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
