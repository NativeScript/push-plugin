import * as app from 'tns-core-modules/application';
declare var Push: any;
declare var PushManager: any;
declare var iosApp: any;

export declare interface IosInteractiveNotificationAction {
    identifier: string;
    title: string;
    activationMode?: string;
    destructive?: boolean;
    authenticationRequired?: boolean;
    behavior?: string;
}

export declare interface IosInteractiveNotificationCategory {
    identifier: string;
    actionsForDefaultContext: string[];
    actionsForMinimalContext: string[];
}

export declare interface IosRegistrationOptions {
    badge: boolean;
    sound: boolean;
    alert: boolean;
    clearBadge: boolean;
    interactiveSettings: {
        actions: IosInteractiveNotificationAction[],
        categories: IosInteractiveNotificationCategory[]
    };
    notificationCallbackIOS: (message: any) => void;
}

export declare interface NSError {
    code: number;
    domain: string;
    userInfo: any;
}

let pushHandler;
let pushManager;
(() => {


    if (!pushHandler) {
        pushHandler = Push.alloc().init();
    }

    if (!pushManager) {
        pushManager = PushManager.alloc().init();
    }
})();


const _init = (settings: IosRegistrationOptions) => {
    if (!!this.isInitialized) return;

    const self = this;
    // initialize the native push plugin
    this.settings = settings;
    this.notificationCallbackIOS = settings.notificationCallbackIOS;

    // subscribe to the notification received event.
    this._addObserver("notificationReceived", (context: any) => {
        const userInfo = JSON.parse(context.userInfo.objectForKey('message'));
        self.notificationCallbackIOS(userInfo);
    });

    this.isInitialized = true;
};

const _mapCategories = (interactiveSettings: any) => {
    let categories = [];

    for (let i = 0; i < interactiveSettings.categories.length; i++) {
        const currentCategory = interactiveSettings.categories[i];
        let mappedCategory = {
            identifier: currentCategory.identifier,
            actionsForDefaultContext: [],
            actionsForMinimalContext: []
        };

        for (let j = 0; j < interactiveSettings.actions.length; j++) {
            const currentAction = interactiveSettings.actions[j];

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
};

const _addObserver = (eventName: String, callback: (context: any) => void) => {
    return iosApp.addNotificationObserver(eventName, callback);
};

const _removeObserver = function (observer: () => void, eventName: String) {
    iosApp.removeNotificationObserver(observer, eventName);
};

export function register(settings: IosRegistrationOptions, success: (token: String) => void, error: (error: NSError) => void) {
    const self = this;

    this._init(settings);
    if (!this.didRegisterObserver) { // make sure that the events are not attached more than once
        this.didRegisterObserver = this._addObserver("didRegisterForRemoteNotificationsWithDeviceToken", (result: any) => {
            self._removeObserver(self.didRegisterObserver, "didRegisterForRemoteNotificationsWithDeviceToken");
            self.didRegisterObserver = undefined;
            const token = result.userInfo.objectForKey('message');
            success(token);
        });
    }

    if (!this.didFailToRegisterObserver) {
        this.didFailToRegisterObserver = this._addObserver("didFailToRegisterForRemoteNotificationsWithError", (e: NSError) => {
            self._removeObserver(self.didFailToRegisterObserver, "didFailToRegisterForRemoteNotificationsWithError");
            self.didFailToRegisterObserver = undefined;
            error(e);
        });
    }

    pushHandler.register(self.settings);
}

export function registerUserNotificationSettings(success: () => void, error: (error: NSError) => void) {
    const self = this;
    if (self.settings && self.settings.interactiveSettings) {
        const interactiveSettings = self.settings.interactiveSettings;
        let notificationTypes = [];
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
            this.registerUserSettingsObserver = this._addObserver("didRegisterUserNotificationSettings", () => {
                self._removeObserver(self.registerUserSettingsObserver, "didRegisterUserNotificationSettings");

                self.registerUserSettingsObserver = undefined;
                success();
            });
        }

        if (!this.failToRegisterUserSettingsObserver) {
            this.failToRegisterUserSettingsObserver = this._addObserver("failToRegisterUserNotificationSettings", (e: NSError) => {
                self._removeObserver(self.didFailToRegisterObserver, "failToRegisterUserNotificationSettings");

                self.failToRegisterUserSettingsObserver = undefined;
                error(e);
            });
        }

        pushHandler.registerUserNotificationSettings({
            types: notificationTypes,
            categories: self._mapCategories(interactiveSettings)
        });
    } else {
        success();
    }
}

export function unregister(done: (context: any) => void) {
    const self = this;
    if (!this.didUnregisterObserver) {
        this.didUnregisterObserver = this._addObserver("didUnregister", (context: any) => {
            self._removeObserver(self.didUnregisterObserver, "didUnregister");

            self.didUnregisterObserver = undefined;
            done(context);
        });
    }

    pushHandler.unregister();
}

export function areNotificationsEnabled(done: (areEnabled: Boolean) => void) {
    const self = this;
    if (!this.areNotificationsEnabledObserver) {
        this.areNotificationsEnabledObserver = this._addObserver("areNotificationsEnabled", function (result) {
            const areEnabledStr = result.userInfo.objectForKey('message');
            const areEnabled = areEnabledStr === "true";

            self._removeObserver(self.areNotificationsEnabledObserver, "areNotificationsEnabled");
            self.areNotificationsEnabledObserver = undefined;
            done(areEnabled);
        });
    }

    pushHandler.areNotificationsEnabled();
}
