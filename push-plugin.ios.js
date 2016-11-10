var utils = require("utils/utils");

module.exports = (function() {

    var pushHandler;
    var pushManager

    (function() {
        if (!pushHandler) {
            pushHandler = Push.new();
            pushManager = PushManager.new();
        }
    })();

    var pushPluginObject = {


        _init: function(settings) {
            if (!!this.isInitialized) return;

            var self = this;
            // initialize the native push plugin
            this.settings = settings;
            this.notificationCallbackIOS = settings.notificationCallbackIOS;

            this.notificationCenter = utils.ios.getter(NSNotificationCenter, NSNotificationCenter.defaultCenter);

            // subscribe to the notification received event.
            this._addObserver("notificationReceived", function(context) {
                var userInfo = JSON.parse(context.userInfo.objectForKey('message'));
                self.notificationCallbackIOS(userInfo);
            });

            this.isInitialized = true;
        },
        register: function(settings, success, error) {
            this._init(settings);

            var self = this;
            if (!this.didRegisterObserver) { // make sure that the events are not attached more than once
                this.didRegisterObserver = this._addObserver("didRegisterForRemoteNotificationsWithDeviceToken", function(result) {
                    this.notificationCenter.removeObserver(self.didRegisterObserver);
                    self.didRegisterObserver = undefined;
                    var token = result.userInfo.objectForKey('message');
                    success(token);
                });
            }

            if (!this.didFailToRegisterObserver) {
                this.didFailToRegisterObserver = this._addObserver("didFailToRegisterForRemoteNotificationsWithError", function(e) {
                    this.notificationCenter.removeObserver(self.didFailToRegisterObserver);
                    self.didFailToRegisterObserver = undefined;
                    //var err = JSON.parse(e.userInfo.objectForKey('error'));
                    error(e);
                });
            }

            pushHandler.register(self.settings);
        },

        registerUserNotificationSettings: function(success,error) {
            var self = this;
            if (self.settings && self.settings.interactiveSettings) {
                var interactiveSettings = self.settings.interactiveSettings;
                var notificationTypes = [];
                if (self.settings.alert) {
                    notificationTypes.push("alert");
                }
                if (self.settings.badge) {
                    notificationTypes.push("badge");
                }
                if (self.settings.sound) {
                    notificationTypes.push("sound");
                }

                if (!this.registerUserSettingsObserver) {
                    this.registerUserSettingsObserver = this._addObserver("didRegisterUserNotificationSettings", function() {
                        NSNotificationCenter.defaultCenter().removeObserver(self.registerUserSettingsObserver);
                        self.registerUserSettingsObserver = undefined;
                        success();
                    });
                }

                if (!this.failToRegisterUserSettingsObserver) {
                    this.failToRegisterUserSettingsObserver = this._addObserver("failToRegisterUserNotificationSettings", function(error) {
                        NSNotificationCenter.defaultCenter().removeObserver(self.failToRegisterUserSettingsObserver);
                        self.failToRegisterUserSettingsObserver = undefined;
                        error(error);
                    });
                }

                pushHandler.registerUserNotificationSettings({
                    types: notificationTypes,
                    categories: self._mapCategories(interactiveSettings)
                });
            } else {
                success();
            }
        },

        unregister: function(done) {
            var self = this;
            if (!this.didUnregisterObserver) {
                this.didUnregisterObserver = this._addObserver("didUnregister", function(context) {
                    NSNotificationCenter.defaultCenter().removeObserver(self.didUnregisterObserver);
                    self.didUnregisterObserver = undefined;
                    done(context);
                });
            }

            pushHandler.unregister();
        },

        areNotificationsEnabled: function(done) {
            var self = this;
            if (!this.areNotificationsEnabledObserver) {
                this.areNotificationsEnabledObserver = this._addObserver("areNotificationsEnabled", function(result) {
                    var areEnabledStr = result.userInfo.objectForKey('message');
                    var areEnabled;
                    if(areEnabledStr === "true"){
                        areEnabled = true;
                    }
                    NSNotificationCenter.defaultCenter().removeObserver(self.areNotificationsEnabledObserver);
                    self.areNotificationsEnabledObserver = undefined;
                    done(areEnabled);
                });
            }
            pushHandler.areNotificationsEnabled();
        },

        _mapCategories: function(interactiveSettings) {
            var categories = [];

            for (var i = 0; i < interactiveSettings.categories.length; i++) {
                var currentCategory = interactiveSettings.categories[i];
                var mappedCategory = {
                    identifier: currentCategory.identifier,
                    actionsForDefaultContext: [],
                    actionsForMinimalContext: []
                }

                for (var j = 0; j < interactiveSettings.actions.length; j++) {
                    var currentAction = interactiveSettings.actions[j];

                    if (currentCategory.actionsForMinimalContext.indexOf(currentAction.identifier) > -1) {
                        mappedCategory.actionsForMinimalContext.push(currentAction);
                    }

                    if (currentCategory.actionsForDefaultContext.indexOf(currentAction.identifier) > -1) {
                        mappedCategory.actionsForDefaultContext.push(currentAction);
                    }
                }
                categories.push(mappedCategory);

            }
            return categories;
        },

        _addObserver: function(eventName, callback) {
            var queue = utils.ios.getter(NSOperationQueue, NSOperationQueue.mainQueue);
            return this.notificationCenter.addObserverForNameObjectQueueUsingBlock(eventName, null, queue, callback);
        }

    };
    return pushPluginObject;
})();
